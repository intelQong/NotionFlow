/**
 * NotionFlow - Automatic Update Checker Engine
 * Periodically checks GitHub raw release repository for newer versions of NotionFlow
 * and alerts the user with 1-tap update installation.
 */

export const NOTIONFLOW_VERSION = '1.2.0';
export const NOTIONFLOW_RAW_URL = 'https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js';

export class UpdateChecker {
  private lastCheckKey = 'notionflow_last_update_check';
  private checkIntervalMs = 12 * 60 * 60 * 1000; // Check every 12 hours

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    // Delay check slightly to not block initial page render
    setTimeout(() => {
      this.check(false);
    }, 4000);
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-updater-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-updater-styles';
    style.textContent = `
      .notionflow-update-banner {
        position: fixed;
        top: 14px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        opacity: 0;
        z-index: 100002;
        background: rgba(26, 26, 28, 0.95);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(35, 131, 226, 0.5);
        border-radius: 16px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(35, 131, 226, 0.25);
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        max-width: 90vw;
        user-select: none;
      }

      .notionflow-update-banner.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      .notionflow-update-text {
        font-size: 13px;
        font-weight: 500;
        color: #ffffff;
        line-height: 1.3;
      }

      .notionflow-update-btn {
        background: #2383e2;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .notionflow-update-btn:active {
        opacity: 0.85;
      }

      .notionflow-update-dismiss {
        background: transparent;
        border: none;
        color: #888;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
  }

  public async check(force: boolean = false): Promise<{ hasUpdate: boolean; latestVersion?: string }> {
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem(this.lastCheckKey) || '0', 10);

    if (!force && now - lastCheck < this.checkIntervalMs) {
      return { hasUpdate: false };
    }

    try {
      // Add timestamp to prevent aggressive Safari caching
      const response = await fetch(`${NOTIONFLOW_RAW_URL}?t=${now}`, {
        cache: 'no-cache',
        headers: { 'Accept': 'text/plain' },
      });

      if (!response.ok) return { hasUpdate: false };

      const scriptText = await response.text();
      localStorage.setItem(this.lastCheckKey, now.toString());

      const match = scriptText.match(/\/\/\s*@version\s+([0-9.]+)/i);
      if (match && match[1]) {
        const latestVersion = match[1].trim();
        if (this.isNewer(latestVersion, NOTIONFLOW_VERSION)) {
          this.showUpdateBanner(latestVersion);
          return { hasUpdate: true, latestVersion };
        }
      }
    } catch (e) {
      console.warn('[NotionFlow] Auto-update check skipped:', e);
    }

    return { hasUpdate: false };
  }

  private isNewer(remote: string, current: string): boolean {
    const rParts = remote.split('.').map(n => parseInt(n, 10) || 0);
    const cParts = current.split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
      const r = rParts[i] || 0;
      const c = cParts[i] || 0;
      if (r > c) return true;
      if (r < c) return false;
    }
    return false;
  }

  private showUpdateBanner(newVersion: string): void {
    if (document.getElementById('notionflow-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'notionflow-update-banner';
    banner.className = 'notionflow-update-banner';
    banner.innerHTML = `
      <div style="font-size: 18px;">🚀</div>
      <div class="notionflow-update-text">
        <div><strong>NotionFlow v${newVersion}</strong> is available!</div>
        <div style="font-size: 11px; color: #aaa;">Current: v${NOTIONFLOW_VERSION}</div>
      </div>
      <a class="notionflow-update-btn" href="${NOTIONFLOW_RAW_URL}" target="_blank">Update</a>
      <button class="notionflow-update-dismiss" id="notionflow-dismiss-update">✕</button>
    `;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.classList.add('visible');
    });

    banner.querySelector('#notionflow-dismiss-update')?.addEventListener('click', () => {
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 400);
    });
  }
}
