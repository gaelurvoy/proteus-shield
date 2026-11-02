# Proteus Shield — Étude

**Defending Against AI Reverse-Engineering Agents: A Seven-Axis Landscape Study and State of the Art**

![Status: research](https://img.shields.io/badge/status-research-red)
![Type: survey](https://img.shields.io/badge/type-survey%20%2F%20state--of--the--art-blue)

> **Proteus** (identifiant technique d'origine : `proteus-shield-etude`, dépôt désormais intégré ici) — une étude de cadrage qui applique
> la stratégie militaire classique, avec *L'Art de la guerre* de Sun Tzu comme référence, à la
> défense des logiciels livrés contre les agents IA qui automatisent la rétro-ingénierie
> (REA, Ghidra-MCP, Cline, et similaires). Du nom de Protée, la divinité marine capable de changer
> de forme : l'axe 7 « vitesse et adaptabilité » — renouveler la protection plus vite que
> l'attaquant ne l'apprend — est précisément le vide que cette étude défriche.

> A framing study mapping classical military strategy — with Sun Tzu's *The Art of War*
> as the reference — onto the defense of shipped software against AI agents that automate
> reverse engineering (REA, Ghidra-MCP, Cline, and similar).

---

## What this is

Since 2026, AI agents have begun automating the reverse engineering of software delivered
to customers. A first defensive response already exists ([BLA](https://github.com/qybaihe/bla)),
and a counter-response to it already exists (Anti-BLA). This study starts from one intuition:
**classical military strategy offers a wider grid than obfuscation alone** for thinking about
this defense.

The Sun Tzu → cybersecurity mapping is a field that already exists
(*The Art of War for Computer Security*, Tom Madsen, Springer 2019; *Sun Tzu and Cyber War*,
NATO Cooperative Cyber Defence Centre of Excellence). To the author's knowledge, it has **not**
been applied specifically to AI reverse-engineering agents. That is the angle of this study.

## What this study covers and does not cover

**Covered**: a grid of **seven strategic axes**, and for each one, the GitHub projects or
research papers already published that apply it (or fail to apply it) to defense against AI
reverse-engineering agents.

**Not covered**: the construction of a protection tool. This is *framing* work. The only
instrument derived from it is the companion measurement harness at the root of this repository
([`../../README.md`](../../README.md)), which measures an analyzer's cost and implements no
evasion, deception or counter-attack.

> ⚠️ This is an honest **state of the art / framing study only**. It describes and catalogs
> techniques. It does **not** ship, implement, or reproduce any evasion-of-analysis,
> aggressive-deception, or counter-attack capability.

## The seven axes

| # | Axis | Principle | Representative work | Specific to AI agents? |
|---|---|---|---|---|
| 1 | Know yourself and the enemy | Understand how the attacking agent reasons and fails before countering it | Academic surveys, Ricerca Security (NDSS BAR 2026), Reveree | Yes |
| 2 | Avoidance | Do not expose what matters: keep critical logic out of the client's reach | Thin-client / server-side architecture (Jscrambler, PapelShip) | Partially |
| 3 | Raising the cost | Do not block the attack, make it unprofitable | BLA (Exhaust), Elastic Security Labs | Yes |
| 4 | Deception | Lay false trails to mislead the analysis | BLA (Poison, Hallucinate), Mantis, Cloak/Honey/Trap | Yes |
| 5 | Fortification | Make the code structure itself unreadable | Acoda, CoTDeceptor, NeuroShield (CCS 2025) | Yes |
| 6 | Counter-attack | Turn the attack back against the attacking agent | Mantis, Anti-BLA, AgentSnare, prompt injection vs. Cline + GhidraMCP | Yes |
| 7 | Speed and adaptability | Renew the protections faster than the attacker learns them | Code Renewability (Abrath et al. 2020); scattered building blocks, none measured against an agent | **Not measured — the gap** |

The detail of each axis follows in [methodology.md](methodology.md).

## The key finding

**Axis 7 — speed and adaptability — is the least covered, and it is where this study finds its
genuine contribution.** The building blocks exist (attack profitability, moving target defense,
invalidation of acquired knowledge), but **no published study measures a renewal cadence against
an agent that re-analyzes a protection in minutes instead of human-days**. A static protection
is eventually learned and bypassed; renewing it faster than the attacker can capitalize is
potentially the weak point of the entire grid — and it is unmeasured.

Two other notable findings:

- **Mantis** is an open-source project that goes as far as turning a prompt-injection back
  against the attacking agent to take control of its machine.
- **Axis 2 (avoidance)** still lacks AI-specific treatment: the sources found are general
  application architecture, not studies for the specific case of an AI agent browsing a thick
  client in minutes.

## Where this fits

This folder is the **source study** of the repository. The harness at the root picks up the
open ground this study identifies (blind spot #4, then axis 7) without crossing its substance line.

```
docs/etude/
├── README.md        # this file: principle, honest status and scope
├── methodology.md   # the seven-axis grid, what exists, what is missing
├── gaps.md          # the blind spots (angles morts) and open questions
└── sources.md       # full bibliography by axis
```

## Status

**Research / framing only.** No detection thresholds, no rotation granularity, no measurements
have been validated against a real agent. This is not, and does not claim to be, a production
tool at this commit.

## Verification status

- [x] Independent verification of cited multipliers and arXiv identifiers (November 2026 spot-check: BLA, Mantis, Cloak/Honey/Trap, and 11 arXiv IDs confirmed against primary sources — see docs/sources.md)
- [x] Study content transcribed faithfully from the source working document
- [x] Honest scope framing (no executable evasion capability)

## Author's note on scope

The line this repository draws is a substance line, not a wording line. Cataloguing these
techniques in a literature review is this study's purpose and is done without reservation.
Shipping a tool that *executes* active deception or evasion against an automated analyzer is
deliberately out of scope here, because a reusable "defeat code analysis" framework is the same
shape of anti-analysis capability that evasive malware uses against AI-based security scanners —
regardless of the intent of the person publishing it.

## License

MIT. See [LICENSE](../../LICENSE). Defensive use only; see [DISCLAIMER.md](../../DISCLAIMER.md).