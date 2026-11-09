import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';
import { Text } from './text';

const SUCCESS_COLOR = '#34C759';

const pct = (p: number) => `${(p * 100).toFixed(1)}%`;

interface PillProps {
  label: string;
  probability?: number;
  highlighted: boolean;
}

export function Pill({ label, probability, highlighted }: PillProps) {
  const { colors } = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: highlighted
            ? SUCCESS_COLOR
            : colors.surfaceContainer,
        },
      ]}>
      <Text variant="body2" bold style={highlighted && styles.highlightedText}>
        {label.charAt(0).toUpperCase() + label.slice(1)}
      </Text>
      {probability !== undefined && (
        <Text variant="caption" style={highlighted && styles.highlightedText}>
          {pct(probability)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  highlightedText: { color: '#FFFFFF' },
});
