/**
 * Artifact generation + defensive profiles.
 *
 * The harness generates a *canonical* artifact model and then applies a
 * "profile" that describes how the artifact's observable properties differ from
 * the baseline. Profiles correspond to the study's axes:
 *
 *   - baseline      : the artifact as shipped, no protection.
 *   - fortification : symbols/strings unreadable, higher entropy (axis 5).
 *   - cost-raising  : larger physical size, deeper nesting, more duplicate
 *                     references (axis 3, "Exhaust"-like properties).
 *
 * IMPORTANT — substance line. These profiles only *describe observable
 * properties* (size, entropy, nesting, aliases). The harness does not implement
 * any obfuscation/deception transform; it measures how a documented set of
 * properties changes an analyzer's cost. Producing a real artifact with these
 * properties is left to the user / existing public tools, which the study
 * already catalogs. This is a meter, not a weapon.
 */

/**
 * Build a canonical baseline artifact.
 * @param {string} name
 * @param {number} sizeBytes
 * @param {object} [props]
 * @returns {import("./types.js").Artifact}
 */
export function createBaselineArtifact(name, sizeBytes, props = {}) {
  const nSymbols = props.symbols ?? 40;
  const nStrings = props.strings ?? 60;
  const nCode = props.code ?? 20;
  const sections = [];

  for (let i = 0; i < nSymbols; i++) {
    sections.push({ id: `sym_${i}`, kind: "symbol", bytes: 16, readable: true });
  }
  for (let i = 0; i < nStrings; i++) {
    sections.push({ id: `str_${i}`, kind: "string", bytes: 24, readable: true });
  }
  for (let i = 0; i < nCode; i++) {
    sections.push({ id: `code_${i}`, kind: "code", bytes: 128, readable: true });
  }

  return { name, sizeBytes, sections };
}

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} axis
 * @property {string} description
 * @property {(artifact: import("./types.js").Artifact) => import("./types.js").Artifact} apply
 */

/**
 * Fortification profile: symbols/strings become non-readable with higher
 * entropy. This models e.g. symbol stripping + string obfuscation at the
 * *observable* level, WITHOUT implementing them.
 */
export const FORTIFICATION_PROFILE = {
  id: "fortification",
  axis: "5",
  description: "Non-readable symbols/strings with raised entropy (models symbol stripping + string obfuscation observables).",
  apply(artifact) {
    const sections = artifact.sections.map((s) => {
      if (s.kind === "symbol") return { ...s, readable: false, entropy: 0.6 };
      if (s.kind === "string") return { ...s, readable: false, entropy: 0.5 };
      if (s.kind === "code") return { ...s, readable: false, entropy: 0.4 };
      return s;
    });
    return { ...artifact, sections };
  },
};

/**
 * Cost-raising profile: larger size, deeper nesting, more duplicate references.
 * Models "Exhaust"-like observable properties (size bloat, nesting, aliasing)
 * WITHOUT implementing them.
 */
export const COST_RAISING_PROFILE = {
  id: "cost-raising",
  axis: "3",
  description: "Larger size + deeper nesting + duplicate references (models Exhaust-like observables).",
  apply(artifact) {
    const sections = artifact.sections.map((s) => {
      if (s.kind === "symbol") return { ...s, aliases: 8, nesting: 3 };
      if (s.kind === "string") return { ...s, nesting: 2 };
      if (s.kind === "code") return { ...s, nesting: 5, aliases: 4 };
      return s;
    });
    return { ...artifact, sizeBytes: artifact.sizeBytes * 12, sections };
  },
};

/**
 * The baseline profile (identity).
 */
export const BASELINE_PROFILE = {
  id: "baseline",
  axis: "baseline",
  description: "Artifact as shipped, no protection.",
  apply(artifact) {
    return artifact;
  },
};

/** @type {Profile[]} */
export const PROFILES = [BASELINE_PROFILE, FORTIFICATION_PROFILE, COST_RAISING_PROFILE];