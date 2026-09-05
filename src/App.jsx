import { useMemo, useRef, useState } from 'react'
import { History, X } from 'lucide-react'
import TopMark from './components/TopMark'
import LanguagePicker from './components/LanguagePicker'
import StormOrb from './components/StormOrb'
import ModeToggle from './components/ModeToggle'
import Composer from './components/Composer'
import { getSpeechRecognition, speak, stopSpeaking } from './services/voice'
import { askStorm } from './services/stormAgent'

const quickActions = [
  { label: 'Learn a phrase', prompt: 'Teach me a verified beginner Vagahau Niue phrase.' },
  { label: 'Practise speaking', prompt: 'Help me practise the pronunciation of a verified Vagahau Niue phrase.' },
]

const stateLabels = {
  idle: 'Ready to listen',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
}

export default function App() {
  const [language, setLanguage] = useState('niu')
  const [mode, setMode] = useState('voice')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [state, setState] = useState('idle')
  const [listening, setListening] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const recognitionRef = useRef(null)
  const Recognition = useMemo(() => getSpeechRecognition(), [])
  const busy = state === 'thinking' || state === 'speaking'

  async function sendMessage(text = input, { speakReply = true } = {}) {
    const clean = text.trim()
    if (!clean || busy) return

    stopSpeaking()
    const history = messages
    setMessages((prev) => [...prev, { role: 'user', text: clean }])
    setInput('')
    setState('thinking')

    const result = await askStorm({ message: clean, history })
    const reply = result.text
    setMessages((prev) => [...prev, { role: 'storm', text: reply, source: result.source, grounded: result.grounded }])

    if (!speakReply) {
      setState('idle')
      return
    }

    await speak(reply, {
      onStart: () => setState('speaking'),
      onEnd: () => setState('idle'),
      onError: () => setState('idle'),
    })
  }

  function startListening() {
    if (!Recognition || busy) return

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    stopSpeaking()
    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-NZ'

    recognition.onstart = () => {
      setListening(true)
      setState('listening')
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('').trim()
      setInput(transcript)
      const finalResult = event.results[event.results.length - 1]
      if (finalResult?.isFinal && transcript) {
        window.setTimeout(() => sendMessage(transcript, { speakReply: true }), 120)
      }
    }

    recognition.onerror = () => {
      setListening(false)
      setState('idle')
    }

    recognition.onend = () => {
      setListening(false)
      setState((current) => current === 'listening' ? 'idle' : current)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  function toggleHistory() {
    setShowHistory((value) => !value)
  }

  return (
    <main className="app-shell">
      <div className="ambient-light ambient-light--left" />
      <div className="ambient-light ambient-light--right" />

      <header className="topbar">
        <TopMark />
        <div className="topbar__right">
          <LanguagePicker selected={language} onChange={setLanguage} />
          <button className="glass-icon" type="button" onClick={toggleHistory} aria-label="Conversation history">
            <History size={18} strokeWidth={1.8}/>
          </button>
        </div>
      </header>

      <section className="storm-stage">
        <StormOrb state={state} />

        <div className="storm-identity">
          <h1>STORM</h1>
          <p className={`storm-status storm-status--${state}`}><span />{stateLabels[state]}</p>
        </div>

        <ModeToggle mode={mode} onChange={setMode} />
        {mode === 'avatar' && <p className="avatar-note">Avatar mode shares the same STORM voice session. Visual renderer is the next layer.</p>}

        <div className="quick-actions" aria-label="Quick actions">
          {quickActions.map((action) => (
            <button key={action.label} type="button" onClick={() => sendMessage(action.prompt)} disabled={busy}>
              {action.label}<span>›</span>
            </button>
          ))}
        </div>

        {messages.length > 0 && (
          <div className="conversation" aria-live="polite">
            {messages.slice(-4).map((message, index) => (
              <div key={`${message.role}-${index}`} className={`message message--${message.role}`}>
                {message.role === 'storm' && <span className="message__label">STORM</span>}
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="composer-zone">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage(input, { speakReply: false })}
          listening={listening}
          onMic={startListening}
          canListen={Boolean(Recognition)}
          onTalk={startListening}
          busy={busy}
        />
      </div>

      {showHistory && (
        <aside className="history-panel" aria-label="Conversation history">
          <div className="history-panel__head"><strong>History</strong><button type="button" onClick={toggleHistory} aria-label="Close history"><X size={18}/></button></div>
          {messages.length === 0 ? <p>No conversation yet.</p> : messages.map((message, index) => (
            <div key={`history-${index}`} className="history-item"><small>{message.role === 'storm' ? 'STORM' : 'You'}</small><p>{message.text}</p></div>
          ))}
        </aside>
      )}
    </main>
  )
}
