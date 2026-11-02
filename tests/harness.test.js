import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createScriptedAnalyzer } from "../src/analyzer.js";
import { createBaselineArtifact, FORTIFICATION_PROFILE } from "../src/profiles.js";
import { aggregate } from "../src/benchmark.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "src", "cli.js");
const REFERENCE = join(ROOT, "benchmarks", "results", "2026-11-02_reference.json");
const REFERENCE_SEED = "12648430";

function cli(args, cwd = ROOT) {
  return spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" });
}

/** Result minus the two metadata fields that legitimately change between runs. */
function stable(obj) {
  const { runId, startedAt, ...rest } = obj;
  return rest;
}

test("same seed gives identical results (all fields but runId/startedAt)", () => {
  const a = JSON.parse(cli(["benchmark", "--json", "--seed", REFERENCE_SEED]).stdout);
  const b = JSON.parse(cli(["benchmark", "--json", "--seed", REFERENCE_SEED]).stdout);
  assert.deepEqual(stable(a), stable(b));
});

test("reference seed reproduces the committed reference result", () => {
  const fresh = JSON.parse(cli(["benchmark", "--json", "--seed", REFERENCE_SEED]).stdout);
  const committed = JSON.parse(readFileSync(REFERENCE, "utf8"));
  assert.deepEqual(stable(fresh), stable(committed));
});

test("result rows are self-describing: full cost model and seed are embedded", () => {
  const out = JSON.parse(cli(["benchmark", "--json", "--seed", REFERENCE_SEED]).stdout);
  for (const row of out.rows) {
    assert.equal(row.extra.params.seed, Number(REFERENCE_SEED));
    for (const k of ["opsBudget", "tokensPerOpBase", "tokensPerByte", "entropyTokenMult", "aliasTokenMult", "nestingTokenMult"]) {
      assert.equal(typeof row.extra.params[k], "number", `missing ${k}`);
    }
  }
});

test("invalid arguments are rejected with exit code 2", () => {
  for (const args of [
    ["benchmark", "--seed", "abc"],
    ["benchmark", "--seed", "-1"],
    ["benchmark", "--seed", "4294967296"],
    ["benchmark", "--seed"],
    ["benchmark", "--runs", "0"],
    ["benchmark", "--runs", "1001"],
    ["benchmark", "--bogus"],
    ["nope"],
  ]) {
    const r = cli(args);
    assert.equal(r.status, 2, `expected exit 2 for ${args.join(" ")}, got ${r.status}`);
  }
});

test("--out is resolved from the current directory, not from the repository", () => {
  const dir = mkdtempSync(join(tmpdir(), "proteus-"));
  const r = cli(["benchmark", "--seed", "1", "--out", "sub/run.json"], dir);
  assert.equal(r.status, 0);
  assert.ok(existsSync(join(dir, "sub", "run.json")));
  assert.ok(!existsSync(join(ROOT, "sub")));
});

test("--runs reports an aggregate with a standard deviation", () => {
  const out = JSON.parse(cli(["benchmark", "--json", "--runs", "5"]).stdout);
  assert.equal(out.seeds.count, 5);
  const fort = out.aggregate.find((a) => a.profileId === "fortification");
  assert.equal(fort.runs, 5);
  assert.ok(fort.understandScore.stdev > 0);
});

test("aggregate computes mean and sample standard deviation", () => {
  const row = (tokens) => ({ profileId: "p", axis: "x", operations: 1, tokens, understandScore: 1, tokensPerUnderstanding: tokens, failed: false });
  const [p] = aggregate([[row(2)], [row(4)], [row(6)]]);
  assert.equal(p.tokens.mean, 4);
  assert.equal(p.tokens.stdev, 2);
});

test("`failed` means giving up with sections unread, not just touching the budget", () => {
  const artifact = createBaselineArtifact("t", 1000, { symbols: 3, strings: 0, code: 0 });
  // 1 initial op + 1 per section = 4 operations when everything is read.
  const exact = createScriptedAnalyzer("t", { opsBudget: 4 }).analyze(artifact);
  assert.equal(exact.failed, false);
  assert.equal(exact.understandScore, 1);
  const tight = createScriptedAnalyzer("t", { opsBudget: 3 }).analyze(artifact);
  assert.equal(tight.failed, true);
  assert.ok(tight.understandScore < 1);
});

test("seed 0 does not degenerate the PRNG", () => {
  const artifact = FORTIFICATION_PROFILE.apply(createBaselineArtifact("t", 1000));
  const r = createScriptedAnalyzer("t", { seed: 0 }).analyze(artifact);
  assert.ok(r.understandScore > 0 && r.understandScore < 1);
});

test("substance line: library code has no filesystem, process or network access", () => {
  const forbidden = /from\s+["'](node:)?(fs|child_process|net|http|https|dns|dgram|worker_threads|vm)["']|\beval\s*\(|new Function\s*\(|\bfetch\s*\(/;
  for (const f of readdirSync(join(ROOT, "src"))) {
    if (f === "cli.js") continue; // the CLI alone may write a result file
    const text = readFileSync(join(ROOT, "src", f), "utf8");
    assert.ok(!forbidden.test(text), `${f} uses a forbidden capability`);
  }
});
