import { generateText } from 'ai'

const PROVIDERS = {
  gateway: {
    model: () => process.env.STORM_MODEL || 'openai/gpt-4o-mini',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: () => process.env.OPENAI_API_KEY,
    model: () => process.env.STORM_MODEL || 'gpt-4o-mini',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    body: ({ model, messages }) => ({ model, messages, temperature: 0.2 }),
    parse: (data) => data?.choices?.[0]?.message?.content,
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    key: () => process.env.ANTHROPIC_API_KEY,
    model: () => process.env.STORM_MODEL || 'claude-3-5-haiku-latest',
    headers: (key) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }),
    body: ({ model, messages }) => {
      const system = messages.find((m) => m.role === 'system')?.content || ''
      const rest = messages.filter((m) => m.role !== 'system')
      return { model, max_tokens: 500, system, messages: rest, temperature: 0.2 }
    },
    parse: (data) => data?.content?.find((x) => x.type === 'text')?.text,
  },
  xai: {
    url: 'https://api.x.ai/v1/chat/completions',
    key: () => process.env.XAI_API_KEY,
    model: () => process.env.STORM_MODEL || 'grok-4-fast-reasoning',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    body: ({ model, messages }) => ({ model, messages, temperature: 0.2 }),
    parse: (data) => data?.choices?.[0]?.message?.content,
  },
}

async function runGateway(messages) {
  const model = PROVIDERS.gateway.model()
  const result = await generateText({
    model,
    messages,
    temperature: 0.2,
    maxOutputTokens: 500,
  })
  const text = result.text?.trim()
  if (!text) throw new Error('gateway:empty')
  return { text, provider: 'gateway', model }
}

async function runDirect(name, provider, messages) {
  const key = provider.key()
  if (!key) throw new Error(`${name}:missing-key`)
  const model = provider.model()
  const response = await fetch(provider.url, {
    method: 'POST',
    headers: provider.headers(key),
    body: JSON.stringify(provider.body({ model, messages })),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`${name}:${response.status}`)
  const text = provider.parse(data)?.trim()
  if (!text) throw new Error(`${name}:empty`)
  return { text, provider: name, model: data?.model || model }
}

export async function runModel(messages) {
  const preferred = (process.env.STORM_PROVIDER || 'gateway').toLowerCase()
  const order = [preferred, 'gateway', 'openai', 'anthropic', 'xai'].filter((v, i, a) => a.indexOf(v) === i)
  const errors = []

  for (const name of order) {
    const provider = PROVIDERS[name]
    if (!provider) continue
    try {
      if (name === 'gateway') return await runGateway(messages)
      return await runDirect(name, provider, messages)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${name}:failed`)
    }
  }

  throw new Error(`No STORM model provider available${errors.length ? ` (${errors.join(', ')})` : ''}`)
}

export async function searchWeb(query) {
  const key = process.env.TAVILY_API_KEY
  if (!key || !query) return []

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return []
    return (data.results || []).slice(0, 5).map((item) => ({
      title: item.title,
      url: item.url,
      content: item.content,
      score: item.score,
    }))
  } catch {
    return []
  }
}
