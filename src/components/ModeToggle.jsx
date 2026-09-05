export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="tablist" aria-label="STORM mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'voice'}
        className={mode === 'voice' ? 'active' : ''}
        onClick={() => onChange('voice')}
      >
        Voice
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'avatar'}
        className={mode === 'avatar' ? 'active' : ''}
        onClick={() => onChange('avatar')}
      >
        Avatar
      </button>
    </div>
  )
}
