#!/usr/bin/env node
// Fails the build if any raw Tailwind color utility (e.g. `bg-amber-500`,
// `text-emerald-600`, `from-sky-500/10`) shows up outside styles/theme.css.
// This exists because the "use theme tokens, not stock Tailwind colors" rule
// in CLAUDE.md §12 was violated three separate times before an automated
// check was added — documentation alone wasn't enough.

import { readdirSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

const SRC_DIR = join(import.meta.dirname, "..", "src");

// Stock Tailwind color families that aren't this project's tokens. Our own
// tokens (brand, neutral, success, warning, danger, info) are intentionally
// excluded — those are exactly what should be used instead.
const FORBIDDEN_COLORS = [
  "slate", "gray", "zinc", "stone",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
];

const COLOR_PATTERN = new RegExp(
  String.raw`\b(${FORBIDDEN_COLORS.join("|")})-(?:50|100|200|300|400|500|600|700|800|900|950)\b`,
  "g",
);

function collectFiles(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, results);
    } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const files = collectFiles(SRC_DIR);
  const violations = [];

  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      const matches = line.match(COLOR_PATTERN);
      if (matches) {
        violations.push({ file, line: index + 1, matches: [...new Set(matches)] });
      }
    });
  }

  if (violations.length > 0) {
    console.error("\n✖ Raw Tailwind color classes found — use this project's theme tokens instead");
    console.error("  (brand / neutral / success / warning / danger / info — see CLAUDE.md §12):\n");
    for (const { file, line, matches } of violations) {
      console.error(`  ${file}:${line}  ${matches.join(", ")}`);
    }
    console.error("");
    process.exit(1);
  }

  console.log("✓ No raw Tailwind color classes found in src/");
}

main();
