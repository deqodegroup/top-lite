// Provider-neutral client for machine translation. The UI knows nothing about Google.
// Niue is never routed here — it stays on the verified STORM agent.

export async function getMachineLanguages(signal) {
  try {
    const response = await fetch('/api/translate', { signal })
    const data = await response.json().catch(() => ({}))
    return response.ok && data.configured && Array.isArray(data.languages) ? data.languages : []
  } catch {
    return []
  }
}

export async function translateMachine({ text, target }) {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, target }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.translation) throw new Error(data.error || 'Translation unavailable')
  return { text: data.translation, language: data.language, provider: data.provider, verified: false }
}
