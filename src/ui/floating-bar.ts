/**
 * NotionFlow - Power-User Floating Action Bar (FAB)
 * Glassmorphism floating pill providing quick search, sidebar toggle,
 * zoom controls, undo/redo, focus mode, and layout switcher.
 */

import { ViewportController } from '../engine/viewport';
import { SidebarDrawerManager } from '../engine/sidebar-drawer';
import { ColumnsCarouselManager } from '../engine/columns-carousel';

export class FloatingBar {
  private container: HTMLElement | null = null;
  private isCollapsed: boolean = false;
  private zoomMenuOpen: boolean = false;

  constructor(
    private viewport: ViewportController,
    private sidebar: SidebarDrawerManager,
    private carousel: ColumnsCarouselManager
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
        background: rgba(22, 22, 24, 0.82);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 32px;
        padding: 6px 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        user-select: none;
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
        width: 40px;
        height: 40px;
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
        height: 22px;
        background: rgba(255, 255, 255, 0.15);
        margin: 0 2px;
      }

      /* Zoom Popover Menu */
      .notionflow-zoom-popover {
        position: absolute;
        bottom: 56px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(26, 26, 28, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        padding: 12px 14px;
        display: none;
        flex-direction: column;
        gap: 10px;
        min-width: 210px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
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
        gap: 6px;
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
    document.head.appendChild(style);
  }

  private createBar(): void {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'notionflow-fab-container';

    this.container.innerHTML = `
      <!-- Sidebar Toggle -->
      <button class="notionflow-fab-btn" id="notionflow-btn-sidebar" title="Toggle Sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>

      <!-- Quick Find (Cmd+P) -->
      <button class="notionflow-fab-btn primary" id="notionflow-btn-search" title="Quick Search (Cmd+P)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </button>

      <!-- New Page (Cmd+N) -->
      <button class="notionflow-fab-btn" id="notionflow-btn-new" title="New Page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      <div class="notionflow-fab-divider"></div>

      <!-- Undo -->
      <button class="notionflow-fab-btn" id="notionflow-btn-undo" title="Undo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>

      <!-- Redo -->
      <button class="notionflow-fab-btn" id="notionflow-btn-redo" title="Redo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
      </button>

      <!-- Zoom Menu Trigger -->
      <div style="position: relative;">
        <button class="notionflow-fab-btn" id="notionflow-btn-zoom" title="Zoom & Scaling">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>

        <!-- Zoom Popover -->
        <div class="notionflow-zoom-popover" id="notionflow-zoom-menu">
          <div class="notionflow-zoom-row">
            <span>Scale Level</span>
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
    document.body.appendChild(this.container);
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

    // Redo
    this.container?.querySelector('#notionflow-btn-redo')?.addEventListener('click', () => {
      const evt = new KeyboardEvent('keydown', { key: 'z', code: 'KeyZ', metaKey: true, shiftKey: true, bubbles: true });
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

    // Close zoom popover when clicking outside
    document.addEventListener('click', (e) => {
      if (this.zoomMenuOpen && !zoomMenu?.contains(e.target as Node) && e.target !== zoomBtn) {
        this.zoomMenuOpen = false;
        zoomMenu?.classList.remove('visible');
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
