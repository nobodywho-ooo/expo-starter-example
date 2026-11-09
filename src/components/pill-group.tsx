import { StyleSheet, View } from 'react-native';

import { Pill } from './pill';

interface PillGroupProps {
  options: { label: string; probability?: number }[];
}

export function PillGroup({ options }: PillGroupProps) {
  const best = options.reduce<number | undefined>(
    (max, { probability }) =>
      probability !== undefined && (max === undefined || probability > max)
        ? probability
        : max,
    undefined,
  );

  return (
    <View style={styles.container}>
      {options.map(({ label, probability }) => (
        <Pill
          key={label}
          label={label}
          probability={probability}
          highlighted={best !== undefined && probability === best}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
