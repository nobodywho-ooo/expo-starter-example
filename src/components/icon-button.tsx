import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { useColors } from '@/hooks';
import { PlatformSymbol } from './platform-symbol';

export interface IconButtonIconProps {
  iosIconName: string;
  androidIconName: string;
}

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: IconButtonIconProps;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export function IconButton({
  icon,
  size = 20,
  color,
  backgroundColor,
  ...props
}: IconButtonProps) {
  const { colors } = useColors();

  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: backgroundColor ?? colors.surfaceContainer },
        pressed && { opacity: 0.6 },
      ]}
      {...props}>
      <PlatformSymbol
        ios={icon.iosIconName}
        android={icon.androidIconName}
        size={size}
        color={color ?? colors.onSurface}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
