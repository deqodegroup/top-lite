const MODEL_PROVIDERS = {
  openrouterFree: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    key: () => process.env.OPENROUTER_API_KEY,
    model: () => process.env.STORM_FREE_MODEL || 'openrouter/free',
    headers: (key) => ({
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.STORM_APP_URL || 'https://top-lite-djrevos-projects.vercel.app',
      'X-Title': 'TOP Lite STORM',
    }),
    body: ({ model, messages }) => ({ model, messages, temperature: 0.2 }),
    parse: (data) => data?.choices?.[0]?.message?.content,
  },
  gateway: {
    url: 'https://ai-gateway.vercel.sh/v1/chat/completions',
    key: () => process.env.AI_GATEWAY_API_KEY,
    model: () => process.env.STORM_MODEL || 'openai/gpt-4o-mini',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }),
    body: ({ model, messages }) => ({ model, messages, temperature: 0.2 }),
    parse: (data) => data?.choices?.[0]?.message?.content,
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

const WEB_CACHE_TTL_MS = 10 * 60 * 1000
const webCache = new Map()

function cacheKey(query) {
  return String(query || '').trim().toLowerCase()
}

function getCachedWeb(query) {
  const key = cacheKey(query)
  const cached = webCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.savedAt > WEB_CACHE_TTL_MS) {
    webCache.delete(key)
    return null
  }
  return cached.results
}

function setCachedWeb(query, results) {
  const key = cacheKey(query)
  if (!key || !results.length) return
  webCache.set(key, { savedAt: Date.now(), results })
  if (webCache.size > 100) {
    const oldest = webCache.keys().next().value
    webCache.delete(oldest)
  }
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
  const preferred = (process.env.STORM_PROVIDER || 'openrouterFree').toLowerCase()
  const aliases = { openrouter: 'openrouterFree', free: 'openrouterFree' }
  const normalizedPreferred = aliases[preferred] || preferred
  const order = [normalizedPreferred, 'openrouterFree', 'gateway', 'openai', 'anthropic', 'xai'].filter((v, i, a) => a.indexOf(v) === i)
  const errors = []

  for (const name of order) {
    const provider = MODEL_PROVIDERS[name]
    if (!provider) continue
    try {
      return await runDirect(name, provider, messages)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : `${name}:failed`)
    }
  }

  throw new Error(`No STORM model provider available${errors.length ? ` (${errors.join(', ')})` : ''}`)
}

function normalizeWebResult(item, provider) {
  return {
    title: item.title || item.name || 'Web result',
    url: item.url || item.link,
    content: item.content || item.description || item.snippet || '',
    score: item.score ?? null,
    provider,
    searchedAt: new Date().toISOString(),
    cache: 'miss',
  }
}

async function searchSearxng(query) {
  const base = String(process.env.SEARXNG_BASE_URL || '').replace(/\/$/, '')
  if (!base) return []
  try {
    const url = `${base}/search?q=${encodeURIComponent(query)}&format=json&language=en-US&safesearch=1`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return []
    const data = await response.json().catch(() => ({}))
    return (data.results || []).slice(0, 6).map((item) => normalizeWebResult(item, 'searxng'))
  } catch {
    return []
  }
}

function flattenDuckDuckGoTopics(topics = [], output = []) {
  for (const item of topics) {
    if (item?.Topics) flattenDuckDuckGoTopics(item.Topics, output)
    else if (item?.FirstURL && item?.Text) output.push(item)
    if (output.length >= 6) break
  }
  return output
}

async function searchDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1&skip_disambig=1`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) return []
    const data = await response.json().catch(() => ({}))
    const results = []
    if (data.AbstractText && data.AbstractURL) {
      results.push(normalizeWebResult({ title: data.Heading || query, url: data.AbstractURL, content: data.AbstractText }, 'duckduckgo'))
    }
    for (const item of flattenDuckDuckGoTopics(data.RelatedTopics || [])) {
      if (results.length >= 6) break
      results.push(normalizeWebResult({ title: item.Text?.split(' - ')[0] || query, url: item.FirstURL, content: item.Text }, 'duckduckgo'))
    }
    return results
  } catch {
    return []
  }
}

async function searchBrave(query) {
  const key = process.env.BRAVE_SEARCH_API_KEY
  if (!key) return []
  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=6`, {
      headers: { Accept: 'application/json', 'X-Subscription-Token': key },
    })
    if (!response.ok) return []
    const data = await response.json().catch(() => ({}))
    return (data.web?.results || []).slice(0, 6).map((item) => normalizeWebResult(item, 'brave'))
  } catch {
    return []
  }
}

async function searchTavily(query) {
  const key = process.env.TAVILY_API_KEY
  if (!key) return []
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: key, query, search_depth: 'basic', max_results: 6, include_answer: false }),
    })
    if (!response.ok) return []
    const data = await response.json().catch(() => ({}))
    return (data.results || []).slice(0, 6).map((item) => normalizeWebResult(item, 'tavily'))
  } catch {
    return []
  }
}

export async function searchWeb(query) {
  if (!query) return []
  const cached = getCachedWeb(query)
  if (cached) return cached.map((item) => ({ ...item, cache: 'hit' }))

  const providers = [searchSearxng, searchDuckDuckGo, searchBrave, searchTavily]
  for (const provider of providers) {
    const results = await provider(query)
    if (results.length) {
      setCachedWeb(query, results)
      return results
    }
  }

  return []
}
