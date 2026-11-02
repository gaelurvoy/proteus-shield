/**
 * Analyzer interface + the deterministic scripted substitute.
 *
 * An "analyzer" is anything that reads an artifact and reports how fully it
 * understood it, consuming operations, tokens, and time along the way. The
 * interface is deliberately minimal so a real agent (REA, Ghidra-MCP, Cline)
 * can be plugged in later as an adapter sharing the same contract.
 *
 * The scripted substitute (`createScriptedAnalyzer`) is a deterministic model
 * of a reverse-engineering agent's *reading behavior*. It is NOT an LLM and does
 * NOT claim to reproduce any particular agent's real token usage — it is an
 * explicit, seeded model whose parameters are documented, so a benchmark run is
 * reproducible by anyone.
 */

import { createHash } from "node:crypto";

/**
 * A deterministic PRNG so a run is reproducible across machines.
 * @param {number} seed
 */
function makeRng(seed) {
  let s = seed >>> 0;
  // xorshift32 is stuck forever on 0; any non-zero constant avoids that.
  if (s === 0) s = 0x9e3779b9;
  // Returns a value in [0, 1] (both ends reachable).
  return function rng() {
    // xorshift32
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17; s >>>= 0;
    s ^= s << 5; s >>>= 0;
    return s / 0xffffffff;
  };
}

/**
 * The analyzer contract. A conforming analyzer exposes `analyze()`.
 * @typedef {Object} Analyzer
 * @property {string} id
 * @property {(artifact: import("./types.js").Artifact, opts: object) => import("./types.js").RunResult} analyze
 */

/**
 * Cost model parameters for the scripted substitute. Every number is
 * documented and part of the reproducible protocol (see docs/protocol.md).
 *
 * @typedef {Object} ScriptedOpts
 * @property {number} opsBudget        // max read operations before giving up
 * @property {number} tokensPerOpBase  // tokens consumed per read operation
 * @property {number} tokensPerByte    // extra tokens per byte read
 * @property {number} entropyTokenMult // multiplier on hard-to-read (entropy) sections
 * @property {number} aliasTokenMult   // multiplier from duplicate/decoys references
 * @property {number} nestingTokenMult // multiplier from nesting depth
 * @property {number} seed
 */

/** @type {ScriptedOpts} */
const DEFAULTS = {
  opsBudget: 10_000,
  tokensPerOpBase: 120,
  tokensPerByte: 0.02,
  entropyTokenMult: 3.0,
  aliasTokenMult: 1.5,
  nestingTokenMult: 1.3,
  seed: 0xC0FFEE,
};

/**
 * Build a deterministic scripted analyzer.
 * @param {string} id
 * @param {Partial<ScriptedOpts>} [overrides]
 * @returns {Analyzer}
 */
export function createScriptedAnalyzer(id = "scripted-v1", overrides = {}) {
  const opts = { ...DEFAULTS, ...overrides };

  return {
    id,
    /**
     * @param {import("./types.js").Artifact} artifact
     */
    analyze(artifact) {
      const rng = makeRng(opts.seed ^ hashArtifact(artifact));

      let operations = 0;
      let tokens = 0;
      let understood = 0;
      let budgetExhausted = false;
      const totalSections = artifact.sections.length;

      // Raw size read cost (a fixed overhead proportional to size).
      tokens += artifact.sizeBytes * opts.tokensPerByte;
      operations += 1;

      for (const sec of artifact.sections) {
        if (operations >= opts.opsBudget) {
          // The analyzer gives up with sections still unread.
          budgetExhausted = true;
          break;
        }

        // Reading a section always costs at least one operation + base tokens.
        operations += 1;
        let secTokens = opts.tokensPerOpBase + sec.bytes * opts.tokensPerByte;

        const entropy = sec.entropy ?? 0;
        const aliases = sec.aliases ?? 1;
        const nesting = sec.nesting ?? 1;

        if (!sec.readable) {
          // A non-readable section requires repeated passes before it is understood.
          const passes = 1 + Math.floor(entropy * 4 * rng());
          operations += passes;
          secTokens *= 1 + entropy * opts.entropyTokenMult;
        }
        // Decoys / duplicate references multiply the work needed to disambiguate.
        secTokens *= 1 + (aliases - 1) * opts.aliasTokenMult;
        // Nesting depth compounds traversal cost.
        secTokens *= Math.pow(opts.nestingTokenMult, Math.max(0, nesting - 1));

        tokens += secTokens;
        understood += estimateUnderstanding(sec, rng);
      }

      // `failed` means "gave up with work left", not merely "touched the budget".
      const failed = budgetExhausted;
      const understandScore = totalSections === 0 ? 0 : understood / totalSections;
      // Time is purely modeled (no wall clock) so a run is deterministic.
      const timeMs = simulateThinkMs(operations, rng);

      return {
        analyzerId: id,
        artifactName: artifact.name,
        operations,
        tokens: Math.round(tokens),
        timeMs,
        understandScore,
        failed,
        // The full cost model travels with the result, so it is self-describing.
        extra: { model: "scripted-v1", params: { ...opts } },
      };
    },
  };
}

/**
 * How fully a single section was understood, given its observables.
 * Deterministic given the section and the seeded rng.
 * @param {import("./types.js").Section} sec
 * @param {() => number} rng
 * @returns {number} 0..1
 */
function estimateUnderstanding(sec, rng) {
  if (sec.readable) return 1;
  const entropy = sec.entropy ?? 0;
  // Higher entropy / deeper nesting → lower single-pass understanding.
  const raw = 1 - entropy * 0.7;
  const noise = (rng() - 0.5) * 0.1;
  return Math.min(1, Math.max(0, raw + noise));
}

/**
 * Deterministic "think time" that scales with operations, so time is not just
 * wall-clock (which would be ~0 for a scripted model and defeat the point).
 * @param {number} operations
 * @param {() => number} rng
 */
function simulateThinkMs(operations, rng) {
  let sum = 0;
  const n = Math.min(operations, 200);
  for (let i = 0; i < n; i++) sum += rng();
  return Math.round((operations * 0.4) + sum * 0.6);
}

/**
 * A stable fingerprint of the artifact used to perturb the seeded RNG so that
 * different artifacts don't share identical noise sequences.
 * @param {import("./types.js").Artifact} artifact
 * @returns {number}
 */
function hashArtifact(artifact) {
  const h = createHash("sha256")
    .update(artifact.name)
    .update(String(artifact.sizeBytes))
    .update(JSON.stringify(artifact.sections.map((s) => [s.id, s.bytes])))
    .digest("hex");
  return parseInt(h.slice(0, 8), 16);
}
