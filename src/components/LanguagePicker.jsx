import { Check, ChevronDown, Globe2 } from 'lucide-react'
import { useState } from 'react'
import { languages } from '../data/languages'

export default function LanguagePicker({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const current = languages.find((language) => language.code === selected)

  function choose(language) {
    if (!language.enabled) return
    onChange(language.code)
    setOpen(false)
  }

  return (
    <div className={`language-wrap ${open ? 'is-open' : ''}`}>
      <button className="language-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>{current?.short}</span><ChevronDown size={15} className="language-chevron"/>
      </button>
      <div className="language-menu" role="menu" aria-hidden={!open}>
        <div className="language-menu__title">Language</div>
        {languages.map((language) => (
          <button
            key={language.code}
            type="button"
            disabled={!language.enabled}
            onClick={() => choose(language)}
            className={selected === language.code ? 'active' : ''}
          >
            <span className="language-menu__name"><Globe2 size={15}/>{language.short}</span>
            {selected === language.code ? <Check size={16}/> : !language.enabled ? <small>Soon</small> : null}
          </button>
        ))}
      </div>
    </div>
  )
}
