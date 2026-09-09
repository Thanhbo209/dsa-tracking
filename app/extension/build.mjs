import { build } from "esbuild";

await build({
  entryPoints: ["extension/src/content.ts"],
  bundle: true,
  outfile: "extension/dist/content.js",
  format: "iife",
  platform: "browser",
  target: "es2022",
});
