#!/usr/bin/env node
/**
 * proteus-shield CLI.
 *
 * Usage:
 *   node src/cli.js benchmark [--seed N] [--runs N] [--out <path>] [--json]
 *   node src/cli.js --help
 *
 * Produces a reproducible result set. No dependencies.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createScriptedAnalyzer } from "./analyzer.js";
import { PROFILES } from "./profiles.js";
import { runBenchmark, normalize, aggregate, standardScenario } from "./benchmark.js";

const DEFAULT_SEED = 0xc0ffee;
const MAX_RUNS = 1000;

function usage() {
  return [
    "proteus-shield — measurement harness (defensive study only)",
    "",
    "Commands:",
    "  benchmark   Run the reproducible benchmark",
    "",
    "Options (for benchmark):",
    "  --seed <n>     Analyzer seed, integer 0..4294967295 (default 12648430)",
    "  --runs <n>     Repeat over n consecutive seeds and report mean/stdev (1..1000, default 1)",
    "  --out <path>   Also write the full JSON result to this file (relative to the current directory)",
    "  --json         Print the full JSON to stdout instead of the summary table",
    "  --help, -h     Show this help",
    "",
    "Without --json, a human-readable table is printed. --out never changes stdout format.",
  ].join("\n");
}

class UsageError extends Error {}

/**
 * Strict argument parser: unknown flags and missing values are errors.
 * @param {string[]} args
 */
function parseArgs(args) {
  const opts = { seed: DEFAULT_SEED, runs: 1, out: null, json: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") {
      opts.json = true;
    } else if (a === "--seed" || a === "--runs" || a === "--out") {
      const v = args[i + 1];
      if (v === undefined || v.startsWith("--")) throw new UsageError(`Missing value for ${a}`);
      i++;
      if (a === "--out") {
        opts.out = v;
      } else {
        if (!/^\d+$/.test(v)) throw new UsageError(`${a} expects a non-negative integer, got "${v}"`);
        const n = Number(v);
        if (a === "--seed") {
          if (n > 0xffffffff) throw new UsageError("--seed must be at most 4294967295");
          opts.seed = n;
        } else {
          if (n < 1 || n > MAX_RUNS) throw new UsageError(`--runs must be between 1 and ${MAX_RUNS}`);
          opts.runs = n;
        }
      }
    } else {
      throw new UsageError(`Unknown option: ${a}`);
    }
  }
  return opts;
}

function runOnce(seed) {
  const analyzer = createScriptedAnalyzer("scripted-v1", { seed });
  const { artifact } = standardScenario([analyzer]);
  const summary = runBenchmark({ artifact, profiles: PROFILES, analyzers: [analyzer] });
  return { ...summary, rows: normalize(summary) };
}

function fmt(n, digits = 0) {
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function table(first, agg) {
  const lines = [];
  const head = ["profile", "axis", "operations", "tokens", "understood", "tokens/understanding"];
  lines.push(head.join("\t"));
  for (const r of first.rows) {
    lines.push(
      [r.profileId, r.axis, fmt(r.operations), fmt(r.tokens), `${fmt(r.understandScore * 100, 1)}%`, fmt(r.tokensPerUnderstanding)].join("\t"),
    );
  }
  if (agg) {
    lines.push("");
    lines.push(`Aggregate over ${agg[0].runs} seeds (mean ± stdev)`);
    for (const a of agg) {
      lines.push(
        [
          a.profileId,
          `ops ${fmt(a.operations.mean, 1)} ± ${fmt(a.operations.stdev, 1)}`,
          `tokens ${fmt(a.tokens.mean)} ± ${fmt(a.tokens.stdev)}`,
          `understood ${fmt(a.understandScore.mean * 100, 1)}% ± ${fmt(a.understandScore.stdev * 100, 2)}`,
          `failed ${a.failedRuns}/${a.runs}`,
        ].join("\t"),
      );
    }
  }
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    return;
  }

  try {
    const [cmd, ...rest] = args;
    if (cmd !== "benchmark") throw new UsageError(`Unknown command: ${cmd}`);
    const opts = parseArgs(rest);

    const results = [];
    for (let i = 0; i < opts.runs; i++) results.push(runOnce(opts.seed + i));
    const output = { ...results[0] };
    let agg = null;
    if (opts.runs > 1) {
      agg = aggregate(results.map((r) => r.rows));
      output.seeds = { first: opts.seed, count: opts.runs };
      output.aggregate = agg;
    }

    if (opts.out) {
      const full = resolve(process.cwd(), opts.out);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, JSON.stringify(output, null, 2) + "\n", "utf8");
      console.error(`Wrote ${full}`);
    }

    console.log(opts.json ? JSON.stringify(output, null, 2) : table(results[0], agg));
  } catch (err) {
    if (err instanceof UsageError) {
      console.error(`${err.message}\n\n${usage()}`);
      process.exit(2);
    }
    throw err;
  }
}

main();
