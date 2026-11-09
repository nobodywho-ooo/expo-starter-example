import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  Button,
  ErrorView,
  LoadingView,
  PillGroup,
  ScoreAxis,
  Text,
} from '@/components';
import { devLog } from '@/helpers';
import { useColors } from '@/hooks';
import { AiModelState, useAiService } from '@/services';

const DEFAULT_DIARY_ENTRY =
  'What a lovely Saturday! Went for a long bike ride along the river with ' +
  'Sam, then we had a picnic in the park and the sun came out just in time. ' +
  'Finished the evening baking a lemon cake with mum.';

const TOPIC_CRITERIA: Record<string, string> = {
  work: 'job, colleagues, deadlines, career',
  relationships: 'family, friends, partner',
  health: 'sleep, exercise, food, illness',
  leisure: 'hobbies, travel, going out',
};

const MOOD_CRITERIA = ['bad', 'okay', 'great'];

interface DecisionResult {
  topics: Record<string, number>;
  stressed: number;
  moodScore: number;
  duration: number;
}

export default function DecisionScreen() {
  const { colors } = useColors();
  const { decision, decisionState, createDecision } = useAiService();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [buttonHeight, setButtonHeight] = useState<number | undefined>();
  const [diaryEntry, setDiaryEntry] = useState(DEFAULT_DIARY_ENTRY);
  const [result, setResult] = useState<DecisionResult | undefined>(undefined);

  useEffect(() => {
    createDecision();
  }, [createDecision]);

  const classify = async () => {
    const decisionModel = decision.current;
    if (!decisionModel) {
      return;
    }

    setHasError(false);
    setResult(undefined);
    setIsProcessing(true);

    try {
      const start = Date.now();
      const results = await decisionModel.decide({
        state: `Diary entry: ${diaryEntry}`,
        questions: {
          topics: {
            type: 'choice',
            instructions: 'Choose the main topic of this diary entry',
            criteria: TOPIC_CRITERIA,
          },
          stressed: {
            type: 'noul',
            instructions: 'Does the writer sound stressed?',
          },
          mood: {
            type: 'score',
            instructions: "How is the writer's overall mood?",
            criteria: MOOD_CRITERIA,
          },
        },
      });

      const duration = Date.now() - start;
      const { topics, stressed, mood } = results.answers;

      if (!topics || !('choice' in topics)) {
        throw new Error('Expected a choice answer for "topics"');
      }
      if (!stressed || !('noul' in stressed)) {
        throw new Error('Expected a noul answer for "stressed"');
      }
      if (!mood || !('score' in mood)) {
        throw new Error('Expected a score answer for "mood"');
      }

      setResult({
        topics: topics.probabilities,
        stressed: stressed.noul,
        moodScore: mood.score,
        duration,
      });
      setHasResults(true);
    } catch (error) {
      devLog('DecisionScreen error', error);
      setHasError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (decisionState === AiModelState.Error) {
    return <ErrorView onRetry={createDecision} />;
  }

  if (decisionState !== AiModelState.Ready) {
    return <LoadingView />;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[styles.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={styles.content}>
      <Text variant="body2" style={{ color: colors.onSurfaceVariant }}>
        This example simulates a diary app. We use the decision model to pick
        the main topic of a user’s entry, detect stress and rate the mood.
      </Text>

      <Text variant="h3" style={styles.sectionTitle}>
        Diary entry
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            color: colors.onSurface,
            backgroundColor: colors.surfaceContainer,
          },
        ]}
        placeholder="Write an entry..."
        placeholderTextColor={colors.onSurfaceVariant}
        value={diaryEntry}
        onChangeText={setDiaryEntry}
        editable={!isProcessing}
        multiline
      />

      {isProcessing ? (
        <View style={[styles.spinner, { height: buttonHeight }]}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <Button
          style={styles.button}
          title={hasResults ? 'Get insights again' : 'Get insights'}
          variant="primary"
          onPress={classify}
          onLayout={e => setButtonHeight(e.nativeEvent.layout.height)}
          disabled={diaryEntry.trim() === ''}
        />
      )}

      {hasError && (
        <Text style={[styles.error, { color: colors.danger }]}>
          Something went wrong
        </Text>
      )}

      <Text variant="h3" style={styles.sectionTitle}>
        What is the entry about?
      </Text>
      <PillGroup
        options={Object.keys(TOPIC_CRITERIA).map(topic => ({
          label: topic,
          probability: result?.topics[topic],
        }))}
      />

      <Text variant="h3" style={styles.sectionTitle}>
        Is the user stressed?
      </Text>
      <PillGroup
        options={[
          { label: 'yes', probability: result?.stressed },
          {
            label: 'no',
            probability: result ? 1 - result.stressed : undefined,
          },
        ]}
      />

      <Text variant="h3" style={styles.sectionTitle}>
        Mood
      </Text>
      <ScoreAxis levels={MOOD_CRITERIA} score={result?.moodScore} />

      {result && (
        <Text
          variant="body2"
          style={[styles.duration, { color: colors.onSurfaceVariant }]}>
          Decided in {(result.duration / 1000).toFixed(2)} s
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  content: { paddingBottom: 32 },
  textInput: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: { marginTop: 16, marginBottom: 8 },
  spinner: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { paddingTop: 16, paddingBottom: 8 },
  error: { paddingTop: 8 },
  duration: { paddingTop: 24 },
});
