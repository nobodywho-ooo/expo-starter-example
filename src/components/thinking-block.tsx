import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';
import { PlatformSymbol } from './platform-symbol';
import { Text } from './text';

interface ThinkingBlockProps {
  thinking: string | null;
  isComplete: boolean;
}

export function ThinkingBlock({ thinking, isComplete }: ThinkingBlockProps) {
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);

  if (!isComplete) {
    return (
      <View style={styles.loaderRow}>
        <ActivityIndicator size="small" color={colors.onSurfaceVariant} />
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          Thinking...
        </Text>
      </View>
    );
  }

  if (!thinking) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsOpen(open => !open)}
        style={styles.header}
        hitSlop={8}>
        <PlatformSymbol
          ios={isOpen ? 'chevron.down' : 'chevron.right'}
          android={isOpen ? 'expand_more' : 'chevron_right'}
          size={14}
          color={colors.onSurfaceVariant}
        />
        <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
          Thoughts
        </Text>
      </Pressable>

      {isOpen && (
        <Text variant="body2" style={[styles.body, { color: colors.onSurfaceVariant }]}>
          {thinking}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  container: {
    width: '100%',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  body: {
    marginTop: 8,
    lineHeight: 20,
  },
});
