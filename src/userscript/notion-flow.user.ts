/**
 * NotionFlow - Standalone Safari & Mobile Userscript Entry Point
 * Designed for iOS Safari Extensions (Userscripts, Stay, Orion, Tampermonkey)
 * and WKUserScript native injection.
 */

import { initSpoofing } from '../engine/spoof';
import { ViewportController } from '../engine/viewport';
import { ColumnsCarouselManager } from '../engine/columns-carousel';
import { DatabaseEnhancer } from '../engine/database-enhancer';
import { TouchHandlesManager } from '../engine/touch-handles';
import { SidebarDrawerManager } from '../engine/sidebar-drawer';
import { KeyboardToolbarManager } from '../engine/keyboard-toolbar';
import { SettingsManager } from '../engine/settings';
import { UpdateChecker } from '../engine/updater';
import { FloatingBar } from '../ui/floating-bar';

(function () {
  'use strict';

  // Only run in top-level window; do not inject into third-party auth iframes (Google One Tap, Stripe, etc.)
  if (window.self !== window.top) {
    return;
  }

  console.log('[NotionFlow Userscript] Initializing on Notion Desktop...');

  // 1. Spoof environment immediately
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

      console.log('[NotionFlow Userscript] All systems operational with Auto-Updater active 🚀');
    } catch (err) {
      console.error('[NotionFlow Userscript] Initialization error:', err);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
