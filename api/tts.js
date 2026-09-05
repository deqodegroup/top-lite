function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })

  const { text } = req.body || {}
  if (!text || typeof text !== 'string') return sendJson(res, 400, { error: 'text is required' })
  if (text.length > 1200) return sendJson(res, 400, { error: 'text too long' })

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  if (!apiKey || !voiceId) return sendJson(res, 503, { error: 'STORM premium voice is not configured' })

  const body = {
    text,
    model_id: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
    voice_settings: {
      stability: Number(process.env.STORM_VOICE_STABILITY || 0.5),
      similarity_boost: Number(process.env.STORM_VOICE_SIMILARITY || 0.8),
    },
  }

  if (process.env.ELEVENLABS_DICT_ID && process.env.ELEVENLABS_DICT_VERSION_ID) {
    body.pronunciation_dictionary_locators = [{
      pronunciation_dictionary_id: process.env.ELEVENLABS_DICT_ID,
      version_id: process.env.ELEVENLABS_DICT_VERSION_ID,
    }]
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) return sendJson(res, 502, { error: `STORM voice provider failed (${response.status})` })

    const audio = Buffer.from(await response.arrayBuffer())
    res.statusCode = 200
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Storm-Voice', 'premium')
    res.end(audio)
  } catch (error) {
    return sendJson(res, 502, { error: error instanceof Error ? error.message : 'STORM voice failed' })
  }
}
