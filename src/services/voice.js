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

export async function speak(text, callbacks = {}) {
  stopSpeaking()

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) throw new Error('Premium voice unavailable')
    const blob = await response.blob()
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
        resolve(false)
      }
      audio.play().catch(() => resolve(false))
    }).then(async (ok) => ok || speakBrowser(text, callbacks))
  } catch {
    return speakBrowser(text, callbacks)
  }
}
