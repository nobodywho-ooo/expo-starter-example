import { StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';
import { Text } from './text';

const SUCCESS_COLOR = '#34C759';
const TICK_HEIGHT = 12;
const DOT_SIZE = 16;

interface ScoreAxisProps {
  levels: string[];
  score?: number;
}

export function ScoreAxis({ levels, score }: ScoreAxisProps) {
  const { colors } = useColors();
  const lastIndex = levels.length - 1;

  const textAlign = (index: number) =>
    index === 0 ? 'left' : index === lastIndex ? 'right' : 'center';

  return (
    <View>
      <View style={styles.axis}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        {levels.map((level, index) => (
          <View
            key={level}
            style={[
              styles.tick,
              {
                left: `${(index / lastIndex) * 100}%`,
                backgroundColor: colors.border,
              },
            ]}
          />
        ))}
        {score !== undefined && (
          <View
            style={[
              styles.dot,
              {
                left: `${(score / lastIndex) * 100}%`,
                backgroundColor: SUCCESS_COLOR,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.labels}>
        {levels.map((level, index) => (
          <Text
            key={level}
            variant="caption"
            style={[styles.label, { textAlign: textAlign(index) }]}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: {
    height: TICK_HEIGHT,
    justifyContent: 'center',
  },
  line: { height: 2 },
  tick: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: TICK_HEIGHT,
    marginLeft: -1,
  },
  dot: {
    position: 'absolute',
    top: (TICK_HEIGHT - DOT_SIZE) / 2,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginLeft: -DOT_SIZE / 2,
  },
  labels: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  label: { flex: 1 },
});
