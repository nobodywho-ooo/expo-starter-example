import { Stack } from 'expo-router';

import { useColors } from '@/hooks';

export default function ChatStackLayout() {
  const { colors } = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { color: colors.onSurface },
      }}>
      <Stack.Screen name="index" options={{ title: 'Chat' }} />
    </Stack>
  );
}
