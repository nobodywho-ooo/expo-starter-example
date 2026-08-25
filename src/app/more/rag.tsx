import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { cosineSimilarity } from 'react-native-nobodywho';

import { Button, Text } from '@/components';
import { devLog } from '@/helpers';
import { useColors } from '@/hooks';
import { useAiService } from '@/services';

const knowledgeBase = [
  'Python supports multiple programming paradigms including object-oriented and functional',
  'JavaScript is primarily used for web development and runs in browsers',
  'SQL is a domain-specific language for managing relational databases',
  'Git is a version control system for tracking changes in source code',
  'NumPy is a Python library for numerical computing and array operations',
  'Pandas is a Python library for data manipulation and analysis',
  'Matplotlib is a Python plotting library for creating static visualizations',
  'Seaborn builds on Matplotlib for statistical data visualization in Python',
  'scikit-learn is a Python library for classical machine learning algorithms',
  'TensorFlow is an end-to-end open-source platform for machine learning',
  'PyTorch is a deep learning framework widely used in research',
  'React is a JavaScript library for building user interfaces',
  'Node.js lets developers run JavaScript on the server side',
  'TypeScript adds optional static typing to JavaScript',
  'Docker packages applications and dependencies into portable containers',
  'Kubernetes orchestrates containerized applications at scale',
  'PostgreSQL is a powerful open-source relational database',
  'Redis is an in-memory data store used as a cache and message broker',
  'GraphQL is a query language for APIs that lets clients request exact data',
  'Rust is a systems programming language focused on safety and performance',
  'Go is a compiled language designed for concurrent network services',
  'Linux is an open-source operating system kernel used across servers',
];

const query = 'What Python libraries are best for data analysis?';

export default function RagScreen() {
  const { encoder, crossEncoder } = useAiService();
  const { colors } = useColors();
  const [isProcessing, setIsProcessing] = useState(false);
  const [topResults, setTopResults] = useState<string[]>([]);

  // Plain function: the React Compiler handles memoization; hand-memoizing over
  // `encoder.current` / `crossEncoder.current` trips the linter.
  const runRag = async () => {
    const activeEncoder = encoder.current;
    const activeCrossEncoder = crossEncoder.current;
    if (!activeEncoder || !activeCrossEncoder) return;

    setTopResults([]);
    setIsProcessing(true);
    try {
      // Pre-compute embeddings for all documents
      const docEmbeddings: number[][] = [];
      for (const doc of knowledgeBase) {
        docEmbeddings.push(await activeEncoder.encode(doc));
      }

      // Stage 1: Fast filtering with embeddings
      const queryEmbedding = await activeEncoder.encode(query);
      const similarities: { doc: string; score: number }[] = [];
      for (let i = 0; i < knowledgeBase.length; i++) {
        similarities.push({
          doc: knowledgeBase[i],
          score: cosineSimilarity(queryEmbedding, docEmbeddings[i]),
        });
      }
      similarities.sort((a, b) => b.score - a.score);
      const candidateDocs = similarities.slice(0, 20).map(s => s.doc);

      // Stage 2: Precise ranking with cross-encoder
      const ranked = await activeCrossEncoder.rankAndSort(query, candidateDocs);

      // Return top 3 most relevant
      setTopResults(ranked.slice(0, 3).map(([doc]) => doc));
    } catch (error) {
      devLog('RagScreen error', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text variant="h3">Example</Text>

      <Text style={styles.paragraph} italic>
        Query: {query}
      </Text>

      <Button
        style={styles.button}
        title={isProcessing ? 'Running...' : 'Run RAG'}
        variant="primary"
        onPress={runRag}
        disabled={isProcessing}
      />

      {isProcessing && topResults.length === 0 ? (
        <ActivityIndicator size="large" style={styles.spinner} />
      ) : topResults.length > 0 ? (
        <>
          <Text style={styles.paragraph} bold>
            Top matches:
          </Text>
          {topResults.map((doc, index) => (
            <Text key={index} style={styles.paragraph}>
              {index + 1}. {doc}
            </Text>
          ))}
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
  button: { marginTop: 16, marginBottom: 16 },
  spinner: {
    alignSelf: 'center',
    paddingVertical: 24,
  },
  paragraph: { paddingTop: 8 },
});
