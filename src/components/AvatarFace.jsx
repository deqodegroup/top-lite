import { useEffect, useRef } from 'react'

export default function AvatarFace({ videoUrl, state = 'idle', ready = false, onEnded }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return
    const video = videoRef.current
    video.currentTime = 0
    video.play().catch(() => {})
  }, [videoUrl])

  return (
    <div className={`avatar-face avatar-face--${state} ${ready ? 'is-ready' : 'is-offline'}`}>
      <div className="avatar-face__frame">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            playsInline
            autoPlay
            onEnded={onEnded}
          />
        ) : (
          <div className="avatar-face__placeholder" aria-label="Avatar runtime waiting">
            <span className="avatar-face__pulse" />
            <strong>STORM</strong>
            <small>{ready ? 'Avatar ready' : 'Avatar runtime pending'}</small>
          </div>
        )}
      </div>
      <div className="avatar-face__glass-ring" aria-hidden="true" />
    </div>
  )
}
