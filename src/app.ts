/**
 * NotionFlow - Main Application Coordinator
 * Boots up desktop spoofing, viewport management, snap carousel,
 * database enhancements, touch handles, keyboard toolbar, settings manager, updater, and FAB.
 */

import { initSpoofing } from './engine/spoof';
import { ViewportController } from './engine/viewport';
import { ColumnsCarouselManager } from './engine/columns-carousel';
import { DatabaseEnhancer } from './engine/database-enhancer';
import { TouchHandlesManager } from './engine/touch-handles';
import { SidebarDrawerManager } from './engine/sidebar-drawer';
import { KeyboardToolbarManager } from './engine/keyboard-toolbar';
import { SettingsManager } from './engine/settings';
import { UpdateChecker } from './engine/updater';
import { FloatingBar } from './ui/floating-bar';
import { SimulatorFrame } from './ui/simulator-frame';

export class NotionFlowApp {
  private viewport: ViewportController;
  private carousel: ColumnsCarouselManager;
  private database: DatabaseEnhancer;
  private touchHandles: TouchHandlesManager;
  private sidebar: SidebarDrawerManager;
  private keyboard: KeyboardToolbarManager;
  private settings: SettingsManager;
  private updater: UpdateChecker;
  private floatingBar: FloatingBar;
  private simulator: SimulatorFrame;

  constructor() {
    // 1. Initialize desktop spoofing immediately
    initSpoofing();

    // 2. Instantiate controllers
    this.viewport = new ViewportController();
    this.carousel = new ColumnsCarouselManager();
    this.database = new DatabaseEnhancer();
    this.touchHandles = new TouchHandlesManager();
    this.sidebar = new SidebarDrawerManager();
    this.keyboard = new KeyboardToolbarManager();
    this.settings = new SettingsManager();
    this.updater = new UpdateChecker();
    this.floatingBar = new FloatingBar(this.viewport, this.sidebar, this.carousel, this.settings, this.updater);
    this.simulator = new SimulatorFrame();
  }

  public start(): void {
    // Only mount simulator shell if in standalone web preview mode
    if (document.querySelector('.notionflow-device-bezel')) {
      this.simulator.init();
    }

    // Initialize core dynamic engine
    this.viewport.init();
    this.carousel.init();
    this.database.init();
    this.touchHandles.init();
    this.sidebar.init();
    this.keyboard.init();
    this.settings.init();
    this.updater.init();
    this.floatingBar.init();

    console.log('[NotionFlow] All power-user mobile wrapper systems active 🚀');
  }
}

// Auto-boot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new NotionFlowApp();
  app.start();
});
