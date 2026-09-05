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

let trustedPolicy: any = undefined;

function getPolicy(): any {
  if (trustedPolicy !== undefined) return trustedPolicy;
  try {
    if (typeof window !== 'undefined' && (window as any).trustedTypes?.createPolicy) {
      trustedPolicy = (window as any).trustedTypes.createPolicy('notionflow-policy', {
        createHTML: (s: string) => s
      });
      return trustedPolicy;
    }
  } catch {
    try {
      trustedPolicy = (window as any).trustedTypes?.defaultPolicy || null;
      return trustedPolicy;
    } catch {
      trustedPolicy = null;
    }
  }
  trustedPolicy = null;
  return trustedPolicy;
}

export function safeSetHTML(element: HTMLElement, html: string): void {
  try {
    const policy = getPolicy();
    if (policy && typeof policy.createHTML === 'function') {
      element.innerHTML = policy.createHTML(html);
      return;
    }
  } catch {}

  try {
    element.innerHTML = html;
  } catch {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      element.replaceChildren(...Array.from(doc.body.childNodes));
    } catch {}
  }
}
