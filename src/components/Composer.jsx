import { ArrowUp, Mic, MicOff, Volume2 } from 'lucide-react'

export default function Composer({ value, onChange, onSubmit, listening, onMic, canListen, onVoiceMode }) {
  function submit(e) {
    e.preventDefault()
    if (value.trim()) onSubmit()
  }

  return (
    <form className="composer" onSubmit={submit}>
      <button
        className={`composer__voice ${listening ? 'is-listening' : ''}`}
        type="button"
        onClick={onMic}
        aria-label={canListen ? 'Use microphone' : 'Microphone recognition unavailable'}
        title={canListen ? 'Speak to STORM' : 'Speech recognition is not supported by this browser'}
      >
        {listening ? <MicOff size={20}/> : <Mic size={20}/>} 
      </button>
      <textarea
        rows="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Message STORM…"
        aria-label="Message STORM"
      />
      <button className="composer__listen" type="button" onClick={onVoiceMode} aria-label="Voice mode"><Volume2 size={19}/></button>
      <button className="composer__send" type="submit" disabled={!value.trim()} aria-label="Send"><ArrowUp size={19}/></button>
    </form>
  )
}
