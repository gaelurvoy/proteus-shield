# Proteus Shield — Action (experimental measurement harness)

**The defensive instrumentation counterpart to the Proteus Shield study.**

[![Status: experimental](https://img.shields.io/badge/status-experimental-red)]()
[![Type: benchmark](https://img.shields.io/badge/type-benchmark%20harness-blue)]()

> `proteus-shield-action` measures how costly it is for an analyzer to understand
> an artifact whose observable properties vary by defensive profile. It is the
> instrument that fills the framing study's **blind spot #4**: nobody measures
> end-to-end cost across axes on the same artifact and analyzer.

---

## ⚠️ Substance line — read first

This project is a **meter, not a weapon**. It measures, it does not protect. It
does **not**:

- implement obfuscation, packing, string encryption, symbol stripping, or
  polymorphic decoders;
- transform, pack, or encrypt any binary;
- deceive, mislead, or actively exhaust a real analyzer;
- ship any evasion-of-analysis or counter-attack capability.

It only *describes* observable properties (size, entropy, readability, nesting,
aliases) and *measures* an analyzer's cost against them. See
[docs/methodology.md](docs/methodology.md) for the exact protocol and the
declared, reproducible cost model.

## What it produces

A dated, reproducible JSON result set comparing defensive axes on a common
currency (operations, tokens, time, cost-per-understanding):

```
node src/cli.js benchmark --seed 12648430 --out benchmarks/results/run.json
```

Example (scripted substitute, v0.1 reference run):

| Profile | Axis | Operations | Tokens | Understood | Cost/understanding |
|---|---|---|---:|---:|---:|
| baseline | — | 121 | ~19.6k | 100% | ~19.6k |
| fortification | 5 | 311 | ~42k | 64% | ~65.8k |
| cost-raising | 3 | 121 | ~203k | 100% | ~202.9k |

The story this first run tells: *fortification* shrinks understanding (the
analyzer fails to fully grasp the artifact), while *cost-raising* explodes token
cost without extra understanding. Both are measurable, comparable, and —
crucially — **honest about being a scripted model, not a real agent.**

## Honest status

- The analyzer is a **documented, seeded substitute**, not a real REA/GhidraMCP.
  Its token numbers are **declared placeholders**, not calibrated measurements
  against a real agent. This is deliberate and is the opposite of shipping
  unverified multipliers.
- The profiles describe **observable properties**, not real transforms.
- No defender-side cost model yet (the other half of "cost per euro").

## Repository layout

```
proteus-shield-action/
├── README.md
├── DISCLAIMER.md
├── LICENSE
├── package.json
├── src/
│   ├── cli.js           # CLI entry (node src/cli.js benchmark)
│   ├── types.js         # shared typedefs (JSDoc)
│   ├── analyzer.js      # analyzer contract + scripted substitute
│   ├── profiles.js      # defensive profiles (observables)
│   └── benchmark.js     # runner + normalization
├── docs/
│   └── methodology.md   # the reproducible protocol
└── benchmarks/
    └── results/         # dated, reproducible JSON results
```

## Run it

No dependencies, plain Node ≥ 20:

```bash
node src/cli.js benchmark --seed 12648430 --out benchmarks/results/run.json
node src/cli.js benchmark --json   # print to stdout
```

## Relationship to proteus-shield-etude

The framing study (`proteus-shield-etude`) established the seven axes and
identified axis 7 (speed/adaptability) and the missing cross-axis measurement as
the open ground. This harness is the first *instrumental* step on that ground —
and it stays strictly on the blue-team side.

## License

MIT. Defensive study only — see [DISCLAIMER.md](DISCLAIMER.md).