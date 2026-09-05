/**
 * NotionFlow - Desktop Spoofing & Environment Masking
 * Completely masks iOS mobile environment, overrides navigator properties,
 * screen dimensions, pointer media queries, and suppresses mobile banners/redirects.
 * Ensures Notion serves full desktop Settings & Members and desktop Notifications.
 */

import { safeAppend } from './dom-utils';

export function initSpoofing(): void {
  const DESKTOP_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
  const DESKTOP_APP_VERSION =
    '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';

  const overrideProp = (target: any, prop: string, getter: () => any) => {
    try {
      Object.defineProperty(target, prop, {
        get: getter,
        configurable: true,
        enumerable: true
      });
    } catch {}
  };

  // 1. Spoof Navigator properties on Navigator.prototype AND window.navigator
  // Notion checks userAgent, appVersion, platform, and maxTouchPoints to detect iOS
  const navTargets = [Navigator.prototype, navigator];
  for (const t of navTargets) {
    overrideProp(t, 'userAgent', () => DESKTOP_UA);
    overrideProp(t, 'appVersion', () => DESKTOP_APP_VERSION);
    overrideProp(t, 'platform', () => 'MacIntel');
    overrideProp(t, 'vendor', () => 'Apple Computer, Inc.');
    // maxTouchPoints: 0 prevents Notion's iPad detection (platform === 'MacIntel' && maxTouchPoints > 1)
    overrideProp(t, 'maxTouchPoints', () => 0);
    // Suppress standalone PWA flag so Notion doesn't switch to mobile standalone UI
    overrideProp(t, 'standalone', () => false);
  }

  // 2. Spoof UserAgentData for modern WebKit/Chromium
  const uad = {
    brands: [
      { brand: 'Apple Safari', version: '17.5' },
      { brand: 'Safari', version: '17.5' },
      { brand: 'Not-A.Brand', version: '24' }
    ],
    mobile: false,
    platform: 'macOS',
    getHighEntropyValues: async () => ({
      architecture: 'arm',
      model: '',
      platform: 'macOS',
      platformVersion: '14.5.0',
      uaFullVersion: '17.5.0'
    })
  };
  for (const t of navTargets) {
    overrideProp(t, 'userAgentData', () => uad);
  }

  // 3. Spoof Screen Dimensions and Window Outer Bounds
  // Notion checks window.screen.width (< 768) or outerWidth to trigger mobile routes for Settings and Notifications.
  // Spoofing screen.width to 1440 forces Notion to render the desktop dialogs instead of mobile views.
  const screenTargets = [Screen.prototype, window.screen];
  for (const t of screenTargets) {
    overrideProp(t, 'width', () => 1440);
    overrideProp(t, 'availWidth', () => 1440);
    overrideProp(t, 'height', () => 900);
    overrideProp(t, 'availHeight', () => 900);
    overrideProp(t, 'colorDepth', () => 24);
    overrideProp(t, 'pixelDepth', () => 24);
  }

  overrideProp(window, 'outerWidth', () => 1440);
  overrideProp(window, 'outerHeight', () => 900);
  overrideProp(window, 'orientation', () => undefined);

  // 4. Override matchMedia for mouse pointer, hover, and standalone display mode
  try {
    const origMatchMedia = window.matchMedia;
    if (origMatchMedia) {
      window.matchMedia = function (query: string): MediaQueryList {
        const mql = origMatchMedia.call(window, query);
        if (/pointer:\s*coarse/i.test(query) || /hover:\s*none/i.test(query) || /display-mode:\s*standalone/i.test(query)) {
          try {
            Object.defineProperty(mql, 'matches', { get: () => false, configurable: true });
          } catch {}
        } else if (/pointer:\s*fine/i.test(query) || /hover:\s*hover/i.test(query)) {
          try {
            Object.defineProperty(mql, 'matches', { get: () => true, configurable: true });
          } catch {}
        }
        return mql;
      };
    }
  } catch (e) {
    console.warn('[NotionFlow] matchMedia override skipped:', e);
  }

  // 5. Neutralize Notion's iPad detection ("ontouchend" in document)
  // Notion checks: ("MacIntel" === a.platform && "ontouchend" in document) to identify iPads.
  // Stripping touch event listener properties from Document, Window, and Element prototypes
  // ensures Notion's module 900532 evaluates isIpad=false, isIOS=false, isMobile=false, isDesktop=true.
  try {
    const touchProps = ['ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'];
    const touchTargets = [
      Document.prototype,
      typeof HTMLDocument !== 'undefined' ? HTMLDocument.prototype : null,
      window,
      typeof Window !== 'undefined' ? Window.prototype : null,
      document,
      Element.prototype,
      HTMLElement.prototype
    ].filter(Boolean);

    for (const tgt of touchTargets) {
      for (const prop of touchProps) {
        try {
          delete (tgt as any)[prop];
        } catch {}
      }
    }
  } catch (e) {
    console.warn('[NotionFlow] ontouchend neutralization error:', e);
  }

  // 6. Intercept Notion's module 386961 global CONFIG
  // Ensure window.CONFIG.isMobile is locked to false without clobbering Notion's configuration.
  // CRITICAL: NEVER set window.CONFIG_OVERRIDE to a partial object! Notion treats CONFIG_OVERRIDE
  // as a complete configuration replacement; setting a partial object wipes out Notion's
  // imageProxy, proxyServiceHosts, and asset URLs, crashing React with ReferenceError during boot.
  try {
    if ((window as any).CONFIG_OVERRIDE && !(window as any).CONFIG_OVERRIDE.env) {
      delete (window as any).CONFIG_OVERRIDE;
    }

    let configVal: any = (window as any).CONFIG;
    if (configVal && typeof configVal === 'object') {
      try {
        configVal.isMobile = false;
      } catch {}
    }

    Object.defineProperty(window, 'CONFIG', {
      get: () => configVal,
      set: (val) => {
        if (val && typeof val === 'object') {
          try {
            Object.defineProperty(val, 'isMobile', {
              get: () => false,
              set: () => {},
              configurable: true,
              enumerable: true
            });
          } catch {
            val.isMobile = false;
          }
        }
        configVal = val;
      },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('[NotionFlow] CONFIG intercept error:', e);
  }

  // 7. Suppress Notion Mobile Smart App Banner and Deep Linking
  const suppressMobileBanners = () => {
    // Remove Apple Smart App Banner immediately and observe for late injections
    const killAppBanner = () => {
      const metas = document.querySelectorAll('meta[name="apple-itunes-app"]');
      metas.forEach((m) => {
        try {
          m.setAttribute('content', '');
          m.remove();
        } catch {}
      });
    };
    killAppBanner();

    try {
      if (typeof MutationObserver !== 'undefined' && (document.documentElement || document.head)) {
        const metaObserver = new MutationObserver(() => killAppBanner());
        metaObserver.observe(document.documentElement || document.head, { childList: true, subtree: true });
      }
    } catch {}

    // Suppress "Open in Notion app" bottom sheets, banners, and mobile promotional overlays
    const style = document.createElement('style');
    style.id = 'notionflow-anti-mobile-banner';
    style.textContent = `
      /* Hide Notion native mobile promotional banners & headers */
      .notion-mobile-app-banner,
      .notion-mobile-banner,
      [data-testid="mobile-app-banner"],
      div:has(> a[href*="apple.com/app/notion"]),
      div:has(> a[href*="itunes.apple.com"]),
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="itunes.apple.com"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="notion.so/mobile"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="notion.com/mobile"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    if (!document.getElementById('notionflow-anti-mobile-banner')) {
      safeAppend(style);
    }
  };

  suppressMobileBanners();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', suppressMobileBanners);
  }

  // 8. Neutralize mobile app feature flags
  try {
    (window as any).__mobileAppFeatures = {};
    Object.defineProperty(window, '__mobileAppFeatures', {
      get: () => ({}),
      set: () => {},
      configurable: true,
      enumerable: true
    });
  } catch {}

  // 8. Intercept window.open targeting mobile redirects
  const originalOpen = window.open;
  window.open = function (url?: string | URL, target?: string, features?: string): Window | null {
    if (typeof url === 'string') {
      if (url.includes('itunes.apple.com') || url.startsWith('notion://')) {
        console.log('[NotionFlow] Suppressed native app store / deeplink redirect:', url);
        return null;
      }
    }
    return originalOpen.call(window, url, target, features);
  };

  console.log('[NotionFlow] Full Desktop Spoofing Active (MacIntel, Desktop UA, Screen 1440, Pointer Fine) 🖥️');
}
