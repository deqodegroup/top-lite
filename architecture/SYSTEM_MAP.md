# TOP Lite — ICM System Map

## Canonical stack

`TOP Lite -> APEX-UI + selected Apple Design -> STORM -> OpenDex -> DQ Universal`

OpenJarvis is historical and is not part of the active TOP Lite build unless explicitly reintroduced.

## 1. Interface / UI
Purpose: Present the TOP Lite voice-first experience, STORM visual states, language selection, chat, microphone, Voice/Avatar mode and mobile/desktop interaction.
Canonical location: `src/components`, `src/App.jsx`, `src/styles`.
Design foundation: APEX-UI interaction principles plus the selected Apple Design option in DQ Universal.
Must not own: model-provider credentials, provider-specific runtime logic or canonical language knowledge.

## 2. Core Intelligence / Orchestration — STORM
Purpose: Own the TOP Lite intelligence identity, session behavior, domain rules, response policy and normalized contract between UI, knowledge and runtime.
Current locations: `src/services/stormAgent.js`, `api/storm.js`.
Temporary fallback: `src/core/stormRouter.js` only when the remote runtime is unavailable.

STORM must remain model/provider agnostic.

## 3. Runtime / Model Router — OpenDex pattern
Purpose: Supply the reusable voice-first/model-provider runtime pattern beneath STORM without coupling TOP Lite to one model.
Current web implementation: `api/storm.js` uses the Vercel AI Gateway OpenAI-compatible endpoint with `AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN` and configurable `STORM_MODEL`.
Future: the adapter may point to a hosted OpenDex runtime or another compliant provider/router without changing the UI.

## 4. Voice / Services
Current voice loop:
`Talk -> browser speech recognition -> STORM -> browser speech synthesis`

State contract:
`idle -> listening -> thinking -> speaking -> idle`

Current voice I/O is intentionally replaceable. Custom STORM TTS, local Whisper/Vosk, Realtime voice, or another OpenDex-compatible voice service can replace browser I/O without changing STORM or the interface contract.

Avatar mode uses the same STORM session and voice flow. The visual talking-avatar renderer is a separate service layer and must not own intelligence.

## 5. Data / Knowledge
Purpose: verified Vagahau Niue vocabulary, grammar, pronunciation, lessons, curriculum, cultural knowledge and provenance.
Rule: STORM must not invent or guess unverified Vagahau Niue.
If verified knowledge is not available for a requested language answer, the agent must explicitly say it is not verified rather than fabricate it.

Target sources include the approved TOP knowledge library and community-validated pronunciation/audio material.

## 6. Governance / Security — DQ Universal
DQ Universal / ICM is mandatory for this repository.
Requirements:
- one canonical home per fact;
- provider neutrality;
- no secrets in source;
- community validation for language/cultural claims;
- clear provenance and confidence state;
- protected main TOP repository remains outside this build;
- preserve separation between UI, intelligence, runtime, services, data and deployment.

## 7. Deployment / Integration
Repository: `deqodegroup/top-lite`.
Deployment: standalone Vercel project.
Main TOP repository: protected / out of scope.
Future integration with main TOP occurs through explicit interfaces rather than merging product internals.

## Primary flows

Voice:
`User -> Talk -> STT -> STORM -> verified knowledge/tools -> OpenDex/provider runtime -> STORM response -> TTS -> User`

Text:
`User -> Composer -> STORM -> verified knowledge/tools -> OpenDex/provider runtime -> STORM response -> UI`

Avatar:
`STORM voice session -> avatar renderer/lip-sync -> same response/audio session`

## Current implementation status
- APEX-UI-inspired liquid STORM orb: implemented.
- Apple-inspired TOP Lite interface: implemented.
- Voice-first state loop: implemented.
- STORM gateway endpoint: implemented.
- Provider-neutral runtime configuration: implemented.
- Browser STT/TTS fallback: implemented.
- Verified Vagahau Niue knowledge retrieval: not yet connected.
- Custom STORM voice: not yet connected.
- Talking-avatar renderer: not yet connected.
