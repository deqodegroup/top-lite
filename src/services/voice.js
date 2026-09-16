let activeAudio = null

export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function stopSpeaking() {
  if (activeAudio) {
    activeAudio.pause()
    activeAudio.src = ''
    activeAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

function speakBrowser(text, { onStart, onEnd, onError } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Speech synthesis unavailable'))
    return Promise.resolve(false)
  }

  return new Promise((resolve) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 0.96
    utterance.lang = 'en-NZ'
    utterance.onstart = () => onStart?.('browser')
    utterance.onend = () => { onEnd?.('browser'); resolve(true) }
    utterance.onerror = (event) => { onError?.(event); resolve(false) }
    window.speechSynthesis.speak(utterance)
  })
}

export async function synthesizeVoice(text) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('STORM voice unavailable')
    return await response.blob()
  } finally {
    window.clearTimeout(timeout)
  }
}

async function playAudioBlob(blob, callbacks = {}) {
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  activeAudio = audio

  return await new Promise((resolve) => {
    audio.onplay = () => callbacks.onStart?.('premium')
    audio.onended = () => {
      URL.revokeObjectURL(url)
      activeAudio = null
      callbacks.onEnd?.('premium')
      resolve(true)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      activeAudio = null
      callbacks.onError?.(new Error('Audio playback failed'))
      resolve(false)
    }
    audio.play().catch((error) => {
      URL.revokeObjectURL(url)
      activeAudio = null
      callbacks.onError?.(error)
      resolve(false)
    })
  })
}

export async function speak(text, callbacks = {}) {
  stopSpeaking()
  try {
    const blob = await synthesizeVoice(text)
    const ok = await playAudioBlob(blob, callbacks)
    return ok || speakBrowser(text, callbacks)
  } catch {
    return speakBrowser(text, callbacks)
  }
}
