# Methodology — The Seven-Axis Grid

This document develops the seven strategic axes introduced in the [README](README.md). For
each axis: the Sun Tzu principle behind it, what already exists, what is missing, and its
specificity to AI reverse-engineering agents.

The grid is a *framing* tool: it classifies existing work and locates the empty space. It is not
a claim that any single technique is measured or effective.

---

## The reference mapping

The "Sun Tzu → cybersecurity" mapping is established:

- *The Art of War for Computer Security*, Tom Madsen, Springer, 2019.
- *Sun Tzu and Cyber War*, NATO Cooperative Cyber Defence Centre of Excellence.

This study applies that mapping specifically — and, to the author's knowledge, for the first time —
to **AI agents that automate the reverse engineering of shipped software**.

---

## Axis 1 — Know yourself and the enemy

> *"Know your enemy and know yourself."*

The most-cited Sun Tzu principle in cybersecurity. Before choosing a defense, one must know
precisely how the attacking agent observes, reasons, and fails. This is the axis best covered by
research.

- **The Attack and Defense Landscape of Agentic AI: A Comprehensive Survey** (arXiv
  2603.11088, March 2026; accepted to USENIX Security 2026): first systematic framework
  classifying AI-agent defenses along seven design dimensions.
- **A Survey on Agentic Security: Applications, Threats and Defenses** (arXiv 2510.06445):
  taxonomy of 260+ papers (v3) on threats and countermeasures for agentic systems.
- **Challenges and Future Directions in Agentic Reverse Engineering Systems** (April 2026):
  specific to reverse engineering. Models static, dynamic, and hybrid agents, and their
  characteristic failure modes (context window, least-cost-path bias).
- **Humans vs. Machines** (October 2026): direct comparison of AI agents and human analysts on
  real reverse-engineering challenges, with their respective strengths and limits.
- **Ricerca Security** (NDSS BAR 2026): models the agent's analysis loop (Observe, Understand,
  Plan) against three families of protections (Conceal, Complicate, Mislead) over 24 CTF
  challenges. Four agent weaknesses emerge: training bias, over-trusting observations, context
  limits, persistence in an erroneous plan. At least one of the three tested agents solved 88%
  of the challenges, and agents often analyze assembly well without a decompiler.
- **Reveree** (arXiv, September 2026): a diagnosis of reverse-engineering agents. On CTF
  challenges, the median resolution time of the best configurations is under one minute. Agents
  also tend to restart full analysis from scratch rather than reuse a prior result (up to 3.2
  passes per run in base configuration, about 1 with ReAct or Reflexion). These results are on
  CTF challenges, not on protected commercial software.

---

## Axis 2 — Avoidance

The best defense against reverse engineering is to never expose what matters. This is not a
technique for protecting shipped code: it is an architectural decision made upstream.

- The **thin-client / thick-client** distinction is old in application security, but it takes on
  new weight against AI agents: the more business logic runs client-side, the more directly an
  agent with access can read it.
- **Jscrambler** (commercial code-protection vendor) states the limit of this axis plainly:
  obfuscation protects client-side logic, but is not the primary protection for a model that
  lives entirely behind a server-side API. For server-hosted models or logic, the main risk
  shifts to access control, not reverse engineering.
- **PapelShip** commercializes the approach directly: run critical decisions server-side rather
  than protecting them client-side.
- **Quarkslab** (August 2026) illustrates a bypass effect: in their experience, an agent read the
  configuration from the host's Docker container rather than continuing to analyze the native
  code. The execution environment is itself a surface not to expose.

This axis converges with the conclusion drawn from the BLA post: sort what must be shipped from
what must stay hidden, rather than protecting everything equally.

---

## Axis 3 — Raising the cost

Do not prevent the attack; make it unprofitable. This is the most-developed axis to date,
incarnated by the project that launched this reflection.

- **BLA (Exhaust component)**: pushes shipped artifacts beyond the technical limits of the
  analyzers (file size, nesting depth, number of candidates or aliases), forcing the agent to
  fail or spend far more tokens. BLA publishes two kinds of numbers, which must not be conflated:
  (a) an **empirical** red-team section (`npm run redteam:rea`) that records real REA budget /
  capacity / redaction *errors* (byte-level analyzer failures with real error strings) on
  commodity hardware — but only for the formats whose native tooling was actually run, explicitly
  *not* a claim about Ghidra/Frida/LLDB/Rizin/JADX paths that were not executed there; and (b) a
  **14-target benchmark of token/cost multipliers that BLA itself labels "internal estimates"**
  derived from its catalog of REA limits, "not the same as the empirical REA process measurements
  above." That benchmark's per-target multipliers currently range from ~105× to ~2,823×
  (aggregate ~612× tokens / ~292× cost in v1.4.0). None of the multiplier figures are an
  independent third-party measurement against a real agent.
