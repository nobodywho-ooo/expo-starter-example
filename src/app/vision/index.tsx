import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { Prompt } from 'react-native-nobodywho';

import { Button, ErrorView, LoadingView, Text } from '@/components';
import { devLog, getAssetPath, getMarkdownStyle } from '@/helpers';
import { useColors, useTabBarBottomPadding, useThemeMode } from '@/hooks';
import { AiModelState, useAiService } from '@/services';

export default function VisionRoute() {
  const { visionChatState, createVisionChat, disposeVisionChat } =
    useAiService();

  // Load the model when this tab gains focus and free it when inactive
  useFocusEffect(
    useCallback(() => {
      createVisionChat();
      return () => {
        disposeVisionChat();
      };
    }, [createVisionChat, disposeVisionChat]),
  );

  switch (visionChatState) {
    case AiModelState.Ready:
      return <VisionScreen />;
    case AiModelState.Error:
      return <ErrorView onRetry={createVisionChat} />;
    default:
      return <LoadingView />;
  }
}

function VisionScreen() {
  const { colors } = useColors();
  const { isDarkMode } = useThemeMode();
  const paddingBottom = useTabBarBottomPadding();
  const { visionChat } = useAiService();
  const [result, setResult] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Not wrapped in useCallback: the React Compiler (reactCompiler is enabled in
  // app.json) memoizes automatically, and hand-memoizing a closure over a ref's
  // `.current` trips the preserve-manual-memoization rule.
  const analyse = async () => {
    const activeChat = visionChat.current;

    if (!activeChat) {
      return;
    }

    setResult('');
    setIsStreaming(true);
    try {
      const image1Path = await getAssetPath('image-1.png');
      const image2Path = await getAssetPath('image-2.png');
      const prompt = new Prompt([
        Prompt.Text('Tell me what you see in the first image.'),
        Prompt.Image(image1Path),
        Prompt.Text('Also tell me what you see in the second image.'),
        Prompt.Image(image2Path),
      ]);
      let accumulated = '';
      for await (const token of activeChat.ask(prompt)) {
        accumulated += token;
        setResult(accumulated);
      }
    } catch (error) {
      devLog('VisionScreen error', error);
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
      <Image
        source={require('@/assets/media/image-1.png')}
        style={styles.image}
        contentFit="cover"
      />
      <Image
        source={require('@/assets/media/image-2.png')}
        style={styles.image}
        contentFit="cover"
      />
      <Text variant="h3">Analyze & Describe</Text>
      <Text style={styles.subHeader}>
        Find out what the model can see in the images.
      </Text>
      <Button
        style={styles.button}
        title={isStreaming ? 'Analyzing...' : 'Analyze'}
        variant="primary"
        onPress={analyse}
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  subHeader: { paddingTop: 8, paddingBottom: 4 },
  markdownContainer: { paddingVertical: 24 },
  spinner: {
    alignSelf: 'center',
    paddingVertical: 24,
  },
  button: { marginTop: 16, marginBottom: 2 },
});
