import { routeStormMessage } from '../core/stormRouter'

export async function askStorm({ message, history = [], verifiedContext = '' }) {
  try {
    const response = await fetch('/api/storm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, verifiedContext }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.text) throw new Error(data.error || 'STORM runtime unavailable')

    return {
      text: data.text,
      source: 'opendex-gateway',
      grounded: Boolean(data.grounded),
      model: data.model,
    }
  } catch (error) {
    const fallback = await routeStormMessage({ text: message, language: 'niu' })
    return {
      text: fallback,
      source: 'local-fallback',
      grounded: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
