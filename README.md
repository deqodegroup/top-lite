# TOP Lite

Standalone, Niue-first conversational language web app for The Orator Project.

## Canonical project truth
- `AGENTS.md` — builder entry and protected boundaries.
- `CONTEXT.md` — identity, current state and project rules.
- `architecture/SYSTEM_MAP.md` — ICM architecture map.
- `docs/DESIGN.md` — selected TOP Lite Apple-inspired design direction.
- `docs/BUILD.md` — build, validation and motion gates.

TOP Lite follows the universal DEQODE ICM architecture law defined in `deqodegroup/dq-universal`. Apple-inspired design is a product-specific design choice, not a universal DEQODE design rule.

## Current build
- STORM living centrepiece with restrained state-responsive motion.
- Premium white/ocean-blue conversational interface.
- Restrained Liquid Glass controls and composer.
- Chat-first interaction.
- Browser microphone transcription where supported.
- Browser speech synthesis for voice playback.
- Vagahau Niue first, with Samoa/Tonga/Fiji staged in the language selector.
- Mobile-first responsive UI.
- Reduced-motion accessibility support.

## ICM architecture
- Interface/UI — `src/components`, `src/App.jsx`, `src/styles`.
- Core Intelligence/Orchestration — `src/core`.
- Model Router/Providers — production adapter layer still to be connected.
- Services/Tools/APIs — `src/services` plus future voice/web/translation/avatar adapters.
- Data/Knowledge — `src/data` today; validated Vagahau Niue knowledge layer to be connected.
- Governance/Security — source validation, community validation, privacy and secrets rules.
- Deployment/Integration — standalone Vercel project; no main TOP repo coupling.

## Important current limitation
`src/core/stormRouter.js` is a local test harness, not the final STORM intelligence engine. Production STORM must connect through a provider-independent model/knowledge layer rather than hard-coding intelligence into the frontend.

## Development
```bash
npm install
npm run dev
npm run build
```
