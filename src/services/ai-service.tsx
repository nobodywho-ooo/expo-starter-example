import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Chat,
  CrossEncoder,
  Encoder,
  SamplerConfig,
  SpeechToText,
  SpeechToTextOptions,
  TextToSpeech,
  TextToSpeechOptions,
  Tool,
} from 'react-native-nobodywho';

import { devLog, getAssetPath } from '@/helpers';

export enum AiModelState {
  NotLoaded = 'notLoaded',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

enum ModelName {
  ChatModel = 'chat-model.gguf',
  ChatVisionModel = 'chat-vision-model.gguf',
  ProjectionVisionModel = 'projection-vision-model.gguf',
  ChatAudioModel = 'chat-audio-model.gguf',
  ProjectionAudioModel = 'projection-audio-model.gguf',
  EmbeddingModel = 'embedding-model.gguf',
  RerankerModel = 'reranker-model.gguf',
}

interface AiServiceState {
  chatState: AiModelState;
  chatWithToolCallingState: AiModelState;
  visionChatState: AiModelState;
  hearingChatState: AiModelState;
  encoderState: AiModelState;
  crossEncoderState: AiModelState;
  ttsState: AiModelState;
  sttState: AiModelState;
}

interface AiServiceContextValue extends AiServiceState {
  chat: React.RefObject<Chat | undefined>;
  chatWithToolCalling: React.RefObject<Chat | undefined>;
  visionChat: React.RefObject<Chat | undefined>;
  hearingChat: React.RefObject<Chat | undefined>;
  encoder: React.RefObject<Encoder | undefined>;
  crossEncoder: React.RefObject<CrossEncoder | undefined>;
  tts: React.RefObject<TextToSpeech | undefined>;
  stt: React.RefObject<SpeechToText | undefined>;

  createChat: (opts?: {
    useGpu?: boolean;
    systemPrompt?: string;
    sampler?: SamplerConfig;
    contextSize?: number;
  }) => Promise<void>;
  createToolCallingChat: (opts?: {
    useGpu?: boolean;
    tools?: Tool[];
    systemPrompt?: string;
    sampler?: SamplerConfig;
    contextSize?: number;
  }) => Promise<void>;
  createVisionChat: (opts?: {
    useGpu?: boolean;
    systemPrompt?: string;
    contextSize?: number;
  }) => Promise<void>;
  createHearingChat: (opts?: {
    useGpu?: boolean;
    systemPrompt?: string;
    contextSize?: number;
  }) => Promise<void>;
  createEncoder: (opts?: {
    useGpu?: boolean;
    contextSize?: number;
  }) => Promise<void>;
  createCrossEncoder: (opts?: {
    useGpu?: boolean;
    contextSize?: number;
  }) => Promise<void>;
  createTts: (opts?: Partial<TextToSpeechOptions>) => Promise<void>;
  createStt: (opts?: Partial<SpeechToTextOptions>) => Promise<void>;
  disposeVisionChat: () => void;
  disposeHearingChat: () => void;
  dispose: () => void;
}

const AiServiceContext = createContext<AiServiceContextValue | undefined>(
  undefined,
);

const initialState: AiServiceState = {
  chatState: AiModelState.NotLoaded,
  chatWithToolCallingState: AiModelState.NotLoaded,
  visionChatState: AiModelState.NotLoaded,
  hearingChatState: AiModelState.NotLoaded,
  encoderState: AiModelState.NotLoaded,
  crossEncoderState: AiModelState.NotLoaded,
  ttsState: AiModelState.NotLoaded,
  sttState: AiModelState.NotLoaded,
};

export const AiServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AiServiceState>(initialState);

  // Guard to prevent duplicate loading of the same model, e.g. if createChat is called twice quickly.
  const inFlight = useRef({
    chat: false,
    chatWithToolCalling: false,
    visionChat: false,
    hearingChat: false,
    encoder: false,
    crossEncoder: false,
    tts: false,
    stt: false,
  });

  const chatRef = useRef<Chat | undefined>(undefined);
  const chatWithToolCallingRef = useRef<Chat | undefined>(undefined);
  const visionChatRef = useRef<Chat | undefined>(undefined);
  const hearingChatRef = useRef<Chat | undefined>(undefined);
  const encoderRef = useRef<Encoder | undefined>(undefined);
  const crossEncoderRef = useRef<CrossEncoder | undefined>(undefined);
  const ttsRef = useRef<TextToSpeech | undefined>(undefined);
  const sttRef = useRef<SpeechToText | undefined>(undefined);

  const createChat = useCallback(
    async (opts?: {
      useGpu?: boolean;
      systemPrompt?: string;
      sampler?: SamplerConfig;
      contextSize?: number;
    }) => {
      if (inFlight.current.chat || chatRef.current) {
        return;
      }

      inFlight.current.chat = true;
      setState(s => ({ ...s, chatState: AiModelState.Loading }));

      try {
        const modelPath = await getAssetPath(ModelName.ChatModel);
        const chat = await Chat.fromPath({
          modelPath,
          useGpu: opts?.useGpu ?? true,
          systemPrompt: opts?.systemPrompt,
          sampler: opts?.sampler,
          contextSize: opts?.contextSize,
        });

        chatRef.current = chat;
        setState(s => ({ ...s, chatState: AiModelState.Ready }));
      } catch (error) {
        devLog('AiService error', error);
        setState(s => ({ ...s, chatState: AiModelState.Error }));
      } finally {
        inFlight.current.chat = false;
      }
    },
    [],
  );

