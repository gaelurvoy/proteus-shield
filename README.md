# Proteus Shield

**A seven-axis study of defending shipped software against AI reverse-engineering agents, and a
small reproducible harness to start measuring it.**

![Status: experimental](https://img.shields.io/badge/status-experimental-red)
![Node >= 20](https://img.shields.io/badge/node-%3E%3D20-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

Two parts, one repository:

| Part | Where | What it is |
|---|---|---|
| **Study** | [`docs/etude/`](docs/etude/README.md) | A literature survey: seven strategic axes (from Sun Tzu), what exists on each, and the blind spots. No code. |
| **Harness** | [`src/`](src/) + [`docs/protocol.md`](docs/protocol.md) | A meter that models how costly it is for an analyzer to understand an artifact whose observable properties vary by defensive profile. |

The study found that nobody measures end-to-end cost across axes on the same artifact and
analyzer (its blind spot #4). The harness is the first instrumental step on that ground.

---

## Substance line — read first

This project is a **meter, not a weapon**. It measures, it does not protect. It does **not**:

- implement obfuscation, packing, string encryption, symbol stripping, or polymorphic decoders;
- transform, pack, or encrypt any binary;
- deceive, mislead, or actively exhaust a real analyzer;
- ship any evasion-of-analysis or counter-attack capability.

It only *describes* observable properties (size, entropy, readability, nesting, aliases) and
*computes* a modeled analyzer cost against them. See [DISCLAIMER.md](DISCLAIMER.md).

## Run it

No dependencies, Node 20 or later.

```bash
node src/cli.js benchmark                          # summary table, default seed
node src/cli.js benchmark --seed 12648430 --out run.json   # also write the full JSON
node src/cli.js benchmark --runs 30                # mean and stdev over 30 consecutive seeds
node src/cli.js benchmark --json                   # full JSON on stdout
npm test                                           # node:test suite, no install needed
```

Reference run (seed 12648430, scripted substitute):

| Profile | Axis | Operations | Tokens | Understood | Tokens per understanding |
|---|---|---:|---:|---:|---:|
| baseline | — | 121 | 19,613 | 100% | 19,613 |
| fortification | 5 | 311 | 42,060 | 63.9% | 65,791 |
| cost-raising | 3 | 121 | 202,879 | 100% | 202,879 |

## How to read these numbers

**These are outputs of declared assumptions, not findings about real agents.** The analyzer is a
deterministic cost model whose multipliers are placeholders (see
[`docs/protocol.md`](docs/protocol.md)). Two consequences you should keep in mind:

- The "understood" figure for fortification is closed-form: it follows directly from the entropy
  values assigned to the profile: (40×0.58 + 60×0.65 + 20×0.72) / 120 = 0.638, which a hand
  calculation gives without running anything.
- Across 30 seeds, understanding varies by about 0.3 points (standard deviation) and tokens do
  not vary at all. Seed noise is negligible here; the model assumptions are what drive the result.

The value of the harness today is the **protocol and the contract** (artifact model, profiles,
analyzer interface, normalization, self-describing result files). The numbers become meaningful
only once a real analyzer is plugged in behind the same contract.

## Status and limits

- Analyzer: scripted substitute, not a real REA / Ghidra-MCP agent. Not calibrated.
- Profiles describe observable properties; they are not real transforms.
- One synthetic artifact, no defender-side cost model yet (so "which axis pays most per euro" is not yet answered).
- No signal-triggered rotation (axes 6 and 7) yet.

## Layout

```
proteus-shield/
├── README.md
├── DISCLAIMER.md
├── LICENSE
├── CHANGELOG.md
├── package.json
├── src/
│   ├── cli.js          # CLI entry
│   ├── types.js        # shared typedefs (JSDoc)
│   ├── analyzer.js     # analyzer contract + scripted substitute
│   ├── profiles.js     # defensive profiles (observables only)
│   └── benchmark.js    # runner, normalization, multi-seed aggregate
├── tests/              # node:test suite
├── docs/
│   ├── protocol.md     # the reproducible measurement protocol
│   └── etude/          # the seven-axis study (README, methodology, gaps, sources)
└── benchmarks/
    └── results/        # dated, reproducible JSON results
```

## Roadmap (defensive only)

1. A real-agent adapter implementing the analyzer contract.
2. A defender-cost model (build, delivery, support).
3. A specification of signal-triggered rotation as a policy, not as an engine.

## License

MIT. Defensive study only; see [DISCLAIMER.md](DISCLAIMER.md).
