interface Window {
  gtag: (_command: string, _target: string, _config?: Record<string, unknown>) => void;
  turnstile?: Turnstile;
}

interface Turnstile {
  render: (_container: HTMLElement | string, _options: TurnstileRenderOptions) => string;
  execute: (_widgetId: string) => void;
  reset: (_widgetId: string) => void;
  remove: (_widgetId: string) => void;
}

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  execution?: 'render' | 'execute';
  appearance?: 'always' | 'execute' | 'interaction-only';
  callback?: (_token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
}
