import { ArrowUp, Mic, MicOff, Volume2 } from 'lucide-react'

export default function Composer({ value, onChange, onSubmit, listening, onMic, canListen, onVoiceMode }) {
  function submit(event) {
    event.preventDefault()
    if (value.trim()) onSubmit()
  }

  function onKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (value.trim()) onSubmit()
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <button
        className={`composer__control ${listening ? 'is-listening' : ''}`}
        type="button"
        onClick={onMic}
        disabled={!canListen}
        aria-label={canListen ? (listening ? 'Stop listening' : 'Speak to STORM') : 'Microphone recognition unavailable'}
        title={canListen ? 'Speak to STORM' : 'Speech recognition is not supported by this browser'}
      >
        {listening ? <MicOff size={19} strokeWidth={1.8}/> : <Mic size={19} strokeWidth={1.8}/>} 
      </button>

      <textarea
        rows="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Message STORM"
        aria-label="Message STORM"
      />

      <button className="composer__control" type="button" onClick={onVoiceMode} aria-label="Play STORM voice">
        <Volume2 size={18} strokeWidth={1.8}/>
      </button>

      <button className="composer__send" type="submit" disabled={!value.trim()} aria-label="Send message">
        <ArrowUp size={18} strokeWidth={2}/>
      </button>
    </form>
  )
}
