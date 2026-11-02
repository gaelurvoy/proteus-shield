/**
 * proteus-shield — core types (JSDoc typedefs).
 *
 * This project is a *measurement harness*, not a protection engine. It measures
 * how much an analyzer "costs" (operations / tokens / time) to understand an
 * artifact under a given defensive profile. It does NOT implement any
 * obfuscation, deception, or evasion transform itself; transforms are supplied
 * by the user or referenced to existing public tools (see docs/protocol.md).
 */

/**
 * An "artifact" under analysis: a document model of something an analyzer reads.
 * `sections` represent the observable units of the artifact (e.g. strings,
 * symbols, code regions) that an analyzer must traverse to understand it.
 *
 * @typedef {Object} Artifact
 * @property {string} name
 * @property {number} sizeBytes          // physical size (drives raw-read cost)
 * @property {Array<Section>} sections    // observable units
 */

/**
 * A single observable unit inside an artifact.
 *
 * @typedef {Object} Section
 * @property {string} id
 * @property {string} kind              // e.g. "symbol", "string", "code", "metadata"
 * @property {number} bytes
 * @property {boolean} readable         // whether the unit yields meaning on first read
 * @property {number} [entropy]         // 0..1 — how hard it is to make sense of (fortification)
 * @property {number} [nesting]         // nesting depth (cost-raising)
 * @property {number} [aliases]         // number of duplicate/decoys references (cost-raising)
 */

/**
 * A defensive profile describes the *observable properties* of an artifact, not
 * how it was produced. The harness measures the analyzer's cost against these
 * properties. Profiles map to the study's axes 3 (cost) and 5 (fortification).
 * The concrete `Profile` typedef (with `apply`) lives in profiles.js.
 */

/**
 * The result of one analyzer run against one artifact under one profile.
 *
 * @typedef {Object} RunResult
 * @property {string} analyzerId
 * @property {string} artifactName
 * @property {string} [profileId]      // set by the runner, not by the analyzer
 * @property {string} [axis]           // set by the runner
 * @property {number} operations       // number of "read" operations expended
 * @property {number} tokens          // modeled tokens consumed (see docs/protocol.md)
 * @property {number} timeMs           // wall-clock or simulated time
 * @property {number} understandScore  // 0..1 — how fully the analyzer understood the artifact
 * @property {boolean} failed          // did it give up (budget exceeded)?
 * @property {Object} [extra]
 */

export {};