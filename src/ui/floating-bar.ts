/**
 * NotionFlow - Power-User Floating Action Bar (FAB)
 * Glassmorphism floating pill providing quick search, sidebar toggle,
 * full Notion settings & members access, zoom controls, undo/redo, and carousel.
 */

import { ViewportController } from '../engine/viewport';
import { SidebarDrawerManager } from '../engine/sidebar-drawer';
import { ColumnsCarouselManager } from '../engine/columns-carousel';
import { SettingsManager } from '../engine/settings';
import { UpdateChecker, NOTIONFLOW_VERSION } from '../engine/updater';
import { safeAppend, safeAppendBody } from '../engine/dom-utils';

export class FloatingBar {
  private container: HTMLElement | null = null;
  private isCollapsed: boolean = false;
  private zoomMenuOpen: boolean = false;

  constructor(
    private viewport: ViewportController,
    private sidebar: SidebarDrawerManager,
    private carousel: ColumnsCarouselManager,
    private settings: SettingsManager,
    private updater: UpdateChecker
  ) {
    this.injectStyles();
  }

  public init(): void {
    this.createBar();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-fab-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-fab-styles';
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

  private createBar(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'notionflow-fab-container';
    this.container.className = 'notionflow-fab-container';

    this.container.innerHTML = `
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
    `;

    this.attachEventListeners();
    safeAppendBody(this.container);
  }

  private attachEventListeners(): void {
    // Sidebar
    this.container?.querySelector('#notionflow-btn-sidebar')?.addEventListener('click', () => {
      this.sidebar.toggleSidebar();
    });

    // Quick Search (Cmd+P)
    this.container?.querySelector('#notionflow-btn-search')?.addEventListener('click', () => {
      const evt = new KeyboardEvent('keydown', { key: 'p', code: 'KeyP', metaKey: true, bubbles: true });
      document.dispatchEvent(evt);
    });

    // Notion Settings (Cmd+,)
    this.container?.querySelector('#notionflow-btn-settings')?.addEventListener('click', () => {
      this.settings.toggleSettings();
    });

    // New Page (Cmd+N)
    this.container?.querySelector('#notionflow-btn-new')?.addEventListener('click', () => {
      const evt = new KeyboardEvent('keydown', { key: 'n', code: 'KeyN', metaKey: true, bubbles: true });
      document.dispatchEvent(evt);
    });

    // Undo
    this.container?.querySelector('#notionflow-btn-undo')?.addEventListener('click', () => {
      const evt = new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, bubbles: true });
      document.dispatchEvent(evt);
    });

    // Zoom Popover Toggle
    const zoomBtn = this.container?.querySelector('#notionflow-btn-zoom');
    const zoomMenu = this.container?.querySelector('#notionflow-zoom-menu') as HTMLElement | null;
    const zoomSlider = this.container?.querySelector('#notionflow-zoom-slider') as HTMLInputElement | null;
    const zoomText = this.container?.querySelector('#notionflow-zoom-text');

    zoomBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.zoomMenuOpen = !this.zoomMenuOpen;
      zoomMenu?.classList.toggle('visible', this.zoomMenuOpen);
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (this.zoomMenuOpen && !zoomMenu?.contains(e.target as Node) && e.target !== zoomBtn) {
        this.zoomMenuOpen = false;
        zoomMenu?.classList.remove('visible');
      }
    });

    // Popover Settings Button
    this.container?.querySelector('#notionflow-popover-open-settings')?.addEventListener('click', () => {
      this.zoomMenuOpen = false;
      zoomMenu?.classList.remove('visible');
      this.settings.openFullSettings();
    });

    // Popover Inbox Button
    this.container?.querySelector('#notionflow-popover-open-inbox')?.addEventListener('click', () => {
      this.zoomMenuOpen = false;
      zoomMenu?.classList.remove('visible');
      this.settings.openNotifications();
    });

    // Popover Check For Update Button
    const checkBtn = this.container?.querySelector('#notionflow-btn-check-update') as HTMLElement | null;
    checkBtn?.addEventListener('click', async () => {
      if (checkBtn) checkBtn.textContent = 'Checking...';
      const res = await this.updater.check(true);
      if (checkBtn) {
        checkBtn.textContent = res.hasUpdate ? `Update v${res.latestVersion} available!` : 'Up to date ✓';
        setTimeout(() => {
          if (checkBtn) checkBtn.textContent = 'Check for update';
        }, 3500);
      }
    });

    zoomSlider?.addEventListener('input', () => {
      const val = parseInt(zoomSlider.value, 10);
      this.viewport.setZoom(val);
      if (zoomText) zoomText.textContent = `${val}%`;
    });

    this.container?.querySelectorAll('.notionflow-zoom-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-zoom') || '100', 10);
        this.viewport.setZoom(val);
        if (zoomSlider) zoomSlider.value = val.toString();
        if (zoomText) zoomText.textContent = `${val}%`;
        this.container?.querySelectorAll('.notionflow-zoom-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Carousel Toggle
    const carouselBtn = this.container?.querySelector('#notionflow-btn-carousel');
    carouselBtn?.addEventListener('click', () => {
      const isCurrentlyEnabled = this.carousel.isEnabled();
      this.carousel.setEnabled(!isCurrentlyEnabled);
      carouselBtn.classList.toggle('primary', !isCurrentlyEnabled);
    });

    // Collapse FAB
    const collapseBtn = this.container?.querySelector('#notionflow-btn-collapse');
    collapseBtn?.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      this.container?.classList.toggle('collapsed', this.isCollapsed);
    });
  }
}
