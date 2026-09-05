/**
 * NotionFlow - Desktop Spoofing & Environment Masking
 * Masks iOS mobile environment, overrides navigator properties,
 * and suppresses mobile app banners / redirect loops.
 */

export function initSpoofing(): void {
  // 1. Spoof navigator.platform to MacIntel (standard macOS Safari/Chrome)
  try {
    Object.defineProperty(navigator, 'platform', {
      get: () => 'MacIntel',
      configurable: true,
    });
  } catch (e) {
    console.warn('[NotionFlow] Unable to override navigator.platform:', e);
  }

  // 2. Spoof UserAgentData if supported by modern WebKit
  if ('userAgentData' in navigator && (navigator as any).userAgentData) {
    try {
      Object.defineProperty(navigator, 'userAgentData', {
        get: () => ({
          brands: [
            { brand: 'Google Chrome', version: '124' },
            { brand: 'Chromium', version: '124' },
            { brand: 'Not-A.Brand', version: '24' }
          ],
          mobile: false,
          platform: 'macOS',
          getHighEntropyValues: async () => ({
            architecture: 'arm',
            model: '',
            platform: 'macOS',
            platformVersion: '14.5.0',
            uaFullVersion: '124.0.6367.208'
          })
        }),
        configurable: true
      });
    } catch (e) {
      console.warn('[NotionFlow] Unable to override userAgentData:', e);
    }
  }

  // 3. Suppress Notion Mobile Smart App Banner and Deep Linking
  const suppressMobileBanners = () => {
    // Remove Apple Smart App Banner
    const appBanner = document.querySelector('meta[name="apple-itunes-app"]');
    if (appBanner) {
      appBanner.remove();
    }

    // Suppress "Open in Notion app" bottom sheets and interstitials
    const style = document.createElement('style');
    style.id = 'notionflow-anti-mobile-banner';
    style.textContent = `
      /* Hide Notion native mobile promotional banners & headers */
      .notion-mobile-app-banner,
      .notion-mobile-banner,
      [data-testid="mobile-app-banner"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="itunes.apple.com"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="notion.so/mobile"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    if (!document.getElementById('notionflow-anti-mobile-banner')) {
      document.head.appendChild(style);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', suppressMobileBanners);
  } else {
    suppressMobileBanners();
  }

  // 4. Intercept window.open / location changes targeting mobile redirects
  const originalOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
    if (typeof url === 'string') {
      // Prevent redirect to app store or notion mobile deeplink
      if (url.includes('itunes.apple.com') || url.startsWith('notion://')) {
        console.log('[NotionFlow] Suppressed native app store / deeplink redirect:', url);
        return null;
      }
    }
    return originalOpen.call(window, url, target, features);
  };

  console.log('[NotionFlow] Desktop spoofing initialized successfully (MacIntel / Desktop UA)');
}
