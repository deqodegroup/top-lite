const SYSTEM_PROMPT = `You are STORM, the Niue-first language intelligence for TOP Lite.

Your job is to help users learn, listen to, practise and understand Vagahau Niue and Niuean culture in a calm, concise, respectful way.

NON-NEGOTIABLE LANGUAGE RULE:
- Never invent, guess or fabricate Vagahau Niue words, translations, pronunciation or cultural claims.
- If a requested language fact is not grounded in verified TOP knowledge supplied to you, say that it is not yet verified and offer to explain the concept in English instead.
- Treat provenance and community validation as part of correctness.

BEHAVIOUR:
- Voice-first. Replies should usually be short enough to speak naturally.
- Be warm, direct and useful.
- For pronunciation coaching, explain one sound or phrase at a time.
- Do not pretend the avatar, microphone, knowledge base or external tools are available when they are not.
- TOP Lite is Niue-first. Other Pacific languages are staged for later.

ARCHITECTURE:
You are the STORM intelligence layer. The UI, voice I/O, provider/model and knowledge sources are separate and replaceable under DQ Universal / ICM.`

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })

  const token = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!token) {
    return send(res, 503, {
      error: 'STORM runtime is not configured',
      code: 'STORM_RUNTIME_OFFLINE',
    })
  }

  const model = process.env.STORM_MODEL || 'openai/gpt-4o-mini'
  const { message, history = [], verifiedContext = '' } = req.body || {}
  if (!message || typeof message !== 'string') return send(res, 400, { error: 'message is required' })

  const verifiedBlock = verifiedContext
    ? `\n\nVERIFIED TOP KNOWLEDGE FOR THIS TURN:\n${verifiedContext}`
    : '\n\nVERIFIED TOP KNOWLEDGE FOR THIS TURN: none supplied. Do not generate unverified Vagahau Niue.'

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + verifiedBlock },
    ...history.slice(-10).map((item) => ({
      role: item.role === 'storm' ? 'assistant' : 'user',
      content: String(item.text || ''),
    })),
    { role: 'user', content: message },
  ]

  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, stream: false, temperature: 0.2 }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return send(res, response.status, {
        error: data?.error?.message || data?.error || 'STORM provider request failed',
        code: 'STORM_PROVIDER_ERROR',
      })
    }

    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) return send(res, 502, { error: 'STORM returned no response', code: 'STORM_EMPTY_RESPONSE' })

    return send(res, 200, {
      text,
      model: data.model || model,
      grounded: Boolean(verifiedContext),
    })
  } catch (error) {
    return send(res, 502, {
      error: error instanceof Error ? error.message : 'STORM runtime failed',
      code: 'STORM_RUNTIME_ERROR',
    })
  }
}
