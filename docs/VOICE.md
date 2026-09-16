# TOP Lite voice

TOP Lite uses OpenAI speech generation for STORM voice output.

## Production path
`STORM text -> /api/tts -> OpenAI /v1/audio/speech -> audio/mpeg -> browser playback`

## Environment
- `OPENAI_API_KEY` — required.
- `OPENAI_TTS_MODEL` — optional, defaults to `gpt-4o-mini-tts`.
- `OPENAI_TTS_VOICE` — optional, defaults to `marin`.
- `OPENAI_TTS_SPEED` — optional, defaults to `1.0`.

The previous ElevenLabs-specific path has been removed from the live voice route. Browser speech synthesis remains only as an emergency playback fallback when the server TTS route is unavailable.
