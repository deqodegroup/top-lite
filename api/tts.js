function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function cleanForSpeech(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text || typeof text !== 'string') return sendJson(res, 400, { error: 'text is required' })

  const speechText = cleanForSpeech(text)
  if (!speechText) return sendJson(res, 400, { error: 'text is empty after cleanup' })
  if (speechText.length > 4096) return sendJson(res, 400, { error: 'text too long' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return sendJson(res, 503, { error: 'STORM voice is not configured' })

  const body = {
    model: process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts',
    voice: process.env.OPENAI_TTS_VOICE || 'marin',
    input: speechText,
    response_format: 'mp3',
    speed: Number(process.env.OPENAI_TTS_SPEED || 1.0),
    instructions: process.env.OPENAI_TTS_INSTRUCTIONS || 'Speak warmly, naturally and conversationally. Sound calm, intelligent and human, never robotic or announcer-like. Use gentle pacing and natural pauses. Treat Vagahau Niue words carefully and do not exaggerate an accent.',
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return sendJson(res, 502, { error: error?.error?.message || `STORM voice provider failed (${response.status})` })
    }

    const audio = Buffer.from(await response.arrayBuffer())
    res.statusCode = 200
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Storm-Voice', 'openai')
    res.end(audio)
  } catch (error) {
    return sendJson(res, 502, { error: error instanceof Error ? error.message : 'STORM voice failed' })
  }
}
