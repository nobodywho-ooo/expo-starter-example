import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  RecordingOptions,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

import { devLog } from '@/helpers';
import { useAiService } from '@/services';

const SAMPLE_RATE = 16000;

// Whisper's `transcribeFile` decodes WAV / MP3. iOS records uncompressed
// LINEAR PCM WAV natively; on Android the container differs, so the mic feature
// is best-effort there — see the NobodyWho docs for platform notes.
const STT_RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.wav',
  sampleRate: SAMPLE_RATE,
  numberOfChannels: 1,
  ios: {
    ...RecordingPresets.HIGH_QUALITY.ios,
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    sampleRate: SAMPLE_RATE,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  android: {
    ...RecordingPresets.HIGH_QUALITY.android,
    extension: '.wav',
    sampleRate: SAMPLE_RATE,
  },
};

// Strip non-speech markers from Whisper, like "[BLANK_AUDIO]", "[MUSIC]", ...
const cleanTranscript = (text: string): string =>
  text
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripScheme = (uri: string): string => uri.replace(/^file:\/\//, '');

interface SttRecording {
  isRecording: boolean;
  isTranscribing: boolean;
  toggle: () => Promise<void>;
}

/**
 * Records microphone audio to a WAV file with `expo-audio` and transcribes it
 * with the NobodyWho Whisper model from `useAiService`. `onTranscribed`
 * receives the final text once recording stops.
 */
export const useSttRecording = (
  onTranscribed: (text: string) => void,
): SttRecording => {
  const { stt, createStt } = useAiService();
  const recorder = useAudioRecorder(STT_RECORDING_OPTIONS);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  const busyRef = useRef<boolean>(false);
  const onTranscribedRef = useRef(onTranscribed);
  useEffect(() => {
    onTranscribedRef.current = onTranscribed;
  }, [onTranscribed]);

  const startRecording = useCallback(async () => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      throw new Error('Microphone unavailable or permission denied');
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
  }, [recorder]);

  const stopAndTranscribe = useCallback(async () => {
    await recorder.stop();
    setIsRecording(false);

    const uri = recorder.uri;
    if (!uri) {
      return;
    }

    setIsTranscribing(true);
    try {
      await createStt();
      const model = stt.current;
      if (!model) {
        throw new Error('STT model unavailable');
      }

      const raw = await model.transcribeFile(stripScheme(uri)).completed();
      const text = cleanTranscript(raw);

      if (text) {
        onTranscribedRef.current(text);
      }
    } finally {
      setIsTranscribing(false);
    }
  }, [recorder, stt, createStt]);

  const toggle = useCallback(async () => {
    if (busyRef.current || isTranscribing) {
      return;
    }

    busyRef.current = true;

    try {
      if (isRecording) {
        await stopAndTranscribe();
      } else {
        await startRecording();
      }
    } catch (error) {
      devLog('useSttRecording error:', error);
      setIsRecording(false);
      setIsTranscribing(false);
    } finally {
      busyRef.current = false;
    }
  }, [isRecording, isTranscribing, startRecording, stopAndTranscribe]);

  useEffect(() => {
    return () => {
      // Best-effort stop if the screen unmounts mid-recording.
      recorder.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isRecording, isTranscribing, toggle };
};
