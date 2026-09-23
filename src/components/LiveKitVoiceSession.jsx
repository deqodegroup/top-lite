import { useEffect, useState } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react'
import '@livekit/components-styles'

function VoiceBridge({ onState, onTranscript, onError }) {
  const assistant = useVoiceAssistant()
  const transcriptions = useTranscriptions()

  useEffect(() => {
    const state = assistant?.state
    if (!state) return
    if (state === 'speaking') onState?.('speaking')
    else if (state === 'thinking') onState?.('thinking')
    else if (assistant?.canListen) onState?.('listening')
    else if (assistant?.isFinished) onState?.('idle')
  }, [assistant?.state, assistant?.canListen, assistant?.isFinished, onState])

  useEffect(() => {
    if (!transcriptions?.length) return
    const latest = transcriptions[transcriptions.length - 1]
    if (!latest?.text) return
    onTranscript?.({
      text: latest.text,
      participantIdentity: latest.participantIdentity || latest.participant?.identity || null,
      final: latest.attributes?.['lk.transcription_final'] === 'true',
      segmentId: latest.attributes?.['lk.segment_id'] || null,
    })
  }, [transcriptions, onTranscript])

  useEffect(() => {
    if (assistant?.state === 'failed') onError?.(new Error('STORM voice session failed'))
  }, [assistant?.state, onError])

  return <RoomAudioRenderer />
}

export default function LiveKitVoiceSession({
  active,
  onState,
  onTranscript,
  onConnected,
  onDisconnected,
  onError,
}) {
  const [connection, setConnection] = useState(null)

  useEffect(() => {
    if (!active) {
      setConnection(null)
      return
    }

    const controller = new AbortController()
    onState?.('thinking')

    fetch('/api/livekit-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.participant_token || !data.server_url) {
          throw new Error(data.error || 'Unable to start LiveKit voice')
        }
        setConnection({
          token: data.participant_token,
          serverUrl: data.server_url,
        })
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        onState?.('idle')
        onError?.(error)
      })

    return () => controller.abort()
  }, [active, onState, onError])

  if (!active || !connection) return null

  return (
    <LiveKitRoom
      token={connection.token}
      serverUrl={connection.serverUrl}
      connect
      audio
      video={false}
      onConnected={() => onConnected?.()}
      onDisconnected={() => {
        onState?.('idle')
        onDisconnected?.()
      }}
      onError={(error) => {
        onState?.('idle')
        onError?.(error)
      }}
      style={{ display: 'contents' }}
    >
      <VoiceBridge onState={onState} onTranscript={onTranscript} onError={onError} />
    </LiveKitRoom>
  )
}
