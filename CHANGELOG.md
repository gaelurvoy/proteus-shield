# Changelog

## 0.2.1 — 2026-11-02

- Project and repository renamed `proteus-shield` (it now holds both the study and the harness). The `harness` field of result files and the package name follow. Old `proteus-shield-action` URLs redirect.

## 0.2.0 — 2026-11-02

Publication-readiness pass following an audit of v0.1.0.

### Repository
- The framing study (formerly `proteus-shield-etude`) now lives in `docs/etude/`. One repository,
  one disclaimer, one license. The old study repository can be archived.
- `docs/methodology.md` renamed `docs/protocol.md` (it describes the harness protocol; the study's
  own methodology is `docs/etude/methodology.md`).

### Harness
- Result rows embed the full cost model under `extra.params` (previously only the seed), as the
  protocol document already claimed.
- `timeMs` is fully modeled, with no wall-clock component, so a run is deterministic apart from
  `runId` and `startedAt`.
- `failed` is true only when the analyzer stops with sections unread (previously also true when
  the budget was reached exactly as the last section completed).
- The PRNG can no longer get stuck on a zero state.
- The analyzer no longer sets a placeholder `profileId`; the runner tags rows.
- New `--runs N` option: mean and sample standard deviation across consecutive seeds.

### CLI
- Strict argument parsing: invalid `--seed`, unknown options and missing values exit with code 2
  (previously `--seed abc` was silently accepted and serialized as `null`).
- `--out` is resolved from the current directory (previously from the repository root).
- Default output is a readable table; `--json` prints the full JSON. `--out` no longer changes
  what is printed on stdout.

### Docs, tests, CI
- README rewritten: results are presented as outputs of declared assumptions, with limits stated.
- `node:test` suite (`npm test`) including a regression test against the committed reference
  result and a guard that library code has no filesystem, process or network access.
- GitHub Actions workflow on Node 20 and 22.
- License holder name added; `package.json` metadata completed.

## 0.1.0 — 2026-11-01

First reference run: scripted analyzer, three profiles, reproducible JSON result.
