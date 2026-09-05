export default function StormOrb({ state = 'idle' }) {
  return (
    <div className={`storm-orb storm-orb--${state}`} aria-label={`STORM is ${state}`}>
      <div className="storm-orb__aura" />
      <div className="storm-orb__ring storm-orb__ring--outer" />
      <div className="storm-orb__ring storm-orb__ring--inner" />
      <div className="storm-orb__core">
        <div className="storm-orb__glass" />
        <span className="storm-orb__current storm-orb__current--a" />
        <span className="storm-orb__current storm-orb__current--b" />
        <span className="storm-orb__current storm-orb__current--c" />
        <span className="storm-orb__current storm-orb__current--d" />
      </div>
      <div className="storm-orb__shadow" />
    </div>
  )
}
