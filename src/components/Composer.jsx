import { ArrowUp, AudioLines, Mic, MicOff, Square } from 'lucide-react'

export default function Composer({ value, onChange, onSubmit, listening, onMic, canListen, onTalk, busy, voiceSession = false, speaking = false }) {
  function submit(e) {
    e.preventDefault()
    if (value.trim() && !busy) onSubmit()
  }

  const voiceActive = voiceSession || listening || speaking

  return (
    <form className="composer" onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={voiceSession ? 'Voice conversation active…' : 'Message STORM…'}
        aria-label="Message STORM"
      />

      <button
        className={`composer__mic ${listening ? 'is-listening' : ''}`}
        type="button"
        onClick={onMic}
        disabled={!canListen || busy}
        aria-label={canListen ? (listening ? 'Pause listening' : 'Use microphone') : 'Microphone recognition unavailable'}
        title={canListen ? (listening ? 'Pause listening' : 'Speak to STORM') : 'Speech recognition is not supported by this browser'}
      >
        {listening ? <MicOff size={21}/> : <Mic size={21}/>} 
      </button>

      {value.trim() && !voiceSession ? (
        <button className="composer__send" type="submit" disabled={busy} aria-label="Send message">
          <ArrowUp size={20}/>
        </button>
      ) : (
        <button
          className={`composer__talk ${voiceActive ? 'is-listening' : ''}`}
          type="button"
          onClick={onTalk}
          disabled={!canListen || busy}
          aria-label={voiceSession ? 'End voice conversation' : 'Start voice conversation'}
          title={voiceSession ? 'End voice conversation' : 'Start voice conversation'}
        >
          {voiceSession ? <Square size={18}/> : <AudioLines size={23}/>}
          <span>{voiceSession ? 'End' : 'Talk'}</span>
        </button>
      )}
    </form>
  )
}
