/**
 * NotionFlow - Pure Desktop Mode for iOS & iPadOS
 * Unlocks the full desktop Notion web app on iPhone and iPad Safari via lightweight userscript.
 */

import { initSpoofing } from '../engine/spoof';
import { UpdateChecker } from '../engine/updater';

(function () {
  'use strict';

  // Only run in top-level window; do not inject into third-party auth iframes
  if (window.self !== window.top) {
    return;
  }

  console.log('[NotionFlow] Initializing Pure Desktop Mode on iOS & iPadOS...');

  // 1. Activate desktop environment masking & responsive usability immediately
  initSpoofing();

  // 2. Initialize background update checker
  const updater = new UpdateChecker();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updater.init());
  } else {
    updater.init();
  }

  console.log('[NotionFlow] Pure Desktop Mode Active 🚀');
})();
