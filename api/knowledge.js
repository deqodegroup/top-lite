import { searchKnowledge, knowledgeMeta } from '../lib/storm-knowledge.js'

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  res.end(JSON.stringify(body))
}

export default function handler(req, res) {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' })

  const query = String(req.query?.q || '').trim()
  if (!query) return send(res, 400, { error: 'q is required' })
  if (query.length > 200) return send(res, 400, { error: 'q is too long' })

  const requested = Number(req.query?.limit || 8)
  const limit = Number.isFinite(requested) ? Math.max(1, Math.min(20, Math.floor(requested))) : 8
  const results = searchKnowledge(query, limit)

  return send(res, 200, {
    query,
    count: results.length,
    results,
    meta: knowledgeMeta(),
  })
}
