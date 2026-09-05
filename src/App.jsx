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
const stateLabels = { idle: 'Ready to talk', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Speaking…' }

export default function App() {
  const [language, setLanguage] = useState('niu')
  const [mode, setMode] = useState('voice')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [state, setState] = useState('idle')
  const [listening, setListening] = useState(false)
  const [voiceSession, setVoiceSession] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const recognitionRef = useRef(null)
  const messagesRef = useRef([])
  const voiceSessionRef = useRef(false)
  const stateRef = useRef('idle')
  const restartTimerRef = useRef(null)
  const Recognition = useMemo(() => getSpeechRecognition(), [])
  const thinking = state === 'thinking'

  function updateState(next) { stateRef.current = next; setState(next) }
  function updateMessages(updater) {
    setMessages((prev) => { const next = typeof updater === 'function' ? updater(prev) : updater; messagesRef.current = next; return next })
  }
  function setVoiceSessionActive(active) { voiceSessionRef.current = active; setVoiceSession(active) }
  function clearRestartTimer() { if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current); restartTimerRef.current = null }
  function scheduleListen(delay = 140) {
    clearRestartTimer()
    if (!voiceSessionRef.current) return
    restartTimerRef.current = window.setTimeout(() => startListening({ auto: true }), delay)
  }

  async function sendMessage(text = input, { speakReply = true } = {}) {
    const clean = text.trim()
    if (!clean || stateRef.current === 'thinking') return
    clearRestartTimer(); stopSpeaking()
    const history = messagesRef.current
    updateMessages((prev) => [...prev, { role: 'user', text: clean }])
    setInput(''); updateState('thinking')
    const result = await askStorm({ message: clean, history, allowWeb: true })
    const reply = result.text
    updateMessages((prev) => [...prev, { role: 'storm', text: reply, source: result.source, grounded: result.grounded, webSources: result.webSources || [] }])
    if (!speakReply) { updateState('idle'); return }
    await speak(reply, {
      onStart: () => updateState('speaking'),
      onEnd: () => { updateState('idle'); scheduleListen() },
      onError: () => { updateState('idle'); scheduleListen(260) },
    })
  }

  function startListening({ auto = false } = {}) {
    if (!Recognition || stateRef.current === 'thinking') return
    clearRestartTimer()
    if (stateRef.current === 'speaking') { stopSpeaking(); updateState('idle') }
    if (recognitionRef.current) {
      if (!auto) { try { recognitionRef.current.stop() } catch {} }
      return
    }
    if (!auto) setVoiceSessionActive(true)
    stopSpeaking()
    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language === 'niu' ? 'en-NZ' : 'en-US'
    let submitted = false
    recognition.onstart = () => { setListening(true); updateState('listening') }
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('').trim()
      setInput(transcript)
      const finalResult = event.results[event.results.length - 1]
      if (finalResult?.isFinal && transcript && !submitted) {
        submitted = true
        recognitionRef.current = null
        setListening(false)
        window.setTimeout(() => sendMessage(transcript, { speakReply: true }), 50)
      }
    }
    recognition.onerror = (event) => {
      recognitionRef.current = null; setListening(false); updateState('idle')
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') setVoiceSessionActive(false)
      else scheduleListen(450)
    }
    recognition.onend = () => {
      recognitionRef.current = null; setListening(false)
      if (stateRef.current === 'listening') updateState('idle')
      if (!submitted && voiceSessionRef.current) scheduleListen(220)
    }
    recognitionRef.current = recognition
    try { recognition.start() } catch { recognitionRef.current = null; setListening(false); updateState('idle'); scheduleListen(400) }
  }

  function endVoiceSession() {
    clearRestartTimer(); setVoiceSessionActive(false); stopSpeaking()
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch {}; recognitionRef.current = null }
    setListening(false); updateState('idle')
  }
  function handleTalk() { voiceSessionRef.current ? endVoiceSession() : startListening() }
  function toggleHistory() { setShowHistory((value) => !value) }

  return (
    <main className="app-shell">
      <div className="ambient-light ambient-light--left" /><div className="ambient-light ambient-light--right" />
      <header className="topbar"><TopMark /><div className="topbar__right"><LanguagePicker selected={language} onChange={setLanguage} /><button className="glass-icon" type="button" onClick={toggleHistory} aria-label="Conversation history"><History size={18} strokeWidth={1.8}/></button></div></header>
      <section className="storm-stage">
        <StormOrb state={state} />
        <div className="storm-identity"><h1>STORM</h1><p className={`storm-status storm-status--${state}`}><span />{stateLabels[state]}</p>{voiceSession && <p className="voice-session-note">Live conversation · tap End when finished</p>}</div>
        <ModeToggle mode={mode} onChange={setMode} />
        {mode === 'avatar' && <p className="avatar-note">Avatar mode shares this STORM conversation.</p>}
        <div className="quick-actions" aria-label="Quick actions">{quickActions.map((action) => <button key={action.label} type="button" onClick={() => sendMessage(action.prompt)} disabled={thinking}>{action.label}<span>›</span></button>)}</div>
        {messages.length > 0 && <div className="conversation" aria-live="polite">{messages.slice(-6).map((message, index) => <div key={`${message.role}-${index}`} className={`message message--${message.role}`}>{message.role === 'storm' && <span className="message__label">STORM</span>}<p>{message.text}</p>{message.role === 'storm' && message.webSources?.length > 0 && <div className="message__sources">{message.webSources.slice(0, 3).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>)}</div>}</div>)}</div>}
      </section>
      <div className="composer-zone"><Composer value={input} onChange={setInput} onSubmit={() => sendMessage(input, { speakReply: false })} listening={listening} onMic={() => startListening()} canListen={Boolean(Recognition)} onTalk={handleTalk} busy={thinking} voiceSession={voiceSession} speaking={state === 'speaking'} /></div>
      {showHistory && <aside className="history-panel" aria-label="Conversation history"><div className="history-panel__head"><strong>History</strong><button type="button" onClick={toggleHistory} aria-label="Close history"><X size={18}/></button></div>{messages.length === 0 ? <p>No conversation yet.</p> : messages.map((message, index) => <div key={`history-${index}`} className="history-item"><small>{message.role === 'storm' ? 'STORM' : 'You'}</small><p>{message.text}</p></div>)}</aside>}
    </main>
  )
}
