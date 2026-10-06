"""Smoke test: inject the built bundle into WebKit (iPhone + iPad emulation) and assert desktop spoofing.

Usage: npm run build && python3 tests/smoke_webkit.py
Requires: pip install playwright && playwright install webkit
"""
import pathlib
from playwright.sync_api import sync_playwright

BUNDLE = pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'notionflow-injection.js'
HTML = '<html><head><meta name="apple-itunes-app" content="app-id=1"></head><body></body></html>'

PROBE = '''() => {
  window.CONFIG = { isMobile: true, env: 'x' };
  window.CONFIG.isMobile = true;
  const m = document.createElement('meta');
  m.name = 'apple-itunes-app';
  document.head.appendChild(m);
  return new Promise(res => setTimeout(() => res({
    ua: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    ontouchend: 'ontouchend' in document,
    isMobile: window.CONFIG.isMobile,
    env: window.CONFIG.env,
    bannerMetas: document.querySelectorAll('meta[name="apple-itunes-app"]').length,
    appStoreOpen: window.open('https://apps.apple.com/app/notion') === null,
    deeplinkOpen: window.open(new URL('notion://x')) === null,
    styles: document.querySelectorAll('#notionflow-desktop-styles').length,
  }), 50));
}'''

EXPECTED = {
    'platform': 'MacIntel',
    'maxTouchPoints': 0,
    'ontouchend': False,
    'isMobile': False,
    'env': 'x',
    'bannerMetas': 0,
    'appStoreOpen': True,
    'deeplinkOpen': True,
    'styles': 1,
}


def main():
    js = BUNDLE.read_text()
    with sync_playwright() as p:
        browser = p.webkit.launch()
        for device in ('iPhone 14 Pro', 'iPad Pro 11'):
            page = browser.new_context(**p.devices[device]).new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.add_init_script(js)
            page.route('https://app.notion.so/', lambda r: r.fulfill(body=HTML, content_type='text/html'))
            page.goto('https://app.notion.so/')
            got = page.evaluate(PROBE)
            assert 'Macintosh' in got['ua'], (device, got['ua'])
            for key, want in EXPECTED.items():
                assert got[key] == want, f'{device}: {key}={got[key]!r}, expected {want!r}'
            assert not errors, (device, errors)
            print(f'✓ {device}')
        browser.close()


if __name__ == '__main__':
    main()
