/**
 * The benchmark runner.
 *
 * Given an artifact, a list of defensive profiles, and one or more analyzers,
 * it runs every (analyzer × profile) combination and returns a dated,
 * reproducible result set. It also normalizes costs to a common currency
 * (operations, tokens, time) so axes can be compared per unit of understanding
 * gained — the exact measurement the study's "blind spot #4" asked for:
 * which axis pays most per unit of understanding denied (defender-side cost is not modeled yet).
 */

import { createBaselineArtifact } from "./profiles.js";

/**
 * Combine a baseline artifact name + a profile into a runnable artifact.
 * @param {import("./types.js").Artifact} base
 * @param {import("./profiles.js").Profile} profile
 */
function applyProfile(base, profile) {
  const art = profile.apply(base);
  return { ...art, name: `${base.name}/${profile.id}` };
}

/**
 * Run the benchmark.
 * @param {object} opts
 * @param {import("./types.js").Artifact} opts.artifact
 * @param {import("./profiles.js").Profile[]} opts.profiles
 * @param {import("./analyzer.js").Analyzer[]} opts.analyzers
 * @param {string} [opts.runId]
 * @returns {object} summary object
 */
export function runBenchmark({ artifact, profiles, analyzers, runId }) {
  const startedAt = new Date().toISOString();
  const rows = [];

  for (const analyzer of analyzers) {
    for (const profile of profiles) {
      const profiledArtifact = applyProfile(artifact, profile);
      const result = analyzer.analyze(profiledArtifact);
      // The analyzer only sees the profiled artifact; the runner tags the row.
      result.profileId = profile.id;
      result.artifactName = artifact.name;
      result.axis = profile.axis;
      rows.push(result);
    }
  }

  return {
    runId: runId ?? `run-${startedAt}`,
    startedAt,
    protocolVersion: "1.1.0",
    harness: "proteus-shield",
    artifact: artifact.name,
    analyzers: analyzers.map((a) => a.id),
    profiles: rows.map((r) => r.profileId),
    rows,
  };
}

/**
 * Normalize cost so axes can be compared: cost per point of understanding.
 * @param {object} summary - output of runBenchmark()
 * @returns {Array} rows augmented with normalized fields
 */
export function normalize(summary) {
  return summary.rows.map((r) => {
    const denom = Math.max(r.understandScore, 1e-6);
    const tokensPerUnderstanding = r.tokens / denom;
    const opsPerUnderstanding = r.operations / denom;
    return {
      ...r,
      tokensPerUnderstanding: Math.round(tokensPerUnderstanding),
      opsPerUnderstanding: Math.round(opsPerUnderstanding * 100) / 100,
    };
  });
}

/**
 * Aggregate several runs (one per seed) into mean / sample standard deviation
 * per profile. This is what tells you how much of a result is seed noise.
 * @param {Array<Array<object>>} runs - each item is normalize(summary) for one seed
 * @returns {Array<object>}
 */
export function aggregate(runs) {
  const byProfile = new Map();
  for (const rows of runs) {
    for (const r of rows) {
      if (!byProfile.has(r.profileId)) byProfile.set(r.profileId, []);
      byProfile.get(r.profileId).push(r);
    }
  }
  const stat = (xs) => {
    const n = xs.length;
    const mean = xs.reduce((a, b) => a + b, 0) / n;
    const variance = n > 1 ? xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
    return { mean, stdev: Math.sqrt(variance) };
  };
  return [...byProfile.entries()].map(([profileId, rs]) => ({
    profileId,
    axis: rs[0].axis,
    runs: rs.length,
    operations: stat(rs.map((r) => r.operations)),
    tokens: stat(rs.map((r) => r.tokens)),
    understandScore: stat(rs.map((r) => r.understandScore)),
    tokensPerUnderstanding: stat(rs.map((r) => r.tokensPerUnderstanding)),
    failedRuns: rs.filter((r) => r.failed).length,
  }));
}

/**
 * Build the standard benchmark scenario (one representative artifact).
 * @param {import("./analyzer.js").Analyzer[]} analyzers
 */
export function standardScenario(analyzers) {
  // A representative shipped artifact: ~250 KiB with a realistic section mix.
  const artifact = createBaselineArtifact("sample-app", 256_000, {
    symbols: 40,
    strings: 60,
    code: 20,
  });
  return { artifact, analyzers };
}