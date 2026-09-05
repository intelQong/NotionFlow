/**
 * NotionFlow - Safe DOM Utilities
 * Provides resilient DOM insertion that handles execution at document-start,
 * when document.head or document.body may not yet exist in WebKit / Safari.
 */

export function safeAppend(element: HTMLElement): void {
  const target = document.head || document.documentElement || document.body;
  if (target) {
    target.appendChild(element);
  } else {
    const onReady = () => {
      const el = document.head || document.documentElement || document.body;
      if (el && !element.parentElement) {
        el.appendChild(element);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady, { once: true });
    } else {
      setTimeout(onReady, 0);
    }
  }
}

export function safeAppendBody(element: HTMLElement): void {
  if (document.body) {
    document.body.appendChild(element);
    return;
  }
  const onReady = () => {
    if (document.body && !element.parentElement) {
      document.body.appendChild(element);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  }
  window.addEventListener('load', onReady, { once: true });
  setTimeout(onReady, 0);
  setTimeout(onReady, 50);
}
