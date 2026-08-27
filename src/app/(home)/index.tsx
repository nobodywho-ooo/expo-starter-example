import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Message } from 'react-native-nobodywho';

import {
  EmptyChat,
  ErrorView,
  InputBar,
  LoadingView,
  MessageListItem,
} from '@/components';
import { isIOS } from '@/helpers';
import {
  useColors,
  useSttRecording,
  useTabBarBottomPadding,
  useTtsPlayback,
} from '@/hooks';

import { AiModelState, useAiService } from '@/services';

const INPUT_BAR_BOTTOM_GAP = 10;

export default function ChatRoute() {
  const { chatState, createChat } = useAiService();

  const initChat = useCallback(async () => {
    await createChat();
  }, [createChat]);

  useEffect(() => {
    initChat();
  }, [initChat]);

  switch (chatState) {
    case AiModelState.Ready:
      return <ChatScreen />;
    case AiModelState.Error:
      return <ErrorView onRetry={initChat} />;
    default:
      return <LoadingView />;
  }
}

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardOffset, setKeyboardOffset] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const { colors } = useColors();
  const { chat: currentChat } = useAiService();
  const { loadingIndex, playingIndex, play, stop } = useTtsPlayback();
  const appendTranscript = useCallback(
    (text: string) => setInputText(prev => (prev ? `${prev} ${text}` : text)),
    [],
  );
  const {
    isRecording,
    isTranscribing,
    toggle: toggleSpeechToText,
  } = useSttRecording(appendTranscript);
  const flatListRef = useRef<FlatList>(null);
  const containerRef = useRef<View>(null);
  const paddingBottom = useTabBarBottomPadding();
  const isKeyboardVisible = keyboardHeight > 0;

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages]);

  useEffect(() => {
    const showEvent = isIOS ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = isIOS ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e.endCoordinates.height);

      const windowHeight = Dimensions.get('window').height;
      const keyboardTop =
        e.endCoordinates.screenY || windowHeight - e.endCoordinates.height;

      containerRef.current?.measureInWindow((_x, y, _width, height) => {
        const containerBottom = y + height;
        setKeyboardOffset(
          Math.max(
            containerBottom - keyboardTop + INPUT_BAR_BOTTOM_GAP,
            INPUT_BAR_BOTTOM_GAP,
          ),
        );
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    const userInput = inputText.trim();
    if (!userInput || isStreaming) {
      return;
    }

    const chat = currentChat.current;
    if (!chat) {
      return;
    }

    const userMessage: Message = { role: 'user', content: userInput };
    const initialAssistantMessage: Message = { role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsStreaming(true);

    try {
      let accumulated = '';
      const streamResult = chat.ask(userInput);

      for await (const token of streamResult) {
        accumulated += token;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: accumulated };
          return next;
        });
      }
    } catch (error) {
      console.error('Chat generation failed:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    currentChat.current?.stopGeneration();
  };

  const bottomOffset =
    isKeyboardVisible && keyboardOffset != null
      ? keyboardOffset
      : paddingBottom + INPUT_BAR_BOTTOM_GAP;
  const footerHeight =
    paddingBottom + INPUT_BAR_BOTTOM_GAP * 2 + InputBar.height;

  const ListFooter = useMemo(
    () => <View style={{ height: footerHeight }} />,
    [footerHeight],
  );

  const keyExtractor = useCallback(
    (_: Message, index: number) => `${index}`,
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => (
      <MessageListItem
        message={item}
        index={index}
        isStreaming={isStreaming}
        isAudioLoading={loadingIndex === index}
        isPlaying={playingIndex === index}
        onPlay={play}
        onStop={stop}
      />
    ),
    [isStreaming, loadingIndex, playingIndex, play, stop],
  );

  return (
    <View
      ref={containerRef}
      style={[styles.container, { backgroundColor: colors.surface }]}>
      {messages.length === 0 ? (
        <Pressable style={styles.emptyArea} onPress={Keyboard.dismiss}>
          {!isKeyboardVisible && <EmptyChat />}
        </Pressable>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={ListFooter}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />
      )}
      <InputBar
        value={inputText}
        isStreaming={isStreaming}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        onChangeText={setInputText}
        onSend={handleSend}
        onStop={stopStreaming}
        onToggleSpeechToText={toggleSpeechToText}
        style={{ bottom: bottomOffset }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyArea: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
});
