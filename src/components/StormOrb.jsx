export default function StormOrb({ state = 'idle' }) {
  return (
    <div className={`storm-orb storm-orb--${state}`} aria-label={`STORM is ${state}`}>
      <div className="storm-orb__glow" />
      <div className="storm-orb__shell">
        <div className="storm-orb__rim" />
        <div className="storm-orb__water storm-orb__water--one" />
        <div className="storm-orb__water storm-orb__water--two" />
        <div className="storm-orb__water storm-orb__water--three" />
        <div className="storm-orb__light" />
        <div className="storm-orb__core" />
      </div>
      <div className="storm-orb__reflection" />
    </div>
  )
}
