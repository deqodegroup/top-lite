import { routeStormMessage } from '../core/stormRouter'

async function askWebOnly(message) {
  const response = await fetch('/api/web', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.text) throw new Error(data.error || 'Web fallback unavailable')

  return {
    text: data.text,
    source: 'web-only-fallback',
    grounded: Boolean(data.grounded),
    provider: data.provider,
    model: null,
    mode: data.mode || 'web-only-online',
    knowledgeHits: [],
    webSources: data.webSources || [],
    trustedSources: [],
    sourceRegistry: null,
  }
}

function stormIsOffline(data, response) {
  if (!response.ok || !data?.text) return true
  if (data.mode === 'safe-fallback') return true
  if (data.provider === 'top-lite-safe-fallback') return true
  return false
}

export async function askStorm({ message, history = [], allowWeb }) {
  let stormError = null

  try {
    const response = await fetch('/api/storm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, allowWeb }),
    })

    const data = await response.json().catch(() => ({}))
    if (stormIsOffline(data, response)) throw new Error(data.error || data.runtimeError || 'STORM runtime unavailable')

    return {
      text: data.text,
      source: 'opendex-runtime',
      grounded: Boolean(data.grounded),
      provider: data.provider,
      model: data.model,
      mode: data.mode,
      memoryHits: data.memoryHits || [],
      knowledgeHits: data.knowledgeHits || [],
      webSources: data.webSources || [],
      trustedSources: data.trustedSources || [],
      sourceRegistry: data.sourceRegistry || null,
    }
  } catch (error) {
    stormError = error
  }

  if (allowWeb !== false) {
    try {
      return await askWebOnly(message)
    } catch {}
  }

  const fallback = await routeStormMessage({ text: message, language: 'niu' })
  return {
    text: fallback,
    source: 'local-fallback',
    grounded: false,
    memoryHits: [],
    knowledgeHits: [],
    webSources: [],
    trustedSources: [],
    sourceRegistry: null,
    error: stormError instanceof Error ? stormError.message : String(stormError || 'STORM runtime unavailable'),
  }
}
