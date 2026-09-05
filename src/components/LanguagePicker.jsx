import { ChevronDown, Globe2, LockKeyhole } from 'lucide-react'
import { languages } from '../data/languages'

export default function LanguagePicker({ selected, onChange }) {
  const active = languages.find((language) => language.code === selected)

  return (
    <div className="language-wrap">
      <button className="language-trigger" type="button" aria-haspopup="menu">
        <Globe2 size={15} strokeWidth={1.8}/>
        <span>{active?.short}</span>
        <ChevronDown size={13} strokeWidth={1.8}/>
      </button>
      <div className="language-menu" role="menu" aria-label="Choose language">
        <div className="language-menu__label">LANGUAGE</div>
        {languages.map((language) => (
          <button
            key={language.code}
            type="button"
            role="menuitem"
            disabled={!language.enabled}
            onClick={() => language.enabled && onChange(language.code)}
            className={selected === language.code ? 'active' : ''}
          >
            <span>
              <strong>{language.short}</strong>
              <small>{language.label}</small>
            </span>
            {!language.enabled && <LockKeyhole size={12} strokeWidth={1.8}/>} 
          </button>
        ))}
      </div>
    </div>
  )
}
