import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Stack } from 'expo-router';

import { useColors } from '@/hooks';

export default function HearingStackLayout() {
  const { colors } = useColors();
  const glass = isLiquidGlassAvailable();

  return (
    <Stack
      screenOptions={{
        ...(glass ? {} : { headerStyle: { backgroundColor: colors.surface } }),
        headerTintColor: colors.onSurface,
        headerTitleStyle: { color: colors.onSurface },
        headerLargeTitleStyle: { color: colors.onSurface },
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Hearing', headerLargeTitle: true }}
      />
    </Stack>
  );
}
