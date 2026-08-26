# Download vision chat + projection models (LFM2.5-VL-450M) for Windows (PowerShell)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$assetsDir = Join-Path $projectDir "assets"

$chatUrl = "https://huggingface.co/LiquidAI/LFM2.5-VL-450M-GGUF/resolve/main/LFM2.5-VL-450M-Q4_K_M.gguf"
$projectionUrl = "https://huggingface.co/LiquidAI/LFM2.5-VL-450M-GGUF/resolve/main/mmproj-LFM2.5-VL-450m-BF16.gguf"

$chatOutput = Join-Path $assetsDir "chat-vision-model.gguf"
$projectionOutput = Join-Path $assetsDir "projection-vision-model.gguf"

if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

Write-Host "Downloading vision chat model..."
Invoke-WebRequest -Uri $chatUrl -OutFile $chatOutput -UseBasicParsing
Write-Host "Done. vision chat model saved to $chatOutput"

Write-Host "Downloading vision projection model..."
Invoke-WebRequest -Uri $projectionUrl -OutFile $projectionOutput -UseBasicParsing
Write-Host "Done. vision projection model saved to $projectionOutput"
