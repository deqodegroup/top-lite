$ErrorActionPreference = "Stop"

Write-Host "TOP Lite - LiveKit STORM deployment"

if (-not (Get-Command lk -ErrorAction SilentlyContinue)) {
  throw "LiveKit CLI 'lk' is not installed or not in PATH. Install the latest LiveKit CLI, then run this script again."
}

if (-not $env:OPENAI_API_KEY) {
  throw "OPENAI_API_KEY is not set in this terminal."
}

Write-Host "Checking LiveKit Cloud authentication..."
try {
  lk project list | Out-Host
} catch {
  Write-Host "LiveKit Cloud login required."
  lk cloud auth
}

$toml = Join-Path $PSScriptRoot "livekit.toml"
Push-Location $PSScriptRoot
try {
  if (Test-Path $toml) {
    Write-Host "Deploying new top-storm version..."
    lk agent deploy --secrets "OPENAI_API_KEY=$env:OPENAI_API_KEY" --secrets "TOP_KNOWLEDGE_URL=https://top-lite.vercel.app/api/knowledge" --secrets "TOP_LIVEKIT_AGENT_NAME=top-storm" --secrets "OPENAI_REALTIME_MODEL=gpt-realtime" --secrets "OPENAI_REALTIME_VOICE=marin"
  } else {
    Write-Host "Creating top-storm agent..."
    lk agent create --secrets "OPENAI_API_KEY=$env:OPENAI_API_KEY" --secrets "TOP_KNOWLEDGE_URL=https://top-lite.vercel.app/api/knowledge" --secrets "TOP_LIVEKIT_AGENT_NAME=top-storm" --secrets "OPENAI_REALTIME_MODEL=gpt-realtime" --secrets "OPENAI_REALTIME_VOICE=marin"
  }

  Write-Host "Agent status:"
  lk agent status
} finally {
  Pop-Location
}
