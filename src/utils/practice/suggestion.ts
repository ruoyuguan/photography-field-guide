import { practiceCatalog } from '../../data_files/practice-catalog.ts';
import type { MissionStatus } from './progress.ts';

export interface PracticeSuggestion {
  missionId: string;
  kind: 'start' | 'continue' | 'next' | 'revisit';
  completedCount: number;
  totalCount: number;
}

/** Suggest an available task in curriculum order without changing progress. */
export function selectPracticeSuggestion(
  statuses: Readonly<Record<string, MissionStatus>>
): PracticeSuggestion {
  const completedCount = practiceCatalog.filter(
    entry => statuses[entry.id] === 'completed'
  ).length;
  const totalCount = practiceCatalog.length;
  const inProgress = practiceCatalog.find(
    entry => statuses[entry.id] === 'in-progress'
  );
  if (inProgress)
    return {
      missionId: inProgress.id,
      kind: 'continue',
      completedCount,
      totalCount,
    };

  const unstarted = practiceCatalog.find(
    entry => statuses[entry.id] !== 'completed'
  );
  if (unstarted)
    return {
      missionId: unstarted.id,
      kind: completedCount === 0 ? 'start' : 'next',
      completedCount,
      totalCount,
    };

  return {
    missionId: practiceCatalog[0].id,
    kind: 'revisit',
    completedCount,
    totalCount,
  };
}
