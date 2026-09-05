import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.intelqong.notionflow',
  appName: 'NotionFlow',
  webDir: 'dist',
  overrideUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  appendUserAgent: ' NotionFlow/1.0',
  backgroundColor: '#191919',
  server: {
    // When deploying as direct Notion webview wrapper, point to Notion URL.
    // When using local bundle mode, webDir is served.
    allowNavigation: [
      '*.notion.so',
      'notion.so',
      '*.notion.site',
      '*.apple.com',
      'accounts.google.com'
    ]
  },
  ios: {
    preferredContentMode: 'desktop',
    scrollEnabled: true,
    backgroundColor: '#191919',
    limitsNavigationsToAppBoundDomains: false
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#191919'
    }
  }
};

export default config;
