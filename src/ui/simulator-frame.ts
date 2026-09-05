/**
 * NotionFlow - iOS Device Frame Simulator & Sandbox Runner
 * Provides a responsive iOS device shell (iPhone 16 Pro / iPad Pro)
 * with Dynamic Island, Home Indicator, and interactive Notion testbed.
 */

export interface SimulatorOptions {
  device: 'iphone-16-pro' | 'iphone-16-plus' | 'ipad-pro';
  orientation: 'portrait' | 'landscape';
}

export class SimulatorFrame {
  private isLandscape: boolean = false;

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.renderSimulatorShell();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-simulator-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-simulator-styles';
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        background: #0a0a0c;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
        overflow-x: hidden;
      }

      /* Top Simulator Toolbar */
      .notionflow-sim-header {
        width: 100%;
        max-width: 1200px;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .notionflow-sim-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 700;
        font-size: 17px;
        letter-spacing: -0.3px;
      }

      .notionflow-sim-badge {
        background: linear-gradient(135deg, #2383e2, #0056b3);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 12px;
        text-transform: uppercase;
      }

      .notionflow-sim-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .notionflow-sim-select,
      .notionflow-sim-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #eee;
        border-radius: 8px;
        padding: 7px 12px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background 0.15s ease;
      }

      .notionflow-sim-btn:hover {
        background: rgba(255, 255, 255, 0.16);
      }

      /* Stage Area */
      .notionflow-sim-stage {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 30px 20px;
        width: 100%;
        box-sizing: border-box;
      }

      /* iPhone Device Frame */
      .notionflow-device-bezel {
        background: #1e1e24;
        border: 10px solid #2d2d34;
        border-radius: 54px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 0 2px #44444e;
        position: relative;
        overflow: hidden;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
      }

      /* Device Form Factor Sizes */
      .notionflow-device-bezel.iphone-16-pro {
        width: 393px;
        height: 852px;
      }

      .notionflow-device-bezel.iphone-16-plus {
        width: 430px;
        height: 932px;
      }

      .notionflow-device-bezel.ipad-pro {
        width: 820px;
        height: 1024px;
        border-radius: 36px;
      }

      .notionflow-device-bezel.landscape {
        transform: rotate(-90deg);
        margin: 50px 0;
      }

      /* Dynamic Island / Notch */
      .notionflow-dynamic-island {
        position: absolute;
        top: 11px;
        left: 50%;
        transform: translateX(-50%);
        width: 118px;
        height: 32px;
        background: #000000;
        border-radius: 20px;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        box-sizing: border-box;
      }

      .notionflow-dynamic-island-camera {
        width: 11px;
        height: 11px;
        background: #111a2e;
        border-radius: 50%;
        border: 1px solid #1a2a44;
      }

      /* Home Indicator Bar */
      .notionflow-home-bar {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        width: 136px;
        height: 4.5px;
        background: rgba(255, 255, 255, 0.75);
        border-radius: 4px;
        z-index: 999999;
        pointer-events: none;
      }

      /* Viewport Screen */
      .notionflow-device-screen {
        flex: 1;
        width: 100%;
        height: 100%;
        background: #191919;
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
  }

  private renderSimulatorShell(): void {
    const header = document.createElement('header');
    header.className = 'notionflow-sim-header';
    header.innerHTML = `
      <div class="notionflow-sim-brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2383e2" stroke-width="2.2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/></svg>
        <span>NotionFlow</span>
        <span class="notionflow-sim-badge">iOS Desktop Wrapper</span>
      </div>
      <div class="notionflow-sim-controls">
        <select class="notionflow-sim-select" id="notionflow-sim-device-select">
          <option value="iphone-16-pro">iPhone 16 Pro (393 × 852)</option>
          <option value="iphone-16-plus">iPhone 16 Plus (430 × 932)</option>
          <option value="ipad-pro">iPad Pro 11" (820 × 1024)</option>
        </select>
        <button class="notionflow-sim-btn" id="notionflow-sim-rotate-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
          Rotate
        </button>
      </div>
    `;
    document.body.prepend(header);

    // Event listeners
    const select = document.getElementById('notionflow-sim-device-select') as HTMLSelectElement | null;
    const bezel = document.querySelector('.notionflow-device-bezel');

    select?.addEventListener('change', () => {
      if (!bezel) return;
      bezel.classList.remove('iphone-16-pro', 'iphone-16-plus', 'ipad-pro');
      bezel.classList.add(select.value);
    });

    const rotateBtn = document.getElementById('notionflow-sim-rotate-btn');
    rotateBtn?.addEventListener('click', () => {
      if (!bezel) return;
      this.isLandscape = !this.isLandscape;
      bezel.classList.toggle('landscape', this.isLandscape);
    });
  }
}
