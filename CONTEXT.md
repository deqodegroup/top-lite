# TOP Lite — Canonical Context

## Identity
Project: TOP Lite
Purpose: A standalone, Niue-first conversational language web app for The Orator Project.
Primary intelligence identity: STORM.
Primary users: learners, families, community members, diaspora, and language supporters.

## Product direction
- Mobile-friendly conversational web app.
- Chat + microphone + voice as the primary interaction surface.
- Vagahau Niue first.
- Samoa, Tonga and Fiji may be added later through provider/service integrations.
- STORM should feel calm, alive and responsive rather than like a static chatbot icon.

## Architecture
TOP Lite follows DEQODE ICM architecture law. See `architecture/SYSTEM_MAP.md`.

## Design
TOP Lite deliberately opts into the reusable Apple Design Option from `deqodegroup/dq-universal/skills/apple-design/SKILL.md`.
This is a product-specific design choice, not a universal DEQODE design rule.
See `docs/DESIGN.md`.

## Repository/deployment boundaries
- This repository is standalone: `deqodegroup/top-lite`.
- It must not be nested back into or modify the main TOP repository unless explicitly directed by the Founder.
- Deployment target: standalone Vercel project.

## Current state
Working:
- React/Vite shell.
- Chat interaction.
- Browser speech recognition where supported.
- Browser speech synthesis.
- STORM visual states.

In progress:
- Apple-inspired UI refinement.
- Proper ICM bootstrap and provider boundaries.
- Production validation.

Known gap:
- Current STORM intelligence is a local test router, not yet the full model + validated Vagahau Niue knowledge service.

## Data/source rule
Language accuracy, pronunciation, cultural information and teaching content must ultimately come from validated, legitimate Niue/community/educational sources. Community validation remains essential.
