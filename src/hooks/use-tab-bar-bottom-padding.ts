import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isAndroid } from '@/helpers';

const ANDROID_TAB_BAR_HEIGHT = 80;

/**
 * Approximate bottom padding needed to keep content clear of the native tab bar.
 */
export const useTabBarBottomPadding = (): number => {
  const insets = useSafeAreaInsets();
  return isAndroid ? ANDROID_TAB_BAR_HEIGHT + insets.bottom : 90;
};
