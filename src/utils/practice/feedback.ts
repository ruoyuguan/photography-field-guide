import type {
  PracticeLocale,
  PracticeMission,
} from '../../data_files/practice.ts';

/** Match the submitted identity, never its translated label or display position. */
export function predictionFeedback(
  mission: PracticeMission,
  locale: PracticeLocale,
  choiceId?: string | null
): string | null {
  const prediction = mission.copy[locale].prediction;
  const choice = prediction.choices.find(item => item.id === choiceId);
  if (!choice) return null;
  return (
    choice.explanation?.trim() ||
    (choice.id === prediction.correctChoiceId
      ? prediction.correct
      : prediction.incorrect)
  );
}
