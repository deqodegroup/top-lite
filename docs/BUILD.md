# TOP Lite — Build Contract

## Architecture law
TOP Lite follows DEQODE DQ Universal / ICM architecture law.

## Product-specific build rules
- Standalone repo and standalone deployment.
- Do not modify the main TOP repository.
- Keep Interface/UI separate from STORM orchestration, provider routing, services, knowledge, governance and deployment.
- Model and service providers must remain replaceable.
- The current local response router is a test harness only.
- Apple-inspired design is selected for this product; it is not universal architecture policy.

## Build sequence
1. Confirm repository context and protected boundaries.
2. Confirm ICM layer ownership before implementation.
3. Build/validate functional interface without provider lock-in.
4. Validate responsive behavior and accessibility.
5. Only after core behavior passes, enable approved animation/interaction polish.
6. Build production bundle.
7. Deploy to the standalone Vercel project.
8. Smoke-test the live deployment.
9. Record known gaps before adding the real STORM provider/knowledge layer.

## Functional acceptance
- App loads without runtime/build failure.
- User can enter and submit a message.
- STORM response flow updates listening/thinking/speaking/idle states.
- Microphone control degrades gracefully where browser recognition is unavailable.
- Voice playback does not block text use.
- Language selector shows Vagahau Niue first and keeps staged languages disabled until activated.
- Mobile layout remains usable at narrow widths.

## Design acceptance
See `docs/DESIGN.md`.

## Motion gate
Animation is approved only after functional acceptance passes. Motion must communicate state, continuity or response and must respect reduced-motion preferences.

## Current known limitation
The active STORM response layer is not yet the production intelligence agent. A provider-independent model/knowledge service must replace the local test router before intelligence testing is considered complete.
