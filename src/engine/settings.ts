/**
 * NotionFlow - Notion Settings & Preferences Coordinator
 * Provides instant 1-tap access to Notion's full desktop Settings & Members
 * (Workspace, Billing, Members, Integrations, Connections, Security)
 * and ensures full mobile touch responsiveness on iOS screens.
 */

export class SettingsManager {
  private isModalOpen: boolean = false;

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.observeSettingsDialog();
    this.setupModalDismissListeners();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-settings-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-settings-styles';
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
    document.head.appendChild(style);
  }

  /**
   * Opens Notion's full desktop Settings & Members dialog.
   * Employs multi-strategy trigger:
   * 1. Direct click on Notion's sidebar Settings button.
   * 2. Simulated Cmd+, / Ctrl+, keyboard shortcut.
   * 3. Fallback to simulator/standalone settings modal if present.
   */
  public openFullSettings(): void {
    console.log('[NotionFlow] Opening Notion Full Settings & Members...');

    // Strategy 1: Find Notion's Settings item in the DOM
    const settingsButton = this.findNotionSettingsButton();
    if (settingsButton) {
      settingsButton.click();
      this.isModalOpen = true;
      return;
    }

    // Strategy 2: Simulate Cmd+, (Mac) or Ctrl+, (Windows)
    const dispatched = this.dispatchShortcut();
    if (dispatched) {
      this.isModalOpen = true;
    }

    // Strategy 3: Check for sandbox / simulator modal in index.html
    const simModal = document.querySelector<HTMLElement>('#notionflow-sim-settings-modal');
    if (simModal) {
      simModal.style.display = 'flex';
      this.isModalOpen = true;
    }
  }

  /**
   * Closes the settings modal via Escape or clicking close button.
   */
  public closeSettings(): void {
    const escEvt = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(escEvt);

    const closeBtn = document.querySelector<HTMLElement>(
      '[role="dialog"] [aria-label*="Close" i], [role="dialog"] button:has(svg)'
    );
    if (closeBtn) closeBtn.click();

    const simModal = document.querySelector<HTMLElement>('#notionflow-sim-settings-modal');
    if (simModal) simModal.style.display = 'none';

    this.isModalOpen = false;
  }

  public toggleSettings(): void {
    if (this.isOpen()) {
      this.closeSettings();
    } else {
      this.openFullSettings();
    }
  }

  public isOpen(): boolean {
    const dialog = document.querySelector('[role="dialog"]');
    const simModal = document.querySelector<HTMLElement>('#notionflow-sim-settings-modal');
    return this.isModalOpen || Boolean((dialog && dialog.clientHeight > 100) || (simModal && simModal.style.display !== 'none'));
  }

  private findNotionSettingsButton(): HTMLElement | null {
    // 1. Look for explicit aria-label
    const byAria = document.querySelector<HTMLElement>('[role="button"][aria-label*="Settings" i], [role="button"][aria-label*="Paramètres" i], [role="button"][aria-label*="Einstellungen" i]');
    if (byAria) return byAria;

    // 2. Query all sidebar items for "Settings" text
    const sidebarItems = document.querySelectorAll<HTMLElement>(
      '.notion-sidebar-container [role="button"], .notion-sidebar-container div, .notion-sidebar-item'
    );
    for (const item of Array.from(sidebarItems)) {
      const text = item.textContent?.trim() || '';
      if (/settings\s*(&|and)?\s*members/i.test(text) || /^settings$/i.test(text)) {
        const clickable = (item.closest('[role="button"]') || item) as HTMLElement;
        return clickable;
      }
    }

    return null;
  }

  public openNotifications(): void {
    console.log('[NotionFlow] Opening Notion Desktop Notifications / Inbox...');
    const notifBtn = this.findNotionNotificationsButton();
    if (notifBtn) {
      notifBtn.click();
      return;
    }
  }

  public findNotionNotificationsButton(): HTMLElement | null {
    // 1. By aria-label
    const byAria = document.querySelector<HTMLElement>(
      '[role="button"][aria-label*="Updates" i], [role="button"][aria-label*="Inbox" i], [role="button"][aria-label*="Notifications" i]'
    );
    if (byAria) return byAria;

    // 2. Query sidebar items for "Inbox" or "Updates"
    const sidebarItems = document.querySelectorAll<HTMLElement>(
      '.notion-sidebar-container [role="button"], .notion-sidebar-container div, .notion-sidebar-item'
    );
    for (const item of Array.from(sidebarItems)) {
      const text = item.textContent?.trim() || '';
      if (/^(inbox|updates|notifications)$/i.test(text) || /updates\s*(&|and)?\s*inbox/i.test(text)) {
        const clickable = (item.closest('[role="button"]') || item) as HTMLElement;
        return clickable;
      }
    }
    return null;
  }

  private dispatchShortcut(): boolean {
    const target = document.activeElement || document.body;

    // Mac Cmd+, event
    const evtMac = new KeyboardEvent('keydown', {
      key: ',',
      code: 'Comma',
      keyCode: 188,
      which: 188,
      metaKey: true,
      ctrlKey: false,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(evtMac);
    window.dispatchEvent(evtMac);
    document.dispatchEvent(evtMac);

    // Windows/Linux Ctrl+, event fallback
    const evtWin = new KeyboardEvent('keydown', {
      key: ',',
      code: 'Comma',
      keyCode: 188,
      which: 188,
      metaKey: false,
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(evtWin);
    window.dispatchEvent(evtWin);
    document.dispatchEvent(evtWin);

    return true;
  }

  private observeSettingsDialog(): void {
    const observer = new MutationObserver(() => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      if (dialog && !dialog.classList.contains('notionflow-settings-enhanced')) {
        dialog.classList.add('notionflow-settings-enhanced');
        // Ensure scroll elasticity on iOS
        dialog.style.setProperty('-webkit-overflow-scrolling', 'touch');
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private setupModalDismissListeners(): void {
    // Dismiss simulator / sandbox modal on close button or backdrop click
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('#notionflow-close-settings-modal')) {
        this.closeSettings();
      } else if (target?.id === 'notionflow-sim-settings-modal') {
        this.closeSettings();
      }
    });

    // Global keyboard shortcut: Cmd+, (Mac/iOS) or Ctrl+, (Windows/Linux)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === ',' || e.code === 'Comma')) {
        e.preventDefault();
        this.toggleSettings();
      }
    });
  }
}
