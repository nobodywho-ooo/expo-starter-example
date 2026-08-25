import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColors } from '@/hooks';
import { AiServiceProvider } from '@/services';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AiServiceProvider>
        <ThemedTabs />
      </AiServiceProvider>
    </GestureHandlerRootView>
  );
}

function ThemedTabs() {
  const scheme = useColorScheme();
  const { colors } = useColors();
  const isDark = scheme === 'dark';

  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: { ...base.colors, background: colors.surface },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NativeTabs
        tintColor={colors.tabBarActive}
        backgroundColor={colors.surfaceSecondary}>
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="bubble.fill" md="chat" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="vision">
          <NativeTabs.Trigger.Label>Vision</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="camera.fill" md="photo_camera" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="hearing">
          <NativeTabs.Trigger.Label>Hearing</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="ear.fill" md="hearing" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="more">
          <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="ellipsis.circle.fill" md="more_horiz" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </ThemeProvider>
  );
}
