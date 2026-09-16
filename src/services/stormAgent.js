import { routeStormMessage } from '../core/stormRouter'

export async function askStorm({ message, previousResponseId = null, allowWeb = true }) {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, previousResponseId, allowWeb }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.text) throw new Error(data.error || 'STORM agent unavailable')

    return {
      text: data.text,
      responseId: data.responseId || null,
      source: data.source || 'openai-responses-agent',
      grounded: Boolean(data.grounded),
      provider: data.provider || 'openai',
      model: data.model || null,
      mode: data.mode || 'agent',
      knowledgeHits: data.knowledgeHits || [],
      webSources: data.webSources || [],
      trustedSources: data.trustedSources || [],
    }
  } catch (error) {
    const fallback = await routeStormMessage({ text: message, language: 'niu' })
    return {
      text: fallback,
      responseId: null,
      source: 'local-fallback',
      grounded: false,
      provider: null,
      model: null,
      mode: 'local-fallback',
      knowledgeHits: [],
      webSources: [],
      trustedSources: [],
      error: error instanceof Error ? error.message : 'STORM agent unavailable',
    }
  }
}
