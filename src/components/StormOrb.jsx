export default function StormOrb({ state = 'idle', mode = 'chat' }) {
  return (
    <div className={`storm-orb storm-orb--${state} storm-orb--mode-${mode}`} aria-label={`STORM is ${state}`}>
      <div className="storm-orb__field storm-orb__field--outer" />
      <div className="storm-orb__field storm-orb__field--inner" />
      <div className="storm-orb__glow" />
      <div className="storm-orb__ring storm-orb__ring--one" />
      <div className="storm-orb__ring storm-orb__ring--two" />
      <div className="storm-orb__ring storm-orb__ring--three" />
      <div className="storm-orb__shell">
        <div className="storm-orb__rim" />
        <div className="storm-orb__water storm-orb__water--one" />
        <div className="storm-orb__water storm-orb__water--two" />
        <div className="storm-orb__water storm-orb__water--three" />
        <div className="storm-orb__light" />
        <div className="storm-orb__core" />
      </div>
      <div className="storm-orb__reflection" />
      <div className="storm-orb__signal" aria-hidden="true"><i /><i /><i /><i /><i /></div>
    </div>
  )
}
