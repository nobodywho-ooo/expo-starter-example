import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';
import { PlatformSymbol } from './platform-symbol';
import { Text } from './text';

export function EmptyChat() {
  const { colors } = useColors();

  return (
    <View style={styles.container}>
      <PlatformSymbol
        ios="bubble.fill"
        android="chat_bubble"
        size={48}
        color={colors.onSurfaceVariant}
      />
      <Text style={[styles.text, { color: colors.onSurfaceVariant }]}>
        Start a chat
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text: {
    paddingTop: 10,
  },
});
