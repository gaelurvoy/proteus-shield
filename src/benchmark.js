/**
 * The benchmark runner.
 *
 * Given an artifact, a list of defensive profiles, and one or more analyzers,
 * it runs every (analyzer × profile) combination and returns a dated,
 * reproducible result set. It also normalizes costs to a common currency
 * (operations, tokens, time) so axes can be compared per unit of understanding
 * gained — the exact measurement the study's "blind spot #4" asked for:
 * which axis pays most per euro of effort.
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
      // Reattach profile id correctly (the analyzer set name to base/profile.id).
      result.profileId = profile.id;
      result.artifactName = artifact.name;
      result.axis = profile.axis;
      rows.push(result);
    }
  }

  return {
    runId: runId ?? `run-${startedAt}`,
    startedAt,
    protocolVersion: "1.0.0",
    harness: "proteus-shield-action",
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