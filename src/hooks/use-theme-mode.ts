import { useColorScheme } from 'react-native';

export const useThemeMode = (): { isDarkMode: boolean } => {
  const colorScheme = useColorScheme();
  return { isDarkMode: colorScheme === 'dark' };
};
