# NotionFlow iOS 🚀
> **Desktop-Class Notion Superpowers on Mobile**

Notion on mobile has long frustrated power users: multi-column dashboards get squashed into endless single-column scrolls, database tables are truncated or forced into card views, formulas and relation properties are cumbersome to edit, and essential desktop shortcuts are absent. Conversely, using standard "Request Desktop Website" in mobile Safari yields a microscopic, unreadable viewport with awkward navigation.

**NotionFlow** is an iOS hybrid wrapper and dynamic client-side injection engine that loads Notion in **full desktop mode** while dynamically transforming the UI/UX for seamless touch-screen usability.

---

## ✨ Core Superpowers

| Feature | Description |
| :--- | :--- |
| 🖥️ **Desktop Mode Spoofing** | Spoofs macOS Safari UA (`MacIntel`), overrides `userAgentData`, suppresses mobile app redirect banners, and unlocks desktop features (multi-columns, full database views, formulas 2.0, database templates). |
| 🗂️ **Horizontal Snap-Carousel** | Dynamically transforms desktop multi-column layouts into smooth, swipeable card carousels with pagination dots on mobile viewports (< 768px). Dashboards remain organized side-by-side without vertical clutter! |
| 📊 **Database Table Enhancer** | Freezes the primary title column with sticky left positioning so panning right through properties never loses row context. Includes a **Full-Screen Focus Mode** for spreadsheet-style data entry. |
| 👆 **Touch Block Handles** | Replaces desktop mouse `:hover` with touch detection. Tapping any block reveals finger-friendly handles for adding blocks (`+`), duplicating, and deleting. |
| ⚡ **Floating Action Bar (FAB)** | Glassmorphism bottom pill with 1-tap **Quick Find** (`Cmd+P`/`Cmd+K`), **Sidebar Drawer Toggle**, **Dynamic Zoom Slider** (60%–140%), **Undo / Redo**, and **New Page** (`Cmd+N`). |
| ⌨️ **Keyboard Accessory Bar** | Automatically appears above the iOS virtual keyboard when editing text, offering quick buttons for `#`, `##`, `###`, `[ ]` (To-Do), `•` (Bullet), `1.` (Numbered), `**Bold**`, `*Italic*`, `Code`, `/` (Slash command trigger), and `Tab / Shift+Tab`. |
| 📑 **Slide-Over Sidebar Drawer** | Converts Notion's desktop sidebar into an off-canvas drawer with backdrop blur, tap-to-dismiss, and left-bezel swipe gestures. |
| 🖤 **OLED Dark Mode & Safe Areas** | High-contrast true-black optimization synced with iOS system dark mode, respecting Dynamic Island and Home Indicator safe areas. |

---

## 🏗️ Architecture Overview

```
notion-wraper-ios/
├── capacitor.config.ts          # Capacitor iOS configuration (Desktop UA, WebKit settings)
├── vite.config.ts               # Vite dev and bundling configuration
├── package.json                 # Project dependencies & build scripts
├── src/
│   ├── index.html               # Interactive iOS Device Frame Simulator shell
│   ├── app.ts                   # Main application coordinator
│   ├── engine/
│   │   ├── spoof.ts             # MacIntel & desktop UA spoofing engine
│   │   ├── viewport.ts          # Dynamic viewport scaling & zoom presets
│   │   ├── columns-carousel.ts  # Multi-column snap carousel transformer
│   │   ├── database-enhancer.ts # Sticky title columns & full-screen DB focus mode
│   │   ├── touch-handles.ts     # Touch block hover emulator & enlarged hitboxes
│   │   ├── sidebar-drawer.ts    # Off-canvas slide-over sidebar manager
│   │   └── keyboard-toolbar.ts  # iOS virtual keyboard accessory bar
│   ├── ui/
│   │   ├── floating-bar.ts      # Glassmorphism Floating Action Bar
│   │   ├── simulator-frame.ts   # Interactive iPhone 16 Pro / iPad Pro shell
│   │   └── styles/              # High-priority responsive CSS overrides
│   └── userscript/
│       └── notion-flow.user.ts  # Standalone Userscript entry point
├── ios/
│   └── App/                     # Native iOS Capacitor / Xcode Project
│       ├── App/
│       │   ├── ViewController.swift  # Custom WKWebView configuration & script injection
│       │   ├── Info.plist            # iOS permissions, ATS, and orientations
│       │   └── public/               # Bundled web assets & injection scripts
│       └── Podfile
└── scripts/
    └── build-userscript.js      # Bundler for standalone .user.js
```

---

## 🚀 Getting Started

