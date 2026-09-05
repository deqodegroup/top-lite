export default function TopMark() {
  return (
    <div className="top-mark" aria-label="The Orator Project">
      <div className="top-mark__symbol" aria-hidden="true">
        <span className="top-mark__arc top-mark__arc--one" />
        <span className="top-mark__arc top-mark__arc--two" />
        <span className="top-mark__horizon" />
      </div>
      <div className="top-mark__type">
        <strong>TOP</strong>
        <span>LITE</span>
      </div>
    </div>
  )
}
