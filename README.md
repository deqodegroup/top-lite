# TOP Lite

Standalone, Niue-first conversational language web app for The Orator Project.

## Current build

- STORM living centrepiece
- Chat-first interface
- Browser microphone transcription where supported
- Browser speech synthesis for voice playback
- Vagahau Niue first, with Samoa/Tonga/Fiji staged in the language selector
- Mobile-first responsive UI
- ICM-aligned separation between interface, core routing, services and data

## Architecture

- `src/components` — interface/UI
- `src/core` — STORM orchestration/router
- `src/services` — voice and future provider integrations
- `src/data` — language/config data
- `src/styles` — design system and responsive presentation

The frontend is not coupled to any single model provider. Replace `routeStormMessage()` with the selected provider/router service when the live language intelligence endpoint is ready.

## Development

```bash
npm install
npm run dev
npm run build
```
