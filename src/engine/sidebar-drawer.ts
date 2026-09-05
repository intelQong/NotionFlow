/**
 * NotionFlow - Sidebar Drawer Adapter
 * Converts Notion's desktop sidebar into a native-feeling slide-over drawer
 * with backdrop blur, tap-to-dismiss, and bezel swipe gestures.
 */

export class SidebarDrawerManager {
  private backdrop: HTMLElement | null = null;
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.createBackdrop();
    this.setupSwipeGestures();
    this.observeSidebarState();
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-sidebar-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-sidebar-styles';
    style.textContent = `
      @media (max-width: 768px) {
        /* Convert Notion sidebar container to fixed off-canvas drawer */
        .notion-sidebar-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          height: 100vh !important;
          width: 290px !important;
          max-width: 82vw !important;
          z-index: 9999 !important;
          box-shadow: 8px 0 30px rgba(0, 0, 0, 0.35) !important;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        /* Prevent content from squishing when sidebar opens */
        .notion-frame {
          width: 100% !important;
          max-width: 100vw !important;
          padding-left: 0 !important;
        }

        /* Drawer Backdrop Overlay */
        .notionflow-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .notionflow-drawer-backdrop.active {
          opacity: 1;
          pointer-events: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private createBackdrop(): void {
    if (this.backdrop) return;

    this.backdrop = document.createElement('div');
    this.backdrop.className = 'notionflow-drawer-backdrop';
    this.backdrop.addEventListener('click', () => {
      this.closeSidebar();
    });
    document.body.appendChild(this.backdrop);
  }

  public isSidebarOpen(): boolean {
    const sidebar = document.querySelector<HTMLElement>('.notion-sidebar-container');
    if (!sidebar) return false;
    // Check if sidebar has non-zero width or display not none
    const style = window.getComputedStyle(sidebar);
    return style.display !== 'none' && style.visibility !== 'hidden' && sidebar.offsetWidth > 50;
  }

  public toggleSidebar(): void {
    // Notion toggles sidebar via Cmd+\ or clicking the chevron in the topbar
    const toggleBtn = document.querySelector<HTMLElement>('[role="button"][aria-label*="sidebar" i], .notion-topbar [role="button"] svg path[d*="M2"]')?.closest('div[role="button"]') as HTMLElement | null;

    if (toggleBtn) {
      toggleBtn.click();
    } else {
      // Simulate Cmd+\ keyboard shortcut
      const evt = new KeyboardEvent('keydown', {
        key: '\\',
        code: 'Backslash',
        metaKey: true,
        bubbles: true
      });
      document.dispatchEvent(evt);
    }
  }

  public closeSidebar(): void {
    if (this.isSidebarOpen()) {
      this.toggleSidebar();
    }
  }

  private observeSidebarState(): void {
    // Watch for sidebar width or class changes to toggle backdrop
    const checkSidebar = () => {
      if (window.innerWidth > 768) {
        this.backdrop?.classList.remove('active');
        return;
      }
      const open = this.isSidebarOpen();
      this.backdrop?.classList.toggle('active', open);
    };

    const observer = new MutationObserver(checkSidebar);
    observer.observe(document.body, { attributes: true, subtree: true, childList: true });
    window.addEventListener('resize', checkSidebar);
  }

  private setupSwipeGestures(): void {
    // Swipe from left edge (< 35px) to open sidebar; swipe left to close
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;

      // Ensure horizontal swipe dominates vertical scroll
      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX > 0 && this.touchStartX < 35 && !this.isSidebarOpen()) {
          // Swipe right from bezel -> open
          this.toggleSidebar();
        } else if (deltaX < 0 && this.isSidebarOpen() && this.touchStartX > 50) {
          // Swipe left -> close
          this.closeSidebar();
        }
      }
    }, { passive: true });
  }
}
