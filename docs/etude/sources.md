# Sources

Full bibliography by axis. arXiv identifiers and URLs are transcribed as found in the working
study; independent verification is flagged where not yet confirmed (see note at the end).

## Sun Tzu / cybersecurity grid

- *The Art of War for Computer Security*, Tom Madsen, Springer, 2019.
- *Sun Tzu and Cyber War*, NATO Cooperative Cyber Defence Centre of Excellence.

## Axis 1 — Know yourself and the enemy

- *The Attack and Defense Landscape of Agentic AI: A Comprehensive Survey* — arXiv 2603.11088 (accepted to USENIX Security 2026).
- *A Survey on Agentic Security: Applications, Threats and Defenses* — arXiv 2510.06445.
- *Challenges and Future Directions in Agentic Reverse Engineering Systems* — arXiv 2604.14317 (Radey, West, Fawaz; SAGAI 2026).
- *Humans vs. Machines* (October 2026).
- Ricerca Security, *Towards LLM-Resistant Software Protection* (NDSS BAR 2026) — https://www.ndss-symposium.org/wp-content/uploads/bar2026-58.pdf.
- *Reveree: Diagnosing LLM Reverse-Engineering Agents* — arXiv 2609.01185.

## Axis 2 — Avoidance

- Jscrambler, *LLM-Resilient Code Protection*.
- PapelShip, server-side protection.
- Quarkslab, *Defeating AI-assisted reverse engineering (or at least trying to)* — https://blog.quarkslab.com/defeating-ai-assisted-reverse-engineering-or-at-least-trying-to.html.

## Axis 3 — Raising the cost

- BLA, GitHub repository (qybaihe/bla) — https://github.com/qybaihe/bla (npm: `bla-agents`).
- Elastic Security Labs, *The Cost of Understanding* — https://www.elastic.co/security-labs/llm-reversing-vs-llm-obfuscation.
- *Code Renewability for Native Software Protection* (Abrath et al.) — https://arxiv.org/pdf/2003.00916.

## Axis 4 — Deception

- BLA — https://github.com/qybaihe/bla.
- Mantis (Pasquini, Kornaropoulos, Ateniese) — paper arXiv 2410.20911, code https://github.com/pasquini-dario/project_mantis.
- *Cloak, Honey, Trap: Proactive Defenses Against LLM Agents* (USENIX Security 2025) — https://www.usenix.org/conference/usenixsecurity25/presentation/ayzenshteyn.

## Axis 5 — Fortification

- *Acoda: Adversarial Code Obfuscation for Defending against LLM-based Analysis* — arXiv 2606.11755.
- *CoTDeceptor: Adversarial Code Obfuscation Against CoT-Enhanced LLM Code Agents* — arXiv 2512.21250.
- NeuroShield, ACM CCS 2025.
- Quarkslab — https://blog.quarkslab.com/defeating-ai-assisted-reverse-engineering-or-at-least-trying-to.html.
- Elastic Security Labs — https://www.elastic.co/security-labs/llm-reversing-vs-llm-obfuscation.

## Axis 6 — Counter-attack

- Mantis (paper and code) — arXiv 2410.20911, https://github.com/pasquini-dario/project_mantis.
- Anti-BLA.
- AgentSnare.
- Naval Postgraduate School, prompt injection against reverse-engineering agents.
- Crawford and McClure, *Investigating Detection and Obfuscation of Prompt Injection Attacks Against Software Reverse Engineering AI Agents* — https://arxiv.org/abs/2605.30677.
- *When Binaries Talk Back: Representation-Confusion Attacks on LLM-Assisted Reverse Engineering* — https://arxiv.org/pdf/2607.12507.

## Axis 7 — Speed and adaptability

- *Code Renewability for Native Software Protection* — https://arxiv.org/pdf/2003.00916.
- *N-version Obfuscation* (Xu, Zhou, Lyu, 2016) — https://archive.cps-vo.org/node/40304.
- US patent 8,990,785, build-time diversity — https://patents.google.com/patent/US8990785.
- Recon 2026, *Deobfuscation in the Age of Agentic Reverse Engineering* — https://cfp.recon.cx/recon-2026/talk/A99GW9/.
- TrustedSec, *The Defensive Stack is Exposed* — https://trustedsec.com/blog/the-defensive-stack-is-exposed.
- *Denying the World Model: Automated Moving Target Defense* (Zenodo) — https://zenodo.org/records/21396968.
- *MTDSense: AI-Based Fingerprinting of Moving Target Defense Techniques* — https://arxiv.org/pdf/2408.03758.
- javascriptobfuscator.com, *Anti-LLM Research* — https://javascriptobfuscator.com/blog/can-ai-reverse-engineer-obfuscated-javascript.aspx.
- *Reveree* — https://arxiv.org/pdf/2609.01185.

---

## Verification note

An independent spot-check (November 2026) confirmed the following against primary sources:

- **BLA** (github.com/qybaihe/bla, npm `bla-agents`): three layers **Poison → Exhaust →
  Hallucinate**; per-target multipliers ~105×–2,823×, aggregate ~612× tokens / ~292× cost
  (v1.4.0), labeled "internal estimates"; separate empirical `redteam:rea` section (real REA
  budget/capacity errors). **Correction to the earlier working note:** the 612×/292× figures are
  still present (as aggregates), not removed.
- **Mantis**: paper *Hacking Back the AI-Hacker* (arXiv 2410.20911, Pasquini/Kornaropoulos/
  Ateniese), code github.com/pasquini-dario/project_mantis, "over 95%" effectiveness, reverse-shell
  "hack back". Confirmed.
- **Cloak, Honey, Trap** (Ayzenshteyn, Weiss, Mirsky, USENIX Security 2025). Confirmed.
- **arXiv identifiers** confirmed real: 2603.11088, 2510.06445, 2604.14317, 2609.01185,
  2605.30677, 2607.12507, 2606.11755, 2512.21250, 2003.00916, 2408.03758, 2410.20911.

Still subject to the standing caveats below.

- **Absence of a finding is not proof of absence.** Searches were done via web engine (standard
  and extended modes). Recent or low-indexed work, in particular on Axis 7, may have been missed.
- **Sources read only in part.** Several papers (Cloak/Honey/Trap; Crawford & McClure; Reveree;
  Ricerca) were read through abstracts and excerpts, not in full. Any figure must be checked
  against the original text before formal publication.
- **CTF results.** Ricerca and Reveree resolution times and success rates are on CTF challenges,
  not protected commercial software in real conditions.
- **Commercial sources.** Jscrambler, PapelShip, PreEmptive, and javascriptobfuscator.com are
  vendors; their effectiveness claims carry no independent-measurement weight.