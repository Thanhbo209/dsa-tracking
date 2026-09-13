import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

// Ensure icons folder exists and contains logo.png
const iconsDir = path.resolve("extension/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (fs.existsSync("public/logo.png")) {
  fs.copyFileSync("public/logo.png", "extension/icons/logo.png");
  fs.copyFileSync("public/logo.png", "extension/logo.png");
}

await build({
  entryPoints: [
    "extension/src/content.ts",
    "extension/src/background.ts",
    "extension/src/popup.ts",
    "extension/src/bridge.ts",
  ],
  bundle: true,
  outdir: "extension/dist",
  format: "iife",
  platform: "browser",
  target: "es2022",
});

console.log("Extension build completed successfully!");

