import { useMemo, useRef, useState } from 'react'
import { History, Menu, Plus, X } from 'lucide-react'
import TopMark from './components/TopMark'
import LanguagePicker from './components/LanguagePicker'
import StormOrb from './components/StormOrb'
import Composer from './components/Composer'
import { getSpeechRecognition, speak, stopSpeaking } from './services/voice'
import { askStorm } from './services/stormAgent'

const starters = [
  'Teach me a greeting',
  'Help me practise pronunciation',
  'Translate a simple phrase',
  'Tell me something about Niue culture',
]

const stateLabels = {
  idle: 'Ready',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
}

export default function App() {
  const [language, setLanguage] = useState('niu')
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

  function updateState(next) {
    stateRef.current = next
    setState(next)
  }

  function updateMessages(updater) {
    setMessages((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      messagesRef.current = next
      return next
    })
  }

  function setVoiceSessionActive(active) {
    voiceSessionRef.current = active
    setVoiceSession(active)
  }

  function clearRestartTimer() {
    if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current)
    restartTimerRef.current = null
  }

  function scheduleListen(delay = 140) {
    clearRestartTimer()
    if (!voiceSessionRef.current) return
    restartTimerRef.current = window.setTimeout(() => startListening({ auto: true }), delay)
  }

  async function sendMessage(text = input, { speakReply = false } = {}) {
    const clean = text.trim()
    if (!clean || stateRef.current === 'thinking') return

    clearRestartTimer()
    stopSpeaking()
    const history = messagesRef.current
    updateMessages((prev) => [...prev, { role: 'user', text: clean }])
    setInput('')
    updateState('thinking')

    const result = await askStorm({ message: clean, history, allowWeb: true })
    const reply = result.text
    updateMessages((prev) => [
      ...prev,
      {
        role: 'storm',
        text: reply,
        source: result.source,
        grounded: result.grounded,
        webSources: result.webSources || [],
      },
    ])

    if (!speakReply && !voiceSessionRef.current) {
      updateState('idle')
      return
    }

    await speak(reply, {
      onStart: () => updateState('speaking'),
      onEnd: () => {
        updateState('idle')
        scheduleListen()
      },
      onError: () => {
        updateState('idle')
        scheduleListen(260)
      },
    })
  }

  function startListening({ auto = false } = {}) {
    if (!Recognition || stateRef.current === 'thinking') return
    clearRestartTimer()

    if (stateRef.current === 'speaking') {
      stopSpeaking()
      updateState('idle')
    }

    if (recognitionRef.current) {
      if (!auto) {
        try { recognitionRef.current.stop() } catch {}
      }
      return
    }

    if (!auto) setVoiceSessionActive(true)
    stopSpeaking()

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language === 'niu' ? 'en-NZ' : 'en-US'
    let submitted = false

    recognition.onstart = () => {
      setListening(true)
      updateState('listening')
    }

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')
        .trim()
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
      recognitionRef.current = null
      setListening(false)
      updateState('idle')
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceSessionActive(false)
      } else {
        scheduleListen(450)
      }
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)
      if (stateRef.current === 'listening') updateState('idle')
      if (!submitted && voiceSessionRef.current) scheduleListen(220)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setListening(false)
      updateState('idle')
      scheduleListen(400)
    }
  }

  function endVoiceSession() {
    clearRestartTimer()
    setVoiceSessionActive(false)
    stopSpeaking()
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setListening(false)
    updateState('idle')
  }

  function handleTalk() {
    voiceSessionRef.current ? endVoiceSession() : startListening()
  }

  function newChat() {
    endVoiceSession()
    updateMessages([])
    setInput('')
    setShowHistory(false)
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <aside className="rail" aria-label="TOP Lite navigation">
        <button className="rail__logo" type="button" aria-label="TOP Lite home" onClick={newChat}>
          <TopMark compact />
        </button>
        <div className="rail__actions">
          <button type="button" aria-label="New chat" onClick={newChat}><Plus size={19} /></button>
          <button type="button" aria-label="History" onClick={() => setShowHistory(true)}><History size={18} /></button>
        </div>
        <button className="rail__menu" type="button" aria-label="Menu"><Menu size={18} /></button>
      </aside>

      <section className="workspace">
        <header className="workspace__header">
          <div className="workspace__title">
            <span>TOP Lite</span>
            <small>Powered by STORM</small>
          </div>
          <div className="workspace__tools">
            <span className={`status-pill status-pill--${state}`}><i />{stateLabels[state]}</span>
            <LanguagePicker selected={language} onChange={setLanguage} />
          </div>
        </header>

        <div className={`chat-canvas ${messages.length ? 'chat-canvas--active' : ''}`}>
          {messages.length === 0 ? (
            <div className="welcome-state">
              <div className="storm-presence">
                <StormOrb state={state} />
              </div>
              <div className="welcome-copy">
                <span className="eyebrow">Vagahau Niue · voice + chat</span>
                <h1>Fakaalofa lahi atu.</h1>
                <p>Talk naturally with STORM. Learn, listen and practise at your own pace.</p>
              </div>
              <div className="starter-grid">
                {starters.map((starter) => (
                  <button key={starter} type="button" onClick={() => sendMessage(starter)} disabled={thinking}>
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="thread" aria-live="polite">
              {messages.map((message, index) => (
                <article key={`${message.role}-${index}`} className={`thread-row thread-row--${message.role}`}>
                  {message.role === 'storm' && (
                    <div className="thread-avatar" aria-hidden="true">
                      <span className={`thread-avatar__orb thread-avatar__orb--${state}`} />
                    </div>
                  )}
                  <div className="thread-message">
                    {message.role === 'storm' && <strong>STORM</strong>}
                    <p>{message.text}</p>
                    {message.role === 'storm' && message.webSources?.length > 0 && (
                      <div className="thread-sources">
                        {message.webSources.slice(0, 3).map((source) => (
                          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {thinking && (
                <article className="thread-row thread-row--storm">
                  <div className="thread-avatar"><span className="thread-avatar__orb thread-avatar__orb--thinking" /></div>
                  <div className="thinking-dots" aria-label="STORM is thinking"><span /><span /><span /></div>
                </article>
              )}
            </div>
          )}
        </div>

        <footer className="composer-dock">
          {voiceSession && (
            <div className="voice-banner">
              <span className="voice-banner__pulse" />
              Live voice conversation with STORM
              <button type="button" onClick={endVoiceSession}>End</button>
            </div>
          )}
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={() => sendMessage(input, { speakReply: false })}
            listening={listening}
            onMic={() => startListening()}
            canListen={Boolean(Recognition)}
            onTalk={handleTalk}
            busy={thinking}
            voiceSession={voiceSession}
            speaking={state === 'speaking'}
          />
          <p className="composer-note">STORM can make mistakes. Language content should be community validated.</p>
        </footer>
      </section>

      {showHistory && (
        <aside className="history-panel" aria-label="Conversation history">
          <div className="history-panel__head">
            <div><strong>History</strong><small>Current session</small></div>
            <button type="button" onClick={() => setShowHistory(false)} aria-label="Close history"><X size={18} /></button>
          </div>
          {messages.length === 0 ? (
            <p className="history-empty">No conversation yet.</p>
          ) : (
            messages.map((message, index) => (
              <div key={`history-${index}`} className="history-item">
                <small>{message.role === 'storm' ? 'STORM' : 'You'}</small>
                <p>{message.text}</p>
              </div>
            ))
          )}
        </aside>
      )}
    </main>
  )
}