  const createToolCallingChat = useCallback(
    async (opts?: {
      useGpu?: boolean;
      tools?: Tool[];
      systemPrompt?: string;
      sampler?: SamplerConfig;
      contextSize?: number;
    }) => {
      if (inFlight.current.chatWithToolCalling || chatWithToolCallingRef.current){
        return;
      }

      inFlight.current.chatWithToolCalling = true;
      setState(s => ({ ...s, chatWithToolCallingState: AiModelState.Loading }));

      try {
        const modelPath = await getAssetPath(ModelName.ChatModel);
        const chat = await Chat.fromPath({
          modelPath,
          useGpu: opts?.useGpu ?? true,
          tools: opts?.tools ?? [],
          systemPrompt: opts?.systemPrompt,
          sampler: opts?.sampler,
          contextSize: opts?.contextSize,
        });

        chatWithToolCallingRef.current = chat;

        setState(s => ({
          ...s,
          chatWithToolCallingState: AiModelState.Ready,
        }));
      } catch (error) {
        devLog('AiService error', error);
        setState(s => ({
          ...s,
          chatWithToolCallingState: AiModelState.Error,
        }));
      } finally {
        inFlight.current.chatWithToolCalling = false;
      }
    },
    [],
  );

  const createVisionChat = useCallback(
    async (opts?: {
      useGpu?: boolean;
      systemPrompt?: string;
      contextSize?: number;
    }) => {
      if (inFlight.current.visionChat || visionChatRef.current) {
        return;
      }

      inFlight.current.visionChat = true;
      setState(s => ({ ...s, visionChatState: AiModelState.Loading }));

      try {
        const modelPath = await getAssetPath(ModelName.ChatVisionModel);
        const projectionModelPath = await getAssetPath(
          ModelName.ProjectionVisionModel,
        );
        const chat = await Chat.fromPath({
          modelPath,
          projectionModelPath,
          useGpu: opts?.useGpu ?? true,
          systemPrompt: opts?.systemPrompt,
          contextSize: opts?.contextSize,
        });

        visionChatRef.current = chat;
        setState(s => ({ ...s, visionChatState: AiModelState.Ready }));
      } catch (error) {
        devLog('AiService error', error);
        setState(s => ({ ...s, visionChatState: AiModelState.Error }));
      } finally {
        inFlight.current.visionChat = false;
      }
    },
    [],
  );

  const disposeVisionChat = useCallback(() => {
    visionChatRef.current?.destroy();
    visionChatRef.current = undefined;
    inFlight.current.visionChat = false;
    setState(s => ({ ...s, visionChatState: AiModelState.NotLoaded }));
  }, []);

  // Hearing chat — LFM2.5-Audio model (chat-audio-model.gguf +
  // projection-audio-model.gguf). Used by the Hearing tab.
  const createHearingChat = useCallback(
    async (opts?: {
      useGpu?: boolean;
      systemPrompt?: string;
      contextSize?: number;
    }) => {
      if (inFlight.current.hearingChat || hearingChatRef.current) {
        return;
      }

      inFlight.current.hearingChat = true;
      setState(s => ({ ...s, hearingChatState: AiModelState.Loading }));

      try {
        const modelPath = await getAssetPath(ModelName.ChatAudioModel);
        const projectionModelPath = await getAssetPath(
          ModelName.ProjectionAudioModel,
        );
        const chat = await Chat.fromPath({
          modelPath,
          projectionModelPath,
          useGpu: opts?.useGpu ?? true,
          systemPrompt: opts?.systemPrompt,
          contextSize: opts?.contextSize,
        });

        hearingChatRef.current = chat;
        setState(s => ({ ...s, hearingChatState: AiModelState.Ready }));
      } catch (error) {
        devLog('AiService error', error);
        setState(s => ({ ...s, hearingChatState: AiModelState.Error }));
      } finally {
        inFlight.current.hearingChat = false;
      }
    },
    [],
  );

  const disposeHearingChat = useCallback(() => {
    hearingChatRef.current?.destroy();
    hearingChatRef.current = undefined;
    inFlight.current.hearingChat = false;
    setState(s => ({ ...s, hearingChatState: AiModelState.NotLoaded }));
  }, []);

  // Embeddings
  const createEncoder = useCallback(
    async (opts?: { useGpu?: boolean; contextSize?: number }) => {
      if (inFlight.current.encoder || encoderRef.current) {
        return;
      }

      inFlight.current.encoder = true;
      setState(s => ({ ...s, encoderState: AiModelState.Loading }));

      try {
        const modelPath = await getAssetPath(ModelName.EmbeddingModel);
        const encoder = await Encoder.fromPath({
          modelPath,
          useGpu: opts?.useGpu ?? true,
          contextSize: opts?.contextSize,
        });

        encoderRef.current = encoder;
        setState(s => ({ ...s, encoderState: AiModelState.Ready }));
      } catch (error) {
        devLog('AiService error', error);
        setState(s => ({ ...s, encoderState: AiModelState.Error }));
      } finally {
        inFlight.current.encoder = false;
      }
    },
    [],
  );

