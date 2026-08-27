import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import { useColors } from '@/hooks';
import { IconButton } from './icon-button';

const INPUT_BAR_HEIGHT = 98;

const getBoxShadow = (shadowColor: string) => ({
  boxShadow: [
    {
      offsetX: 0,
      offsetY: 0,
      blurRadius: 15,
      spreadDistance: 4,
      color: shadowColor,
      inset: false,
    },
  ],
});

interface InputBarProps {
  value: string;
  isStreaming: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStop: () => void;
  onToggleSpeechToText: () => void;
  style?: StyleProp<ViewStyle>;
}

export function InputBar({
  value,
  isStreaming,
  isRecording,
  isTranscribing,
  onChangeText,
  onSend,
  onStop,
  onToggleSpeechToText,
  style,
}: InputBarProps) {
  const { colors } = useColors();

  return (
    <View style={[styles.inputBarOuter, style]}>
        <View
          style={[
            styles.inputBarInner,
            getBoxShadow(colors.shadow),
            { backgroundColor: colors.surfaceSecondary },
          ]}>
        <TextInput
          style={[styles.textInput, { color: colors.onSurface }]}
          placeholder="Ask something..."
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          multiline
        />
        <View style={styles.actionsContainer}>
          <SpeechToTextButton
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            onPress={onToggleSpeechToText}
          />
          <SendButton
            isStreaming={isStreaming}
            value={value}
            onSend={onSend}
            onStop={onStop}
          />
        </View>
      </View>
    </View>
  );
}

InputBar.height = INPUT_BAR_HEIGHT;

interface SendButtonProps {
  isStreaming: boolean;
  value: string;
  onSend: () => void;
  onStop: () => void;
}

function SendButton({ isStreaming, value, onSend, onStop }: SendButtonProps) {
  const { colors } = useColors();

  if (isStreaming) {
    return (
      <IconButton
        icon={{ iosIconName: 'stop.circle', androidIconName: 'stop_circle' }}
        onPress={onStop}
        size={28}
        color={colors.danger}
        backgroundColor="transparent"
      />
    );
  }

  let color = colors.primary;
  let fontWeight: '500' | '600' = '500';

  if (value === '') {
    color = colors.onSurfaceVariant;
    fontWeight = '600';
  }

  return (
    <Pressable onPress={onSend} style={styles.sendButton}>
      <Text style={[styles.sendButtonText, { color, fontWeight }]}>Send</Text>
    </Pressable>
  );
}

interface SpeechToTextButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  onPress: () => void;
}

function SpeechToTextButton({
  isRecording,
  isTranscribing,
  onPress,
}: SpeechToTextButtonProps) {
  const { colors } = useColors();

  if (isTranscribing) {
    return <ActivityIndicator size="small" color={colors.primary} />;
  }

  return (
    <IconButton
      icon={
        isRecording
          ? { iosIconName: 'stop.fill', androidIconName: 'stop' }
          : { iosIconName: 'microphone.fill', androidIconName: 'mic' }
      }
      onPress={onPress}
      size={20}
      color={isRecording ? colors.danger : colors.primary}
      backgroundColor="transparent"
    />
  );
}

const styles = StyleSheet.create({
  inputBarOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
  },
  inputBarInner: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: INPUT_BAR_HEIGHT,
    overflow: 'hidden',
    backgroundColor: 'rgb(226, 226, 226)'
  },
  actionsContainer: {
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
  },
});
