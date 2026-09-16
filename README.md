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
- Chat / Voice / Avatar modes share one continuous conversation.
- OpenAI Responses API is the primary intelligence layer.
- Built-in OpenAI web search provides current external context and citations.
- Optional OpenAI file search can connect curated Niue source files through a vector store.
- Local verified TOP Lite Vagahau Niue knowledge remains available as a trusted context layer.
- Browser microphone transcription where supported.
- ElevenLabs voice with browser speech fallback.
- Optional external avatar runtime kept separate under ICM.
- Vagahau Niue first, with Samoa/Tonga/Fiji staged in the language selector.
- Mobile-first responsive UI and reduced-motion accessibility support.

## ICM architecture
- Interface/UI — `src/components`, `src/App.jsx`, `src/styles`.
- Intelligence — secure `/api/agent` gateway to OpenAI Responses API.
- Knowledge — local verified Niue data plus optional OpenAI file search.
- Current information — OpenAI built-in web search.
- Voice — separate TTS service adapter.
- Avatar — separate runtime adapter; failure must never break chat or voice.
- Governance/Security — source validation, community validation, privacy, server-side secrets and bounded sessions.
- Deployment/Integration — standalone Vercel project; no main TOP repo coupling.

## Required environment
- `OPENAI_API_KEY` — required for the live STORM agent.
- `OPENAI_MODEL` — optional; defaults to `gpt-5.6-terra`.
- `OPENAI_NIUE_VECTOR_STORE_ID` — optional; enables curated Niue file search.
- `OPENAI_REASONING_EFFORT` — optional; defaults to `low`.
- `OPENAI_AGENT_TIMEOUT_MS` — optional; defaults to 22000.
- ElevenLabs and avatar runtime variables remain optional and isolated from the intelligence layer.

## Fallback behavior
`src/core/stormRouter.js` is retained only as an offline/local fallback. It is no longer the primary STORM intelligence engine.

## Development
```bash
npm install
npm run dev
npm run build
```
