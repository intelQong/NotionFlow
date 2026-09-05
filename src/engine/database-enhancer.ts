/**
 * NotionFlow - Database Enhancer
 * Adds sticky primary column, full-screen database focus mode,
 * and smooth touch scrolling for Notion table and board views.
 */

import { safeAppend, safeAppendBody, safeSetHTML } from './dom-utils';

export class DatabaseEnhancer {
  private isFocusModeActive: boolean = false;
  private currentFocusedDB: HTMLElement | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.enhanceTables();
    this.observeMutations();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-db-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-db-styles';
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
    document.documentElement.classList.add('notionflow-sticky-col-enabled');
  }

  private enhanceTables(): void {
    const dbs = document.querySelectorAll<HTMLElement>('.notion-collection-view-body, .notion-table-view, [data-block-id].notion-collection_view-block');
    dbs.forEach(db => this.attachFocusButton(db));
  }

  private attachFocusButton(dbContainer: HTMLElement): void {
    if (dbContainer.querySelector('.notionflow-db-focus-btn')) return;

    // Find the view switcher or collection header
    const header = dbContainer.querySelector('.notion-collection-view-tabs, [role="tablist"]') || dbContainer;
    
    const focusBtn = document.createElement('button');
    focusBtn.className = 'notionflow-db-focus-btn';
    safeSetHTML(
      focusBtn,
      `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
      Focus View
    `
    );

    focusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDatabaseFocus(dbContainer);
    });

    header.appendChild(focusBtn);
  }

  public toggleDatabaseFocus(dbContainer?: HTMLElement): void {
    if (this.isFocusModeActive && this.currentFocusedDB) {
      // Exit focus mode
      this.currentFocusedDB.classList.remove('notionflow-db-focused');
      document.querySelector('.notionflow-db-close-btn')?.remove();
      this.currentFocusedDB = null;
      this.isFocusModeActive = false;
    } else if (dbContainer) {
      // Enter focus mode
      this.currentFocusedDB = dbContainer;
      dbContainer.classList.add('notionflow-db-focused');
      this.isFocusModeActive = true;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'notionflow-db-close-btn';
      closeBtn.textContent = '✕ Exit Focus';
      closeBtn.addEventListener('click', () => this.toggleDatabaseFocus());
      safeAppendBody(closeBtn);
    }
  }

  private observeMutations(): void {
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
}
