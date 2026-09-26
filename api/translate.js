// Machine translation for staged Pacific languages (provider: Google Cloud Translation, NMT).
// Niue is NOT handled here: Vagahau Niue stays verified-corpus only (see architecture/SYSTEM_MAP.md).
// The route reports itself "not configured" until GOOGLE_TRANSLATE_API_KEY is set in Vercel.

// Only languages Google's official list supports (verified 2026-09-26). Tongan is not on it.
const SUPPORTED = { sm: 'Samoan', fj: 'Fijian' }
const MAX_CHARS = 500
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const hits = new Map() // best-effort per-instance rate limit, keyed by client IP

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function limited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY

  if (req.method === 'GET') {
    return sendJson(res, 200, { configured: Boolean(apiKey), languages: apiKey ? Object.keys(SUPPORTED) : [] })
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  const { text, target } = req.body || {}
  if (typeof text !== 'string' || !text.trim()) return sendJson(res, 400, { error: 'text is required' })
  if (text.length > MAX_CHARS) return sendJson(res, 400, { error: `text is limited to ${MAX_CHARS} characters` })
  if (!Object.hasOwn(SUPPORTED, target)) return sendJson(res, 400, { error: 'unsupported target language' })
  if (!apiKey) return sendJson(res, 503, { error: 'Machine translation is not configured' })
  if (limited(req)) return sendJson(res, 429, { error: 'Too many requests, please wait a moment' })

  try {
    const upstream = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey },
      body: JSON.stringify({ q: text.trim(), source: 'en', target, format: 'text' }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!upstream.ok) {
      console.error('translate upstream status', upstream.status)
      return sendJson(res, 502, { error: 'Translation service unavailable' })
    }
    const data = await upstream.json()
    const translation = data?.data?.translations?.[0]?.translatedText
    if (!translation) return sendJson(res, 502, { error: 'Translation service returned nothing' })
    return sendJson(res, 200, {
      translation,
      target,
      language: SUPPORTED[target],
      provider: 'google-nmt',
      verified: false, // never presented as community-validated
    })
  } catch (error) {
    console.error('translate failed', error instanceof Error ? error.message : error)
    return sendJson(res, 502, { error: 'Translation service unavailable' })
  }
}
