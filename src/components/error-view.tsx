import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';
import { Button } from './button';
import { Text } from './text';

interface ErrorViewProps {
  onRetry: () => void;
}

export function ErrorView({ onRetry }: ErrorViewProps) {
  const { colors } = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.text, { color: colors.onSurface }]}>
        Something went wrong
      </Text>
      <Button title="Retry" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginBottom: 16,
  },
});
