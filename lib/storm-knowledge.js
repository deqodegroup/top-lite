import { readFileSync } from 'node:fs'

const knowledge = JSON.parse(
  readFileSync(new URL('../data/storm/knowledge.json', import.meta.url), 'utf8')
)

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1)
}

export function searchKnowledge(query, limit = 8) {
  const q = new Set(tokens(query))
  if (!q.size) return []

  return knowledge.entries
    .map((entry) => {
      const hay = tokens(`${entry.niuean} ${entry.english} ${entry.pronunciation_note || ''}`)
      let score = 0
      for (const token of hay) if (q.has(token)) score += 1
      const queryLower = String(query).toLowerCase()
      if (entry.niuean.toLowerCase() === queryLower || entry.english.toLowerCase() === queryLower) score += 8
      else if (entry.niuean.toLowerCase().includes(queryLower) || entry.english.toLowerCase().includes(queryLower)) score += 4
      return { ...entry, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function formatKnowledge(results) {
  if (!results.length) return 'No matching verified TOP Lite knowledge was found.'
  return results.map((entry) => {
    const note = entry.pronunciation_note ? `; pronunciation: ${entry.pronunciation_note}` : ''
    return `- ${entry.niuean} = ${entry.english} [${entry.source}]${note}`
  }).join('\n')
}

export function knowledgeMeta() {
  return {
    language: knowledge.language,
    status: knowledge.status,
    count: knowledge.entries.length,
    sources: knowledge.sources,
  }
}
