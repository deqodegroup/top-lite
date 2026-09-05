export function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}

export function speak(text, { onStart, onEnd, onError } = {}) {
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
    utterance.onstart = () => onStart?.()
    utterance.onend = () => { onEnd?.(); resolve(true) }
    utterance.onerror = (event) => { onError?.(event); resolve(false) }
    window.speechSynthesis.speak(utterance)
  })
}
