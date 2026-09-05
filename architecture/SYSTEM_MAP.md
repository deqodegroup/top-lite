# TOP Lite — ICM System Map

## 1. Interface / UI
Purpose: Present the conversational experience, STORM visual states, language selection, chat, microphone and voice controls.
Canonical location: `src/components`, `src/App.jsx`, `src/styles`.
Must not own: model-provider logic, validated language knowledge, external service credentials, deployment secrets.

## 2. Core Intelligence / Orchestration
Purpose: Accept user intent/context, choose the correct knowledge/service/provider path, manage STORM response state and return normalized responses to the UI.
Current canonical location: `src/core/stormRouter.js`.
Target evolution: move from local test routing to a provider-independent orchestration service/API while preserving the UI contract.

## 3. Model Router / Providers
Purpose: Provide a stable interface for whichever LLM/model provider is selected.
Current status: not yet live.
Required rule: UI and STORM identity must not depend on one provider SDK.
Target interface: normalized request/response adapter consumed by Core Intelligence.

## 4. Services / Tools / APIs
Current:
- Browser speech recognition adapter.
- Browser speech synthesis adapter.
Future candidates:
- Production speech-to-text.
- Text-to-speech / STORM voice.
- Translation.
- Web retrieval/search.
- Avatar/lip-sync.
- Analytics/telemetry.
All services must sit behind adapters so they can be replaced.

## 5. Data / Knowledge
Purpose: Vagahau Niue vocabulary, grammar, pronunciation, curriculum, cultural knowledge and validated references.
Current status: only minimal UI/config data is present.
Target: validated knowledge layer with canonical sources and provenance.
Rule: do not bury language knowledge in UI components or provider prompts as the only copy.

## 6. Governance / Security
Requirements:
- Community validation for language/cultural accuracy.
- Source trust rules for external information.
- No secrets committed to repo.
- Clear handling of user input/audio if production voice services are added.
- Provider/service permissions limited to what TOP Lite needs.

## 7. Deployment / Integration
Repository: `deqodegroup/top-lite`.
Deployment: standalone Vercel project.
Integration: may later connect to main TOP through explicit interfaces, not by merging product internals.
Main TOP repo is currently protected and outside scope.

## Primary flows
`User -> Interface -> STORM Core -> Provider Router -> Model Provider`
`STORM Core -> Knowledge Layer -> Validated Vagahau Niue data`
`Interface -> Voice Adapter -> Browser/voice service`
`STORM Core -> Service Adapter -> Web/translation/avatar services`

## Architecture debt to remove
The current local hard-coded response router is acceptable only as a test harness. It must not become the production STORM intelligence implementation.
