// ==UserScript==
// @name         NotionFlow - Desktop Mode for iOS & iPadOS
// @namespace    https://github.com/intelQong/NotionFlow
// @version      1.4.0
// @description  Pure, bloat-free Desktop Notion on iOS & iPadOS Safari via lightweight userscript.
// @author       intelQong
// @updateURL    https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js
// @downloadURL  https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js
// @match        https://app.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.com/*
// @match        https://app.notion.so/*
// @match        https://*.notion.so/*
// @match        https://notion.so/*
// @match        https://*.notion.site/*
// @noframes
// @run-at       document-start
// @grant        none
// ==/UserScript==

"use strict";
(() => {
  // src/engine/dom-utils.ts
  function safeAppend(element) {
    const target = document.head || document.documentElement || document.body;
    if (target) {
      target.appendChild(element);
    } else {
      const onReady = () => {
        const el = document.head || document.documentElement || document.body;
        if (el && !element.parentElement) {
          el.appendChild(element);
        }
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady, { once: true });
      } else {
        setTimeout(onReady, 0);
      }
    }
  }
  function safeAppendBody(element) {
    if (document.body) {
      document.body.appendChild(element);
      return;
    }
    const onReady = () => {
      if (document.body && !element.parentElement) {
        document.body.appendChild(element);
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onReady, { once: true });
    }
    window.addEventListener("load", onReady, { once: true });
    setTimeout(onReady, 0);
    setTimeout(onReady, 50);
  }
  var trustedPolicy = void 0;
  function getPolicy() {
    if (trustedPolicy !== void 0) return trustedPolicy;
    try {
      if (typeof window !== "undefined" && window.trustedTypes?.createPolicy) {
        trustedPolicy = window.trustedTypes.createPolicy("notionflow-policy", {
          createHTML: (s) => s
        });
        return trustedPolicy;
      }
    } catch {
      try {
        trustedPolicy = window.trustedTypes?.defaultPolicy || null;
        return trustedPolicy;
      } catch {
        trustedPolicy = null;
      }
    }
    trustedPolicy = null;
    return trustedPolicy;
  }
  function safeSetHTML(element, html) {
    try {
      const policy = getPolicy();
      if (policy && typeof policy.createHTML === "function") {
        element.innerHTML = policy.createHTML(html);
        return;
      }
    } catch {
    }
    try {
      element.innerHTML = html;
    } catch {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        element.replaceChildren(...Array.from(doc.body.childNodes));
      } catch {
      }
    }
  }

  // src/engine/spoof.ts
  function initSpoofing() {
    const DESKTOP_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
    const DESKTOP_APP_VERSION = "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
    const overrideProp = (target, prop, getter) => {
      try {
        Object.defineProperty(target, prop, {
          get: getter,
          configurable: true,
          enumerable: true
        });
      } catch {
      }
    };
    const navTargets = [Navigator.prototype, navigator];
    for (const t of navTargets) {
      overrideProp(t, "userAgent", () => DESKTOP_UA);
      overrideProp(t, "appVersion", () => DESKTOP_APP_VERSION);
      overrideProp(t, "platform", () => "MacIntel");
      overrideProp(t, "vendor", () => "Apple Computer, Inc.");
      overrideProp(t, "maxTouchPoints", () => 0);
      overrideProp(t, "standalone", () => false);
    }
    const uad = {
      brands: [
        { brand: "Apple Safari", version: "17.5" },
        { brand: "Safari", version: "17.5" },
        { brand: "Not-A.Brand", version: "24" }
      ],
      mobile: false,
      platform: "macOS",
      getHighEntropyValues: async () => ({
        architecture: "arm",
        model: "",
        platform: "macOS",
        platformVersion: "14.5.0",
        uaFullVersion: "17.5.0"
      })
    };
    for (const t of navTargets) {
      overrideProp(t, "userAgentData", () => uad);
    }
    try {
      const origMatchMedia = window.matchMedia;
      if (origMatchMedia) {
        window.matchMedia = function(query) {
          const mql = origMatchMedia.call(window, query);
          if (/display-mode:\s*standalone/i.test(query)) {
            try {
              Object.defineProperty(mql, "matches", { get: () => false, configurable: true });
            } catch {
            }
          }
          return mql;
        };
      }
    } catch (e) {
      console.warn("[NotionFlow] matchMedia override skipped:", e);
    }
    try {
      const touchProps = ["ontouchstart", "ontouchend", "ontouchmove", "ontouchcancel"];
      const touchTargets = [
        Document.prototype,
        typeof HTMLDocument !== "undefined" ? HTMLDocument.prototype : null,
        window,
        typeof Window !== "undefined" ? Window.prototype : null,
        document,
        Element.prototype,
        HTMLElement.prototype
      ].filter(Boolean);
      for (const tgt of touchTargets) {
        for (const prop of touchProps) {
          try {
            delete tgt[prop];
          } catch {
          }
        }
      }
    } catch (e) {
      console.warn("[NotionFlow] ontouchend neutralization error:", e);
    }
    try {
      if (window.CONFIG_OVERRIDE && !window.CONFIG_OVERRIDE.env) {
        delete window.CONFIG_OVERRIDE;
      }
      let configVal = window.CONFIG;
      if (configVal && typeof configVal === "object") {
        try {
          configVal.isMobile = false;
        } catch {
        }
      }
      Object.defineProperty(window, "CONFIG", {
        get: () => configVal,
        set: (val) => {
          if (val && typeof val === "object") {
            try {
              Object.defineProperty(val, "isMobile", {
                get: () => false,
                set: () => {
                },
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
      console.warn("[NotionFlow] CONFIG intercept error:", e);
    }
    const suppressMobileBanners = () => {
      const killAppBanner = () => {
        const metas = document.querySelectorAll('meta[name="apple-itunes-app"]');
        metas.forEach((m) => {
          try {
            m.setAttribute("content", "");
            m.remove();
          } catch {
          }
        });
      };
      killAppBanner();
      try {
        if (typeof MutationObserver !== "undefined" && (document.documentElement || document.head)) {
          const metaObserver = new MutationObserver(() => killAppBanner());
          metaObserver.observe(document.documentElement || document.head, { childList: true, subtree: true });
        }
      } catch {
      }
      const style = document.createElement("style");
      style.id = "notionflow-desktop-styles";
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

      /* Responsive Desktop Modals (Settings & Members, Share, Quick Find) */
      @media (max-width: 1080px) {
        .notion-overlay-container [role="dialog"],
        .notion-settings-dialog {
          width: 96vw !important;
          max-width: 96vw !important;
          height: 90vh !important;
          max-height: 90vh !important;
          margin: auto !important;
          border-radius: 16px !important;
          overflow: hidden !important;
        }
      }

      /* Off-canvas slide-over drawer for desktop sidebar on narrow screens (< 768px) */
      @media (max-width: 768px) {
        .notion-sidebar-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          height: 100vh !important;
          width: 280px !important;
          max-width: 80vw !important;
          z-index: 9999 !important;
          box-shadow: 4px 0 25px rgba(0, 0, 0, 0.4) !important;
        }
        .notion-frame {
          width: 100% !important;
          max-width: 100vw !important;
          padding-left: 0 !important;
        }
      }

      /* Smooth momentum scrolling for wide database tables, boards, and timelines */
      .notion-table-view,
      .notion-board-view,
      .notion-timeline-view {
        -webkit-overflow-scrolling: touch !important;
      }
    `;
      if (!document.getElementById("notionflow-desktop-styles")) {
        safeAppend(style);
      }
    };
    suppressMobileBanners();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", suppressMobileBanners);
    }
    try {
      window.__mobileAppFeatures = {};
      Object.defineProperty(window, "__mobileAppFeatures", {
        get: () => ({}),
        set: () => {
        },
        configurable: true,
        enumerable: true
      });
    } catch {
    }
    const originalOpen = window.open;
    window.open = function(url, target, features) {
      if (typeof url === "string") {
        if (url.includes("itunes.apple.com") || url.startsWith("notion://")) {
          console.log("[NotionFlow] Suppressed native app store / deeplink redirect:", url);
          return null;
        }
      }
      return originalOpen.call(window, url, target, features);
    };
    console.log("[NotionFlow] Full Desktop Mode Active on iOS & iPadOS \u{1F5A5}\uFE0F");
  }

  // src/engine/updater.ts
  var NOTIONFLOW_VERSION = "1.4.0";
  var NOTIONFLOW_RAW_URL = "https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js";
  var UpdateChecker = class {
    lastCheckKey = "notionflow_last_update_check";
    checkIntervalMs = 12 * 60 * 60 * 1e3;
    // Check every 12 hours
    constructor() {
      this.injectStyles();
    }
    init() {
      setTimeout(() => {
        this.check(false);
      }, 4e3);
    }
    injectStyles() {
      if (document.getElementById("notionflow-updater-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-updater-styles";
      style.textContent = `
      .notionflow-update-banner {
        position: fixed;
        top: 14px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        opacity: 0;
        z-index: 100002;
        background: rgba(26, 26, 28, 0.95);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(35, 131, 226, 0.5);
        border-radius: 16px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(35, 131, 226, 0.25);
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 90vw;
        user-select: none;
      }

      .notionflow-update-banner.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      .notionflow-update-text {
        font-size: 13px;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.3;
      }

      .notionflow-update-btn {
        background: #2383e2;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .notionflow-update-btn:active {
        opacity: 0.85;
      }

      .notionflow-update-dismiss {
        background: transparent;
        border: none;
        color: #888;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
      safeAppend(style);
    }
    async check(force = false) {
      const now = Date.now();
      const lastCheck = parseInt(localStorage.getItem(this.lastCheckKey) || "0", 10);
      if (!force && now - lastCheck < this.checkIntervalMs) {
        return { hasUpdate: false };
      }
      try {
        let scriptText = "";
        const gmxhr = typeof window.GM_xmlhttpRequest === "function" ? window.GM_xmlhttpRequest : typeof window.GM?.xmlHttpRequest === "function" ? window.GM.xmlHttpRequest : null;
        if (gmxhr) {
          scriptText = await new Promise((resolve, reject) => {
            gmxhr({
              method: "GET",
              url: `${NOTIONFLOW_RAW_URL}?t=${now}`,
              timeout: 5e3,
              onload: (res) => {
                if (res.status >= 200 && res.status < 300) {
                  resolve(res.responseText);
                } else {
                  reject(new Error(`Status ${res.status}`));
                }
              },
              ontimeout: () => reject(new Error("Timeout")),
              onerror: (err) => reject(err)
            });
          });
        } else {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5e3);
          const response = await fetch(`${NOTIONFLOW_RAW_URL}?t=${now}`, {
            cache: "no-cache",
            headers: { Accept: "text/plain" },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (!response.ok) return { hasUpdate: false };
          scriptText = await response.text();
        }
        localStorage.setItem(this.lastCheckKey, now.toString());
        const match = scriptText.match(/\/\/\s*@version\s+([0-9.]+)/i);
        if (match && match[1]) {
          const latestVersion = match[1].trim();
          if (this.isNewer(latestVersion, NOTIONFLOW_VERSION)) {
            this.showUpdateBanner(latestVersion);
            return { hasUpdate: true, latestVersion };
          }
        }
      } catch {
      }
      return { hasUpdate: false };
    }
    isNewer(remote, current) {
      const rParts = remote.split(".").map((n) => parseInt(n, 10) || 0);
      const cParts = current.split(".").map((n) => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
        const r = rParts[i] || 0;
        const c = cParts[i] || 0;
        if (r > c) return true;
        if (r < c) return false;
      }
      return false;
    }
    showUpdateBanner(newVersion) {
      if (document.getElementById("notionflow-update-banner")) return;
      const banner = document.createElement("div");
      banner.id = "notionflow-update-banner";
      banner.className = "notionflow-update-banner";
      safeSetHTML(
        banner,
        `
      <div style="font-size: 18px;">\u{1F680}</div>
      <div class="notionflow-update-text">
        <div><strong>NotionFlow v${newVersion}</strong> is available!</div>
        <div style="font-size: 11px; color: #aaa;">Current: v${NOTIONFLOW_VERSION}</div>
      </div>
      <a class="notionflow-update-btn" href="${NOTIONFLOW_RAW_URL}" target="_blank">Update</a>
      <button class="notionflow-update-dismiss" id="notionflow-dismiss-update">\u2715</button>
    `
      );
      safeAppendBody(banner);
      requestAnimationFrame(() => {
        banner.classList.add("visible");
      });
      banner.querySelector("#notionflow-dismiss-update")?.addEventListener("click", () => {
        banner.classList.remove("visible");
        setTimeout(() => banner.remove(), 400);
      });
    }
  };

  // src/userscript/notion-flow.user.ts
  (function() {
    "use strict";
    if (window.self !== window.top) {
      return;
    }
    console.log("[NotionFlow] Initializing Pure Desktop Mode on iOS & iPadOS...");
    initSpoofing();
    const updater = new UpdateChecker();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => updater.init());
    } else {
      updater.init();
    }
    console.log("[NotionFlow] Pure Desktop Mode Active \u{1F680}");
  })();
})();