- **Elastic Security Labs** (April 2026, *The Cost of Understanding*): measures the cost of
  reverse engineering by Claude Opus 4.6 against increasingly heavy obfuscations. On their most
  costly case, time grew up to 4× and cost up to 4.5× from one test phase to the next, and
  stacking layers blew up cost to the point of killing executions. Conclusion: obfuscation stays
  viable against a pipeline processing many samples, much less so against a determined target.
- **Code Renewability for Native Software Protection** (Abrath et al., Ghent University)
  formulates the general principle, predating current AI agents: a protection works when the
  attacker anticipates a negative return on investment, before or during the attack. The
  framework (ASPIRE) has never been re-thought for AI agents, but its economic logic is directly
  transposable.

---

## Axis 4 — Deception

> *"All warfare is based on deception."*

Lay false trails so the analysis concludes something *wrong*, rather than nothing at all. This
differs from raising the cost, which aims to exhaust, not to mislead.

- **BLA (Poison component)**: misleading metadata, decoy elements in shipped files (e.g. fake
  source maps, canaries, honey metadata, decoy control flow).
- **BLA (Hallucinate component)**: a third layer, added to BLA's pipeline ("Poison → Exhaust →
  Hallucinate"), which leaves the analyzer with truncated inventories, redaction failures, and
  ambiguous rabbit holes while the runtime behavior stays equivalent. The working study's source
  named only Poison and Exhaust; Hallucinate is a later addition and is folded here under
  deception.
- **Mantis** deploys deliberately-vulnerable decoy services (a fake FTP server) to attract the
  attacking agent before moving to counter-attack (Axis 6).
- **Cloak, Honey, Trap: Proactive Defenses Against LLM Agents** (Ayzenshteyn, Weiss, Mirsky,
  USENIX Security 2025 / 34th USENIX Security Symposium): a deception and counter-attack defense
  framework that exploits LLM weaknesses (bias, memory limits, tokenization issues) to disrupt,
  detect, or neutralize malicious agents.
- The generalist honeypot / decoy literature is abundant and transposable, but — unlike BLA and
  Mantis — has not yet been specifically adapted to AI agents that reverse-engineer shipped
  software.

---

## Axis 5 — Fortification

The classic wall: make the code structure itself unreadable. This is the axis where academic
research specific to AI agents is most active in 2026.

- **Acoda: Adversarial Code Obfuscation for Defending against LLM-based Analysis** (arXiv
  2606.11755, June 2026): adversarial obfuscation generated by genetic algorithm, designed
  specifically to foil LLM code analysis (8 semantics-preserving obfuscations, up to 70% attack
  success rate on 7 SOTA LLMs). It differs from classic obfuscation, which was designed for human
  analysts. Note: the study's working source attributed this to "ICSE 2026"; the arXiv record is
  cs.SE (submitted June 2026), and the ICSE venue was not independently confirmed here.
- **CoTDeceptor: Adversarial Code Obfuscation Against CoT-Enhanced LLM Code Agents** (arXiv
  2512.21250, December 2025): targets Chain-of-Thought LLM *detectors* with automatically evolving
  multi-stage obfuscation chains that bypass CoT-driven vulnerability detection. Note: this is
  itself an *evasion* work (defeating LLM detectors), listed here to document the adversarial
  obfuscation frontier rather than as a defensive fortification tool.
- **NeuroShield** (ACM CCS 2025): transforms the structure of compiled AI models to prevent their
  reconstruction. It protects models, not ordinary application code.
- Practitioners have documented empirical limits: **Quarkslab** and **Elastic Security Labs**
  tested hardenings against real agents (including Claude), with mixed results depending on the
  technique. JIT bytecode encryption proved most effective in their tests.
- **Jscrambler** already commercializes an offering positioned explicitly against AI-assisted
  threats.

---

## Axis 6 — Counter-attack

The most radical axis, and where the most solid finding of this study sits.

- **Mantis** (Pasquini, Kornaropoulos, Ateniese; open source at
  `github.com/pasquini-dario/project_mantis`; paper *Hacking Back the AI-Hacker: Prompt Injection
  as a Defense Against LLM-driven Cyberattacks*, arXiv 2410.20911): exploits the attacking agents'
  own vulnerability to prompt injection. A decoy server answers the agent with hidden
  instructions — made invisible to a human via ANSI escape sequences and HTML comments — that
  push it to sabotage its own attack (passive defense / "agent-tarpit"), or even to open a
  reverse shell that Mantis uses to take control of the attacker's machine (active defense). Over
  95% effectiveness reported across configurations (ChatGPT-4/4o, Claude 3.5 Sonnet/Haiku). This
  is not specific to reverse engineering shipped software, but the principle transposes: a REA or
  Ghidra-MCP is, at bottom, an LLM agent like any other.
- **Anti-BLA**: a direct, already-public response to BLA. Inspects BLA-protected artifacts without
  touching the original bytes, to extract usable evidence anyway.
- **AgentSnare** (*Learning to Delay, Divert, and Defuse Autonomous Penetration Agents*): a
  neighboring approach for automated pentest agents, with static decoys whose effectiveness and
  limits the study measures.
