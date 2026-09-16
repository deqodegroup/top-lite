export default function ModeToggle({ mode, onChange }) {
  const modes = [
    { id: 'chat', label: 'Chat' },
    { id: 'voice', label: 'Voice' },
    { id: 'avatar', label: 'Avatar' },
  ]

  return (
    <div className="mode-toggle" role="tablist" aria-label="STORM mode">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={mode === item.id}
          className={mode === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
