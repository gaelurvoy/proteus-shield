# Disclaimer

This repository contains two things, both **for defensive study only**:

1. a **state-of-the-art / framing study** (`docs/etude/`) of how to defend shipped software
   against AI agents that automate reverse engineering;
2. a **measurement harness** (`src/`) that measures an analyzer's modeled cost against
   observable properties of an artifact.

This project:

- measures, it does not protect. It does not harden, obfuscate, pack, or transform any software
  artifact;
- does **not** ship, implement, or reproduce any tool that executes evasion of analysis,
  aggressive deception, or counter-attack against any analyzer, human or automated;
- does **not** provide guidance for evading security scanners, sandboxes, or analysis systems,
  whether human or AI-based;
- describes existing techniques **only** for the purpose of literature survey and open-question
  identification;
- ships, as its "analyzer", a documented, seeded scripted substitute: an explicit cost model, not
  an LLM and not a real reverse-engineering agent. Its token numbers are declared placeholders and
  must not be cited as real measurements against any actual agent.

Use this only to study defense and its measurement on software you are authorized to protect or
analyze, or on your own artifacts. Nothing here is legal, security, or engineering advice for any
specific deployment.
