import crypto from 'node:crypto'
import { AccessToken } from 'livekit-server-sdk'
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol'

const WINDOW_MS = 10 * 60 * 1000
const MAX_TOKENS_PER_WINDOW = 20
const buckets = new Map()

function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function allowedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    const originHost = new URL(origin).host
    const requestHost = req.headers['x-forwarded-host'] || req.headers.host
    return !requestHost || originHost === requestHost
  } catch {
    return false
  }
}

function withinRateLimit(ip) {
  const now = Date.now()
  const current = buckets.get(ip)
  if (!current || now - current.startedAt > WINDOW_MS) {
    buckets.set(ip, { startedAt: now, count: 1 })
    return true
  }
  current.count += 1
  return current.count <= MAX_TOKENS_PER_WINDOW
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      configured: Boolean(
        process.env.LIVEKIT_URL &&
        process.env.LIVEKIT_API_KEY &&
        process.env.LIVEKIT_API_SECRET
      ),
      agentName: process.env.TOP_LIVEKIT_AGENT_NAME || 'top-storm',
    })
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' })
  if (!allowedOrigin(req)) return send(res, 403, { error: 'Origin not allowed' })

  const ip = clientIp(req)
  if (!withinRateLimit(ip)) return send(res, 429, { error: 'Too many voice sessions. Try again shortly.' })

  const serverUrl = process.env.LIVEKIT_URL
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  if (!serverUrl || !apiKey || !apiSecret) {
    return send(res, 503, { error: 'LiveKit voice is not configured' })
  }

  const roomName = `top-lite-${crypto.randomUUID()}`
  const participantIdentity = `learner-${crypto.randomUUID()}`
  const participantName = 'TOP Lite learner'
  const agentName = process.env.TOP_LIVEKIT_AGENT_NAME || 'top-storm'

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    ttl: '10m',
  })

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  token.roomConfig = new RoomConfiguration({
    agents: [new RoomAgentDispatch({ agentName })],
  })

  const participantToken = await token.toJwt()
  return send(res, 201, {
    server_url: serverUrl,
    participant_token: participantToken,
    room_name: roomName,
  })
}
