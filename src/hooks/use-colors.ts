import { useColorScheme } from 'react-native';

import { AppColors, getColors } from '@/constants/colors';

/**
 * Resolves the active color palette from the device color scheme.
 * Expo's `useColorScheme()` re-renders on system theme changes automatically.
 */
export const useColors = (): { colors: AppColors; isDark: boolean } => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return { colors: getColors(isDark ? 'dark' : 'light'), isDark };
};
