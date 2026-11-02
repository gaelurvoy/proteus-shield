# Blind Spots and Open Questions

*"Angles morts"* — the gaps that fall out of the seven-axis grid. These are the natural place
for future work, and for any research program that would pick up where this framing study stops.

---

1. **No cross-cutting synthesis exists.** Every project or paper found covers a single axis,
   sometimes two (BLA does Poison *and* Exhaust). No one has yet assembled these seven axes into a
   single framework applied to AI reverse-engineering agents. That is the space this study clears.

2. **Axis 7 (speed and adaptability) is unmeasured.** No published study found measures the
   renewal cadence needed against an agent that re-analyzes in minutes rather than human-days, nor
   the transfer of acquired knowledge from one variant to another. The building blocks exist
   (attack profitability, moving target defense, invalidation of acquired knowledge), but they
   have never been assembled nor tested on shipped code. This is potentially **the weak point of
   the entire grid**.

3. **Axis 2 (avoidance) lacks AI-specific treatment.** The sources found are general application
   architecture (thin/thick client), not studies designed for the specific case of an AI agent
   able to browse a thick client in minutes.

4. **No one measures the true end-to-end cost.** BLA publishes its own multipliers, and Elastic
   measures a single agent on a single challenge type. No independent study compares several axes
   (fortification, cost-raising, deception) on the *same* agent and the *same* artifact to say
   which pays most per euro invested.

5. **Active counter-attack is not demonstrated against reverse-engineering agents.** Prompt
   injection against a Cline + GhidraMCP pipeline has been tested, as has its detection, with
   limits (adaptive attacks evade the classifier). Mantis, for its part, targets generic attacking
   agents. No demonstration was found of *active* counter-attack (taking control of the attacker's
   machine) against REA or Ghidra-MCP themselves.

---

## Open questions worth a research program

- What renewal cadence makes an agent's effort unamortizable, and what does it cost the defender?
- Does knowledge transfer across variants neutralize build-time diversity? (The N-version
  result says time-to-break grows *linearly*; nothing tests that against an agent.)
- Can rotation be triggered by a *signal* (agent-typical exploration, burst requests) rather than
  a fixed period — and does that connect to counter-attack (Axis 6)?
- Which axis pays most per euro, measured independently on one agent and one artifact?