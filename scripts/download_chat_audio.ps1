# Download audio chat + projection models (LFM2.5-Audio-1.5B) for Windows (PowerShell)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$assetsDir = Join-Path $projectDir "assets"

$chatUrl = "https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B-GGUF/resolve/main/LFM2.5-Audio-1.5B-Q4_0.gguf"
$projectionUrl = "https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B-GGUF/resolve/main/mmproj-LFM2.5-Audio-1.5B-Q4_0.gguf"

$chatOutput = Join-Path $assetsDir "chat-audio-model.gguf"
$projectionOutput = Join-Path $assetsDir "projection-audio-model.gguf"

if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

Write-Host "Downloading audio chat model..."
Invoke-WebRequest -Uri $chatUrl -OutFile $chatOutput -UseBasicParsing
Write-Host "Done. audio chat model saved to $chatOutput"

Write-Host "Downloading audio projection model..."
Invoke-WebRequest -Uri $projectionUrl -OutFile $projectionOutput -UseBasicParsing
Write-Host "Done. audio projection model saved to $projectionOutput"
