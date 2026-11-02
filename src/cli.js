#!/usr/bin/env node
/**
 * proteus-shield-action CLI.
 *
 * Usage:
 *   node src/cli.js benchmark [--out benchmarks/results/<file>.json] [--seed N]
 *   node src/cli.js --help
 *
 * Produces a dated, reproducible JSON result set. No dependencies.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createScriptedAnalyzer } from "./analyzer.js";
import { PROFILES } from "./profiles.js";
import { runBenchmark, normalize, standardScenario } from "./benchmark.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function usage() {
  return [
    "proteus-shield-action — measurement harness (defensive study only)",
    "",
    "Commands:",
    "  benchmark   Run the reproducible benchmark and print/emit results",
    "",
    "Options (for benchmark):",
    "  --out <path>   Write JSON to this path (default: benchmarks/results/)",
    "  --seed <n>     Override the analyzer seed",
    "  --json         Print JSON to stdout instead of a table",
    "  --help         Show this help",
  ].join("\n");
}

function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return;
  }

  const cmd = args[0];
  if (cmd !== "benchmark") {
    console.error(`Unknown command: ${cmd}\n\n${usage()}`);
    process.exit(1);
  }

  const seedStr = argValue(args, "--seed");
  const seed = seedStr ? Number(seedStr) : 0xC0FFEE;
  const outPath = argValue(args, "--out");
  const asJson = args.includes("--json");

  const analyzer = createScriptedAnalyzer("scripted-v1", { seed });
  const { artifact } = standardScenario([analyzer]);

  const summary = runBenchmark({
    artifact,
    profiles: PROFILES,
    analyzers: [analyzer],
  });

  const normalized = normalize(summary);
  const output = { ...summary, rows: normalized };

  if (outPath) {
    const full = resolve(__dirname, "../", outPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, JSON.stringify(output, null, 2) + "\n", "utf8");
    console.log(`Wrote ${full}`);
  }

  if (asJson || !outPath) {
    console.log(JSON.stringify(output, null, 2));
  }
}

main();