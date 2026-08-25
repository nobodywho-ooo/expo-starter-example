import { Pressable, PressableProps, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks';
import { PlatformSymbol } from './platform-symbol';
import { Text } from './text';

interface ListItemProps extends Omit<PressableProps, 'children'> {
  title: string;
  subtitle: string;
  iosIconName: string;
  androidIconName: string;
  iconBackgroundColor: string;
}

export function ListItem({
  title,
  subtitle,
  iosIconName,
  androidIconName,
  iconBackgroundColor,
  disabled,
  ...props
}: ListItemProps) {
  const { colors } = useColors();

  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled]}
      disabled={disabled}
      {...props}>
      <View
        style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <PlatformSymbol
          ios={iosIconName}
          android={androidIconName}
          size={20}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.chevron}>
        <PlatformSymbol
          ios="chevron.right"
          android="chevron_right"
          size={16}
          color={colors.onSurfaceVariant}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.4,
  },
});
