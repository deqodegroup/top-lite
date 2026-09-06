import { searchFreeWeb } from '../lib/free-web.js'

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function directAnswer(results) {
  if (!results.length) return null
  const firstWithText = results.find((item) => String(item.content || '').trim()) || results[0]
  const text = String(firstWithText.content || firstWithText.title || '').replace(/\s+/g, ' ').trim().slice(0, 600)
  if (!text) return null
  return `${text}${text.endsWith('.') ? '' : '.'}`
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return send(res, 200, { ok: true, service: 'web-only', provider: 'duckduckgo-html', keyRequired: false })
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })

  const { message } = req.body || {}
  if (!message || typeof message !== 'string') return send(res, 400, { error: 'message is required' })

  const results = await searchFreeWeb(message, 6)
  const text = directAnswer(results)

  if (!text) return send(res, 503, { error: 'No free web result available', mode: 'web-only-offline' })

  return send(res, 200, {
    text,
    provider: results[0]?.provider || 'duckduckgo-html',
    mode: 'web-only-online',
    grounded: true,
    webSources: results.map(({ title, url, provider, searchedAt, cache, score }) => ({ title, url, provider, searchedAt, cache, score })),
  })
}
