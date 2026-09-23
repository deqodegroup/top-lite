# TOP Lite LiveKit voice

## Architecture

`TOP Lite UI -> /api/livekit-token -> LiveKit Cloud -> top-storm agent -> OpenAI Realtime -> /api/knowledge`

The existing browser speech loop remains available as a fallback for text dictation. The dedicated Talk session uses LiveKit.

## Required server environment

Frontend/Vercel:

```
LIVEKIT_URL=wss://<project>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
TOP_LIVEKIT_AGENT_NAME=top-storm
```

Agent deployment:

```
LIVEKIT_URL=wss://<project>.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
OPENAI_API_KEY=...
TOP_LIVEKIT_AGENT_NAME=top-storm
TOP_KNOWLEDGE_URL=https://top-lite.vercel.app/api/knowledge
OPENAI_REALTIME_MODEL=gpt-realtime
OPENAI_REALTIME_VOICE=marin
```

Never expose API keys with a `VITE_` prefix.

## Local agent

From `agent/`:

```bash
python -m venv .venv
# activate the venv
pip install -r requirements.txt
python agent.py dev
```

For LiveKit Cloud deployment, authenticate the LiveKit CLI and deploy the `agent/` project. The agent name must match `TOP_LIVEKIT_AGENT_NAME`.

## Knowledge grounding

The agent has a `search_vagahau` function tool. It calls TOP Lite's read-only `/api/knowledge` endpoint and must use it before making Vagahau Niue language claims. Missing results are treated as unverified rather than guessed.

## Production hardening

The token endpoint creates short-lived, single-room participant tokens, checks same-origin browser requests and applies a basic process-local rate limit. Before broad public launch, add durable per-user/session rate limiting and authentication or anonymous-session attestation.
