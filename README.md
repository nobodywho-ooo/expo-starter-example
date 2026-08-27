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

**Minimal setup**
Text generation only, fast inference, even on old/budget phone.

| Platform      | Command                       |
| ------------- | ----------------------------- |
| macOS / Linux | `./scripts/download_chat.sh`  |
| Windows       | `.\scripts\download_chat.ps1` |

**Extra Setup**
Adds the optional multimodal / RAG models. Each feature is a separate download grab only the ones you want to try.

| Feature               | macOS / Linux                            | Windows                                   |
| --------------------- | ---------------------------------------- | ----------------------------------------- |
| Vision (images)       | `./scripts/download_chat_vision.sh`      | `.\scripts\download_chat_vision.ps1`      |
| Hearing (audio)       | `./scripts/download_chat_audio.sh`       | `.\scripts\download_chat_audio.ps1`       |
| Embeddings + reranker | `./scripts/download_embedding_rerank.sh` | `.\scripts\download_embedding_rerank.ps1` |

Vision uses a LFM2.5-VL model and Hearing uses a LFM2.5-Audio model.

These scripts download models from Hugging Face, rename them, and place them in the `assets/` folder.

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

### How the models are loaded

The download scripts in step 2 place GGUF files in the `assets/` folder:

| Feature      | File name(s)                                              |
| ------------ | --------------------------------------------------------- |
| Chat         | `chat-model.gguf`                                         |
| Vision       | `chat-vision-model.gguf` + `projection-vision-model.gguf` |
| Hearing      | `chat-audio-model.gguf` + `projection-audio-model.gguf`   |
| Embeddings   | `embedding-model.gguf`                                    |
| RAG reranker | `reranker-model.gguf`                                     |

`src/helpers/assets.ts` (`getAssetPath`) bundles whichever of these files exist
using Metro's `require.context`, so a "chat only" setup does **not** need the
other models present. `metro.config.js` registers `.gguf` as an asset type and
enables `require.context`.

**After adding or removing a model, restart Metro with a cleared cache and clean native files**

```sh
npx expo start --clear # quit when the process is done
rm -rf android/app/build android/app/.cxx android/build # clean stale build artifacts for android
rm -rf ios/build ~/Library/Developer/Xcode/DerivedData # clean for iOS
```

The Kokoro (TTS) and Whisper (STT) models are downloaded automatically from Hugging Face on first use via `hf://` sources (no manual step needed).
You can also download chat / embeddingd / reranker models in that way

#### Miscellaneous

Cleanup: native regeneration of `/ios` and `/android` folders.

```sh
expo prebuild --clean
```

---

## Feedback & Contributions

We welcome your feedback and ideas!

- **Bug Reports & Improvements**: Open an issue on the **[Issues](https://github.com/nobodywho-ooo/expo-starter-example/issues)** page.
- **Feature Requests & Questions**: Join the discussion on **[Discussions](https://github.com/nobodywho-ooo/expo-starter-example/discussions)**.
