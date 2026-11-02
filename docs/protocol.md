# Protocol — Reproducible Benchmark (v1.1.0)

This document specifies the measurement protocol behind `proteus-shield-action`.
It is the instrumentation counterpart to the framing study's blind spot #4
(see [`etude/gaps.md`](etude/gaps.md)):
*"no one measures end-to-end cost across axes on the same agent and artifact."*

## Purpose and substance line

`proteus-shield-action` is a **meter, not a weapon**. It measures how costly it is
for an *analyzer* to understand an artifact whose observable properties vary
according to a **defensive profile**. It does **not**:

- implement any obfuscation, string encryption, symbol stripping, or polymorphic
  decoder (i.e. it does not *produce* hardened artifacts);
- pack, encrypt, or transform binaries;
- deceive, mislead, or exhaust a real analyzer through planted content;
- ship any evasion-of-analysis capability.

It only *describes* observable properties (size, entropy, readability, nesting,
alias count) and *measures* the cost of an analyzer against them. Producing a
real artifact with those properties is left to the user or to the existing
public tools already catalogued in the framing study.

## The analyzer contract

An **analyzer** is any component that, given an artifact model, reports how fully
it understood it, consuming operations, tokens, and time:

```js
analyze(artifact) -> {
  operations,       // number of "read" operations
  tokens,           // estimated token consumption
  timeMs,           // elapsed / modeled time
  understandScore,  // 0..1
  failed            // did it exhaust its budget?
}
```

This is deliberately minimal so that a real agent (REA, Ghidra-MCP, Cline)
can be wrapped as an adapter later without changing the harness.

## The scripted substitute (v1)

For the first release, the harness ships a **deterministic scripted analyzer**
(`scripted-v1`). It is *not* an LLM and *does not claim* to reproduce any real
agent's token usage. It is an explicit, seeded model whose cost parameters are
documented below, so that any person can reproduce a run bit-for-bit.

Cost model (defaults):

| Parameter | Value | Meaning |
|---|---|---|
| `opsBudget` | 10 000 | max read operations before giving up |
| `tokensPerOpBase` | 120 | tokens per read operation |
| `tokensPerByte` | 0.02 | tokens per byte read |
| `entropyTokenMult` | 3.0 | cost multiplier from non-readable sections |
| `aliasTokenMult` | 1.5 | multiplier per duplicate/decoys reference |
| `nestingTokenMult` | 1.3 | multiplier per nesting depth level |
| `seed` | 0xC0FFEE | PRNG seed (xorshift32) |

These numbers are **placeholders**, chosen to illustrate the protocol, and are
explicitly *not* validated against a real agent. They will be replaced by
calibrated values when a real analyzer is plugged in. This honesty is the whole
point: unlike the self-reported multipliers of the BLA project (see
[`etude/sources.md`](etude/sources.md)), every number here is a declared, reproducible knob.

## Defensive profiles

Three profiles describe how an artifact's *observables* differ from baseline:

| Profile | Axis | What it models (observables only) |
|---|---|---|
| `baseline` | — | artifact as shipped, no protection |
| `fortification` | 5 | non-readable symbols/strings, higher entropy |
| `cost-raising` | 3 | larger size, deeper nesting, more duplicate references |

## Reproducibility

A run is reproducible given: the artifact generator parameters, the profile definitions, the
analyzer's cost-model parameters, and the seed. The cost-model parameters and the seed are written
into every result row under `extra.params`, so a result file is self-describing.

Time is **modeled**, never measured: `timeMs` is a deterministic function of operations and the
seeded PRNG, with no wall-clock component. Re-running with the same seed yields identical
`operations`, `tokens`, `timeMs` and `understandScore`. Only the metadata fields `runId` and
`startedAt` differ between runs. `tests/` enforces this against the committed reference result.

```
node src/cli.js benchmark --seed 12648430 --out benchmarks/results/run.json
node src/cli.js benchmark --runs 30      # mean and sample stdev over seeds 12648430..+29
```

`failed` is true only when the analyzer stops with sections still unread because its operation
budget ran out. Touching the budget exactly at the last section is not a failure.

## How to interpret a result

The scripted analyzer is a function of declared multipliers, so its outputs are consequences of
those assumptions:

- the understanding score of a non-readable section is `1 - 0.7 × entropy` (plus bounded noise),
  so the fortification result is derivable by hand;
- token cost multiplies out from `entropyTokenMult`, `aliasTokenMult`, `nestingTokenMult`;
- the seed influences operation counts and understanding noise, not token totals.

A result is therefore evidence about the **harness and protocol**, not about any real agent.
Quote it as "under the declared cost model", never as a measurement.

## Normalization

To compare axes, cost is normalized by understanding gained:

```
tokensPerUnderstanding = tokens / max(understandScore, 1e-6)
opsPerUnderstanding   = operations / max(understandScore, 1e-6)
```

## What this is NOT (yet)

- It is **not** calibrated against a real REA/GhidraMCP agent (future work).
- It does **not** measure defensive *production* cost (the defender's side of
  axis 7: how much a profile costs the vendor in build/delivery). That is a
  separate, equally important measurement the study lists as open.
- It does **not** yet implement signal-triggered rotation (axis 6/7).

## Future work (designated, defensive only)

1. A real-agent adapter implementing the analyzer contract (REA, Ghidra-MCP).
2. A defender-cost model (build-time, delivery, support) to answer "which axis
   pays most per euro" fully.
3. A signal-trigger metric (burst-read detection) feeding a rotation *policy*
   specification — not a rotation engine.