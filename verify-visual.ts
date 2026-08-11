import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

/**
 * Reusable authenticated visual-verification harness.
 *
 *   npx tsx verify-visual.ts --expect "About" --out "before-footer-about"
 *
 * Loads the app with the stored auth state, refuses to assert anything unless the
 * pre-flight proves the session is still authenticated, asserts the footer contains
 * the expected text, then writes a full-page screenshot to <workspace>/screenshots.
 */

const APP_DIR = dirname(fileURLToPath(import.meta.url));
const AUTH_STATE_PATH = resolve(APP_DIR, '.auth', 'state.json');
const SCREENSHOT_DIR = resolve(APP_DIR, '..', 'screenshots');

const APP_ORIGIN = 'https://localhost:5174';
const PROTECTED_PATH = '/sessions';
const PREFLIGHT_TIMEOUT_MS = 20_000;
const ELEMENT_TIMEOUT_MS = 15_000;
const SETTLE_TIMEOUT_MS = 5_000;

const AUTH_EXPIRED_MESSAGE = 'auth expired — re-run npx tsx capture-auth.ts';

type PreflightOutcome = 'authenticated' | 'login' | 'unknown';

const getArg = (flag: string): string | undefined => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
};

/**
 * Proves the stored session is still live before any assertion runs.
 * `/sessions` is a ProtectedRoute, so an expired token redirects to the login page.
 */
const preflightAuth = async (page: Page): Promise<PreflightOutcome> => {
  const authedMarker = page.getByRole('heading', { name: 'Upcoming Sessions' });
  const loginMarker = page.getByRole('heading', { name: 'Welcome Back' });

  const outcome = await Promise.race([
    authedMarker
      .waitFor({ state: 'visible', timeout: PREFLIGHT_TIMEOUT_MS })
      .then((): PreflightOutcome => 'authenticated')
      .catch((): PreflightOutcome => 'unknown'),
    loginMarker
      .waitFor({ state: 'visible', timeout: PREFLIGHT_TIMEOUT_MS })
      .then((): PreflightOutcome => 'login')
      .catch((): PreflightOutcome => 'unknown'),
  ]);

  if (outcome === 'authenticated' && !page.url().includes('/login')) {
    return 'authenticated';
  }
  return outcome === 'login' ? 'login' : 'unknown';
};

const run = async (): Promise<void> => {
  const expected = getArg('--expect');
  const out = getArg('--out');
  const targetPath = getArg('--path') ?? '/';
  const focusSelector = getArg('--focus') ?? 'footer';

  if (expected === undefined || out === undefined) {
    throw new Error('usage: npx tsx verify-visual.ts --expect "<footer text>" --out "<name>"');
  }
  if (!existsSync(AUTH_STATE_PATH)) {
    throw new Error(`no .auth/state.json — run: npx tsx capture-auth.ts`);
  }

  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    storageState: AUTH_STATE_PATH,
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page: Page = await context.newPage();

  try {
    await page.goto(`${APP_ORIGIN}${PROTECTED_PATH}`, { waitUntil: 'domcontentloaded' });

    const auth = await preflightAuth(page);
    if (auth !== 'authenticated') {
      throw new Error(AUTH_EXPIRED_MESSAGE);
    }
    console.info('✓ pre-flight: authenticated session confirmed');

    // Pre-flight runs on a protected route; the page under test is separate so that
    // data-heavy routes do not produce an unreadably tall full-page screenshot.
    if (targetPath !== PROTECTED_PATH) {
      await page.goto(`${APP_ORIGIN}${targetPath}`, { waitUntil: 'domcontentloaded' });
    }

    const footer = page.locator('footer');
    await footer.waitFor({ state: 'visible', timeout: ELEMENT_TIMEOUT_MS });
    await footer
      .getByText(expected, { exact: true })
      .waitFor({ state: 'visible', timeout: ELEMENT_TIMEOUT_MS });
    console.info(`✓ footer contains "${expected}" on ${targetPath}`);

    // graphql-ws keeps a socket open, so networkidle may never fire — best effort only.
    await page
      .waitForLoadState('networkidle', { timeout: SETTLE_TIMEOUT_MS })
      .catch(() => undefined);

    const screenshotPath = resolve(SCREENSHOT_DIR, `${out}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.info(`✓ screenshot: ${screenshotPath}`);

    // Close-up of the region under test, so the visual diff is legible at a glance.
    const focusPath = resolve(SCREENSHOT_DIR, `${out}-focus.png`);
    await page.locator(focusSelector).first().screenshot({ path: focusPath });
    console.info(`✓ focus (${focusSelector}): ${focusPath}`);
  } finally {
    await context.close();
    await browser.close();
  }
};

run().catch((error: unknown) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
