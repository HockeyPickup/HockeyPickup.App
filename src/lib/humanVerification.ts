const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const TURNSTILE_ACTION = 'buy_spot';
const TURNSTILE_LOAD_TIMEOUT_MS = 5000;
const TURNSTILE_POLL_INTERVAL_MS = 50;

export async function executeBuySpotVerification(
  sessionId: number,
  container: HTMLElement | null,
): Promise<string | undefined> {
  if (!TURNSTILE_SITE_KEY) {
    return undefined;
  }

  if (!container) {
    throw new Error('Human verification is unavailable. Please try again.');
  }

  const turnstile = await waitForTurnstile();
  container.innerHTML = '';

  let widgetId: string | undefined;
  try {
    return await new Promise<string>((resolve, reject) => {
      let settled = false;
      const settle = (callback: () => void): void => {
        if (settled) return;
        settled = true;
        callback();
      };

      const renderedWidgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        action: TURNSTILE_ACTION,
        cData: `s_${sessionId}`,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: (token) => settle(() => resolve(token)),
        'error-callback': () =>
          settle(() => reject(new Error('Human verification failed. Please try again.'))),
        'expired-callback': () =>
          settle(() => reject(new Error('Human verification expired. Please try again.'))),
      });

      widgetId = renderedWidgetId;
      turnstile.execute(renderedWidgetId);
    });
  } finally {
    if (widgetId) {
      turnstile.remove(widgetId);
    }
    container.innerHTML = '';
  }
}

function waitForTurnstile(): Promise<Turnstile> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(intervalId);
        resolve(window.turnstile);
        return;
      }

      if (Date.now() - startedAt >= TURNSTILE_LOAD_TIMEOUT_MS) {
        window.clearInterval(intervalId);
        reject(new Error('Human verification is unavailable. Please try again.'));
      }
    }, TURNSTILE_POLL_INTERVAL_MS);
  });
}
