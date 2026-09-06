# TOP Lite — Handoff State

## Current state
- Founder direction for the 2026-09-06 deployment pass: verify the latest standalone `main` build and deploy it to the existing TOP Lite Vercel project without further clarification. The main TOP repository remains protected and out of scope.
- Standalone repo: active.
- DQ Universal / ICM bootstrap: complete.
- Apple-inspired product design source of truth: complete.
- Chat-first interface rebuild: committed to `main`.
- Conversation is now the primary product surface.
- STORM living voice/chat presence: integrated into welcome, thread and state feedback.
- Persistent bottom composer with text, mic, voice-session and send controls: committed.
- Responsive mobile bottom rail: committed.
- Subtle Liquid Glass, ocean-blue depth and reduced-motion support: committed.
- Chat, browser mic and browser voice test interactions: present.
- Production STORM model/knowledge service: not yet connected.

## Latest interface commits
- `0d6a2462979543fd867e2b691b6d9df3c2e0b197` — chat-first application structure.
- `147f23a86f5ecc2d26dcb217cd31ec9f5f332c0e` — premium chat-first visual system.

## Deployment
Stable Vercel project alias previously reported:
`https://top-lite-djrevos-projects.vercel.app`

The Vercel connector manual deploy action is currently returning an input-schema mismatch in this session. The GitHub `main` source is updated and is the canonical production source. If the Vercel Git integration is active, it should deploy from this push. Do not claim live smoke-test success until the resulting production deployment is opened and verified.

## Next engineering step
After live UI verification, connect the provider-independent STORM orchestration/model/knowledge service, then test validated Vagahau Niue accuracy, voice and retrieval as separate ICM layers.

## Protected boundary
Do not modify the main TOP repository. TOP Lite remains standalone unless the Founder explicitly changes that decision.
