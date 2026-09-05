import { useMemo, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import TopMark from './components/TopMark'
import LanguagePicker from './components/LanguagePicker'
import StormOrb from './components/StormOrb'
import Composer from './components/Composer'
import { getSpeechRecognition, speak } from './services/voice'
import { routeStormMessage } from './core/stormRouter'

const starters = ['Teach me a greeting', 'Help with pronunciation', 'Translate a phrase']

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
      window.setTimeout(() => setState('idle'), 1500)
    }, 320)
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
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('')
      setInput(transcript)
    }
    recognition.onerror = () => { setListening(false); setState('idle') }
    recognition.onend = () => { setListening(false); setState('idle') }
    recognitionRef.current = recognition
    recognition.start()
  }

  function voiceMode() {
    const lastStorm = [...messages].reverse().find((message) => message.role === 'storm')
    const text = lastStorm?.text || 'Fakaalofa lahi atu. I’m STORM.'
    setState('speaking')
    speak(text)
    window.setTimeout(() => setState('idle'), 1500)
  }

  return (
    <main className="app-shell">
      <div className="ocean-wash ocean-wash--left" />
      <div className="ocean-wash ocean-wash--right" />

      <header className="topbar">
        <TopMark />
        <div className="topbar__right">
          <LanguagePicker selected={language} onChange={setLanguage} />
          <button className="glass-icon" type="button" aria-label="Menu"><Menu size={18} strokeWidth={1.7}/></button>
        </div>
      </header>

      <section className={`stage ${messages.length ? 'stage--conversation' : ''}`}>
        <div className="storm-label"><span>STORM</span><small>VAGAHAU NIUE</small></div>
        <StormOrb state={state} />

        {messages.length === 0 ? (
          <div className="welcome">
            <h1>Fakaalofa lahi atu.</h1>
            <p>Speak, listen and learn with STORM.</p>
          </div>
        ) : (
          <div className="conversation">
            <div className="message-list" aria-live="polite">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`message message--${message.role}`}>
                  {message.role === 'storm' && <span className="message__label">STORM</span>}
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="starter-row">
            {starters.map((starter) => (
              <button key={starter} type="button" onClick={() => sendMessage(starter)}>{starter}</button>
            ))}
          </div>
        )}
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
        <p className="footnote">TOP Lite · Niue first · Community validated</p>
      </div>
    </main>
  )
}
