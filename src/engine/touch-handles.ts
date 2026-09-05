/**
 * NotionFlow - Touch Block Handles & Interaction Adapter
 * Emulates mouse hover for touch screens, enlarges touch hitboxes,
 * and provides one-tap access to Notion block actions (+ and :: handles).
 */

export class TouchHandlesManager {
  private activeBlock: HTMLElement | null = null;
  private actionPopup: HTMLElement | null = null;

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.setupTouchListeners();
    this.createActionPopup();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-touch-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-touch-styles';
    style.textContent = `
      /* Enlarge touch hitboxes for small interactive Notion elements */
      /* Checkbox hitbox */
      .notion-to_do-block [type="checkbox"],
      .notion-collection-item-checkbox,
      [role="checkbox"] {
        width: 22px !important;
        height: 22px !important;
        margin-right: 8px !important;
        cursor: pointer !important;
      }

      /* Toggle triangle hitbox */
      .notion-toggle-block svg,
      [aria-label="Toggle"] {
        padding: 6px !important;
        margin: -6px !important;
        min-width: 28px !important;
        min-height: 28px !important;
      }

      /* Highlight active block for touch */
      .notionflow-block-touched {
        position: relative;
        background: rgba(35, 131, 226, 0.05) !important;
        border-radius: 6px;
        transition: background 0.15s ease;
      }

      /* Touch Block Action Floating Bar */
      .notionflow-block-actions {
        position: absolute;
        top: -36px;
        right: 8px;
        z-index: 999;
        display: none;
        align-items: center;
        background: rgba(30, 30, 30, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 20px;
        padding: 3px 8px;
        gap: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }

      .notionflow-block-actions.visible {
        display: flex;
        animation: notionflow-fade-in 0.15s ease-out;
      }

      @keyframes notionflow-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .notionflow-block-btn {
        background: transparent;
        border: none;
        color: #fff;
        font-size: 13px;
        padding: 4px 8px;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 1;
      }

      .notionflow-block-btn:active {
        background: rgba(255, 255, 255, 0.2);
      }

      .notionflow-block-btn.danger {
        color: #ff6b6b;
      }
    `;
    document.head.appendChild(style);
  }

  private createActionPopup(): void {
    if (this.actionPopup) return;

    this.actionPopup = document.createElement('div');
    this.actionPopup.className = 'notionflow-block-actions';
    this.actionPopup.innerHTML = `
      <button class="notionflow-block-btn" data-action="add" title="Add block below">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Add
      </button>
      <button class="notionflow-block-btn" data-action="duplicate" title="Duplicate block">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy
      </button>
      <button class="notionflow-block-btn danger" data-action="delete" title="Delete block">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    `;

    this.actionPopup.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!target || !this.activeBlock) return;

      const action = target.getAttribute('data-action');
      this.handleBlockAction(action, this.activeBlock);
    });

    document.body.appendChild(this.actionPopup);
  }

  private setupTouchListeners(): void {
    // Detect tap on Notion block
    document.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      // Skip if tapping our own UI or keyboard accessory
      if (target.closest('.notionflow-block-actions') || target.closest('.notionflow-floating-bar') || target.closest('.notionflow-keyboard-toolbar')) {
        return;
      }

      const block = target.closest<HTMLElement>('[data-block-id]');
      if (block) {
        this.selectBlock(block);
      } else {
        this.deselectBlock();
      }
    }, { passive: true });
  }

  private selectBlock(block: HTMLElement): void {
    if (this.activeBlock === block) return;

    this.deselectBlock();
    this.activeBlock = block;
    block.classList.add('notionflow-block-touched');

    if (this.actionPopup) {
      const rect = block.getBoundingClientRect();
      this.actionPopup.style.top = `${Math.max(10, rect.top + window.scrollY - 38)}px`;
      this.actionPopup.style.right = `${Math.max(16, document.documentElement.clientWidth - rect.right + 12)}px`;
      this.actionPopup.classList.add('visible');
    }
  }

  public deselectBlock(): void {
    if (this.activeBlock) {
      this.activeBlock.classList.remove('notionflow-block-touched');
      this.activeBlock = null;
    }
    if (this.actionPopup) {
      this.actionPopup.classList.remove('visible');
    }
  }

  private handleBlockAction(action: string | null, block: HTMLElement): void {
    switch (action) {
      case 'add':
        // Insert new block below by focusing and dispatching Enter
        const editable = block.querySelector<HTMLElement>('[contenteditable="true"]') || block;
        editable.focus();
        const enterEvt = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        editable.dispatchEvent(enterEvt);
        this.deselectBlock();
        break;

      case 'duplicate':
        // Dispatch Cmd+D in Notion
        const dupEvt = new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', metaKey: true, bubbles: true });
        block.dispatchEvent(dupEvt);
        this.deselectBlock();
        break;

      case 'delete':
        // Dispatch Backspace / Delete
        const delEvt = new KeyboardEvent('keydown', { key: 'Backspace', code: 'Backspace', keyCode: 8, which: 8, bubbles: true });
        block.dispatchEvent(delEvt);
        this.deselectBlock();
        break;
    }
  }
}
