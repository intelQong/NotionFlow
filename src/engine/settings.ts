/**
 * NotionFlow - Notion Settings & Preferences Coordinator
 * Provides instant 1-tap access to Notion's full desktop Settings & Members
 * (Workspace, Billing, Members, Integrations, Connections, Security)
 * and ensures full mobile touch responsiveness on iOS screens.
 */

import { safeAppend } from './dom-utils';

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
         Notion Settings & Members Dialog - Desktop Layout Preserver
         ============================================================ */
      @media (max-width: 1080px) {
        /* Dialog Container */
        .notion-overlay-container [role="dialog"],
        .notion-settings-dialog,
        .notionflow-settings-dialog {
          max-width: 96vw !important;
          max-height: 92vh !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          overflow: hidden !important;
          z-index: 100000 !important;
        }

        /* Enlarge touch targets inside settings */
        [role="dialog"] input,
        [role="dialog"] button,
        [role="dialog"] select,
        [role="dialog"] [role="switch"] {
          min-height: 40px !important;
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
   * Multi-strategy priority:
   * 1. Direct click on Notion's desktop sidebar Settings & Members item.
   * 2. If sidebar is collapsed, reveal sidebar and click Settings.
   * 3. Native Notion SPA router navigation via ?openSettingsTab=account parameter.
   */
  public openFullSettings(): void {
    console.log('[NotionFlow] Opening Notion Full Desktop Settings & Members...');

    // Strategy 1: Click "Settings & members" inside desktop sidebar
    const settingsButton = this.findNotionSettingsButton();
    if (settingsButton) {
      settingsButton.click();
      this.isModalOpen = true;
      return;
    }

    // Strategy 2: If sidebar is collapsed, reveal sidebar first and click
    const toggleBtn = document.querySelector<HTMLElement>(
      '[role="button"][aria-label*="sidebar" i], .notion-topbar [role="button"] svg path[d*="M2"]'
    )?.closest('div[role="button"]') as HTMLElement | null;

    if (toggleBtn && !document.querySelector('.notion-sidebar-container')) {
      toggleBtn.click();
      setTimeout(() => {
        const btn = this.findNotionSettingsButton();
        if (btn) {
          btn.click();
          this.isModalOpen = true;
        }
      }, 150);
      return;
    }

    // Strategy 3: Direct Notion SPA Router navigation via openSettingsTab query param
    // Notion's route parser reads openSettingsTab and natively invokes (0, r(894779).Ow)
    // which opens the full desktop settings store r(802724).Ay
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('openSettingsTab', 'account');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
      setTimeout(() => {
        url.searchParams.delete('openSettingsTab');
        window.history.replaceState({}, '', url.toString());
      }, 600);
      this.isModalOpen = true;
      return;
    } catch {}

    // Fallback: Simulator / Sandbox modal
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
    // CRITICAL: ONLY search inside desktop sidebar container!
    // NEVER query document-wide for aria-label*="Settings" because mobile Notion has a mobile navigation bar with that label!
    const sidebar = document.querySelector('.notion-sidebar-container, .notion-sidebar');
    if (!sidebar) return null;

    const sidebarItems = sidebar.querySelectorAll<HTMLElement>(
      '[role="button"], div[role="button"], .notion-sidebar-item, div'
    );
    for (const item of Array.from(sidebarItems)) {
      const text = item.textContent?.trim() || '';
      if (
        /settings\s*(&|and)?\s*members/i.test(text) ||
        /^settings$/i.test(text) ||
        /paramètres\s*(&|et)?\s*membres/i.test(text) ||
        /einstellungen/i.test(text)
      ) {
        return (item.closest('[role="button"]') || item) as HTMLElement;
      }
    }

    const byAria = sidebar.querySelector<HTMLElement>(
      '[role="button"][aria-label*="Settings" i], [role="button"][aria-label*="Paramètres" i], [role="button"][aria-label*="Einstellungen" i]'
    );
    if (byAria) return byAria;

    return null;
  }

  public openNotifications(): void {
    console.log('[NotionFlow] Opening Notion Desktop Notifications / Inbox...');

    // Strategy 1: Click "Inbox" or "Updates" inside desktop sidebar
    const notifBtn = this.findNotionNotificationsButton();
    if (notifBtn) {
      notifBtn.click();
      return;
    }

    // Strategy 2: If sidebar is collapsed, reveal sidebar first and click
    const toggleBtn = document.querySelector<HTMLElement>(
      '[role="button"][aria-label*="sidebar" i], .notion-topbar [role="button"] svg path[d*="M2"]'
    )?.closest('div[role="button"]') as HTMLElement | null;

    if (toggleBtn && !document.querySelector('.notion-sidebar-container')) {
      toggleBtn.click();
      setTimeout(() => {
        const btn = this.findNotionNotificationsButton();
        if (btn) btn.click();
      }, 150);
      return;
    }

    // Strategy 3: Notion SPA Router navigation via openSettingsTab=notifications
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('openSettingsTab', 'notifications');
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
      setTimeout(() => {
        url.searchParams.delete('openSettingsTab');
        window.history.replaceState({}, '', url.toString());
      }, 600);
    } catch {}
  }

  public findNotionNotificationsButton(): HTMLElement | null {
    // CRITICAL: ONLY search inside desktop sidebar container!
    const sidebar = document.querySelector('.notion-sidebar-container, .notion-sidebar');
    if (!sidebar) return null;

    const sidebarItems = sidebar.querySelectorAll<HTMLElement>(
      '[role="button"], div[role="button"], .notion-sidebar-item, div'
    );
    for (const item of Array.from(sidebarItems)) {
      const text = item.textContent?.trim() || '';
      if (/^(inbox|updates|notifications)$/i.test(text) || /updates\s*(&|and)?\s*inbox/i.test(text)) {
        return (item.closest('[role="button"]') || item) as HTMLElement;
      }
    }

    const byAria = sidebar.querySelector<HTMLElement>(
      '[role="button"][aria-label*="Updates" i], [role="button"][aria-label*="Inbox" i], [role="button"][aria-label*="Notifications" i]'
    );
    if (byAria) return byAria;

    return null;
  }

  private observeSettingsDialog(): void {
    let checkQueued = false;
    const observer = new MutationObserver(() => {
      if (checkQueued) return;
      checkQueued = true;
      requestAnimationFrame(() => {
        checkQueued = false;
        const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
        if (dialog && !dialog.classList.contains('notionflow-settings-enhanced')) {
          dialog.classList.add('notionflow-settings-enhanced');
          dialog.style.setProperty('-webkit-overflow-scrolling', 'touch');
        }
      });
    });

    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
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
  }
}
