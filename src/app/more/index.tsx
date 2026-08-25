import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { ListItem } from '@/components';
import { useColors } from '@/hooks';
import { AiModelState, useAiService } from '@/services';

export default function MoreScreen() {
  const { colors } = useColors();
  const router = useRouter();
  const { encoderState, crossEncoderState, createEncoder, createCrossEncoder } =
    useAiService();

  useEffect(() => {
    createEncoder();
    createCrossEncoder();
  }, [createEncoder, createCrossEncoder]);

  const isLoading =
    encoderState === AiModelState.Loading ||
    crossEncoderState === AiModelState.Loading;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.surface }]}>
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.spinner} />
      ) : (
        <>
          <ListItem
            title="Embeddings"
            subtitle="Use embeddings to find the relevant documents"
            iosIconName="document.fill"
            androidIconName="article"
            iconBackgroundColor="#5856D6"
            disabled={encoderState === AiModelState.Error}
            onPress={() => router.push('/more/embeddings')}
          />
          <ListItem
            title="RAG"
            subtitle="Demonstrate a two-stage retrieval system using RAG"
            iosIconName="magnifyingglass"
            androidIconName="search"
            iconBackgroundColor="#FF9500"
            disabled={
              crossEncoderState === AiModelState.Error ||
              encoderState === AiModelState.Error
            }
            onPress={() => router.push('/more/rag')}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  spinner: {
    alignSelf: 'center',
    paddingVertical: 24,
  },
});
