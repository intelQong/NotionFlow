// ==UserScript==
// @name         NotionFlow - Desktop Superpowers on Mobile iOS
// @namespace    https://github.com/intelQong/NotionFlow
// @version      1.3.2
// @description  Forces desktop Notion on iOS with dynamic UI/UX adaptation: snap carousels, sticky table headers, touch handles, and floating toolbar.
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
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
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
    const screenTargets = [Screen.prototype, window.screen];
    for (const t of screenTargets) {
      overrideProp(t, "width", () => 1440);
      overrideProp(t, "availWidth", () => 1440);
      overrideProp(t, "height", () => 900);
      overrideProp(t, "availHeight", () => 900);
      overrideProp(t, "colorDepth", () => 24);
      overrideProp(t, "pixelDepth", () => 24);
    }
    overrideProp(window, "outerWidth", () => 1440);
    overrideProp(window, "outerHeight", () => 900);
    overrideProp(window, "orientation", () => void 0);
    try {
      const origMatchMedia = window.matchMedia;
      if (origMatchMedia) {
        window.matchMedia = function(query) {
          const mql = origMatchMedia.call(window, query);
          if (/pointer:\s*coarse/i.test(query) || /hover:\s*none/i.test(query) || /display-mode:\s*standalone/i.test(query)) {
            try {
              Object.defineProperty(mql, "matches", { get: () => false, configurable: true });
            } catch {
            }
          } else if (/pointer:\s*fine/i.test(query) || /hover:\s*hover/i.test(query)) {
            try {
              Object.defineProperty(mql, "matches", { get: () => true, configurable: true });
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
      const appBanner = document.querySelector('meta[name="apple-itunes-app"]');
      if (appBanner) {
        appBanner.remove();
      }
      const style = document.createElement("style");
      style.id = "notionflow-anti-mobile-banner";
      style.textContent = `
      /* Hide Notion native mobile promotional banners & headers */
      .notion-mobile-app-banner,
      .notion-mobile-banner,
      [data-testid="mobile-app-banner"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="itunes.apple.com"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="notion.so/mobile"],
      div[style*="position: fixed"][style*="bottom: 0"] a[href*="notion.com/mobile"] {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
      if (!document.getElementById("notionflow-anti-mobile-banner")) {
        safeAppend(style);
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", suppressMobileBanners);
    } else {
      suppressMobileBanners();
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
    console.log("[NotionFlow] Full Desktop Spoofing Active (MacIntel, Desktop UA, Screen 1440, Pointer Fine) \u{1F5A5}\uFE0F");
  }

  // src/engine/viewport.ts
  var STORAGE_KEY_ZOOM = "notionflow_zoom_level";
  var ViewportController = class {
    config = {
      defaultWidth: 1024,
      zoomPercent: 100,
      minZoom: 60,
      maxZoom: 150
    };
    styleElement = null;
    onZoomChangeCallbacks = [];
    constructor() {
      this.loadPersistedZoom();
      this.injectStyleTag();
    }
    init() {
      this.setupViewportMeta();
      this.applyZoom(this.config.zoomPercent);
      this.setupOrientationListener();
    }
    loadPersistedZoom() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_ZOOM);
        if (saved) {
          const val = parseInt(saved, 10);
          if (!isNaN(val) && val >= this.config.minZoom && val <= this.config.maxZoom) {
            this.config.zoomPercent = val;
          }
        }
      } catch {
      }
    }
    injectStyleTag() {
      if (!this.styleElement) {
        this.styleElement = document.createElement("style");
        this.styleElement.id = "notionflow-viewport-style";
        safeAppend(this.styleElement);
      }
    }
    setupViewportMeta() {
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "viewport";
        safeAppend(meta);
      }
      meta.content = `width=${this.config.defaultWidth}, initial-scale=1.0, minimum-scale=0.5, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover`;
    }
    setZoom(percent) {
      const clamped = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, percent));
      this.config.zoomPercent = clamped;
      try {
        localStorage.setItem(STORAGE_KEY_ZOOM, clamped.toString());
      } catch {
      }
      this.applyZoom(clamped);
      this.onZoomChangeCallbacks.forEach((cb) => cb(clamped));
    }
    getZoom() {
      return this.config.zoomPercent;
    }
    zoomIn(step = 10) {
      this.setZoom(this.config.zoomPercent + step);
    }
    zoomOut(step = 10) {
      this.setZoom(this.config.zoomPercent - step);
    }
    resetZoom() {
      this.setZoom(100);
    }
    onZoomChange(callback) {
      this.onZoomChangeCallbacks.push(callback);
    }
    applyZoom(percent) {
      if (!this.styleElement) return;
      const scale = percent / 100;
      this.styleElement.textContent = `
      :root {
        --notionflow-zoom: ${scale};
      }

      /* Dynamically scale Notion page inner content wrapper */
      .notion-frame,
      .notion-scroller,
      .notion-page-content {
        font-size: calc(16px * var(--notionflow-zoom)) !important;
      }

      /* Keep typography easily readable on smaller screens */
      .notion-page-content [data-block-id] {
        line-height: 1.55 !important;
      }

      /* Ensure safe areas for iOS notch and home bar */
      body {
        padding-top: env(safe-area-inset-top, 0px);
        padding-bottom: env(safe-area-inset-bottom, 0px);
        padding-left: env(safe-area-inset-left, 0px);
        padding-right: env(safe-area-inset-right, 0px);
      }
    `;
    }
    setupOrientationListener() {
      const updateForOrientation = () => {
        const isLandscape = window.innerWidth > window.innerHeight;
        this.config.defaultWidth = isLandscape ? 1200 : 960;
        this.setupViewportMeta();
      };
      window.addEventListener("resize", updateForOrientation);
      window.addEventListener("orientationchange", updateForOrientation);
    }
  };

  // src/engine/columns-carousel.ts
  var ColumnsCarouselManager = class {
    enabled = true;
    observer = null;
    processedLists = /* @__PURE__ */ new WeakSet();
    constructor() {
      this.injectStyles();
    }
    init() {
      this.scanAndTransform();
      this.observeMutations();
    }
    setEnabled(val) {
      this.enabled = val;
      const root = document.documentElement;
      if (val) {
        root.classList.add("notionflow-carousel-enabled");
        this.scanAndTransform();
      } else {
        root.classList.remove("notionflow-carousel-enabled");
        this.removeTransformations();
      }
    }
    isEnabled() {
      return this.enabled;
    }
    injectStyles() {
      if (document.getElementById("notionflow-carousel-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-carousel-styles";
      style.textContent = `
      /* Only apply carousel styling on narrow screens / mobile viewport */
      @media (max-width: 768px) {
        .notionflow-carousel-active {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          scroll-snap-type: x mandatory !important;
          -webkit-overflow-scrolling: touch !important;
          scroll-behavior: smooth !important;
          padding: 8px 4px 16px 4px !important;
          gap: 12px !important;
          scrollbar-width: none !important;
        }

        .notionflow-carousel-active::-webkit-scrollbar {
          display: none !important;
        }

        /* Each column acts as a smooth swipeable card */
        .notionflow-carousel-active > div {
          flex: 0 0 86% !important;
          min-width: 86% !important;
          max-width: 86% !important;
          scroll-snap-align: center !important;
          scroll-snap-stop: always !important;
          box-sizing: border-box !important;
          border-radius: 12px !important;
          padding: 12px !important;
          background: rgba(140, 140, 140, 0.08) !important;
          border: 1px solid rgba(140, 140, 140, 0.16) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Pagination indicator dots below carousel */
        .notionflow-carousel-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: -8px;
          margin-bottom: 12px;
          user-select: none;
        }

        .notionflow-carousel-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(150, 150, 150, 0.4);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .notionflow-carousel-dot.active {
          width: 18px;
          border-radius: 4px;
          background: #2383e2;
        }
      }
    `;
      safeAppend(style);
    }
    scanAndTransform() {
      if (!this.enabled) return;
      const selectors = [
        ".notion-column_list-block",
        'div[style*="column-list"]',
        'div[data-block-id][style*="display: flex"]'
      ];
      const elements = document.querySelectorAll(selectors.join(", "));
      elements.forEach((el) => this.transformColumnList(el));
    }
    transformColumnList(container) {
      if (this.processedLists.has(container)) return;
      const columns = Array.from(container.children).filter((child) => {
        return child.classList.contains("notion-column-block") || child.style.width || child.getAttribute("data-block-id");
      });
      if (columns.length < 2) return;
      this.processedLists.add(container);
      container.classList.add("notionflow-carousel-active");
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "notionflow-carousel-dots";
      columns.forEach((col, index) => {
        const dot = document.createElement("span");
        dot.className = `notionflow-carousel-dot ${index === 0 ? "active" : ""}`;
        dot.addEventListener("click", () => {
          col.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
        dotsContainer.appendChild(dot);
      });
      container.parentElement?.insertBefore(dotsContainer, container.nextSibling);
      let scrollTimeout = null;
      container.addEventListener("scroll", () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const containerLeft = container.getBoundingClientRect().left;
          const containerCenter = containerLeft + container.offsetWidth / 2;
          let closestIndex = 0;
          let minDiff = Infinity;
          columns.forEach((col, idx) => {
            const colRect = col.getBoundingClientRect();
            const colCenter = colRect.left + colRect.width / 2;
            const diff = Math.abs(colCenter - containerCenter);
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = idx;
            }
          });
          const dots = dotsContainer.querySelectorAll(".notionflow-carousel-dot");
          dots.forEach((d, i) => {
            d.classList.toggle("active", i === closestIndex);
          });
        }, 50);
      }, { passive: true });
    }
    removeTransformations() {
      document.querySelectorAll(".notionflow-carousel-active").forEach((el) => {
        el.classList.remove("notionflow-carousel-active");
      });
      document.querySelectorAll(".notionflow-carousel-dots").forEach((el) => el.remove());
      this.processedLists = /* @__PURE__ */ new WeakSet();
    }
    observeMutations() {
      this.observer = new MutationObserver(() => {
        if (this.enabled) {
          this.scanAndTransform();
        }
      });
      this.observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  };

  // src/engine/database-enhancer.ts
  var DatabaseEnhancer = class {
    isFocusModeActive = false;
    currentFocusedDB = null;
    observer = null;
    constructor() {
      this.injectStyles();
    }
    init() {
      this.enhanceTables();
      this.observeMutations();
    }
    injectStyles() {
      if (document.getElementById("notionflow-db-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-db-styles";
      style.textContent = `
      /* Sticky Primary Column for Notion Table Views */
      .notion-collection-view-body,
      .notion-table-view {
        -webkit-overflow-scrolling: touch !important;
        overflow-x: auto !important;
      }

      /* Freeze first column (Title) */
      .notionflow-sticky-col-enabled .notion-table-view-header-cell:first-child,
      .notionflow-sticky-col-enabled [data-col-index="0"],
      .notionflow-sticky-col-enabled .notion-table-row > div:first-child {
        position: sticky !important;
        left: 0 !important;
        z-index: 8 !important;
        background-color: inherit !important;
        box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1) !important;
      }

      /* Header cell on top of frozen body cells */
      .notionflow-sticky-col-enabled .notion-table-view-header-cell:first-child {
        z-index: 9 !important;
      }

      /* Database Focus Button */
      .notionflow-db-focus-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(35, 131, 226, 0.12);
        color: #2383e2;
        border: 1px solid rgba(35, 131, 226, 0.25);
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: 8px;
        user-select: none;
      }

      .notionflow-db-focus-btn:hover,
      .notionflow-db-focus-btn:active {
        background: rgba(35, 131, 226, 0.25);
      }

      /* Fullscreen Database Focus Mode */
      .notionflow-db-focused {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 10000 !important;
        background: var(--theme--bg, #ffffff) !important;
        padding: 48px 12px 12px 12px !important;
        box-sizing: border-box !important;
        overflow: auto !important;
      }

      /* Close button for Focus Mode */
      .notionflow-db-close-btn {
        position: fixed;
        top: 10px;
        right: 14px;
        z-index: 10001;
        background: #eb5757;
        color: #fff;
        border: none;
        border-radius: 20px;
        padding: 6px 14px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(235, 87, 87, 0.4);
        cursor: pointer;
      }
    `;
      safeAppend(style);
      document.documentElement.classList.add("notionflow-sticky-col-enabled");
    }
    enhanceTables() {
      const dbs = document.querySelectorAll(".notion-collection-view-body, .notion-table-view, [data-block-id].notion-collection_view-block");
      dbs.forEach((db) => this.attachFocusButton(db));
    }
    attachFocusButton(dbContainer) {
      if (dbContainer.querySelector(".notionflow-db-focus-btn")) return;
      const header = dbContainer.querySelector('.notion-collection-view-tabs, [role="tablist"]') || dbContainer;
      const focusBtn = document.createElement("button");
      focusBtn.className = "notionflow-db-focus-btn";
      safeSetHTML(
        focusBtn,
        `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      Focus View
    `
      );
      focusBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleDatabaseFocus(dbContainer);
      });
      header.appendChild(focusBtn);
    }
    toggleDatabaseFocus(dbContainer) {
      if (this.isFocusModeActive && this.currentFocusedDB) {
        this.currentFocusedDB.classList.remove("notionflow-db-focused");
        document.querySelector(".notionflow-db-close-btn")?.remove();
        this.currentFocusedDB = null;
        this.isFocusModeActive = false;
      } else if (dbContainer) {
        this.currentFocusedDB = dbContainer;
        dbContainer.classList.add("notionflow-db-focused");
        this.isFocusModeActive = true;
        const closeBtn = document.createElement("button");
        closeBtn.className = "notionflow-db-close-btn";
        closeBtn.textContent = "\u2715 Exit Focus";
        closeBtn.addEventListener("click", () => this.toggleDatabaseFocus());
        safeAppendBody(closeBtn);
      }
    }
    observeMutations() {
      let checkQueued = false;
      this.observer = new MutationObserver(() => {
        if (checkQueued) return;
        checkQueued = true;
        requestAnimationFrame(() => {
          checkQueued = false;
          this.enhanceTables();
        });
      });
      this.observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  };

  // src/engine/touch-handles.ts
  var TouchHandlesManager = class {
    activeBlock = null;
    actionPopup = null;
    constructor() {
      this.injectStyles();
    }
    init() {
      this.setupTouchListeners();
      this.createActionPopup();
    }
    injectStyles() {
      if (document.getElementById("notionflow-touch-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-touch-styles";
      style.textContent = `
      /* Enlarge touch hitboxes for small interactive Notion elements */
      /* Checkbox hitbox */
      .notion-to_do-block [type="checkbox"],
      .notion-collection-item-checkbox,
      [role="checkbox"] {
        width: 22px !important;
        height: 22px !important;
        margin-right: 8px !important;
        cursor: pointer !important;
      }

      /* Toggle triangle hitbox */
      .notion-toggle-block svg,
      [aria-label="Toggle"] {
        padding: 6px !important;
        margin: -6px !important;
        min-width: 28px !important;
        min-height: 28px !important;
      }

      /* Highlight active block for touch */
      .notionflow-block-touched {
        position: relative;
        background: rgba(35, 131, 226, 0.05) !important;
        border-radius: 6px;
        transition: background 0.15s ease;
      }

      /* Touch Block Action Floating Bar */
      .notionflow-block-actions {
        position: absolute;
        top: -36px;
        right: 8px;
        z-index: 999;
        display: none;
        align-items: center;
        background: rgba(30, 30, 30, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 20px;
        padding: 3px 8px;
        gap: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }

      .notionflow-block-actions.visible {
        display: flex;
        animation: notionflow-fade-in 0.15s ease-out;
      }

      @keyframes notionflow-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .notionflow-block-btn {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 13px;
        padding: 4px 8px;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 1;
      }

      .notionflow-block-btn:active {
        background: rgba(255, 255, 255, 0.2);
      }

      .notionflow-block-btn.danger {
        color: #ff6b6b;
      }
    `;
      safeAppend(style);
    }
    createActionPopup() {
      if (this.actionPopup) return;
      this.actionPopup = document.createElement("div");
      this.actionPopup.className = "notionflow-block-actions";
      safeSetHTML(
        this.actionPopup,
        `
      <button class="notionflow-block-btn" data-action="add" title="Add block below">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Add
      </button>
      <button class="notionflow-block-btn" data-action="duplicate" title="Duplicate block">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy
      </button>
      <button class="notionflow-block-btn danger" data-action="delete" title="Delete block">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    `
      );
      this.actionPopup.addEventListener("click", (e) => {
        e.stopPropagation();
        const target = e.target.closest("[data-action]");
        if (!target || !this.activeBlock) return;
        const action = target.getAttribute("data-action");
        this.handleBlockAction(action, this.activeBlock);
      });
      safeAppendBody(this.actionPopup);
    }
    setupTouchListeners() {
      document.addEventListener("touchstart", (e) => {
        const target = e.target;
        if (target.closest(".notionflow-block-actions") || target.closest(".notionflow-floating-bar") || target.closest(".notionflow-keyboard-toolbar")) {
          return;
        }
        const block = target.closest("[data-block-id]");
        if (block) {
          this.selectBlock(block);
        } else {
          this.deselectBlock();
        }
      }, { passive: true });
    }
    selectBlock(block) {
      if (this.activeBlock === block) return;
      this.deselectBlock();
      this.activeBlock = block;
      block.classList.add("notionflow-block-touched");
      if (this.actionPopup) {
        const rect = block.getBoundingClientRect();
        this.actionPopup.style.top = `${Math.max(10, rect.top + window.scrollY - 38)}px`;
        this.actionPopup.style.right = `${Math.max(16, document.documentElement.clientWidth - rect.right + 12)}px`;
        this.actionPopup.classList.add("visible");
      }
    }
    deselectBlock() {
      if (this.activeBlock) {
        this.activeBlock.classList.remove("notionflow-block-touched");
        this.activeBlock = null;
      }
      if (this.actionPopup) {
        this.actionPopup.classList.remove("visible");
      }
    }
    handleBlockAction(action, block) {
      switch (action) {
        case "add":
          const editable = block.querySelector('[contenteditable="true"]') || block;
          editable.focus();
          const enterEvt = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true });
          editable.dispatchEvent(enterEvt);
          this.deselectBlock();
          break;
        case "duplicate":
          const dupEvt = new KeyboardEvent("keydown", { key: "d", code: "KeyD", metaKey: true, bubbles: true });
          block.dispatchEvent(dupEvt);
          this.deselectBlock();
          break;
        case "delete":
          const delEvt = new KeyboardEvent("keydown", { key: "Backspace", code: "Backspace", keyCode: 8, which: 8, bubbles: true });
          block.dispatchEvent(delEvt);
          this.deselectBlock();
          break;
      }
    }
  };

  // src/engine/sidebar-drawer.ts
  var SidebarDrawerManager = class {
    backdrop = null;
    touchStartX = 0;
    touchStartY = 0;
    constructor() {
      this.injectStyles();
    }
    init() {
      this.createBackdrop();
      this.setupSwipeGestures();
      this.observeSidebarState();
    }
    injectStyles() {
      if (document.getElementById("notionflow-sidebar-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-sidebar-styles";
      style.textContent = `
      @media (max-width: 768px) {
        /* Convert Notion sidebar container to fixed off-canvas drawer */
        .notion-sidebar-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          height: 100vh !important;
          width: 290px !important;
          max-width: 82vw !important;
          z-index: 9999 !important;
          box-shadow: 8px 0 30px rgba(0, 0, 0, 0.35) !important;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        /* Prevent content from squishing when sidebar opens */
        .notion-frame {
          width: 100% !important;
          max-width: 100vw !important;
          padding-left: 0 !important;
        }

        /* Drawer Backdrop Overlay */
        .notionflow-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .notionflow-drawer-backdrop.active {
          opacity: 1;
          pointer-events: auto;
        }
      }
    `;
      safeAppend(style);
    }
    createBackdrop() {
      if (this.backdrop) return;
      this.backdrop = document.createElement("div");
      this.backdrop.className = "notionflow-drawer-backdrop";
      this.backdrop.addEventListener("click", () => {
        this.closeSidebar();
      });
      safeAppendBody(this.backdrop);
    }
    isSidebarOpen() {
      const sidebar = document.querySelector(".notion-sidebar-container");
      if (!sidebar) return false;
      const style = window.getComputedStyle(sidebar);
      return style.display !== "none" && style.visibility !== "hidden" && sidebar.offsetWidth > 50;
    }
    toggleSidebar() {
      const toggleBtn = document.querySelector('[role="button"][aria-label*="sidebar" i], .notion-topbar [role="button"] svg path[d*="M2"]')?.closest('div[role="button"]');
      if (toggleBtn) {
        toggleBtn.click();
      } else {
        const evt = new KeyboardEvent("keydown", {
          key: "\\",
          code: "Backslash",
          metaKey: true,
          bubbles: true
        });
        document.dispatchEvent(evt);
      }
    }
    closeSidebar() {
      if (this.isSidebarOpen()) {
        this.toggleSidebar();
      }
    }
    observeSidebarState() {
      let checkQueued = false;
      const checkSidebar = () => {
        checkQueued = false;
        if (!this.backdrop) return;
        if (window.innerWidth > 768) {
          if (this.backdrop.classList.contains("active")) {
            this.backdrop.classList.remove("active");
          }
          return;
        }
        const open = this.isSidebarOpen();
        const isActive = this.backdrop.classList.contains("active");
        if (open !== isActive) {
          this.backdrop.classList.toggle("active", open);
        }
      };
      const queueCheck = () => {
        if (checkQueued) return;
        checkQueued = true;
        requestAnimationFrame(checkSidebar);
      };
      const observer = new MutationObserver(queueCheck);
      observer.observe(document.body || document.documentElement, { attributes: true, subtree: true, childList: true });
      window.addEventListener("resize", queueCheck);
    }
    setupSwipeGestures() {
      document.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) return;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }, { passive: true });
      document.addEventListener("touchend", (e) => {
        if (!e.changedTouches || e.changedTouches.length !== 1) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (deltaX > 0 && this.touchStartX < 35 && !this.isSidebarOpen()) {
            this.toggleSidebar();
          } else if (deltaX < 0 && this.isSidebarOpen() && this.touchStartX > 50) {
            this.closeSidebar();
          }
        }
      }, { passive: true });
    }
  };

  // src/engine/keyboard-toolbar.ts
  var KeyboardToolbarManager = class {
    toolbar = null;
    currentEditable = null;
    constructor() {
      this.injectStyles();
    }
    init() {
      this.createToolbar();
      this.setupFocusListeners();
      this.setupViewportListener();
    }
    injectStyles() {
      if (document.getElementById("notionflow-keyboard-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-keyboard-styles";
      style.textContent = `
      .notionflow-keyboard-toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        background: rgba(26, 26, 26, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        display: none;
        align-items: center;
        padding: 6px 8px;
        gap: 6px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
        transform: translateZ(0);
      }

      .notionflow-keyboard-toolbar::-webkit-scrollbar {
        display: none;
      }

      .notionflow-keyboard-toolbar.visible {
        display: flex;
      }

      .notionflow-kb-btn {
        flex: 0 0 auto;
        min-width: 38px;
        height: 36px;
        padding: 0 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #f0f0f0;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease, transform 0.1s ease;
      }

      .notionflow-kb-btn:active {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(0.95);
      }

      .notionflow-kb-btn.primary {
        background: #2383e2;
        color: #ffffff;
      }

      .notionflow-kb-btn.dismiss {
        background: rgba(255, 255, 255, 0.06);
        color: #aaa;
      }
    `;
      safeAppend(style);
    }
    createToolbar() {
      if (this.toolbar) return;
      this.toolbar = document.createElement("div");
      this.toolbar.className = "notionflow-keyboard-toolbar";
      const buttons = [
        { label: "/", action: "slash", title: "Slash Command", primary: true },
        { label: "H1", action: "h1", title: "Heading 1" },
        { label: "H2", action: "h2", title: "Heading 2" },
        { label: "H3", action: "h3", title: "Heading 3" },
        { label: "[ ]", action: "todo", title: "To-do Checkbox" },
        { label: "\u2022 List", action: "bullet", title: "Bullet List" },
        { label: "1. List", action: "number", title: "Numbered List" },
        { label: "B", action: "bold", title: "Bold", style: "font-weight: 800;" },
        { label: "I", action: "italic", title: "Italic", style: "font-style: italic;" },
        { label: "</>", action: "code", title: "Code" },
        { label: "\u21E5", action: "indent", title: "Indent (Tab)" },
        { label: "\u21E4", action: "outdent", title: "Outdent (Shift+Tab)" },
        { label: "\u2715", action: "dismiss", title: "Dismiss Keyboard", dismiss: true }
      ];
      buttons.forEach((btn) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `notionflow-kb-btn ${btn.primary ? "primary" : ""} ${btn.dismiss ? "dismiss" : ""}`;
        button.textContent = btn.label;
        button.title = btn.title;
        if (btn.style) button.style.cssText += btn.style;
        button.addEventListener("mousedown", (e) => e.preventDefault());
        button.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleAction(btn.action);
        });
        this.toolbar.appendChild(button);
      });
      safeAppendBody(this.toolbar);
    }
    setupFocusListeners() {
      document.addEventListener("focusin", (e) => {
        const target = e.target;
        if (target && (target.getAttribute("contenteditable") === "true" || target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
          this.currentEditable = target;
          this.show();
        }
      });
      document.addEventListener("focusout", () => {
        setTimeout(() => {
          const active = document.activeElement;
          if (!active || active.getAttribute("contenteditable") !== "true" && active.tagName !== "INPUT" && active.tagName !== "TEXTAREA") {
            this.hide();
          }
        }, 150);
      });
    }
    setupViewportListener() {
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", () => {
          if (!this.toolbar || !this.toolbar.classList.contains("visible")) return;
          const vv = window.visualViewport;
          const offsetBottom = window.innerHeight - (vv.offsetTop + vv.height);
          this.toolbar.style.bottom = `${Math.max(0, offsetBottom)}px`;
        });
      }
    }
    show() {
      this.toolbar?.classList.add("visible");
    }
    hide() {
      this.toolbar?.classList.remove("visible");
      if (this.toolbar) {
        this.toolbar.style.bottom = "0px";
      }
    }
    handleAction(action) {
      if (!this.currentEditable) return;
      this.currentEditable.focus();
      switch (action) {
        case "slash":
          document.execCommand("insertText", false, "/");
          break;
        case "h1":
          document.execCommand("insertText", false, "# ");
          break;
        case "h2":
          document.execCommand("insertText", false, "## ");
          break;
        case "h3":
          document.execCommand("insertText", false, "### ");
          break;
        case "todo":
          document.execCommand("insertText", false, "[] ");
          break;
        case "bullet":
          document.execCommand("insertText", false, "- ");
          break;
        case "number":
          document.execCommand("insertText", false, "1. ");
          break;
        case "bold": {
          const evt = new KeyboardEvent("keydown", { key: "b", code: "KeyB", metaKey: true, bubbles: true });
          this.currentEditable.dispatchEvent(evt);
          break;
        }
        case "italic": {
          const evt = new KeyboardEvent("keydown", { key: "i", code: "KeyI", metaKey: true, bubbles: true });
          this.currentEditable.dispatchEvent(evt);
          break;
        }
        case "code": {
          const evt = new KeyboardEvent("keydown", { key: "e", code: "KeyE", metaKey: true, bubbles: true });
          this.currentEditable.dispatchEvent(evt);
          break;
        }
        case "indent": {
          const evt = new KeyboardEvent("keydown", { key: "Tab", code: "Tab", keyCode: 9, which: 9, bubbles: true });
          this.currentEditable.dispatchEvent(evt);
          break;
        }
        case "outdent": {
          const evt = new KeyboardEvent("keydown", { key: "Tab", code: "Tab", keyCode: 9, which: 9, shiftKey: true, bubbles: true });
          this.currentEditable.dispatchEvent(evt);
          break;
        }
        case "dismiss":
          this.currentEditable.blur();
          this.hide();
          break;
      }
    }
  };

  // src/engine/settings.ts
  var SettingsManager = class {
    isModalOpen = false;
    constructor() {
      this.injectStyles();
    }
    init() {
      this.observeSettingsDialog();
      this.setupModalDismissListeners();
    }
    injectStyles() {
      if (document.getElementById("notionflow-settings-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-settings-styles";
      style.textContent = `
      /* ============================================================
         Notion Settings & Members Dialog - Mobile Responsive Engine
         ============================================================ */
      @media (max-width: 1080px) {
        /* Dialog Container */
        .notion-overlay-container [role="dialog"],
        div[role="dialog"]:has([aria-label*="Settings" i]),
        .notion-settings-dialog,
        .notionflow-settings-dialog {
          width: 95vw !important;
          max-width: 95vw !important;
          height: 88vh !important;
          max-height: 88vh !important;
          margin: auto !important;
          border-radius: 18px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          background: #19191b !important;
          z-index: 100000 !important;
        }

        /* Two-pane layout adaptation (Sidebar tabs + Detail view) */
        .notion-settings-dialog-layout,
        [role="dialog"] > div {
          display: flex !important;
          flex-direction: column !important;
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
        }

        /* Category navigation tab bar */
        .notion-settings-sidebar,
        [role="dialog"] [role="tablist"],
        .notionflow-settings-tabs {
          display: flex !important;
          flex-direction: row !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          white-space: nowrap !important;
          padding: 10px 12px !important;
          gap: 8px !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          background: rgba(22, 22, 24, 0.98) !important;
          flex-shrink: 0 !important;
        }

        /* Settings item / tab buttons */
        .notion-settings-sidebar [role="button"],
        .notion-settings-sidebar [role="tab"],
        .notionflow-settings-tab {
          padding: 8px 14px !important;
          border-radius: 8px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #aaa !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
        }

        .notion-settings-sidebar [role="button"]:active,
        .notionflow-settings-tab.active {
          background: #2383e2 !important;
          color: #fff !important;
        }

        /* Content pane */
        .notion-settings-content,
        [role="dialog"] [role="tabpanel"],
        .notionflow-settings-panel {
          flex: 1 !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          padding: 18px 16px !important;
        }

        /* Enlarge touch targets inside settings */
        [role="dialog"] input,
        [role="dialog"] button,
        [role="dialog"] select,
        [role="dialog"] [role="switch"] {
          min-height: 42px !important;
          font-size: 14px !important;
        }

        /* Close Button enhancement */
        .notionflow-settings-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      }
    `;
      safeAppend(style);
    }
    /**
     * Opens Notion's full desktop Settings & Members dialog.
     * Employs multi-strategy trigger:
     * 1. Direct click on Notion's sidebar Settings button.
     * 2. Simulated Cmd+, / Ctrl+, keyboard shortcut.
     * 3. Fallback to simulator/standalone settings modal if present.
     */
    openFullSettings() {
      console.log("[NotionFlow] Opening Notion Full Settings & Members...");
      const settingsButton = this.findNotionSettingsButton();
      if (settingsButton) {
        settingsButton.click();
        this.isModalOpen = true;
        return;
      }
      const dispatched = this.dispatchShortcut();
      if (dispatched) {
        this.isModalOpen = true;
      }
      const simModal = document.querySelector("#notionflow-sim-settings-modal");
      if (simModal) {
        simModal.style.display = "flex";
        this.isModalOpen = true;
      }
    }
    /**
     * Closes the settings modal via Escape or clicking close button.
     */
    closeSettings() {
      const escEvt = new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(escEvt);
      const closeBtn = document.querySelector(
        '[role="dialog"] [aria-label*="Close" i], [role="dialog"] button:has(svg)'
      );
      if (closeBtn) closeBtn.click();
      const simModal = document.querySelector("#notionflow-sim-settings-modal");
      if (simModal) simModal.style.display = "none";
      this.isModalOpen = false;
    }
    toggleSettings() {
      if (this.isOpen()) {
        this.closeSettings();
      } else {
        this.openFullSettings();
      }
    }
    isOpen() {
      const dialog = document.querySelector('[role="dialog"]');
      const simModal = document.querySelector("#notionflow-sim-settings-modal");
      return this.isModalOpen || Boolean(dialog && dialog.clientHeight > 100 || simModal && simModal.style.display !== "none");
    }
    findNotionSettingsButton() {
      const byAria = document.querySelector('[role="button"][aria-label*="Settings" i], [role="button"][aria-label*="Param\xE8tres" i], [role="button"][aria-label*="Einstellungen" i]');
      if (byAria) return byAria;
      const sidebarItems = document.querySelectorAll(
        '.notion-sidebar-container [role="button"], .notion-sidebar-container div, .notion-sidebar-item'
      );
      for (const item of Array.from(sidebarItems)) {
        const text = item.textContent?.trim() || "";
        if (/settings\s*(&|and)?\s*members/i.test(text) || /^settings$/i.test(text)) {
          const clickable = item.closest('[role="button"]') || item;
          return clickable;
        }
      }
      return null;
    }
    openNotifications() {
      console.log("[NotionFlow] Opening Notion Desktop Notifications / Inbox...");
      const notifBtn = this.findNotionNotificationsButton();
      if (notifBtn) {
        notifBtn.click();
        return;
      }
    }
    findNotionNotificationsButton() {
      const byAria = document.querySelector(
        '[role="button"][aria-label*="Updates" i], [role="button"][aria-label*="Inbox" i], [role="button"][aria-label*="Notifications" i]'
      );
      if (byAria) return byAria;
      const sidebarItems = document.querySelectorAll(
        '.notion-sidebar-container [role="button"], .notion-sidebar-container div, .notion-sidebar-item'
      );
      for (const item of Array.from(sidebarItems)) {
        const text = item.textContent?.trim() || "";
        if (/^(inbox|updates|notifications)$/i.test(text) || /updates\s*(&|and)?\s*inbox/i.test(text)) {
          const clickable = item.closest('[role="button"]') || item;
          return clickable;
        }
      }
      return null;
    }
    dispatchShortcut() {
      const target = document.activeElement || document.body || document.documentElement || window;
      const evtMac = new KeyboardEvent("keydown", {
        key: ",",
        code: "Comma",
        keyCode: 188,
        which: 188,
        metaKey: true,
        ctrlKey: false,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(evtMac);
      window.dispatchEvent(evtMac);
      document.dispatchEvent(evtMac);
      const evtWin = new KeyboardEvent("keydown", {
        key: ",",
        code: "Comma",
        keyCode: 188,
        which: 188,
        metaKey: false,
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(evtWin);
      window.dispatchEvent(evtWin);
      document.dispatchEvent(evtWin);
      return true;
    }
    observeSettingsDialog() {
      let checkQueued = false;
      const observer = new MutationObserver(() => {
        if (checkQueued) return;
        checkQueued = true;
        requestAnimationFrame(() => {
          checkQueued = false;
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog && !dialog.classList.contains("notionflow-settings-enhanced")) {
            dialog.classList.add("notionflow-settings-enhanced");
            dialog.style.setProperty("-webkit-overflow-scrolling", "touch");
          }
        });
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
    setupModalDismissListeners() {
      document.addEventListener("click", (e) => {
        const target = e.target;
        if (target?.closest("#notionflow-close-settings-modal")) {
          this.closeSettings();
        } else if (target?.id === "notionflow-sim-settings-modal") {
          this.closeSettings();
        }
      });
      document.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === "," || e.code === "Comma")) {
          e.preventDefault();
          this.toggleSettings();
        }
      });
    }
  };

  // src/engine/updater.ts
  var NOTIONFLOW_VERSION = "1.3.2";
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

  // src/ui/floating-bar.ts
  var FloatingBar = class {
    constructor(viewport, sidebar, carousel, settings, updater) {
      this.viewport = viewport;
      this.sidebar = sidebar;
      this.carousel = carousel;
      this.settings = settings;
      this.updater = updater;
      this.injectStyles();
    }
    container = null;
    isCollapsed = false;
    zoomMenuOpen = false;
    init() {
      this.createBar();
    }
    injectStyles() {
      if (document.getElementById("notionflow-fab-styles")) return;
      const style = document.createElement("style");
      style.id = "notionflow-fab-styles";
      style.textContent = `
      .notionflow-fab-container {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(22, 22, 24, 0.84);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 32px;
        padding: 6px 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
      }

      @media (max-width: 420px) {
        .notionflow-fab-container {
          gap: 3px;
          padding: 4px 6px;
          bottom: 14px;
          max-width: 96vw;
        }
        .notionflow-fab-btn {
          width: 36px !important;
          height: 36px !important;
        }
        .notionflow-fab-btn svg {
          width: 16px !important;
          height: 16px !important;
        }
      }

      .notionflow-fab-container.collapsed {
        transform: translateX(-50%) translateY(45px);
        opacity: 0.35;
      }

      .notionflow-fab-container.collapsed:hover,
      .notionflow-fab-container.collapsed:active {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      .notionflow-fab-btn {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.18s ease;
        position: relative;
      }

      .notionflow-fab-btn:active {
        background: rgba(255, 255, 255, 0.24);
        transform: scale(0.92);
      }

      .notionflow-fab-btn.primary {
        background: #2383e2;
        color: #ffffff;
      }

      .notionflow-fab-btn svg {
        width: 18px;
        height: 18px;
      }

      .notionflow-fab-divider {
        width: 1px;
        height: 20px;
        background: rgba(255, 255, 255, 0.15);
        margin: 0 1px;
      }

      /* Zoom & Preferences Popover Menu */
      .notionflow-zoom-popover {
        position: absolute;
        bottom: 54px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(24, 24, 26, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 16px;
        padding: 12px 14px;
        display: none;
        flex-direction: column;
        gap: 10px;
        min-width: 230px;
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.6);
      }

      .notionflow-zoom-popover.visible {
        display: flex;
        animation: notionflow-zoom-pop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes notionflow-zoom-pop {
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }

      .notionflow-zoom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
      }

      .notionflow-zoom-presets {
        display: flex;
        gap: 5px;
      }

      .notionflow-zoom-preset-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 6px;
        color: #ddd;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 6px;
        cursor: pointer;
      }

      .notionflow-zoom-preset-btn.active {
        background: #2383e2;
        color: #fff;
      }
    `;
      safeAppend(style);
    }
    createBar() {
      if (this.container) return;
      this.container = document.createElement("div");
      this.container.id = "notionflow-fab-container";
      this.container.className = "notionflow-fab-container";
      safeSetHTML(
        this.container,
        `
      <!-- Sidebar Toggle -->
      <button class="notionflow-fab-btn" id="notionflow-btn-sidebar" title="Toggle Sidebar (Cmd+\\)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>

      <!-- Quick Find (Cmd+P) -->
      <button class="notionflow-fab-btn primary" id="notionflow-btn-search" title="Quick Search (Cmd+P)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      <!-- Notion Full Settings (Cmd+,) -->
      <button class="notionflow-fab-btn" id="notionflow-btn-settings" title="Notion Settings & Members (Cmd+,)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <!-- New Page (Cmd+N) -->
      <button class="notionflow-fab-btn" id="notionflow-btn-new" title="New Page (Cmd+N)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <div class="notionflow-fab-divider"></div>

      <!-- Undo -->
      <button class="notionflow-fab-btn" id="notionflow-btn-undo" title="Undo (Cmd+Z)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>

      <!-- Zoom & Settings Trigger -->
      <div style="position: relative;">
        <button class="notionflow-fab-btn" id="notionflow-btn-zoom" title="Scale & Preferences">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>

        <!-- Popover -->
        <div class="notionflow-zoom-popover" id="notionflow-zoom-menu">
          <div class="notionflow-zoom-row">
            <span>Viewport Zoom</span>
            <span id="notionflow-zoom-text">${this.viewport.getZoom()}%</span>
          </div>
          <input type="range" id="notionflow-zoom-slider" min="60" max="140" step="5" value="${this.viewport.getZoom()}" style="width: 100%; accent-color: #2383e2;">
          <div class="notionflow-zoom-presets">
            <button class="notionflow-zoom-preset-btn" data-zoom="75">75%</button>
            <button class="notionflow-zoom-preset-btn" data-zoom="90">90%</button>
            <button class="notionflow-zoom-preset-btn active" data-zoom="100">100%</button>
            <button class="notionflow-zoom-preset-btn" data-zoom="115">115%</button>
            <button class="notionflow-zoom-preset-btn" data-zoom="130">130%</button>
          </div>

          <div style="height: 1px; background: rgba(255, 255, 255, 0.1); margin: 4px 0;"></div>

          <button id="notionflow-popover-open-settings" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; background: rgba(35, 131, 226, 0.15); border: 1px solid rgba(35, 131, 226, 0.4); color: #58a6ff; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Full Settings & Members
          </button>

          <button id="notionflow-popover-open-inbox" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e0e0e0; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; margin-top: 5px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notifications & Inbox
          </button>

          <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 2px 0;"></div>

          <!-- Version & Update status -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #888;">
            <span>NotionFlow v${NOTIONFLOW_VERSION}</span>
            <button id="notionflow-btn-check-update" style="background: transparent; border: none; color: #58a6ff; font-size: 11px; font-weight: 600; cursor: pointer; padding: 2px 4px;">Check for update</button>
          </div>
        </div>
      </div>

      <div class="notionflow-fab-divider"></div>

      <!-- Carousel / Stack Toggle -->
      <button class="notionflow-fab-btn" id="notionflow-btn-carousel" title="Toggle Snap Carousel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="18" x="14" y="3" rx="1"/></svg>
      </button>

      <!-- Collapse FAB Pill -->
      <button class="notionflow-fab-btn" id="notionflow-btn-collapse" title="Minimize Bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    `
      );
      this.attachEventListeners();
      safeAppendBody(this.container);
    }
    attachEventListeners() {
      this.container?.querySelector("#notionflow-btn-sidebar")?.addEventListener("click", () => {
        this.sidebar.toggleSidebar();
      });
      this.container?.querySelector("#notionflow-btn-search")?.addEventListener("click", () => {
        const evt = new KeyboardEvent("keydown", { key: "p", code: "KeyP", metaKey: true, bubbles: true });
        document.dispatchEvent(evt);
      });
      this.container?.querySelector("#notionflow-btn-settings")?.addEventListener("click", () => {
        this.settings.toggleSettings();
      });
      this.container?.querySelector("#notionflow-btn-new")?.addEventListener("click", () => {
        const evt = new KeyboardEvent("keydown", { key: "n", code: "KeyN", metaKey: true, bubbles: true });
        document.dispatchEvent(evt);
      });
      this.container?.querySelector("#notionflow-btn-undo")?.addEventListener("click", () => {
        const evt = new KeyboardEvent("keydown", { key: "z", code: "KeyZ", metaKey: true, bubbles: true });
        document.dispatchEvent(evt);
      });
      const zoomBtn = this.container?.querySelector("#notionflow-btn-zoom");
      const zoomMenu = this.container?.querySelector("#notionflow-zoom-menu");
      const zoomSlider = this.container?.querySelector("#notionflow-zoom-slider");
      const zoomText = this.container?.querySelector("#notionflow-zoom-text");
      zoomBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.zoomMenuOpen = !this.zoomMenuOpen;
        zoomMenu?.classList.toggle("visible", this.zoomMenuOpen);
      });
      document.addEventListener("click", (e) => {
        if (this.zoomMenuOpen && !zoomMenu?.contains(e.target) && e.target !== zoomBtn) {
          this.zoomMenuOpen = false;
          zoomMenu?.classList.remove("visible");
        }
      });
      this.container?.querySelector("#notionflow-popover-open-settings")?.addEventListener("click", () => {
        this.zoomMenuOpen = false;
        zoomMenu?.classList.remove("visible");
        this.settings.openFullSettings();
      });
      this.container?.querySelector("#notionflow-popover-open-inbox")?.addEventListener("click", () => {
        this.zoomMenuOpen = false;
        zoomMenu?.classList.remove("visible");
        this.settings.openNotifications();
      });
      const checkBtn = this.container?.querySelector("#notionflow-btn-check-update");
      checkBtn?.addEventListener("click", async () => {
        if (checkBtn) checkBtn.textContent = "Checking...";
        const res = await this.updater.check(true);
        if (checkBtn) {
          checkBtn.textContent = res.hasUpdate ? `Update v${res.latestVersion} available!` : "Up to date \u2713";
          setTimeout(() => {
            if (checkBtn) checkBtn.textContent = "Check for update";
          }, 3500);
        }
      });
      zoomSlider?.addEventListener("input", () => {
        const val = parseInt(zoomSlider.value, 10);
        this.viewport.setZoom(val);
        if (zoomText) zoomText.textContent = `${val}%`;
      });
      this.container?.querySelectorAll(".notionflow-zoom-preset-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const val = parseInt(btn.getAttribute("data-zoom") || "100", 10);
          this.viewport.setZoom(val);
          if (zoomSlider) zoomSlider.value = val.toString();
          if (zoomText) zoomText.textContent = `${val}%`;
          this.container?.querySelectorAll(".notionflow-zoom-preset-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
      const carouselBtn = this.container?.querySelector("#notionflow-btn-carousel");
      carouselBtn?.addEventListener("click", () => {
        const isCurrentlyEnabled = this.carousel.isEnabled();
        this.carousel.setEnabled(!isCurrentlyEnabled);
        carouselBtn.classList.toggle("primary", !isCurrentlyEnabled);
      });
      const collapseBtn = this.container?.querySelector("#notionflow-btn-collapse");
      collapseBtn?.addEventListener("click", () => {
        this.isCollapsed = !this.isCollapsed;
        this.container?.classList.toggle("collapsed", this.isCollapsed);
      });
    }
  };

  // src/userscript/notion-flow.user.ts
  (function() {
    "use strict";
    if (window.self !== window.top) {
      return;
    }
    console.log("[NotionFlow Userscript] Initializing on Notion Desktop...");
    initSpoofing();
    const boot = () => {
      try {
        const viewport = new ViewportController();
        const carousel = new ColumnsCarouselManager();
        const database = new DatabaseEnhancer();
        const touchHandles = new TouchHandlesManager();
        const sidebar = new SidebarDrawerManager();
        const keyboard = new KeyboardToolbarManager();
        const settings = new SettingsManager();
        const updater = new UpdateChecker();
        const floatingBar = new FloatingBar(viewport, sidebar, carousel, settings, updater);
        viewport.init();
        carousel.init();
        database.init();
        touchHandles.init();
        sidebar.init();
        keyboard.init();
        settings.init();
        updater.init();
        floatingBar.init();
        console.log("[NotionFlow Userscript] All systems operational with Auto-Updater active \u{1F680}");
      } catch (err) {
        console.error("[NotionFlow Userscript] Initialization error:", err);
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  })();
})();
