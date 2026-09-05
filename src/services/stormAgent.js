import { routeStormMessage } from '../core/stormRouter'

export async function askStorm({ message, history = [], allowWeb }) {
  try {
    const response = await fetch('/api/storm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, allowWeb }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.text) throw new Error(data.error || 'STORM runtime unavailable')

    return {
      text: data.text,
      source: 'opendex-runtime',
      grounded: Boolean(data.grounded),
      provider: data.provider,
      model: data.model,
      mode: data.mode,
      knowledgeHits: data.knowledgeHits || [],
      webSources: data.webSources || [],
      trustedSources: data.trustedSources || [],
      sourceRegistry: data.sourceRegistry || null,
    }
  } catch (error) {
    const fallback = await routeStormMessage({ text: message, language: 'niu' })
    return {
      text: fallback,
      source: 'local-fallback',
      grounded: false,
      knowledgeHits: [],
      webSources: [],
      trustedSources: [],
      sourceRegistry: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