- **Prompt injection against reverse-engineering agents.** The Naval Postgraduate School (May
  2026) showed that hidden instructions in decompiled code can divert a reverse-engineering agent.
  Crawford and McClure (arXiv 2605.30677, May 2026) tested optimized injection chains placed in
  programs against a Cline + GhidraMCP + Ghidra pipeline. Their follow-up work on detection (as
  reported by a later paper, *When Binaries Talk Back*) catches 20 of 20 attacks in the string
  list output, but only 15 of 24 injected functions in the decompiler output, and 13 of 20
  adaptive attacks evade the classifier. This is the technical basis of any counter-attack of
  this type, along with its detection limits.

---

## Axis 7 — Speed and adaptability

> *"Let your plans be as impenetrable as the night."*

A static protection ends up learned and bypassed. The idea: renew it faster than the attacker can
capitalize on what it has learned. **This is the thinnest-researched axis, and the one where the
study can contribute something new.** The building blocks below exist, but none measures a
renewal cadence against a reverse-engineering agent.

### What exists on the defense side

- **Code Renewability for Native Software Protection** (Abrath et al., 2020): the reference
  architecture. It dynamically renews parts of the protected code, delivered from a secure
  server, so that identifying the attack vector must be redone each time. It predates current AI
  agents.
- **Build-time diversity and N-version obfuscation**: generate functionally-equivalent but
  different copies per user. The *N-version obfuscation* paper (2016) finds that time-to-break
  grows *linearly* with the number of versions. The gain is linear, not exponential — which no
  study has verified against an agent.
- **Rapid protection production**: Elastic shows it is fast and cheap to develop, via an
  automated develop-test-improve loop, obfuscations targeted at a given model. The defender's
  production speed is therefore no longer the limiting factor.
- **Moving target defense (MTD)**: a preprint (*Denying the World Model*) argues that shifting the
  space around assets invalidates an agent's world model faster than it can act, with three test
  campaigns under full containment. This is enterprise networking, not code protection, and the
  author reports their own tests. Conversely, **MTDSense** shows an attacker AI can infer an MTD
  schedule via IP-address mixing: periodic rotation is predictable and therefore exploitable.
- **Commercial offerings**: javascriptobfuscator.com claims that polymorphic decoders regenerated
  at each build disrupt LLM reasoning. A commercial source, to be treated as an unverified claim.

### What the attacker already knows how to do

- **Speed.** On CTF challenges, the best agent configurations solve in under a minute (median,
  Reveree). Even with uncertainty about the leap to protected commercial software, the human
  cadence assumed by Code Renewability no longer holds.
- **Capitalization.** The Recon 2026 talk describes agents that propagate recovered semantics
  through the call graph, spot repeated obfuscation patterns, and deobfuscate at the scale of a
  whole binary or malware family. Renewing the *appearance* is not enough if the transformation
  *pattern* stays the same.
- **Memory.** Agentic reverse-engineering tools already integrate persistent memory: REA keeps
  session memory, and at least one reverse-engineering skill retrieves a prior analysis by the
  binary's sha256 fingerprint. Hash-indexed memory is invalidated by any build change, but that
  says nothing about knowledge transfer from one variant to another.

### Limits and risks specific to renewal

- **Differential attack.** A build-time diversity patent (US 8,990,785) notes that updating a
  protection can lead the attacker directly to the protected elements, if they compare with
  previous versions. An agent is probably effective at comparing versions: a hypothesis to test,
  not a sourced result.
- **The update channel is a surface.** TrustedSec (May 2026) notes that the update mechanisms of
  defensive products become inspectable by agents. Server-side renewal creates a network
  dependency and a new analysis point.
- **Defender latency.** The same article puts the gap between "found something" and "all clients
  protected" at weeks or quarters, versus days for the attacker. Renewal cadence also depends on
  the build, delivery, and support chain.
- **Back to Axis 2.** What stays server-side no longer needs renewing: the smaller the shipped
  portion, the less Axis 7 matters.
- **The BLA case.** The `bla update` command updates the BLA tool itself, not the protections of
  an already-shipped artifact: it does not count as renewal. Exhaust protections also target
  specific analyzer thresholds in REA; if those thresholds change, the protection goes stale —
  the author's reading, and an example of the lack of adaptability.

### What is missing

- A **measure of the renewal cadence** from which an agent no longer amortizes its effort, and of
  what that cadence costs the defender.
- A **measure of knowledge transfer across variants**: does what an agent learns on variant A help
  it on variant B? LLM deobfuscation evaluations cover varied transformations without answering
  this.
- A **signal-triggered rotation** (typical agent exploration behavior, burst requests) rather than
  periodic — which ties back to Axis 6.

---

The blind spots that emerge from this grid — and the open questions for future work — are
collected in [gaps.md](gaps.md). The full bibliography is in [sources.md](sources.md).