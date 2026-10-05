interface Window {
  turnstile: {
    render(selector: string, options: {
      sitekey: string; action: string; callback: (token: string) => void;
      language?: string; theme?: 'dark' | 'light' | 'auto'; size?: 'normal' | 'flexible' | 'compact';
      'timeout-callback'?: () => void; 'unsupported-callback'?: () => void;
      'expired-callback': () => void; 'error-callback': () => void;
    }): string;
    reset(widget: string): void;
  };
}
