import {
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';

import { useColors } from '@/hooks';
import { TextVariant } from '@/types';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  bold?: boolean;
  italic?: boolean;
}

export function Text({
  variant = 'body1',
  bold,
  italic,
  style,
  ...props
}: TextProps) {
  const { colors } = useColors();

  return (
    <RNText
      style={[
        { color: colors.onSurface },
        variantStyles[variant],
        bold && styles.bold,
        italic && styles.italic,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '600',
  },
  italic: {
    fontStyle: 'italic',
  },
});

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -1.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: 0,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};
