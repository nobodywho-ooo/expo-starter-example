![NobodyWho](./preview.png)

[![Discord](https://img.shields.io/discord/1308812521456799765?logo=discord&style=flat-square)](https://discord.gg/qhaMc2qCYB)
[![Matrix](https://img.shields.io/badge/Matrix-000?logo=matrix&logoColor=fff)](https://matrix.to/#/#nobodywho:matrix.org)
[![Mastodon](https://img.shields.io/badge/Mastodon-6364FF?logo=mastodon&logoColor=fff&style=flat-square)](https://mastodon.gamedev.place/@nobodywho)
[![Docs](https://img.shields.io/badge/Docs-lightblue?style=flat-square)](https://docs.nobodywho.ooo)

# NobodyWho Expo Starter App

This starter app demonstrates the capabilities of **[NobodyWho](https://github.com/nobodywho-ooo/nobodywho)**, a library designed to run LLMs locally and efficiently on any device.

## Features

- **Chat** — stream responses from a local LLM
- **Tool calling** — give the model access to custom functions (e.g. weather, calculator)
- **Vision & Hearing** — image & audio ingestion with a multimodal model
- **Embeddings & RAG** — semantic search with an embedding model and cross-encoder reranker
- **Speech to Text** — transcribe audio into text (STT)
- **Text to Speech** — generate natural-sounding speech from text (TTS)

## 1. Getting Started

First, you will need to run `npm install` or `yarn` to install dependencies.

### 2. Download Models

In production, we recommend downloading models on demand — only when needed — using a library like `@dr.pogodin/react-native-fs` for advanced options, or our built-in download method. This keeps your app size small. For development, the simplest approach is to download the models ahead of time and bundle them directly in your assets folder (see script below).

#### Automated (Recommended)

**Chat only**
Minimal setup - fast inference, even on old/budget phone.

| Platform      | Command                       |
| ------------- | ----------------------------- |
| macOS / Linux | `./scripts/download_chat.sh`  |
| Windows       | `.\scripts\download_chat.ps1` |

**All features**
Chat + vision + hearing + embeddings + reranker
Downloads Gemma 4, which runs well on flagship phone, but might not work or be slow on old/budget phone

| Platform      | Command                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| macOS / Linux | `./scripts/download_chat_multimodal.sh && ./scripts/download_embedding_rerank.sh` |
| Windows       | `.\scripts\download_chat_multimodal.ps1; .\scripts\download_embedding_rerank.ps1` |

The scripts download models from Hugging Face, rename them, and place them in the `assets/` folder.

### 3. Run the App

```sh
# Android
npx expo run:android

# iOS
npx expo run:ios
```

**Note:** The first `expo run:*` runs a prebuild that links the native modules
(NobodyWho, enriched markdown, `expo-audio`) and generates the `ios/` and
`android/` folders. For iOS, if you have issues with metro, run `npm start` and
then run the project on Xcode.

### 4. How the models are loaded

The download scripts in step 2 place GGUF files in the `assets/` folder:

| Feature                 | File name                                                    |
| ----------------------- | ------------------------------------------------------------ |
| Chat / Vision / Hearing | `chat-model.gguf` (+ `projection-model.gguf` for multimodal) |
| Embeddings              | `embedding-model.gguf`                                       |
| RAG reranker            | `reranker-model.gguf`                                        |

`src/helpers/assets.ts` (`getAssetPath`) bundles whichever of these files exist
using Metro's `require.context`, so a "chat only" setup does **not** need the
other models present. `metro.config.js` registers `.gguf` as an asset type and
enables `require.context`.

> **After adding or removing a model, restart Metro with a cleared cache** so the
> new `require.context` result is picked up:
>
> ```sh
> npx expo start --clear
> ```

The Kokoro (TTS) and Whisper (STT) models are downloaded automatically from
Hugging Face on first use via `hf://` sources — no manual step needed.

> Prefer downloading the LLMs on demand instead of bundling them? `Chat.fromPath`
> / `Encoder.fromPath` accept an `hf://owner/repo/file.gguf` or `https://` path
> directly, so you can swap the `getAssetPath(...)` calls in
> `src/services/ai-service.tsx` for a remote path.

#### Miscellaneous

Cleanup

```sh
npm run reset-project
```

---

## Feedback & Contributions

We welcome your feedback and ideas!

- **Bug Reports & Improvements**: Open an issue on the **[Issues](https://github.com/nobodywho-ooo/expo-starter-example/issues)** page.
- **Feature Requests & Questions**: Join the discussion on **[Discussions](https://github.com/nobodywho-ooo/expo-starter-example/discussions)**.
