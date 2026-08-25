import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';

export function LoadingView() {
  const { colors } = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
