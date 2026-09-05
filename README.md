<div align="center">

# NotionFlow for iOS

### *Desktop-Class Notion Superpowers, Redesigned for Mobile Touch.*

[![Build Status](https://github.com/intelQong/NotionFlow/actions/workflows/build-ios.yml/badge.svg)](https://github.com/intelQong/NotionFlow/actions/workflows/build-ios.yml)
[![Latest Release](https://img.shields.io/github/v/release/intelQong/NotionFlow?color=007AFF&logo=apple&logoColor=white&label=Release)](https://github.com/intelQong/NotionFlow/releases)
[![iOS Compatibility](https://img.shields.io/badge/iOS-16.0%2B-000000?logo=apple&logoColor=white)](https://apple.com/ios)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.0-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-34C759.svg)](LICENSE)

<br />

<p align="center">
  <a href="#-the-problem-vs-the-notionflow-solution">Overview</a> •
  <a href="#-core-capabilities">Key Features</a> •
  <a href="#-quick-install-safari-userscript-zero-mac--60-seconds">Quick Install (Safari)</a> •
  <a href="#-native-ios-app-deployment-capacitor--xcode">Native iOS App</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-local-interactive-simulator">Simulator</a>
</p>

</div>

---

## 📌 The Problem vs. The NotionFlow Solution

Power users navigating Notion on iOS frequently face two unsatisfactory extremes:

| Scenario | The Problem | The Experience |
| :--- | :--- | :--- |
| **Native Mobile Notion App** | Multi-column dashboards collapse into endless vertical scrolls. Wide database tables force card views. Formulas 2.0 and desktop templates are locked down or stripped. | ❌ Crippled power-user workflows |
| **Safari "Request Desktop Site"** | Yields microscopic unreadable typography, awkward horizontal panning, tiny mouse-hover handles that cannot be tapped, and persistent mobile redirect banners. | ❌ Frustrating & unreadable |
| **NotionFlow iOS** 🚀 | Spoofs full macOS desktop Notion while running a dynamic, client-side injection engine that transforms layouts, adds touch handles, freezes database columns, and docks a floating accessory bar. | ✅ **True desktop power + native touch fluidity** |

---

## ✨ Core Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NotionFlow Engine                             │
├──────────────────┬──────────────────┬─────────────────┬────────────────┤
│ 🗂️ Snap Carousel  │ 📊 Sticky Tables │ ⚡ Glass FAB     │ ⌨️ Keyboard Bar │
│ Columns to Cards │ Frozen Row Idx   │ Search & Zoom   │ Markdown & Tab │
└──────────────────┴──────────────────┴─────────────────┴────────────────┘
```

### 🖥️ 1. MacIntel Desktop Spoofing & Banner Suppression
- Spoofs macOS Safari UA (`MacIntel`) and overrides `navigator.userAgentData`.
- Suppresses native app store redirect prompts, sticky banners, and aggressive mobile interstitials.
- Unlocks full desktop capabilities: multi-column pages, comprehensive database views, Formulas 2.0, and desktop layout templates.

### 🗂️ 2. Horizontal Snap-Carousel for Multi-Columns
- Automatically detects desktop multi-column layouts and wraps them into smooth, momentum-based swipeable carousels on narrow screens (`< 768px`).
- Retains side-by-side dashboard structure with real-time pagination indicator dots—eliminating endless vertical scrolling.

### 📊 3. Database Table Enhancer & Sticky Columns
- **Sticky Title Column**: Freezes the primary title property with high-z-index sticky positioning. Pan infinitely through wide relation and formula columns without losing row context.
- **Full-Screen Focus Mode**: Dedicated 1-tap toggle to expand database tables edge-to-edge for efficient spreadsheet-style editing.

### 👆 4. Touch-First Block Interaction Handles
- Bridges the gap where desktop Notion relies on mouse `:hover` events.
- Single-tap any block to reveal an ergonomic, 44×44pt finger-friendly action bar for block addition (`+`), duplication, reordering, and deletion.

### ⚡ 5. Glassmorphic Floating Action Bar (FAB)
- Floats subtly at the bottom of the screen with iOS-native blur and haptic feedback.
- Instant 1-tap shortcuts:
  - **Quick Find**: Triggers `Cmd+P` / `Cmd+K` desktop search instantly.
  - **Sidebar Drawer**: Toggles an off-canvas slide-over drawer with swipe-to-dismiss gestures.
  - **Dynamic Zoom Slider**: Smoothly adjust viewport magnification from 60% to 140%.
  - **History**: Quick undo and redo actions.
  - **New Page**: Immediate `Cmd+N` document creation.

### ⌨️ 6. Virtual Keyboard Markdown Accessory Bar
- Automatically docks directly above the virtual keyboard whenever an editable block gains focus.
- One-tap buttons for `#` (H1), `##` (H2), `###` (H3), `[ ]` (To-Do), `•` (Bullet list), `1.` (Numbered list), `**Bold**`, `*Italic*`, `Code`, `/` (Slash command), and indent/outdent (`Tab` / `Shift+Tab`).

### 🖤 7. OLED True Black & Native Safe Areas
- High-contrast true OLED `#000000` dark theme overrides.
- Full compatibility with iOS Dynamic Island, notch geometries, and Home Indicator insets.

---

## 📱 Quick Install: Safari Userscript (Zero Mac / 60 Seconds)

> [!TIP]
> **No Mac, Xcode, or developer account required!** Run NotionFlow immediately in Mobile Safari on your iPhone or iPad using the free, open-source **Userscripts** Safari extension.

### Step 1: Install the Userscripts Safari Extension
1. Install **[Userscripts on App Store](https://apps.apple.com/app/userscripts/id1463298887)** *(Free, open-source, GPL-3.0, zero telemetry)*.
2. Navigate to iOS **Settings** ➔ **Safari** ➔ **Extensions**.
3. Tap **Userscripts**:
   - Toggle **Allow Extension** to **ON**.
   - Under *Permissions*, set **All Websites** to **Allow**.

### Step 2: Configure Directory
1. Open the **Userscripts** app from your home screen.
2. Tap **Set Userscripts Directory** and choose or create any local folder (e.g., `On My iPhone/Userscripts`).

### Step 3: Add NotionFlow Script
Choose either option:

* **Option A (Direct File Download)**:
  1. Download [`dist/notion-flow.user.js`](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js) directly to your configured Userscripts folder.
  2. The extension will automatically detect and enable it.

* **Option B (Copy & Paste via Safari)**:
  1. Open the raw [`notion-flow.user.js`](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js) file and copy its content.
  2. In Safari, tap the **Extensions** icon (🧩 or `aA`) in the address bar ➔ **Userscripts**.
  3. Tap **`+` (New Script)**, paste the code, and tap **Save**.

### Step 4: Launch Notion & Add to Home Screen
1. Navigate to [`https://www.notion.so`](https://www.notion.so) in Safari.
2. Notion will load in desktop mode with all NotionFlow touch enhancements active.
3. *(Recommended)* Tap the Safari **Share** icon ➔ **Add to Home Screen** to run NotionFlow in standalone edge-to-edge app mode!

---

## 💻 Native iOS App Deployment (Capacitor & Xcode)

For a fully packaged native `.ipa` with custom WebKit controllers and offline asset injection:

### Prerequisites
- macOS running Xcode 15+
- Node.js 20+ & npm

### Build & Run

```bash
# 1. Clone repository & install dependencies
git clone https://github.com/intelQong/NotionFlow.git
cd NotionFlow
npm install

# 2. Compile web assets & userscript bundles
npm run build
npm run build:userscript

# 3. Synchronize native iOS assets
npm run cap:sync

# 4. Open project in Xcode
npm run cap:open
```

In Xcode:
1. Open `ios/App/App.xcworkspace`.
2. Under **Signing & Capabilities**, select your **Apple Development Team**.
3. Choose your target (Physical iPhone/iPad or iOS Simulator) and click **Run (`Cmd+R`)**.

---

## 🧪 Local Interactive Simulator

Test touch gestures, responsive carousels, and toolbars inside a photorealistic iPhone 16 Pro / iPad Pro simulator directly from your browser:

```bash
# Start local Vite development server
npm run dev
```

Visit `http://localhost:5173` to interact with:
- **Device Frame Switcher**: Toggle between iPhone 16 Pro, iPhone 16 Plus, and iPad Pro.
- **Orientation Toggle**: Test both portrait and landscape viewport scaling.
- **Gesture Testing**: Swipe between multi-column cards and pan sticky database tables.
- **Accessory Bar Preview**: Focus on blocks to inspect keyboard accessories and floating actions.

---

## 🏗️ Architecture

```
notion-wraper-ios/
├── capacitor.config.ts          # WebKit configuration & desktop user-agent overrides
├── vite.config.ts               # Vite bundler & asset pipeline
├── package.json                 # Project configuration and script hooks
├── src/
│   ├── app.ts                   # Core coordinator and lifecycle observer
│   ├── index.html               # Simulator preview shell
│   ├── engine/
│   │   ├── spoof.ts             # MacIntel UA spoofing & redirect suppression
│   │   ├── viewport.ts          # Dynamic viewport scaling & zoom presets
│   │   ├── columns-carousel.ts  # Multi-column snap-carousel transformer
│   │   ├── database-enhancer.ts # Sticky title columns & fullscreen DB focus
│   │   ├── touch-handles.ts     # Touch hover emulation & enlarged hitboxes
│   │   ├── sidebar-drawer.ts    # Off-canvas slide-over drawer coordinator
│   │   └── keyboard-toolbar.ts  # Docked virtual keyboard accessory bar
│   ├── ui/
│   │   ├── floating-bar.ts      # Glassmorphic floating action bar (FAB)
│   │   ├── simulator-frame.ts   # Device shell for browser development
│   │   └── styles/              # High-priority responsive CSS overrides
│   └── userscript/
│       └── notion-flow.user.ts  # Safari extension standalone entry point
├── ios/
│   └── App/                     # Native Capacitor Xcode workspace
│       ├── App/
│       │   ├── ViewController.swift  # Custom WKWebView injection hooks
│       │   └── Info.plist            # App transport security & permissions
│       └── Podfile
└── scripts/
    └── build-userscript.js      # Bundles standalone userscripts to dist/
```

---

## 🛠️ Command Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Launches local interactive iOS simulator server (`localhost:5173`) |
| `npm run build` | Runs TypeScript compilation (`tsc`) and generates production bundle via Vite |
| `npm run build:userscript` | Builds standalone `dist/notion-flow.user.js` and `notionflow-injection.js` |
| `npm run preview` | Previews production build locally |
| `npm run cap:sync` | Synchronizes compiled web assets and native plugins to `ios/App` |
| `npm run cap:open` | Launches the native Xcode workspace (`App.xcworkspace`) |

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for enhancements or encounter any issues:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

Developed with ❤️ by [intelQong](https://github.com/intelQong).
