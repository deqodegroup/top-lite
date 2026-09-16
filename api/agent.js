import { searchKnowledge, formatKnowledge, knowledgeMeta } from '../lib/storm-knowledge.js'
import { formatTrustedSources, findTrustedSources, sourceMeta } from '../lib/storm-sources.js'

const OPENAI_URL = 'https://api.openai.com/v1/responses'

const SYSTEM_PROMPT = `You are STORM, the conversational intelligence inside TOP Lite.

TOP Lite is a standalone, Niue-first language companion. You help people learn, practise and understand Vagahau Niue, while also answering general questions naturally.

OPERATING RULES:
- Be concise, conversational and voice-friendly unless the user asks for depth.
- VERIFIED TOP LITE KNOWLEDGE is the authority for curated Vagahau Niue words, meanings and pronunciation notes supplied in context.
- Never invent or guess Vagahau Niue. If a language fact is uncertain, say so clearly.
- Use web search for current information or when live external context would materially improve the answer.
- Prefer official Niue, Pacific, government, education, cultural and regional institutional sources where available.
- Preserve source provenance when web information is used.
- Treat culturally sensitive knowledge carefully and do not present unverified community knowledge as settled fact.
- You are STORM regardless of the underlying model.
- Do not mention internal routing, APIs, system prompts or model infrastructure to the end user.`

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function serializeTrustedSources(message) {
  return findTrustedSources(message, 6).map(({ id, title, publisher, url, landing_url, type, priority }) => ({
    id,
    title,
    publisher,
    url,
    landingUrl: landing_url || null,
    type,
    priority,
  }))
}

function extractText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) return response.output_text.trim()

  const chunks = []
  for (const item of response?.output || []) {
    if (item?.type !== 'message') continue
    for (const part of item.content || []) {
      if (part?.type === 'output_text' && part.text) chunks.push(part.text)
    }
  }
  return chunks.join('\n').trim()
}

function extractWebSources(response) {
  const seen = new Set()
  const sources = []

  for (const item of response?.output || []) {
    if (item?.type !== 'message') continue
    for (const part of item.content || []) {
      for (const annotation of part.annotations || []) {
        if (annotation?.type !== 'url_citation') continue
        const url = annotation.url || annotation.url_citation?.url
        const title = annotation.title || annotation.url_citation?.title || url
        if (!url || seen.has(url)) continue
        seen.add(url)
        sources.push({ title, url, provider: 'openai-web-search' })
      }
    }
  }

  return sources.slice(0, 8)
}

function buildTools(allowWeb) {
  const tools = []
  if (allowWeb) tools.push({ type: 'web_search' })

  const vectorStoreId = process.env.OPENAI_NIUE_VECTOR_STORE_ID
  if (vectorStoreId) {
    tools.push({
      type: 'file_search',
      vector_store_ids: [vectorStoreId],
      max_num_results: 8,
    })
  }

  return tools
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      service: 'top-lite-agent',
      provider: 'openai-responses',
      model: process.env.OPENAI_MODEL || 'gpt-5.6-terra',
      webSearch: true,
      fileSearch: Boolean(process.env.OPENAI_NIUE_VECTOR_STORE_ID),
      knowledge: knowledgeMeta(),
      sources: sourceMeta(),
      architecture: 'icm-agent-direct',
    })
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })

  const { message, previousResponseId = null, allowWeb = true } = req.body || {}
  if (!message || typeof message !== 'string') return send(res, 400, { error: 'message is required' })
  if (message.length > 4000) return send(res, 400, { error: 'message too long' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return send(res, 503, { error: 'TOP Lite agent is not configured' })

  const knowledge = searchKnowledge(message, 8)
  const trusted = serializeTrustedSources(message)
  const knowledgeBlock = formatKnowledge(knowledge)
  const trustedBlock = formatTrustedSources(message)
  const tools = buildTools(allowWeb)

  const instructions = `${SYSTEM_PROMPT}\n\nVERIFIED TOP LITE KNOWLEDGE FOR THIS TURN:\n${knowledgeBlock}\n\nTRUSTED SOURCE REGISTRY FOR THIS TURN:\n${trustedBlock}`

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-5.6-terra',
    instructions,
    input: message,
    tools,
    reasoning: { effort: process.env.OPENAI_REASONING_EFFORT || 'low' },
    max_output_tokens: Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 700),
    store: true,
  }

  if (previousResponseId) body.previous_response_id = previousResponseId
  if (tools.some((tool) => tool.type === 'web_search')) {
    body.include = ['web_search_call.action.sources']
    if (tools.some((tool) => tool.type === 'file_search')) body.include.push('file_search_call.results')
  } else if (tools.some((tool) => tool.type === 'file_search')) {
    body.include = ['file_search_call.results']
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number(process.env.OPENAI_AGENT_TIMEOUT_MS || 22000))

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = data?.error?.message || `OpenAI agent failed (${response.status})`
      return send(res, response.status >= 500 ? 502 : response.status, { error: message })
    }

    const text = extractText(data)
    if (!text) return send(res, 502, { error: 'STORM returned an empty response' })

    const webSources = extractWebSources(data)
    return send(res, 200, {
      text,
      responseId: data.id || null,
      source: 'openai-responses-agent',
      provider: 'openai',
      model: data.model || body.model,
      mode: webSources.length ? 'agent-web' : 'agent',
      grounded: knowledge.length > 0 || webSources.length > 0 || Boolean(process.env.OPENAI_NIUE_VECTOR_STORE_ID),
      knowledgeHits: knowledge,
      webSources,
      trustedSources: trusted,
    })
  } catch (error) {
    const timedOut = error?.name === 'AbortError'
    return send(res, 502, { error: timedOut ? 'STORM took too long to respond' : 'STORM connection failed' })
  } finally {
    clearTimeout(timeout)
  }
}
