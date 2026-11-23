// Star Catcher — make.fun video-on-X bounty entry (Node 22, standard library only).
//
// The entry is the X post itself: an agent-made video about an AI coding agent
// building the tiny browser game in game/index.html from one prompt, ending with
// make.fun's referral end card. This program does the one job the gate needs:
// it copies POST.json from the repository root to /output/POST.json, where the
// house reads the post's address. It validates the file first (it must be a JSON
// object with a url string), so a bad POST.json fails loudly instead of silently
// copying garbage. Nothing this program writes about the post is scored.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(BOT_DIR, "POST.json");
const target = join(OUTPUT_DIR, "POST.json");

let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(source, "utf8"));
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof parsed !== "object" || parsed === null || typeof (parsed as { url?: unknown }).url !== "string") {
  console.error("POST.json must be a JSON object with a string url, e.g. {\"url\": \"https://x.com/<handle>/status/<id>\"}");
  process.exit(1);
}

// The url must name an X post: https://x.com/<handle>/status/<digits>
// (twitter.com, www./mobile. and /i/web/status/<id> forms are read the same
// way by the gate, but the canonical x.com form is what we write).
const url = (parsed as { url: string }).url;
if (!/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(url)) {
  console.error(`POST.json url does not name an X post: ${url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`POST.json could not be copied to ${OUTPUT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
console.log(`POST.json copied to ${target}`);
