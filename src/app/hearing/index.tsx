import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { Prompt } from 'react-native-nobodywho';

import { Button, ErrorView, LoadingView, Text } from '@/components';
import { devLog, getAssetPath, getMarkdownStyle } from '@/helpers';
import { useColors, useTabBarBottomPadding, useThemeMode } from '@/hooks';
import { AiModelState, useAiService } from '@/services';

export default function HearingRoute() {
  const { visionHearingChatState, createVisionHearingChat } = useAiService();

  const initHearingChat = useCallback(async () => {
    await createVisionHearingChat();
  }, [createVisionHearingChat]);

  useEffect(() => {
    initHearingChat();
  }, [initHearingChat]);

  switch (visionHearingChatState) {
    case AiModelState.Ready:
      return <HearingScreen />;
    case AiModelState.Error:
      return <ErrorView onRetry={initHearingChat} />;
    default:
      return <LoadingView />;
  }
}

function HearingScreen() {
  const { colors } = useColors();
  const { isDarkMode } = useThemeMode();
  const paddingBottom = useTabBarBottomPadding();
  const { visionHearingChat } = useAiService();
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Plain function on purpose — the React Compiler memoizes it, and manual
  // memoization over `visionHearingChat.current` is rejected by the linter.
  const transcribe = async () => {
    const activeChat = visionHearingChat.current;
    if (!activeChat) return;

    setResult('');
    setIsStreaming(true);
    try {
      const audioPath = await getAssetPath('audio.mp3');
      const prompt = new Prompt([
        Prompt.Text('Tell me what you hear in the audio. Transcribe'),
        Prompt.Audio(audioPath),
      ]);
      let accumulated = '';
      for await (const token of activeChat.ask(prompt)) {
        accumulated += token;
        setResult(accumulated);
      }
    } catch (error) {
      devLog('HearingScreen error', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const markdownStyle = useMemo(
    () => getMarkdownStyle(isDarkMode, colors.onSurface),
    [isDarkMode, colors.onSurface],
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.surface, paddingBottom }]}>
      <Text variant="h3">Transcribe audio.mp3</Text>
      <Button
        style={styles.button}
        title={isStreaming ? 'Getting speech...' : 'Get speech'}
        variant="primary"
        onPress={transcribe}
        disabled={isStreaming}
      />
      {isStreaming && result === '' ? (
        <ActivityIndicator size="large" style={styles.spinner} />
      ) : (
        <EnrichedMarkdownText
          containerStyle={styles.markdownContainer}
          markdown={result}
          markdownStyle={markdownStyle}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  markdownContainer: { paddingVertical: 24 },
  spinner: {
    alignSelf: 'center',
    paddingVertical: 24,
  },
  button: { marginTop: 16 },
});
