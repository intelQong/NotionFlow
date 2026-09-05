import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const banner = `// ==UserScript==
// @name         NotionFlow - Desktop Superpowers on Mobile iOS
// @namespace    https://github.com/intelQong/NotionFlow
// @version      1.3.1
// @description  Forces desktop Notion on iOS with dynamic UI/UX adaptation: snap carousels, sticky table headers, touch handles, and floating toolbar.
// @author       intelQong
// @updateURL    https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js
// @downloadURL  https://raw.githubusercontent.com/intelQong/NotionFlow/main/dist/notion-flow.user.js
// @match        https://app.notion.com/*
// @match        https://*.notion.com/*
// @match        https://notion.com/*
// @match        https://app.notion.so/*
// @match        https://*.notion.so/*
// @match        https://notion.so/*
// @match        https://*.notion.site/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
`;

async function build() {
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../src/userscript/notion-flow.user.ts')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['safari15', 'es2022'],
    write: false,
  });

  const code = result.outputFiles[0].text;

  // 1. Output userscript with metadata
  const userScriptPath = path.resolve(distDir, 'notion-flow.user.js');
  fs.writeFileSync(userScriptPath, banner + '\n' + code, 'utf-8');
  console.log('✓ Successfully generated Userscript:', userScriptPath);

  // 2. Output raw injection script for WKUserScript iOS
  const wkScriptPath = path.resolve(distDir, 'notionflow-injection.js');
  fs.writeFileSync(wkScriptPath, code, 'utf-8');
  console.log('✓ Successfully generated WKUserScript bundle:', wkScriptPath);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
