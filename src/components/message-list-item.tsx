import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { Message } from 'react-native-nobodywho';

import { getMarkdownStyle } from '@/helpers';
import { useColors, useThemeMode } from '@/hooks';
import { PlatformSymbol } from './platform-symbol';
import { Text } from './text';

interface MessageListItemProps {
  message: Message;
  index: number;
  isStreaming: boolean;
  isAudioLoading: boolean;
  isPlaying: boolean;
  onPlay: (index: number, text: string) => void;
  onStop: () => void;
}

function MessageListItemComponent({
  message,
  index,
  isStreaming,
  isAudioLoading,
  isPlaying,
  onPlay,
  onStop,
}: MessageListItemProps) {
  const { content, role } = message;
  const { colors } = useColors();
  const { isDarkMode } = useThemeMode();

  const markdownStyle = useMemo(
    () => getMarkdownStyle(isDarkMode, colors.onSurface),
    [isDarkMode, colors.onSurface],
  );

  if (role === 'user') {
    return (
      <View
        style={[
          styles.userContainer,
          { backgroundColor: colors.surfaceContainer },
        ]}>
        <Text style={styles.text}>{content}</Text>
      </View>
    );
  }

  const iconTtsColor = isStreaming ? colors.primaryDisabled : colors.primary;
  const onToggleTts = () => (isPlaying ? onStop() : onPlay(index, content));

  return (
    <>
      <EnrichedMarkdownText
        containerStyle={styles.assistantContainer}
        markdown={content}
        markdownStyle={markdownStyle}
      />
      {isAudioLoading ? (
        <ActivityIndicator style={styles.activityIndicator} />
      ) : (
        content !== '' && (
          <Pressable onPress={!isStreaming ? onToggleTts : undefined}>
            <PlatformSymbol
              ios={isPlaying ? 'stop.circle' : 'speaker.wave.3.fill'}
              android={isPlaying ? 'stop_circle' : 'volume_up'}
              size={16}
              color={iconTtsColor}
            />
          </Pressable>
        )
      )}
    </>
  );
}

export const MessageListItem = React.memo(MessageListItemComponent);

const styles = StyleSheet.create({
  userContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 12,
    maxWidth: '90%',
    alignSelf: 'flex-end',
    borderRadius: 16,
  },
  assistantContainer: {
    marginVertical: 12,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  activityIndicator: {
    alignSelf: 'flex-start',
  },
});
