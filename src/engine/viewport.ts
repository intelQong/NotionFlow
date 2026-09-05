/**
 * NotionFlow - Dynamic Viewport & Scaling Controller
 * Dynamically recalculates viewport scale, manages zoom presets,
 * and maintains readable font sizes while preserving desktop layouts.
 */

export interface ViewportConfig {
  defaultWidth: number; // Default desktop width to emulate (e.g. 1024px)
  zoomPercent: number;  // Current zoom level (e.g. 100)
  minZoom: number;      // Minimum zoom allowed (e.g. 60)
  maxZoom: number;      // Maximum zoom allowed (e.g. 150)
}

import { safeAppend } from './dom-utils';

const STORAGE_KEY_ZOOM = 'notionflow_zoom_level';

export class ViewportController {
  private config: ViewportConfig = {
    defaultWidth: 1024,
    zoomPercent: 100,
    minZoom: 60,
    maxZoom: 150
  };

  private styleElement: HTMLStyleElement | null = null;
  private onZoomChangeCallbacks: ((zoom: number) => void)[] = [];

  constructor() {
    this.loadPersistedZoom();
    this.injectStyleTag();
  }

  public init(): void {
    this.setupViewportMeta();
    this.applyZoom(this.config.zoomPercent);
    this.setupOrientationListener();
  }

  private loadPersistedZoom(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ZOOM);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= this.config.minZoom && val <= this.config.maxZoom) {
          this.config.zoomPercent = val;
        }
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }

  private injectStyleTag(): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'notionflow-viewport-style';
      safeAppend(this.styleElement);
    }
  }

  public setupViewportMeta(): void {
    let meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      safeAppend(meta);
    }

    // Set interactive responsive desktop viewport
    meta.content = `width=${this.config.defaultWidth}, initial-scale=1.0, minimum-scale=0.5, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover`;
  }

  public setZoom(percent: number): void {
    const clamped = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, percent));
    this.config.zoomPercent = clamped;
    try {
      localStorage.setItem(STORAGE_KEY_ZOOM, clamped.toString());
    } catch {}

    this.applyZoom(clamped);
    this.onZoomChangeCallbacks.forEach(cb => cb(clamped));
  }

  public getZoom(): number {
    return this.config.zoomPercent;
  }

  public zoomIn(step: number = 10): void {
    this.setZoom(this.config.zoomPercent + step);
  }

  public zoomOut(step: number = 10): void {
    this.setZoom(this.config.zoomPercent - step);
  }

  public resetZoom(): void {
    this.setZoom(100);
  }

  public onZoomChange(callback: (zoom: number) => void): void {
    this.onZoomChangeCallbacks.push(callback);
  }

  private applyZoom(percent: number): void {
    if (!this.styleElement) return;

    const scale = percent / 100;
    // Apply zoom gracefully via CSS properties
    // Using CSS zoom and responsive typography adjustments:
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

  private setupOrientationListener(): void {
    const updateForOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      this.config.defaultWidth = isLandscape ? 1200 : 960;
      this.setupViewportMeta();
    };

    window.addEventListener('resize', updateForOrientation);
    window.addEventListener('orientationchange', updateForOrientation);
  }
}
