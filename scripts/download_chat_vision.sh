#!/bin/bash
# Download vision chat + projection models (LFM2.5-VL-450M) for macOS and Linux

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSETS_DIR="$PROJECT_DIR/assets"

CHAT_URL="https://huggingface.co/LiquidAI/LFM2.5-VL-450M-GGUF/resolve/main/LFM2.5-VL-450M-Q4_K_M.gguf"
PROJECTION_URL="https://huggingface.co/LiquidAI/LFM2.5-VL-450M-GGUF/resolve/main/mmproj-LFM2.5-VL-450m-BF16.gguf"

CHAT_OUTPUT="$ASSETS_DIR/chat-vision-model.gguf"
PROJECTION_OUTPUT="$ASSETS_DIR/projection-vision-model.gguf"

mkdir -p "$ASSETS_DIR"

download() {
    local url="$1"
    local output="$2"
    local name="$3"

    echo "Downloading $name..."
    if command -v curl &> /dev/null; then
        curl -L -o "$output" "$url"
    elif command -v wget &> /dev/null; then
        wget -O "$output" "$url"
    else
        echo "Error: curl or wget is required." >&2
        exit 1
    fi
    echo "Done. $name saved to $output"
}

download "$CHAT_URL" "$CHAT_OUTPUT" "vision chat model"
download "$PROJECTION_URL" "$PROJECTION_OUTPUT" "vision projection model"
