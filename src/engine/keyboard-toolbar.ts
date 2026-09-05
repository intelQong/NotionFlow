/**
 * NotionFlow - iOS Keyboard Accessory Bar
 * Provides instant one-tap markdown shortcuts, list creation,
 * indent/outdent, and slash commands docked above the virtual keyboard.
 */

export class KeyboardToolbarManager {
  private toolbar: HTMLElement | null = null;
  private currentEditable: HTMLElement | null = null;

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.createToolbar();
    this.setupFocusListeners();
    this.setupViewportListener();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-keyboard-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-keyboard-styles';
    style.textContent = `
      .notionflow-keyboard-toolbar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        background: rgba(26, 26, 26, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        display: none;
        align-items: center;
        padding: 6px 8px;
        gap: 6px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
        transform: translateZ(0);
      }

      .notionflow-keyboard-toolbar::-webkit-scrollbar {
        display: none;
      }

      .notionflow-keyboard-toolbar.visible {
        display: flex;
      }

      .notionflow-kb-btn {
        flex: 0 0 auto;
        min-width: 38px;
        height: 36px;
        padding: 0 10px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #f0f0f0;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        transition: background 0.15s ease, transform 0.1s ease;
      }

      .notionflow-kb-btn:active {
        background: rgba(255, 255, 255, 0.25);
        transform: scale(0.95);
      }

      .notionflow-kb-btn.primary {
        background: #2383e2;
        color: #ffffff;
      }

      .notionflow-kb-btn.dismiss {
        background: rgba(255, 255, 255, 0.06);
        color: #aaa;
      }
    `;
    document.head.appendChild(style);
  }

  private createToolbar(): void {
    if (this.toolbar) return;

    this.toolbar = document.createElement('div');
    this.toolbar.className = 'notionflow-keyboard-toolbar';

    const buttons = [
      { label: '/', action: 'slash', title: 'Slash Command', primary: true },
      { label: 'H1', action: 'h1', title: 'Heading 1' },
      { label: 'H2', action: 'h2', title: 'Heading 2' },
      { label: 'H3', action: 'h3', title: 'Heading 3' },
      { label: '[ ]', action: 'todo', title: 'To-do Checkbox' },
      { label: '• List', action: 'bullet', title: 'Bullet List' },
      { label: '1. List', action: 'number', title: 'Numbered List' },
      { label: 'B', action: 'bold', title: 'Bold', style: 'font-weight: 800;' },
      { label: 'I', action: 'italic', title: 'Italic', style: 'font-style: italic;' },
      { label: '</>', action: 'code', title: 'Code' },
      { label: '⇥', action: 'indent', title: 'Indent (Tab)' },
      { label: '⇤', action: 'outdent', title: 'Outdent (Shift+Tab)' },
      { label: '✕', action: 'dismiss', title: 'Dismiss Keyboard', dismiss: true }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `notionflow-kb-btn ${btn.primary ? 'primary' : ''} ${btn.dismiss ? 'dismiss' : ''}`;
      button.textContent = btn.label;
      button.title = btn.title;
      if (btn.style) button.style.cssText += btn.style;

      // Prevent button click from causing editable to blur
      button.addEventListener('mousedown', (e) => e.preventDefault());
      button.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleAction(btn.action);
      });

      this.toolbar!.appendChild(button);
    });

    document.body.appendChild(this.toolbar);
  }

  private setupFocusListeners(): void {
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      if (target && (target.getAttribute('contenteditable') === 'true' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        this.currentEditable = target;
        this.show();
      }
    });

    document.addEventListener('focusout', () => {
      // Small timeout to allow button clicks on toolbar
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || (active.getAttribute('contenteditable') !== 'true' && active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA')) {
          this.hide();
        }
      }, 150);
    });
  }

  private setupViewportListener(): void {
    // When iOS keyboard opens, window.visualViewport height shrinks
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if (!this.toolbar || !this.toolbar.classList.contains('visible')) return;
        const vv = window.visualViewport!;
        const offsetBottom = window.innerHeight - (vv.offsetTop + vv.height);
        this.toolbar.style.bottom = `${Math.max(0, offsetBottom)}px`;
      });
    }
  }

  public show(): void {
    this.toolbar?.classList.add('visible');
  }

  public hide(): void {
    this.toolbar?.classList.remove('visible');
    if (this.toolbar) {
      this.toolbar.style.bottom = '0px';
    }
  }

  private handleAction(action: string): void {
    if (!this.currentEditable) return;
    this.currentEditable.focus();

    switch (action) {
      case 'slash':
        document.execCommand('insertText', false, '/');
        break;
      case 'h1':
        document.execCommand('insertText', false, '# ');
        break;
      case 'h2':
        document.execCommand('insertText', false, '## ');
        break;
      case 'h3':
        document.execCommand('insertText', false, '### ');
        break;
      case 'todo':
        document.execCommand('insertText', false, '[] ');
        break;
      case 'bullet':
        document.execCommand('insertText', false, '- ');
        break;
      case 'number':
        document.execCommand('insertText', false, '1. ');
        break;
      case 'bold': {
        const evt = new KeyboardEvent('keydown', { key: 'b', code: 'KeyB', metaKey: true, bubbles: true });
        this.currentEditable.dispatchEvent(evt);
        break;
      }
      case 'italic': {
        const evt = new KeyboardEvent('keydown', { key: 'i', code: 'KeyI', metaKey: true, bubbles: true });
        this.currentEditable.dispatchEvent(evt);
        break;
      }
      case 'code': {
        const evt = new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', metaKey: true, bubbles: true });
        this.currentEditable.dispatchEvent(evt);
        break;
      }
      case 'indent': {
        const evt = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, which: 9, bubbles: true });
        this.currentEditable.dispatchEvent(evt);
        break;
      }
      case 'outdent': {
        const evt = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, which: 9, shiftKey: true, bubbles: true });
        this.currentEditable.dispatchEvent(evt);
        break;
      }
      case 'dismiss':
        this.currentEditable.blur();
        this.hide();
        break;
    }
  }
}
