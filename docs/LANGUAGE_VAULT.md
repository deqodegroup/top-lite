# TOP Lite Language Vault

## Purpose

The Language Vault is the governed Vagahau Niue knowledge layer beneath STORM. It separates verified language knowledge from model output and live web search.

## Flow

`approved public source -> candidate ingestion -> human/community review -> verified knowledge -> STORM retrieval`

Automatic scraping never promotes material directly into verified knowledge.

## Canonical files

- `data/storm/sources.json` — trusted source registry and provenance anchors.
- `data/storm/ingest-policy.json` — explicit allow/deny rules for automated fetching.
- `data/storm/knowledge.json` — curated verified seed knowledge used by STORM.
- `scripts/ingest-language.mjs` — fetches approved HTML sources and creates review candidates in `.cache/top-language-candidates/`.
- `lib/storm-knowledge.js` — server-side retrieval.
- `api/knowledge.js` — read-only retrieval endpoint for agents/services.

## Governance

1. Vagahau Niue facts must not be invented.
2. Every promoted record must retain a source identifier.
3. Public web material, community knowledge and culturally restricted material are separate trust classes.
4. Community/elder material is never scraped automatically.
5. PDF/dictionary/orthography material is curated deliberately rather than copied wholesale.
6. Candidate data is unverified until reviewed and promoted.
7. STORM should say when a requested language fact is not verified.

## Running ingestion

```bash
npm run language:ingest
```

This writes only to `.cache/top-language-candidates/`. Review candidates manually before adding factual records to `data/storm/knowledge.json`.

## Retrieval

`GET /api/knowledge?q=fakaaue&limit=8`

The same retrieval function is already used by `api/agent.js`, so STORM receives verified hits before generating a response.

## Next stage

Add a review/promotion tool and community validation states, then connect the same retrieval contract to the LiveKit STORM agent. The storage backend can later move to a database/vector store without changing the UI contract.
