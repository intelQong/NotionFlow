/**
 * NotionFlow - Horizontal Snap-Carousel for Multi-Column Layouts
 * Transforms Notion's desktop multi-column dashboards into smooth,
 * swipeable card carousels with pagination dots on mobile viewports.
 */

export class ColumnsCarouselManager {
  private enabled: boolean = true;
  private observer: MutationObserver | null = null;
  private processedLists: WeakSet<HTMLElement> = new WeakSet();

  constructor() {
    this.injectStyles();
  }

  public init(): void {
    this.scanAndTransform();
    this.observeMutations();
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    const root = document.documentElement;
    if (val) {
      root.classList.add('notionflow-carousel-enabled');
      this.scanAndTransform();
    } else {
      root.classList.remove('notionflow-carousel-enabled');
      this.removeTransformations();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private injectStyles(): void {
    if (document.getElementById('notionflow-carousel-styles')) return;

    const style = document.createElement('style');
    style.id = 'notionflow-carousel-styles';
    style.textContent = `
      /* Only apply carousel styling on narrow screens / mobile viewport */
      @media (max-width: 768px) {
        .notionflow-carousel-active {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          scroll-snap-type: x mandatory !important;
          -webkit-overflow-scrolling: touch !important;
          scroll-behavior: smooth !important;
          padding: 8px 4px 16px 4px !important;
          gap: 12px !important;
          scrollbar-width: none !important;
        }

        .notionflow-carousel-active::-webkit-scrollbar {
          display: none !important;
        }

        /* Each column acts as a smooth swipeable card */
        .notionflow-carousel-active > div {
          flex: 0 0 86% !important;
          min-width: 86% !important;
          max-width: 86% !important;
          scroll-snap-align: center !important;
          scroll-snap-stop: always !important;
          box-sizing: border-box !important;
          border-radius: 12px !important;
          padding: 12px !important;
          background: rgba(140, 140, 140, 0.08) !important;
          border: 1px solid rgba(140, 140, 140, 0.16) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        /* Pagination indicator dots below carousel */
        .notionflow-carousel-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: -8px;
          margin-bottom: 12px;
          user-select: none;
        }

        .notionflow-carousel-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(150, 150, 150, 0.4);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .notionflow-carousel-dot.active {
          width: 18px;
          border-radius: 4px;
          background: #2383e2;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private scanAndTransform(): void {
    if (!this.enabled) return;

    // Target Notion column lists via multiple selector heuristics
    const selectors = [
      '.notion-column_list-block',
      'div[style*="column-list"]',
      'div[data-block-id][style*="display: flex"]'
    ];

    const elements = document.querySelectorAll<HTMLElement>(selectors.join(', '));
    elements.forEach(el => this.transformColumnList(el));
  }

  private transformColumnList(container: HTMLElement): void {
    if (this.processedLists.has(container)) return;

    // Ensure it has at least 2 column children
    const columns = Array.from(container.children).filter(child => {
      return (
        child.classList.contains('notion-column-block') ||
        (child as HTMLElement).style.width ||
        (child as HTMLElement).getAttribute('data-block-id')
      );
    }) as HTMLElement[];

    if (columns.length < 2) return;

    this.processedLists.add(container);
    container.classList.add('notionflow-carousel-active');

    // Create pagination dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'notionflow-carousel-dots';

    columns.forEach((col, index) => {
      const dot = document.createElement('span');
      dot.className = `notionflow-carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        col.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      dotsContainer.appendChild(dot);
    });

    // Insert dots directly after the column list
    container.parentElement?.insertBefore(dotsContainer, container.nextSibling);

    // Track active column on scroll
    let scrollTimeout: any = null;
    container.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const containerLeft = container.getBoundingClientRect().left;
        const containerCenter = containerLeft + container.offsetWidth / 2;

        let closestIndex = 0;
        let minDiff = Infinity;

        columns.forEach((col, idx) => {
          const colRect = col.getBoundingClientRect();
          const colCenter = colRect.left + colRect.width / 2;
          const diff = Math.abs(colCenter - containerCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });

        // Update active dot
        const dots = dotsContainer.querySelectorAll('.notionflow-carousel-dot');
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === closestIndex);
        });
      }, 50);
    }, { passive: true });
  }

  private removeTransformations(): void {
    document.querySelectorAll('.notionflow-carousel-active').forEach(el => {
      el.classList.remove('notionflow-carousel-active');
    });
    document.querySelectorAll('.notionflow-carousel-dots').forEach(el => el.remove());
    this.processedLists = new WeakSet();
  }

  private observeMutations(): void {
    this.observer = new MutationObserver(() => {
      if (this.enabled) {
        this.scanAndTransform();
      }
    });

    this.observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}
