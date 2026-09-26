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

## Machine translation for staged languages (added 2026-09-26, branch `feat/machine-translation`, not merged)
- `api/translate.js` (Google Cloud Translation NMT, server-side key `GOOGLE_TRANSLATE_API_KEY`) + provider-neutral client `src/services/translate.js`.
- Supports Samoan (`sm`) and Fijian (`fj`) only — Tongan and Niuean are NOT on Google's official language list.
- Niue is never routed here; it stays verified-corpus only. Machine output is labelled "Machine translation · not community verified".
- Until the key is set in Vercel, `GET /api/translate` returns `configured:false` and Samoa/Fiji stay "Soon" (disabled). Once set, they show "Beta".
- In a machine language, STORM acts as an English -> target translator (no LLM call, text only, no voice).
- Verified: route logic (mocked upstream), build, unconfigured UI. NOT verified: configured UI path with a real key, real Google output quality.

## Moana + Apple Glass update (2026-09-26, branch `feat/machine-translation`, uncommitted, not deployed)
- New living STORM orb (`src/components/StormOrb.jsx`, three.js) pulses with the real voice level (`src/services/voiceLevel.js`, hooked into `src/services/voice.js`; analysis only, never re-routes the audio). Safari/browser-TTS use a gentle synthetic pulse.
- Dark ocean-black + Apple Liquid Glass theme layer: `src/styles/moana.css`. Design decision recorded in `docs/DESIGN.md`.
- Verified: build passes; desktop + phone layouts and chat state checked in browser; no console errors. NOT verified: a real premium-voice turn (needs OPENAI_API_KEY), LiveKit Voice mode (orb does not yet follow the LiveKit audio level), Avatar mode styling, Safari/iOS.
- Logo: single serif "T" (Founder decision 2026-09-26) in `src/components/TopMark.jsx`; favicon `public/top-t.svg`. Previous wave mark (`top-mark.svg` in main TOP repo) is not used here.
