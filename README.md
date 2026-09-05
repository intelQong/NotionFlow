<div align="center">

# NotionFlow for iOS Safari

### *Desktop-Class Notion Superpowers on Mobile WebKit via Lightweight Userscript.*

[![Latest Release](https://img.shields.io/github/v/release/intelQong/NotionFlow?color=007AFF&logo=apple&logoColor=white&label=Release)](https://github.com/intelQong/NotionFlow/releases)
[![iOS Compatibility](https://img.shields.io/badge/iOS-16.0%2B-000000?logo=apple&logoColor=white)](https://apple.com/ios)
[![Safari Extension](https://img.shields.io/badge/Safari-Userscript-FF9500?logo=safari&logoColor=white)](https://apps.apple.com/app/userscripts/id1463298887)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-34C759.svg)](LICENSE)

<br />

<p align="center">
  <a href="#-the-problem-vs-notionflow">Why NotionFlow?</a> •
  <a href="#-quick-install-60-seconds--zero-mac-required">60s Safari Install</a> •
  <a href="#-how-to-add-to-your-iphone--ipad-home-screen">Add to Home Screen</a> •
  <a href="#-superpowers">Superpowers</a> •
  <a href="#-local-interactive-simulator">Simulator</a> •
  <a href="#-development--build">Development</a>
</p>

</div>

---

## 📌 The Problem vs. NotionFlow

Power users using Notion on iPhone or iPad usually face two frustrating extremes:

| Scenario | The Bottleneck | The Experience |
| :--- | :--- | :--- |
| **Official Mobile Notion App** | Multi-column dashboards squashed into endless single-column scrolls. Wide database tables collapse into cards. Formulas 2.0 and desktop templates are locked down. | ❌ Crippled power-user workflows |
| **Safari "Request Desktop Website"** | Microscopic unreadable typography, awkward horizontal panning, tiny mouse-hover handles that cannot be tapped, and persistent mobile app redirect banners. | ❌ Frustrating & unreadable |
| **NotionFlow (Userscript)** 🚀 | Spoofs full macOS Safari desktop Notion while running a dynamic, client-side injection engine that transforms layouts into swipeable snap carousels, freezes database table headers, adds touch handles, and docks a floating accessory bar. | ✅ **True desktop power + native touch fluidity** |

---

## ⚡ Quick Install (60 Seconds — Zero Mac Required)

> [!TIP]
> **No Mac, Xcode, or developer account required!** NotionFlow runs directly inside Mobile Safari on your iPhone or iPad using the free, open-source **Userscripts** Safari extension.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Get Extension │  ──▶  │ 2. Add Script   │  ──▶  │ 3. Open Notion  │
│ Safari Extension│       │ Save .user.js   │       │ Enjoy Desktop UI│
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Step 1: Install the Free "Userscripts" Extension
1. Open the App Store on your iPhone/iPad and install **[Userscripts](https://apps.apple.com/app/userscripts/id1463298887)** *(Free, open-source, GPL-3.0, zero tracking)*.
2. Go to iPhone **Settings** ➔ **Safari** ➔ **Extensions**.
3. Tap **Userscripts**:
   - Toggle **Allow Extension** to **ON**.
   - Under *Permissions for Userscripts*, tap **All Websites** and select **Allow**.

### Step 2: Configure the Script Directory (10 Seconds)
1. Open the **Userscripts** app from your home screen once.
2. Tap **Set Userscripts Directory** and select any local folder in the Files app (e.g., `On My iPhone` ➔ `Userscripts`).

### Step 3: Add NotionFlow to Userscripts
Choose either quick method:

* **Method A (Direct File Download — Recommended)**:
  1. In Safari, download the compiled userscript: [**`notion-flow.user.js`**](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js).
  2. Save or move the file into your **Userscripts** folder in the Files app.

* **Method B (Copy & Paste in Safari)**:
  1. Open [**`notion-flow.user.js`**](https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js) in Safari and copy all the text.
  2. Tap the Safari **Extensions** icon (puzzle piece 🧩 or `aA`) ➔ tap **Userscripts**.
  3. Tap **`+` (New Script)**, paste the code, and tap **Save**.

### Step 4: Open Notion in Safari
1. Open [**`https://app.notion.com`**](https://app.notion.com) (or [`https://www.notion.so`](https://www.notion.so)) in Safari on your iPhone or iPad.
2. Notion will automatically load in **full desktop mode** with NotionFlow's touch engine active (snap carousels, sticky headers, touch handles, floating toolbars, and full settings access).

---

## 📲 How to Add to Your iPhone / iPad Home Screen

Turn NotionFlow into a **distraction-free, full-screen standalone experience** that removes Safari's browser URL bar and bottom toolbar:

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│ 1. Open app.notion.com    │ ──▶  │ 2. Tap Safari Share (⬆️)   │ ──▶  │ 3. Add to Home Screen     │
│ In Safari on iPhone/iPad  │      │ Scroll down in Share menu │      │ Launches full-screen PWA  │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

### Step-by-Step:
1. **Open Notion**: Go to [**`https://app.notion.com`**](https://app.notion.com) (or `notion.so`) in Safari on your iPhone or iPad. Make sure you are logged in.
2. **Open the Share Menu**: Tap the Safari **Share** icon at the bottom of your screen (the square with an arrow pointing up `⬆️`).
3. **Tap "Add to Home Screen"**: Scroll down through the action sheet and tap **Add to Home Screen** (or *Zum Home-Bildschirm*, *Sur l'écran d'accueil*).
4. **Name the Shortcut**: Name it **NotionFlow** (or **Notion Desktop**) and tap **Add** in the top-right corner.
5. **Launch from Home Screen**: A dedicated icon will appear on your iPhone/iPad Home Screen. Tap it to launch NotionFlow!

> [!TIP]
> **Why Add to Home Screen?**
> * 🚫 **No Browser Bars**: Completely removes Safari's top URL bar and bottom tab bar for 100% edge-to-edge screen real estate.
> * ⚡ **Instant App Switching**: Appears as its own independent window in the iOS App Switcher.
> * 🖤 **Edge-to-Edge OLED**: Automatically integrates with the Dynamic Island, notch, and Home Indicator insets.

---

## ✨ Superpowers

### 🖥️ 1. MacIntel Desktop Spoofing & Banner Suppression
- Spoofs macOS Safari (`MacIntel`) and overrides `navigator.userAgentData`.
- Suppresses native mobile redirect banners, interstitial popups, and app store badges.
- Unlocks full desktop capabilities: multi-columns, full database views, Formulas 2.0, and layout templates.

### 🗂️ 2. Horizontal Snap-Carousel for Multi-Columns
- Automatically detects desktop multi-column layouts and wraps them into smooth, momentum-based swipeable carousels on mobile screens (`< 768px`).
- Retains side-by-side dashboard structure with real-time pagination indicator dots—no more endless vertical scrolling.

### 📊 3. Database Table Enhancer & Sticky Columns
- **Sticky Title Column**: Freezes the primary title property with high-z-index sticky positioning. Pan infinitely through wide relation and formula columns without losing row context.
- **Full-Screen Focus Mode**: Dedicated 1-tap toggle to expand database tables edge-to-edge for efficient spreadsheet-style editing.

### 👆 4. Touch-First Block Interaction Handles
- Solves desktop Notion's reliance on mouse `:hover` events on touch screens.
- Single-tap any block to reveal finger-friendly 44×44pt action handles for block addition (`+`), duplication, reordering, and deletion.

### ⚡ 5. Glassmorphic Floating Action Bar (FAB)
- Subtle bottom pill with iOS glassmorphism blur and haptic feedback:
  - **Quick Find**: Triggers `Cmd+P` / `Cmd+K` desktop search instantly.
  - **Sidebar Drawer**: Toggles an off-canvas slide-over drawer with swipe-to-dismiss gestures.
  - **Dynamic Zoom Slider**: Smoothly adjusts viewport magnification from 60% to 140%.
  - **History**: Quick undo and redo actions.
  - **New Page**: Instant `Cmd+N` document creation.

### ⚙️ 6. Instant Access to Notion Full Settings & Members
- The official Notion mobile app strips or blocks workspace administrative settings (Members, Roles, Billing, Public Sites, Connections, Security, Export).
- NotionFlow provides **1-tap access to Notion's full desktop Settings & Members** modal directly via the ⚙️ FAB button or `Cmd+,`:
  - Manage workspace identity, members, billing tiers, domain routing, and integrations on iPhone/iPad.
  - Dynamically adapts Notion's desktop settings dialog for mobile screens with touch-friendly tabs and responsive layouts.

### ⌨️ 7. Virtual Keyboard Markdown Accessory Bar
- Automatically docks directly above the virtual keyboard whenever an editable block gains focus.
- One-tap buttons for `#` (H1), `##` (H2), `###` (H3), `[ ]` (To-Do), `•` (Bullet list), `1.` (Numbered list), `**Bold**`, `*Italic*`, `Code`, `/` (Slash command), and indent/outdent (`Tab` / `Shift+Tab`).

### 🖤 8. OLED True Black & Safe Area Insets
- High-contrast true OLED `#000000` dark theme overrides.
- Full compatibility with iOS Dynamic Island, notch geometries, and Home Indicator insets.

### 🔄 9. Automatic In-App & Extension Updates
- **Extension Auto-Updates**: Embedded `@updateURL` and `@downloadURL` headers allow Safari **Userscripts**, **Stay**, and **Tampermonkey** to check for updates and keep you on the latest release automatically.
- **Smart Notification Banner**: Built-in background checker detects new releases and shows a non-intrusive 1-tap update banner.
- **Manual Check**: Check anytime from the FAB menu ➔ Scale & Preferences ➔ **"Check for update"**.

---

## 🧪 Local Interactive Simulator

Test all gestures, snap-carousels, and toolbars inside a photorealistic iPhone 16 Pro / iPad Pro simulator directly in your browser:

```bash
# 1. Install dependencies (Node 20+)
npm install

# 2. Start local simulator server
npm run dev
```

Visit `http://localhost:5173` to test:
- **Device Selector**: Switch between iPhone 16 Pro, iPhone 16 Plus, and iPad Pro.
- **Orientation Toggle**: Test portrait and landscape scaling.
- **Interactive Gestures**: Swipe multi-column cards and pan sticky database tables.
- **Accessory Bar Preview**: Focus on blocks to inspect keyboard accessories and floating actions.

---

## 🛠️ Development & Build

```bash
# Build the production userscript (dist/notion-flow.user.js)
npm run build

# Build the interactive web simulator
npm run build:simulator

# Preview the web simulator build locally
npm run preview
```

### Project Structure
```
NotionFlow/
├── scripts/
│   └── build-userscript.js      # Bundles standalone userscript via esbuild
├── src/
│   ├── app.ts                   # Main coordinator and DOM observer
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
│   │   └── styles/              # Responsive CSS overrides
│   └── userscript/
│       └── notion-flow.user.ts  # Userscript entry point
└── dist/
    └── notion-flow.user.js      # Compiled standalone userscript
```

---

## 🤝 Contributing

Contributions, feedback, and feature requests are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/cool-enhancement`).
3. Commit your changes (`git commit -m 'feat: add cool enhancement'`).
4. Push to the branch (`git push origin feature/cool-enhancement`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Crafted with ❤️ by [intelQong](https://github.com/intelQong).
