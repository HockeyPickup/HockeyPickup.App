import { chromium } from 'playwright';

const captureAuth = async (): Promise<void> => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto('https://localhost:5174'); // vite dev server: basicSsl() + --port 5174
  console.log('Log in in the browser window, then press Enter here...');
  await new Promise<void>((resolve) => process.stdin.once('data', () => resolve()));
  await context.storageState({ path: '.auth/state.json' });
  await browser.close();
  console.log('Saved to .auth/state.json');
};

void captureAuth();
