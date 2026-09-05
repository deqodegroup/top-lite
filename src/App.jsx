import { useMemo, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import TopMark from './components/TopMark'
import LanguagePicker from './components/LanguagePicker'
import StormOrb from './components/StormOrb'
import Composer from './components/Composer'
import { getSpeechRecognition, speak } from './services/voice'
import { routeStormMessage } from './core/stormRouter'

const starters = ['Teach me a greeting', 'Help with pronunciation', 'Translate a phrase', 'Tell me about Niue culture']

export default function App() {
  const [language, setLanguage] = useState('niu')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [state, setState] = useState('idle')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const Recognition = useMemo(() => getSpeechRecognition(), [])

  async function sendMessage(text = input) {
    const clean = text.trim()
    if (!clean) return
    setMessages((prev) => [...prev, { role: 'user', text: clean }])
    setInput('')
    setState('thinking')
    const reply = await routeStormMessage({ text: clean, language })
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'storm', text: reply }])
      setState('speaking')
      speak(reply)
      window.setTimeout(() => setState('idle'), 1600)
    }, 360)
  }

  function startListening() {
    if (!Recognition) return
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }
    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-NZ'
    recognition.onstart = () => { setListening(true); setState('listening') }
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('')
      setInput(transcript)
    }
    recognition.onerror = () => { setListening(false); setState('idle') }
    recognition.onend = () => { setListening(false); setState('idle') }
    recognitionRef.current = recognition
    recognition.start()
  }

  function voiceMode() {
    const text = messages.length ? messages[messages.length - 1]?.text : 'Fakaalofa lahi atu. I’m STORM.'
    setState('speaking')
    speak(text)
    window.setTimeout(() => setState('idle'), 1600)
  }

  return (
    <main className="app-shell">
      <div className="ocean-wash ocean-wash--left" />
      <div className="ocean-wash ocean-wash--right" />

      <header className="topbar">
        <TopMark />
        <div className="topbar__right">
          <LanguagePicker selected={language} onChange={setLanguage} />
          <button className="glass-icon" type="button" aria-label="Menu"><Menu size={18}/></button>
        </div>
      </header>

      <section className="stage">
        <div className="identity-line">
          <span>POWERED BY</span>
          <strong>STORM</strong>
          <small>PEOPLE · LANGUAGE · OCEAN · FUTURE</small>
        </div>

        <StormOrb state={state} />

        <div className="stage-copy">
          <p className="stage-kicker">LISTEN · LEARN · SPEAK · PRESERVE</p>
          <h1>A living language.<br/>A brighter tomorrow.</h1>
          <p className="stage-sub">Your cultural language companion for Vagahau Niue.</p>
        </div>

        <div className="conversation">
          {messages.length > 0 && (
            <div className="message-list" aria-live="polite">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`message message--${message.role}`}>
                  {message.role === 'storm' && <span className="message__label">STORM</span>}
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="starter-row">
          {starters.map((starter) => (
            <button key={starter} type="button" onClick={() => sendMessage(starter)}>{starter}</button>
          ))}
        </div>
      </section>

      <div className="composer-zone">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={() => sendMessage()}
          listening={listening}
          onMic={startListening}
          canListen={Boolean(Recognition)}
          onVoiceMode={voiceMode}
        />
        <p className="footnote">TOP Lite · Vagahau Niue first · Community validation remains essential</p>
      </div>
    </main>
  )
}