### 1. Local Interactive Simulator (Develop & Preview)
Test all gestures, carousels, and toolbars inside a photorealistic iPhone 16 Pro / iPad Pro simulator directly in your browser:

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Or build and preview production assets
npm run build
npm run preview
```

Open `http://localhost:5173` to test:
- **Device Selector**: Switch between iPhone 16 Pro, iPhone 16 Plus, and iPad Pro.
- **Rotate**: Test portrait and landscape orientations.
- **Multi-Column Carousel**: Swipe horizontally between the columns.
- **Database Table**: Pan the table horizontally and observe the frozen title column.
- **Interactive Editing**: Tap any block or text area to test the touch handles and keyboard accessory bar.

---

## 📱 Quick iOS Setup Guide (Zero-Mac / 60 Seconds)

> [!TIP]
> **No Mac or Xcode required!** You can run NotionFlow directly inside Mobile Safari on your iPhone or iPad using the free, open-source **Userscripts** Safari extension.

### Step 1: Install the Free "Userscripts" Extension
1. Open the App Store on your iPhone/iPad and install **[Userscripts](https://apps.apple.com/app/userscripts/id1463298887)** *(Free, open-source, no ads or tracking)*.
2. Go to iPhone **Settings** ➔ **Safari** ➔ **Extensions**.
3. Tap **Userscripts**:
   - Toggle **Allow Extension** to **ON**.
   - Under *Permissions for Userscripts*, tap **All Websites** and select **Allow**.

### Step 2: Set the Script Directory (10 Seconds)
1. Open the **Userscripts** app from your iPhone home screen once.
2. Tap **Set Userscripts Directory** and select any folder in the Files app (e.g., `On My iPhone` ➔ `Userscripts`).

### Step 3: Add NotionFlow to Userscripts
Choose either of the two quick methods:

* **Option A (Download File)**:
  1. In Safari on your iPhone, open your release asset: [**NotionFlow v1.0.0 Release**](https://github.com/intelQong/notion-wraper-ios/releases/tag/v1.0.0).
  2. Tap **`notion-flow.user.js`** to download it.
  3. Move or save the downloaded file into your **Userscripts** folder in the Files app.

* **Option B (Copy & Paste in Safari)**:
  1. Open [**dist/notion-flow.user.js**](https://github.com/intelQong/notion-wraper-ios/blob/main/dist/notion-flow.user.js) on GitHub and copy the raw code.
  2. In Safari, tap the **Extensions** icon (puzzle piece 🧩 or `aA` button) in the address bar ➔ tap **Userscripts**.
  3. Tap the **`+` (New Script)** button, paste the code, and tap **Save**.

### Step 4: Launch Notion Desktop
1. Open **`https://www.notion.so`** in Safari.
2. Notion automatically runs in **full desktop mode** with all superpowers:
   - 🗂️ **Horizontal Snap-Carousel**: Swipe smoothly between multi-column dashboard cards.
   - 📊 **Frozen Database Headers**: Sticky title columns remain visible while scrolling wide tables, plus a **"Focus View"** button.
   - ⚡ **Floating Action Bar (FAB)**: 1-tap search (`Cmd+P`), sidebar drawer toggle, dynamic zoom slider (60%–140%), and undo/redo.
   - ⌨️ **Keyboard Toolbar**: Markdown shortcuts docked right above your virtual keyboard.
   - 👆 **Touch Block Handles**: Tap any block to reveal add (`+`), duplicate, and delete controls.

### Step 5: Turn Into a Full-Screen Standalone App (Optional)
To remove Safari's top and bottom browser bars:
1. While on `notion.so` in Safari, tap the **Share** button (box with upward arrow).
2. Scroll down and tap **Add to Home Screen**.
3. Name it **NotionFlow** and tap **Add**.
4. Open the new app icon from your home screen for an edge-to-edge native experience!

---

### 3. Native iOS App (Xcode / TestFlight Deployment)
To build and install the native iOS app onto your iPhone or iPad:

```bash
# 1. Build web assets and standalone injection bundles
npm run build
npm run build:userscript

# 2. Sync to native iOS project
npm run cap:sync

# 3. Open Xcode project (on macOS)
npm run cap:open
# Or open ios/App/App.xcworkspace directly in Xcode
```

In Xcode:
1. Select your Development Team in **Signing & Capabilities**.
2. Select your connected iPhone/iPad or iOS Simulator.
3. Click **Run** (`Cmd+R`) to build and launch **NotionFlow**!

---

## 🛠️ Build Commands Summary

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite local interactive iOS simulator server |
| `npm run build` | Compiles TypeScript and builds production web assets |
| `npm run build:userscript` | Generates standalone `dist/notion-flow.user.js` and `notionflow-injection.js` |
| `npm run cap:sync` | Syncs web assets and native plugins to `ios/App` |
| `npm run cap:open` | Opens Xcode workspace on macOS |

---

## 📄 License
MIT License. Created by intelQong.
