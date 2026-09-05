import { readFileSync } from 'node:fs'

const registry = JSON.parse(
  readFileSync(new URL('../data/storm/sources.json', import.meta.url), 'utf8')
)

function normalize(value) {
  return String(value || '').toLowerCase()
}

export function trustedSources() {
  return registry.sources
}

export function sourceMeta() {
  return {
    version: registry.version,
    updated: registry.updated,
    count: registry.sources.length,
    policy: registry.policy,
  }
}

export function findTrustedSources(query, limit = 6) {
  const q = normalize(query)
  if (!q) return registry.sources.slice(0, limit)

  const tokens = q.split(/[^a-z0-9]+/).filter((token) => token.length > 2)
  return registry.sources
    .map((source) => {
      const haystack = normalize(`${source.title} ${source.publisher} ${source.type} ${source.id}`)
      let score = 0
      for (const token of tokens) if (haystack.includes(token)) score += 1
      if (source.priority === 'primary' || source.priority === 'verified') score += 0.25
      return { ...source, score }
    })
    .filter((source) => source.score > 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function formatTrustedSources(query) {
  const matches = findTrustedSources(query, 8)
  if (!matches.length) return 'No matching persistent trusted source was found.'
  return matches
    .map((source, index) => `${index + 1}. ${source.title} — ${source.publisher}\n${source.url}`)
    .join('\n\n')
}
