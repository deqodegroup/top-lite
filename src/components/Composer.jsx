import { ArrowUp, AudioLines, Mic, MicOff } from 'lucide-react'

export default function Composer({ value, onChange, onSubmit, listening, onMic, canListen, onTalk, busy }) {
  function submit(e) {
    e.preventDefault()
    if (value.trim() && !busy) onSubmit()
  }

  return (
    <form className="composer" onSubmit={submit}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message..."
        aria-label="Message STORM"
      />

      <button
        className={`composer__mic ${listening ? 'is-listening' : ''}`}
        type="button"
        onClick={onMic}
        aria-label={canListen ? (listening ? 'Stop listening' : 'Use microphone') : 'Microphone recognition unavailable'}
        title={canListen ? (listening ? 'Stop listening' : 'Speak to STORM') : 'Speech recognition is not supported by this browser'}
      >
        {listening ? <MicOff size={21}/> : <Mic size={21}/>} 
      </button>

      {value.trim() ? (
        <button className="composer__send" type="submit" disabled={busy} aria-label="Send message">
          <ArrowUp size={20}/>
        </button>
      ) : (
        <button className={`composer__talk ${listening ? 'is-listening' : ''}`} type="button" onClick={onTalk} disabled={!canListen || busy} aria-label="Talk to STORM">
          <AudioLines size={23}/><span>Talk</span>
        </button>
      )}
    </form>
  )
}
