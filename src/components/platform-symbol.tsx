import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

interface PlatformSymbolProps {
  /** SF Symbol name (iOS). */
  ios: string;
  /** Material Symbol name (Android / web). */
  android: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * A single cross-platform icon. `expo-symbols` renders SF Symbols on iOS and
 * Material Symbols on Android/web when `name` is given as a platform map, so we
 * never have to branch on `Platform.OS` at the call site.
 */
export function PlatformSymbol({
  ios,
  android,
  size = 20,
  color,
  style,
}: PlatformSymbolProps) {
  return (
    <SymbolView
      name={{ ios, android, web: android } as SymbolViewProps['name']}
      size={size}
      tintColor={color}
      style={style}
    />
  );
}
