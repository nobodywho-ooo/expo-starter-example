import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { cosineSimilarity } from 'react-native-nobodywho';

import { Button, Text } from '@/components';
import { devLog } from '@/helpers';
import { useColors } from '@/hooks';
import { useAiService } from '@/services';

const documents = [
  'Python supports multiple programming paradigms including object-oriented and functional',
  'JavaScript is primarily used for web development and runs in browsers',
  'SQL is a domain-specific language for managing relational databases',
  'Git is a version control system for tracking changes in source code',
];

const query = 'What language should I use for database queries?';

export default function EmbeddingsScreen() {
  const { encoder } = useAiService();
  const { colors } = useColors();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bestMatch, setBestMatch] = useState('');

  // Plain function: the React Compiler handles memoization; hand-memoizing over
  // `encoder.current` trips the preserve-manual-memoization lint rule.
  const runEmbeddings = async () => {
    const activeEncoder = encoder.current;
    if (!activeEncoder) return;

    setBestMatch('');
    setIsProcessing(true);
    try {
      // Pre-compute document embeddings
      const docEmbeddings: number[][] = [];
      for (const doc of documents) {
        docEmbeddings.push(await activeEncoder.encode(doc));
      }

      // Search query
      const queryEmbedding = await activeEncoder.encode(query);

      // Find the most relevant document
      let maxSimilarity = -1;
      let bestIdx = 0;
      for (let i = 0; i < docEmbeddings.length; i++) {
        const similarity = cosineSimilarity(queryEmbedding, docEmbeddings[i]);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestIdx = i;
        }
      }
      setBestMatch(documents[bestIdx]);
    } catch (error) {
      devLog('EmbeddingsScreen error', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text variant="h3">Example</Text>

      {documents.map((doc, i) => (
        <Text key={i} style={styles.document}>
          {doc}
        </Text>
      ))}

      <Button
        style={styles.button}
        title={isProcessing ? 'Running...' : 'Run Embeddings'}
        variant="primary"
        onPress={runEmbeddings}
        disabled={isProcessing}
      />

      {isProcessing && bestMatch === '' ? (
        <ActivityIndicator size="large" style={styles.spinner} />
      ) : bestMatch !== '' ? (
        <>
          <Text style={styles.paragraph} italic>
            Query: {query}
          </Text>
          <Text style={styles.paragraph}>Best match: {bestMatch}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  document: { paddingTop: 8 },
  button: { marginTop: 16, marginBottom: 16 },
  spinner: {
    alignSelf: 'center',
    paddingVertical: 24,
  },
  paragraph: { paddingTop: 8 },
});
