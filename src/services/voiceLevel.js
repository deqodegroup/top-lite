// Live voice level (0..1) for the STORM orb. Analysis only: the audio graph that plays the voice
// is never re-routed, so a failure here can never silence STORM.

export const voiceLevel = { current: 0 }

export function startLevelMeter(audio) {
  let ctx = null
  let raf = 0
  let analyser = null
  let bins = null
  const t0 = performance.now()

  try {
    if (typeof audio.captureStream === 'function') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      ctx = new AudioCtx()
      ctx.resume?.().catch(() => {})
      analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      bins = new Uint8Array(analyser.frequencyBinCount)
      ctx.createMediaStreamSource(audio.captureStream()).connect(analyser)
    }
  } catch {
    analyser = null
  }

  const loop = () => {
    if (analyser && ctx?.state === 'running') {
      analyser.getByteFrequencyData(bins)
      let sum = 0
      for (let i = 0; i < 28; i++) sum += bins[i]
      voiceLevel.current = Math.min(1, sum / 28 / 118)
    } else {
      // No analysable audio (e.g. Safari): a gentle speech-like swell instead of a flat orb.
      const t = (performance.now() - t0) / 1000
      voiceLevel.current = 0.28 + 0.14 * Math.sin(t * 7) * Math.sin(t * 2.3)
    }
    raf = requestAnimationFrame(loop)
  }
  loop()

  return function stop() {
    cancelAnimationFrame(raf)
    voiceLevel.current = 0
    try { ctx?.close() } catch { /* already closed */ }
  }
}

// Browser speech synthesis exposes no audio, so use the same gentle swell.
export function startSyntheticLevel() {
  const t0 = performance.now()
  let raf = 0
  const loop = () => {
    const t = (performance.now() - t0) / 1000
    voiceLevel.current = 0.28 + 0.14 * Math.sin(t * 7) * Math.sin(t * 2.3)
    raf = requestAnimationFrame(loop)
  }
  loop()
  return function stop() { cancelAnimationFrame(raf); voiceLevel.current = 0 }
}
