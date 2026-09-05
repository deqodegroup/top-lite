import { Globe2, LockKeyhole } from 'lucide-react'
import { languages } from '../data/languages'

export default function LanguagePicker({ selected, onChange }) {
  return (
    <div className="language-wrap">
      <div className="language-trigger"><Globe2 size={16}/><span>{languages.find(l => l.code === selected)?.short}</span></div>
      <div className="language-menu" role="menu">
        {languages.map((language) => (
          <button
            key={language.code}
            type="button"
            disabled={!language.enabled}
            onClick={() => language.enabled && onChange(language.code)}
            className={selected === language.code ? 'active' : ''}
          >
            <span>{language.label}</span>
            {!language.enabled && <LockKeyhole size={13} />}
          </button>
        ))}
      </div>
    </div>
  )
}
