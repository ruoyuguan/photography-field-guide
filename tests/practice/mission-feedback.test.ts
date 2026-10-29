import test from 'node:test';
import assert from 'node:assert/strict';
import {
  missionById,
  missions,
  type PracticeLocale,
} from '../../src/data_files/practice.ts';
import { predictionFeedback } from '../../src/utils/practice/feedback.ts';

const locales: PracticeLocale[] = ['en', 'zh-cn'];

test('every C1–C5 choice has distinct contextual feedback in both languages', () => {
  assert.deepEqual(
    missions.map(mission => mission.id),
    [
      'light-direction',
      'subject-background',
      'neighborhood-story',
      'photo-review',
      'backup-and-export',
    ]
  );
  for (const mission of missions) {
    for (const locale of locales) {
      const choices = mission.copy[locale].prediction.choices;
      const explanations = choices.map(choice => choice.explanation?.trim());
      assert.ok(
        explanations.every(explanation => Boolean(explanation)),
        `${mission.id}/${locale}: every choice needs an explanation`
      );
      assert.equal(
        new Set(explanations).size,
        choices.length,
        `${mission.id}/${locale}: choices must not share one generic response`
      );
      for (const choice of choices) {
        assert.equal(
          predictionFeedback(mission, locale, choice.id),
          choice.explanation?.trim(),
          `${mission.id}/${locale}/${choice.id}`
        );
      }
    }
  }
});

test('feedback follows stable IDs when choice order and translated labels change', () => {
  const original = missionById('subject-background');
  assert.ok(original);
  const reordered = structuredClone(original);
  for (const locale of locales) {
    const originalChoices: {
      id: string;
      label: string;
      explanation?: string;
    }[] = original.copy[locale].prediction.choices;
    reordered.copy[locale].prediction.choices = [...originalChoices]
      .reverse()
      .map((choice, index) => ({
        ...choice,
        label: `Replacement translated label ${locale}/${index}`,
      }));
    for (const choice of originalChoices) {
      assert.equal(
        predictionFeedback(reordered, locale, choice.id),
        choice.explanation?.trim()
      );
    }
  }
});

test('unknown IDs, missing answers, and displayed labels never acquire feedback', () => {
  for (const mission of missions) {
    for (const locale of locales) {
      const unknownAnswers = [
        undefined,
        null,
        '',
        'not-a-choice',
        ...mission.copy[locale].prediction.choices.map(choice => choice.label),
      ];
      for (const answer of unknownAnswers) {
        assert.equal(
          predictionFeedback(mission, locale, answer),
          null,
          `${mission.id}/${locale}: rejected ${String(answer)}`
        );
      }
    }
  }
});

test('an optional missing explanation falls back only after matching a known ID', () => {
  const original = missionById('light-direction');
  assert.ok(original);
  const legacy = structuredClone(original);
  for (const locale of locales) {
    const prediction = legacy.copy[locale].prediction;
    for (const choice of prediction.choices) {
      choice.explanation = '  ';
      assert.equal(
        predictionFeedback(legacy, locale, choice.id),
        choice.id === prediction.correctChoiceId
          ? prediction.correct
          : prediction.incorrect
      );
    }
    assert.equal(predictionFeedback(legacy, locale, 'not-a-choice'), null);
  }
});
