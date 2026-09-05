export default function StormOrb({ state = 'idle' }) {
  return (
    <div className={`storm-orb storm-orb--${state}`} aria-label={`STORM is ${state}`}>
      <div className="storm-orb__halo storm-orb__halo--outer" />
      <div className="storm-orb__halo storm-orb__halo--inner" />
      <div className="storm-orb__core">
        <span className="storm-orb__line storm-orb__line--a" />
        <span className="storm-orb__line storm-orb__line--b" />
        <span className="storm-orb__line storm-orb__line--c" />
      </div>
    </div>
  )
}
