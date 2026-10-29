import { lightweightEditingMission } from './lightweight-editing-practice.ts';
import { missions, type PracticeLocale } from './practice.ts';

export interface PracticeCatalogCopy {
  title: string;
  lessonTitle: string;
  intro: string;
  goal: string;
  duration: string;
}

export interface PracticeCatalogEntry {
  id: string;
  number: number;
  articlePath: string;
  copy: Record<PracticeLocale, PracticeCatalogCopy>;
}

function summary(
  copy: Omit<PracticeCatalogCopy, 'lessonTitle'>,
  lessonTitle: string
): PracticeCatalogCopy {
  return {
    title: copy.title,
    lessonTitle,
    intro: copy.intro,
    goal: copy.goal,
    duration: copy.duration,
  };
}

/** Navigation summaries do not change the missions owned by the shared store. */
export const practiceCatalog: readonly PracticeCatalogEntry[] = [
  ...missions.map(mission => ({
    id: mission.id,
    number: mission.number,
    articlePath: mission.articlePath,
    copy: {
      en: summary(mission.copy.en, mission.copy.en.lessonTitle),
      'zh-cn': summary(
        mission.copy['zh-cn'],
        mission.copy['zh-cn'].lessonTitle
      ),
    },
  })),
  {
    id: lightweightEditingMission.id,
    number: 6,
    articlePath: '/learn/workflow/lightweight-editing/',
    copy: {
      en: summary(lightweightEditingMission.copy.en, 'Lightweight Editing'),
      'zh-cn': summary(lightweightEditingMission.copy['zh-cn'], '轻量后期'),
    },
  },
];

export function practiceEntryById(
  id: string
): PracticeCatalogEntry | undefined {
  return practiceCatalog.find(entry => entry.id === id);
}
