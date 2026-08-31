import {
  AudioModule,
  setAudioModeAsync,
  useAudioStream,
  type AudioStreamBuffer,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceActivityDetectionEvent } from "react-native-nobodywho";

import { devLog } from "@/helpers";
import { useAiService } from "@/services";

// Silero VAD (and Whisper) expect 16 kHz mono. We request this rate from the
// mic stream; the hardware may deliver a slightly different rate, which we read
// back from each buffer for transcription.
const SAMPLE_RATE = 16000;

// Amount of trailing silence that ends a turn. The VAD default (250ms) is eager
// and clips natural mid-sentence pauses, so we relax it for dictation.
const MIN_SILENCE_MS = 800;

// Strip non-speech markers from Whisper, like "[BLANK_AUDIO]", "[MUSIC]", ...
const cleanTranscript = (text: string): string =>
  text
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface SttRecording {
  isRecording: boolean;
  isTranscribing: boolean;
  toggle: () => Promise<void>;
}

/**
 * Streams microphone PCM with `expo-audio`'s `useAudioStream` and runs Silero
 * voice activity detection on it live: each captured chunk is pushed to the VAD,
 * and once it reports `SpeechEnded` the turn is transcribed automatically with
 * the NobodyWho Whisper model — no need to tap stop. Tapping the button again
 * ends the turn manually. `onTranscribed` receives the final text.
 *
 * Unlike file recording, raw PCM works identically on iOS and Android (Android's
 * recorder can only emit AAC/m4a, which Whisper can't decode).
 */
export const useSttRecording = (
  onTranscribed: (text: string) => void,
): SttRecording => {
  const { stt, createStt, vad, createVad } = useAiService();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const busyRef = useRef<boolean>(false);
  // Every sample captured this turn — a fallback for when the VAD never
  // confirms a speech segment (e.g. a very short manual recording).
  const samplesRef = useRef<number[]>([]);
  // Synchronous mirror of `isRecording`, so the buffer callback and a manual
  // stop can't both transcribe the same turn.
  const activeRef = useRef<boolean>(false);
  // Actual capture rate reported by the hardware.
  const sampleRateRef = useRef<number>(SAMPLE_RATE);

  const streamRef = useRef<ReturnType<typeof useAudioStream>["stream"] | null>(
    null,
  );
  const finalizeRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const onTranscribedRef = useRef(onTranscribed);

  useEffect(() => {
    onTranscribedRef.current = onTranscribed;
  }, [onTranscribed]);

  const handleBuffer = useCallback(
    (buffer: AudioStreamBuffer) => {
      if (!activeRef.current) {
        return;
      }

      sampleRateRef.current = buffer.sampleRate || SAMPLE_RATE;
      const chunk = new Int16Array(buffer.data);
      for (let i = 0; i < chunk.length; i++) {
        samplesRef.current.push(chunk[i]);
      }

      const detector = vad.current;
      if (!detector) {
        return;
      }

      if (detector.push(chunk) === VoiceActivityDetectionEvent.SpeechEnded) {
        // Auto-stop: the speaker finished. Fire-and-forget; `finalize` guards
        // against double invocation via `activeRef`.
        finalizeRef.current();
      }
    },
    [vad],
  );

  const { stream } = useAudioStream({
    sampleRate: SAMPLE_RATE,
    channels: 1,
    encoding: "int16",
    onBuffer: handleBuffer,
  });

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const finalize = useCallback(async () => {
    // Claim the turn synchronously so an auto-stop and a manual stop can't race.
    if (!activeRef.current) {
      return;
    }
    activeRef.current = false;

    streamRef.current?.stop();
    setIsRecording(false);

    setIsTranscribing(true);
    try {
      await createStt();
      const model = stt.current;
      if (!model) {
        throw new Error("STT model unavailable");
      }

      const detector = vad.current;
      // Prefer the VAD's trimmed speech segment (with pre-roll); fall back to
      // the full capture if speech was never confirmed.
      const segment = detector?.finish() ?? [];
      const speech = segment.length > 0 ? segment : samplesRef.current;

      if (speech.length > 0) {
        const raw = await model
          .transcribePcm(speech, sampleRateRef.current)
          .completed();
        const text = cleanTranscript(raw);

        if (text) {
          onTranscribedRef.current(text);
        }
      }
    } finally {
      samplesRef.current = [];
      setIsTranscribing(false);
    }
  }, [createStt, stt, vad]);

  useEffect(() => {
    finalizeRef.current = finalize;
  }, [finalize]);

  const startRecording = useCallback(async () => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      throw new Error("Microphone unavailable or permission denied");
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });

    // Start capturing first so we can read the hardware's actual sample rate;
    // buffers arriving before the VAD finishes loading are still accumulated
    // (for the fallback) and simply aren't analysed until the detector exists.
    samplesRef.current = [];
    activeRef.current = true;
    await streamRef.current?.start();
    setIsRecording(true);

    // Load the VAD at the real capture rate so its silence timing is calibrated
    // correctly even when the hardware ignores our 16 kHz request.
    const actualRate = streamRef.current?.sampleRate || SAMPLE_RATE;
    sampleRateRef.current = actualRate;
    await createVad({
      sampleRate: actualRate,
      minSilenceDurationMs: MIN_SILENCE_MS,
    });
  }, [createVad]);

  const toggle = useCallback(async () => {
    if (busyRef.current || isTranscribing) {
      return;
    }

    busyRef.current = true;

    try {
      if (isRecording) {
        await finalize();
      } else {
        await startRecording();
      }
    } catch (error) {
      devLog("useSttRecording error:", error);
      activeRef.current = false;
      streamRef.current?.stop();
      setIsRecording(false);
      setIsTranscribing(false);
    } finally {
      busyRef.current = false;
    }
  }, [isRecording, isTranscribing, startRecording, finalize]);

  useEffect(() => {
    return () => {
      // Best-effort stop if the screen unmounts mid-recording.
      activeRef.current = false;
      try {
        streamRef.current?.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  return { isRecording, isTranscribing, toggle };
};
