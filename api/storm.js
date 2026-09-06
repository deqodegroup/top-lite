import { runModel, searchWeb } from '../lib/opendex-runtime.js'
import { searchKnowledge, formatKnowledge, knowledgeMeta } from '../lib/storm-knowledge.js'
import { formatTrustedSources, findTrustedSources, sourceMeta } from '../lib/storm-sources.js'

const SYSTEM_PROMPT = `You are STORM, the voice-first intelligence inside TOP Lite.

TOP Lite is a standalone Niue-first language app. STORM is conversational, practical, web-capable and able to answer general questions as well as teach Vagahau Niue.

RULES:
- Answer directly and naturally.
- Keep voice-friendly answers concise unless the user asks for depth.
- Use VERIFIED TOP LITE KNOWLEDGE first for Vagahau Niue.
- Never invent or guess Vagahau Niue.
- Use live web results for current/general questions when available.
- Prefer trusted Niue, Pacific, government and education sources.
- Premium model/search providers are fallbacks, not the default dependency.
- You are STORM regardless of the underlying provider.`

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function exactKnowledgeAnswer(message, knowledge) {
  const lower = message.toLowerCase()
  if (/practise|practice|pronunciation|speaking/.test(lower)) {
    const phrase = searchKnowledge('fakaalofa atu', 5).find((entry) => entry.niuean.toLowerCase() === 'fakaalofa atu') || searchKnowledge('fakaaue', 5).find((entry) => entry.niuean.toLowerCase() === 'fakaaue')
    if (!phrase) return null
    return { text: `Let’s practise “${phrase.niuean}” — ${phrase.english}. Say it naturally once, then we can slow it down together.`, hits: [phrase], mode: 'knowledge-direct' }
  }
  if (/learn.*phrase|teach me.*phrase|beginner.*phrase/.test(lower)) {
    const phrase = searchKnowledge('fakaalofa atu', 5).find((entry) => entry.niuean.toLowerCase() === 'fakaalofa atu') || searchKnowledge('fakaaue', 5).find((entry) => entry.niuean.toLowerCase() === 'fakaaue')
    if (!phrase) return null
    return { text: `Try “${phrase.niuean}.” It means ${phrase.english}.`, hits: [phrase], mode: 'knowledge-direct' }
  }
  if (knowledge.length && /what does|meaning|mean\b|translate|translation|word|phrase|niuean|vagahau/.test(lower)) {
    const top = knowledge[0]
    const note = top.pronunciation_note ? ` ${top.pronunciation_note}.` : ''
    return { text: `“${top.niuean}” means ${top.english}.${note}`, hits: [top], mode: 'knowledge-direct' }
  }
  return null
}

function directWebAnswer(web) {
  if (!web.length) return null
  const first = web[0]
  const snippet = String(first.content || '').replace(/\s+/g, ' ').trim().slice(0, 420)
  if (!snippet) return null
  return { text: `${snippet}${snippet.endsWith('.') ? '' : '.'}`, mode: 'web-direct', provider: first.provider || 'free-web' }
}

function serializeWebSources(web) {
  return web.map(({ title, url, score, searchedAt, cache, provider }) => ({ title, url, score, searchedAt, cache, provider }))
}

function serializeTrustedSources(message) {
  return findTrustedSources(message, 6).map(({ id, title, publisher, url, landing_url, type, priority }) => ({ id, title, publisher, url, landingUrl: landing_url || null, type, priority }))
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      service: 'storm',
      knowledge: knowledgeMeta(),
      sources: sourceMeta(),
      freeFirst: true,
      modelOrder: ['openrouter-free', 'vercel-gateway', 'openai', 'anthropic', 'xai'],
      webOrder: ['searxng', 'duckduckgo', 'brave', 'tavily'],
    })
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  const { message, history = [], allowWeb = true } = req.body || {}
  if (!message || typeof message !== 'string') return send(res, 400, { error: 'message is required' })
  if (message.length > 4000) return send(res, 400, { error: 'message too long' })

  const knowledge = searchKnowledge(message, 8)
  const directKnowledge = exactKnowledgeAnswer(message, knowledge)
  const trusted = serializeTrustedSources(message)

  if (directKnowledge) return send(res, 200, {
    text: directKnowledge.text,
    provider: 'top-lite-knowledge',
    model: null,
    grounded: true,
    mode: directKnowledge.mode,
    knowledgeHits: directKnowledge.hits,
    webSources: [],
    trustedSources: trusted,
  })

  const web = allowWeb ? await searchWeb(message) : []
  const knowledgeBlock = formatKnowledge(knowledge)
  const trustedBlock = formatTrustedSources(message)
  const webBlock = web.length ? web.map((item, index) => `${index + 1}. ${item.title}\n${item.content}\n${item.url}`).join('\n\n') : 'No live web results supplied for this turn.'
  const messages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\nVERIFIED TOP LITE KNOWLEDGE:\n${knowledgeBlock}\n\nTRUSTED SOURCES:\n${trustedBlock}\n\nLIVE WEB RESULTS:\n${webBlock}` },
    ...history.slice(-16).map((item) => ({ role: item.role === 'storm' ? 'assistant' : 'user', content: String(item.text || '') })),
    { role: 'user', content: message },
  ]

  try {
    const result = await runModel(messages)
    return send(res, 200, {
      text: result.text,
      provider: result.provider,
      model: result.model,
      grounded: knowledge.length > 0 || web.length > 0,
      mode: web.length ? 'model-web' : 'model',
      knowledgeHits: knowledge,
      webSources: serializeWebSources(web),
      trustedSources: trusted,
    })
  } catch (error) {
    const webFallback = directWebAnswer(web)
    if (webFallback) return send(res, 200, {
      text: webFallback.text,
      provider: webFallback.provider,
      model: null,
      grounded: true,
      mode: webFallback.mode,
      knowledgeHits: knowledge,
      webSources: serializeWebSources(web),
      trustedSources: trusted,
      runtimeError: error instanceof Error ? error.message : 'model unavailable',
    })

    if (knowledge.length) {
      const top = knowledge[0]
      return send(res, 200, {
        text: `I found “${top.niuean}” in the verified TOP Lite knowledge base. It means ${top.english}.`,
        provider: 'top-lite-knowledge',
        model: null,
        grounded: true,
        mode: 'knowledge-fallback',
        knowledgeHits: knowledge,
        webSources: [],
        trustedSources: trusted,
      })
    }

    return send(res, 200, {
      text: 'I lost the live connection for a moment. Try that again.',
      provider: 'top-lite-safe-fallback',
      model: null,
      grounded: false,
      mode: 'safe-fallback',
      knowledgeHits: [],
      webSources: [],
      trustedSources: trusted,
      runtimeError: error instanceof Error ? error.message : 'STORM runtime unavailable',
    })
  }
}
