<div align="center">

# NotionFlow for iOS & iPadOS

### *Pure, Bloat-Free Desktop Notion on Mobile Safari via Lightweight Userscript.*

[![Latest Release](https://img.shields.io/github/v/release/intelQong/NotionFlow?color=007AFF&logo=apple&logoColor=white&label=Release)](https://github.com/intelQong/NotionFlow/releases)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-~17%20KB-success?logo=esbuild&logoColor=white)](dist/notion-flow.user.js)
[![iOS Compatibility](https://img.shields.io/badge/iOS%20%2F%20iPadOS-15.0%2B-000000?logo=apple&logoColor=white)](https://apple.com/ios)
[![Safari Extension](https://img.shields.io/badge/Safari-Userscript-FF9500?logo=safari&logoColor=white)](https://apps.apple.com/app/userscripts/id1463298887)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-34C759.svg)](LICENSE)

<br />

<p align="center">
  <a href="#-the-problem-vs-notionflow">Why NotionFlow?</a> •
  <a href="#-quick-install-60-seconds--zero-mac-required">60s Safari Install</a> •
  <a href="#-distribution-files-which-one-should-you-use">Which File to Use?</a> •
  <a href="#-how-to-add-to-your-iphone--ipad-home-screen">Add to Home Screen</a> •
  <a href="#-how-it-works-under-the-hood">How It Works</a> •
  <a href="#-development--verification">Development & Tests</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-disclaimer">Disclaimer</a>
</p>

</div>

---

## 📌 The Problem vs. NotionFlow

Power users attempting to use Notion on iPhone or iPad encounter deliberate platform restrictions:

| Scenario | What Happens | The Experience |
| :--- | :--- | :--- |
| **Official Notion Mobile App** | Administrative settings (Workspace Members, Roles, Billing, Security, Public Domains) are stripped or blocked. Multi-column dashboards collapse into vertical cards. Wide database tables lose overview context. | ❌ Crippled power-user workflows |
| **Safari "Request Desktop Website"** | **Fails completely.** Notion executes runtime JavaScript checks (`"MacIntel" === platform && "ontouchend" in document`) to detect iPads and iPhones, continuing to force mobile home drawer layouts, interstitial banners, and app-redirect modals. | ❌ Frustrating & blocked |
| **NotionFlow v1.4.0 (Userscript)** 🚀 | Neutralizes Notion's touch detection on prototypes, spoofs macOS Safari, locks `CONFIG.isMobile = false`, suppresses app banners, and applies responsive desktop CSS in a featherweight **~17 KB** package. | ✅ **True desktop Notion + 100% native WebKit speed** |

---

## ⚡ Quick Install (60 Seconds — Zero Mac Required)

> [!TIP]
> **No Mac, Xcode, or developer account required!** NotionFlow runs directly inside Safari on your iPhone or iPad using the free, open-source **Userscripts** extension.

```
┌────────────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
│   1. Get Extension     │  ──▶  │   2. Add NotionFlow    │  ──▶  │    3. Open Notion      │
│ Install "Userscripts"  │       │ Save notion-flow.user  │       │ Enjoy Full Desktop UI  │
│   from App Store       │       │ into Userscripts folder│       │  at app.notion.com     │
└────────────────────────┘       └────────────────────────┘       └────────────────────────┘
```

### Step 1: Install the Free "Userscripts" Extension
1. Open the App Store on your iPhone or iPad and install **[Userscripts](https://apps.apple.com/app/userscripts/id1463298887)** *(Free, open-source, zero tracking, GPL-3.0)*.
2. Open iOS **Settings** ➔ **Safari** ➔ **Extensions**.
3. Tap **Userscripts**:
   - Toggle **Allow Extension** to **ON**.
   - Under *Permissions for Userscripts*, tap **All Websites** and select **Allow** (or grant access to `notion.so` and `notion.com`).

### Step 2: Configure the Script Directory (10 Seconds)
1. Open the **Userscripts** app from your home screen once.
2. Tap **Set Userscripts Directory** and select any local folder in the Files app (e.g., `On My iPhone` ➔ `Userscripts` or `On My iPad` ➔ `Userscripts`).

### Step 3: Add NotionFlow to Userscripts
Choose either method:

* **Method A (Direct File Download — Recommended)**:
  1. Download the compiled userscript: [**`notion-flow.user.js`**](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js).
  2. Save or move `notion-flow.user.js` into your configured **Userscripts** folder in the Files app.

* **Method B (Copy & Paste in Safari)**:
  1. Open [**`notion-flow.user.js`**](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js) in Safari and copy all contents.
  2. Tap the Safari **Extensions** icon (🧩 or `aA`) ➔ tap **Userscripts**.
  3. Tap **`+` (New Script)**, paste the code, and tap **Save**.

### Step 4: Open Notion in Safari
1. Navigate to [**`https://app.notion.com`**](https://app.notion.com) (or `notion.so`).
2. Notion will immediately boot in **full desktop mode**:
   - Full desktop sidebar with quick search and workspace navigation.
   - Access to desktop **Settings & Members** (manage workspace billing, members, domains, integrations).
   - Side-by-side multi-column layouts and Formulas 2.0.
   - Zero intrusive mobile banners or "Open in App" interruptions.

---

## 📦 Distribution Files: Which One Should You Use?

NotionFlow produces two production build artifacts in [`dist/`](dist) and in every [GitHub Release](https://github.com/intelQong/NotionFlow/releases):

| File | Format | Description & Compatibility |
| :--- | :--- | :--- |
| **[`notion-flow.user.js`](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js)** | Userscript Bundle <br>*(Includes `// ==UserScript==` header)* | **For Safari Extension Managers & Userscript Apps:**<br>• [Userscripts Safari Extension](https://apps.apple.com/app/userscripts/id1463298887) (iOS / iPadOS / macOS)<br>• Stay for Safari<br>• Orion Browser (iOS / iPadOS)<br>• Tampermonkey / Violentmonkey |
| **[`notionflow-injection.js`](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notionflow-injection.js)** | Pure Raw JavaScript <br>*(Zero metadata comment block)* | **For Native iOS Apps & Direct Injections:**<br>• Native Swift / Xcode `WKWebView` via `WKUserScript`<br>• Safari Web Extensions (`content_scripts`)<br>• iOS Shortcuts ("Run JavaScript on Web Page")<br>• Custom WebView wrappers |

### 💡 Quick Rule:
* **Installing via Safari Userscripts / Stay on your iPhone or iPad?** ➔ Use **`notion-flow.user.js`**.
* **Building a native iOS wrapper app or custom Safari Web Extension?** ➔ Use **`notionflow-injection.js`**.

---

## 📲 How to Add to Your iPhone / iPad Home Screen

Turn NotionFlow into a **distraction-free, full-screen standalone app** that removes Safari's browser URL bar and bottom toolbar:

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│  1. Open app.notion.com   │ ──▶  │  2. Tap Safari Share (⬆️)  │ ──▶  │  3. Add to Home Screen   │
│ In Safari on iPhone/iPad  │      │ Scroll down in Share menu │      │ Launches full-screen PWA  │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

1. **Open Notion**: Navigate to [**`https://app.notion.com`**](https://app.notion.com) in Safari and log in.
2. **Open Share Menu**: Tap the Safari **Share** icon at the bottom of the screen (the square with an arrow pointing up `⬆️`).
3. **Select "Add to Home Screen"**: Scroll down the share sheet and tap **Add to Home Screen**.
4. **Name Your App**: Name it **Notion Desktop** (or **NotionFlow**) and tap **Add** in the top-right corner.
5. **Launch Edge-to-Edge**: Tap the new icon on your Home Screen for a clean, full-screen experience with zero browser address bars.

---

## 🛠️ How It Works Under the Hood

Notion's web client contains aggressive platform-detection logic to keep mobile browsers restricted. NotionFlow operates at `document_start` before Notion's scripts initialize, dismantling these gates cleanly:

### 1. Neutralizing Prototype Touch Detection
Notion detects iPads and tablets using runtime prototype checks:
```javascript
// Notion's internal client module 900532 check:
"MacIntel" === a.platform && "ontouchend" in e.document
```
NotionFlow strips `ontouchstart`, `ontouchend`, `ontouchmove`, and `ontouchcancel` from `Document.prototype`, `Window.prototype`, `HTMLElement.prototype`, and their respective instances. When Notion evaluates whether the client is a touch tablet, it cleanly evaluates to `isIpad = false`, `isMobile = false`, and `isDesktop = true`.

### 2. Environment & Navigator Masking
- Overrides `navigator.platform` to `MacIntel`.
- Overrides `navigator.userAgent` and `navigator.appVersion` to macOS Safari 17.5.
- Sets `navigator.maxTouchPoints` to `0`.
- Overrides modern `navigator.userAgentData` with macOS desktop high-entropy values.

### 3. Non-Destructive `window.CONFIG` Interceptor
Notion reads `window.CONFIG.isMobile` to toggle between desktop layouts and mobile layouts. NotionFlow defines a dynamic getter/setter on `window.CONFIG` that locks `isMobile` to `false` without clobbering Notion's internal proxy hosts, asset URLs, or configuration object.

### 4. Real-Time Banner & Deep-Link Suppression
- A lightweight `MutationObserver` instantly detects and strips `<meta name="apple-itunes-app">` tags to prevent Safari's intrusive Smart App Banners from appearing.
- Suppresses native deep-link redirects targeting `notion://` and `itunes.apple.com`.
- Hides mobile promotional overlays and "Open in Notion app" bottom sheets.

### 5. Responsive Desktop CSS Overrides
- **Off-Canvas Sidebar Drawer (`< 768px`)**: On smaller mobile screens, the desktop sidebar smoothly docks off-canvas with a slide-over drawer layout so you can easily toggle and navigate pages.
- **Adaptive Modal Sizing (`< 1080px`)**: Constrains desktop dialogs (Settings & Members, Share menu, Quick Find) to fit neatly within mobile and tablet viewports without clipping.
- **Momentum Scrolling**: Enables native `-webkit-overflow-scrolling: touch` for wide database tables, boards, and timelines.

---

## 🧪 Development & Verification

### Building from Source

NotionFlow uses TypeScript and `esbuild` for instant compilation:

```bash
# 1. Clone the repository
git clone https://github.com/intelQong/NotionFlow.git
cd NotionFlow

# 2. Install dependencies (Node 20+)
npm install

# 3. Build userscript and injection bundles
npm run build
```

The build outputs:
- `dist/notion-flow.user.js` (~17.3 KB) — Userscript bundle with metadata header.
- `dist/notionflow-injection.js` (~16.4 KB) — Pure JavaScript bundle for web extensions and native apps.

### Automated Verification with Playwright WebKit

NotionFlow includes automated Playwright tests that inject the script into real WebKit browser engines emulating iPhone 14 Pro and iPad Pro viewports against live `app.notion.com`:

```bash
# Run Playwright WebKit test suite
python3 scratch/test_v140_playwright.py
```

Verified assertions:
- `window.CONFIG.isMobile === false`
- `navigator.platform === 'MacIntel'`
- `"ontouchend" in document === false`
- `document.querySelector('meta[name="apple-itunes-app"]') === null`
- Notion desktop navigation and settings elements render properly.

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/desktop-improvement`).
3. Commit your changes (`git commit -m 'feat: enhance desktop compatibility'`).
4. Push to the branch (`git push origin feature/desktop-improvement`).
5. Open a Pull Request.

---

## ⚖️ Disclaimer

Notion is a registered trademark of Notion Labs, Inc.

NotionFlow is an independent open-source project and is not affiliated with, endorsed by, sponsored by, or in any way officially connected with Notion Labs, Inc. or any of its subsidiaries. All product and company names are trademarks™ or registered® trademarks of their respective holders; use of them does not imply any affiliation with or endorsement by them.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Crafted with ❤️ by [intelQong](https://github.com/intelQong).

