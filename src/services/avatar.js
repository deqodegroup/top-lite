const DEFAULT_SESSION_MS = 5 * 60 * 1000
const HARD_SESSION_MS = 10 * 60 * 1000

function runtimeBase() {
  return String(import.meta.env.VITE_AVATAR_API_URL || '').replace(/\/$/, '')
}

export function avatarRuntimeConfigured() {
  return Boolean(runtimeBase() && import.meta.env.VITE_AVATAR_ID)
}

export function avatarConfig() {
  return {
    baseUrl: runtimeBase(),
    avatarId: import.meta.env.VITE_AVATAR_ID || '',
    sessionMs: Number(import.meta.env.VITE_AVATAR_SESSION_MS || DEFAULT_SESSION_MS),
    hardSessionMs: Number(import.meta.env.VITE_AVATAR_HARD_SESSION_MS || HARD_SESSION_MS),
  }
}

export async function checkAvatarRuntime(signal) {
  const { baseUrl } = avatarConfig()
  if (!baseUrl) return { ready: false, reason: 'not-configured' }

  try {
    const response = await fetch(`${baseUrl}/health`, { signal })
    if (!response.ok) return { ready: false, reason: `health-${response.status}` }
    const data = await response.json().catch(() => ({}))
    return { ready: Boolean(data.ready ?? data.ok ?? data.model_loaded ?? true), data }
  } catch (error) {
    return { ready: false, reason: error instanceof Error ? error.message : 'offline' }
  }
}

// ICM boundary: TOP Lite owns intelligence + voice. The avatar runtime only animates
// approved audio against a preprocessed face. No language or model logic belongs here.
export async function renderAvatarAudio(audioBlob, { signal } = {}) {
  const { baseUrl, avatarId } = avatarConfig()
  if (!baseUrl || !avatarId) throw new Error('Avatar runtime is not configured')

  const form = new FormData()
  form.append('audio_file', audioBlob, 'storm.mp3')

  const response = await fetch(`${baseUrl}/inference/batch/${encodeURIComponent(avatarId)}`, {
    method: 'POST',
    body: form,
    signal,
  })

  if (!response.ok) throw new Error(`Avatar runtime failed (${response.status})`)
  return response.blob()
}
