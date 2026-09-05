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
import { FloatingBar } from '../ui/floating-bar';

(function () {
  'use strict';

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
      const floatingBar = new FloatingBar(viewport, sidebar, carousel);

      viewport.init();
      carousel.init();
      database.init();
      touchHandles.init();
      sidebar.init();
      keyboard.init();
      floatingBar.init();

      console.log('[NotionFlow Userscript] All systems operational 🚀');
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
