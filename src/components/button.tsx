import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { AppColors } from '@/constants/colors';
import { useColors } from '@/hooks';
import { ButtonVariant } from '@/types';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  style,
  ...props
}: ButtonProps) {
  const { colors } = useColors();
  const variantStyle = getVariantStyles(variant, colors);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variantStyle.button,
        style,
        pressed && { opacity: 0.7 },
      ]}
      android_ripple={{ color: 'rgba(0,0,0,0.12)', foreground: true }}
      {...props}>
      <Text style={[styles.text, variantStyle.text]}>{title}</Text>
    </Pressable>
  );
}

const getVariantStyles = (
  variant: ButtonVariant,
  colors: AppColors,
): { button: ViewStyle; text: TextStyle } => {
  switch (variant) {
    case 'primary':
      return {
        button: { backgroundColor: colors.primary },
        text: { color: '#FFFFFF' },
      };
    case 'outline':
      return {
        button: {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        text: { color: colors.onSurface },
      };
  }
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