  // ReRanker
  const createCrossEncoder = useCallback(
    async (opts?: { useGpu?: boolean; contextSize?: number }) => {
      if (inFlight.current.crossEncoder || crossEncoderRef.current) {
        return;
      }

      inFlight.current.crossEncoder = true;
      setState(s => ({ ...s, crossEncoderState: AiModelState.Loading }));

      try {
        const modelPath = await getAssetPath(ModelName.RerankerModel);
        const crossEncoder = await CrossEncoder.fromPath({
          modelPath,
          useGpu: opts?.useGpu ?? true,
          contextSize: opts?.contextSize,
        });

        crossEncoderRef.current = crossEncoder;
        setState(s => ({ ...s, crossEncoderState: AiModelState.Ready }));
      } catch (error) {
        devLog('AiService error', error);
        setState(s => ({ ...s, crossEncoderState: AiModelState.Error }));
      } finally {
        inFlight.current.crossEncoder = false;
      }
    },
    [],
  );

  // Text-to-speech
  const createTts = useCallback(async (opts?: Partial<TextToSpeechOptions>) => {
    if (inFlight.current.tts || ttsRef.current) {
      return;
    }

    inFlight.current.tts = true;
    setState(s => ({ ...s, ttsState: AiModelState.Loading }));

    try {
      const tts = await TextToSpeech.load({
        source: 'hf://NobodyWho/Kokoro-82M',
        voice: 'bf_emma',
        language: 'en-gb',
        ...opts,
      });

      ttsRef.current = tts;
      setState(s => ({ ...s, ttsState: AiModelState.Ready }));
    } catch (error) {
      devLog('AiService error', error);
      setState(s => ({ ...s, ttsState: AiModelState.Error }));
    } finally {
      inFlight.current.tts = false;
    }
  }, []);

  // Speech-to-text
  const createStt = useCallback(async (opts?: Partial<SpeechToTextOptions>) => {
    if (inFlight.current.stt || sttRef.current) {
      return;
    }

    inFlight.current.stt = true;

    try {
      const stt = await SpeechToText.load({
        source: 'hf://onnx-community/whisper-base',
        ...opts,
      });
      
      sttRef.current = stt;
      setState(s => ({ ...s, sttState: AiModelState.Ready }));
    } catch (error) {
      devLog('AiService error', error);
      setState(s => ({ ...s, sttState: AiModelState.Error }));
    } finally {
      inFlight.current.stt = false;
    }
  }, []);

  const dispose = useCallback(() => {
    sttRef.current = undefined;
    ttsRef.current = undefined;
    chatRef.current?.destroy();
    chatRef.current = undefined;
    chatWithToolCallingRef.current?.destroy();
    chatWithToolCallingRef.current = undefined;
    visionChatRef.current?.destroy();
    visionChatRef.current = undefined;
    hearingChatRef.current?.destroy();
    hearingChatRef.current = undefined;
    encoderRef.current = undefined;
    crossEncoderRef.current = undefined;

    // Reset in-flight flags so a subsequent createX() isn't silently skipped if
    // dispose ran while a load was pending.
    inFlight.current.chat = false;
    inFlight.current.chatWithToolCalling = false;
    inFlight.current.visionChat = false;
    inFlight.current.hearingChat = false;
    inFlight.current.encoder = false;
    inFlight.current.crossEncoder = false;
    inFlight.current.tts = false;
    inFlight.current.stt = false;

    setState(initialState);
  }, []);

  const value = useMemo<AiServiceContextValue>(
    () => ({
      ...state,
      chat: chatRef,
      chatWithToolCalling: chatWithToolCallingRef,
      visionChat: visionChatRef,
      hearingChat: hearingChatRef,
      encoder: encoderRef,
      crossEncoder: crossEncoderRef,
      tts: ttsRef,
      stt: sttRef,
      createChat,
      createToolCallingChat,
      createVisionChat,
      createHearingChat,
      createEncoder,
      createCrossEncoder,
      createTts,
      createStt,
      disposeVisionChat,
      disposeHearingChat,
      dispose,
    }),
    [
      state,
      createChat,
      createToolCallingChat,
      createVisionChat,
      createHearingChat,
      createEncoder,
      createCrossEncoder,
      createTts,
      createStt,
      disposeVisionChat,
      disposeHearingChat,
      dispose,
    ],
  );

  return (
    <AiServiceContext.Provider value={value}>
      {children}
    </AiServiceContext.Provider>
  );
};

export const useAiService = (): AiServiceContextValue => {
  const ctx = useContext(AiServiceContext);
  if (!ctx) {
    throw new Error('useAiService must be used within an AiServiceProvider');
  }
  return ctx;
};
