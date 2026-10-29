import type { MarketingLocale } from '@utils/locale';

interface SuggestionCopy {
  title: string;
  reason: string;
  action: string;
}
interface PathCopy {
  mapTitle: string;
  mapIntro: string;
  capture: string;
  existing: string;
  goal: string;
  relatedLesson: string;
  allMissions: string;
  taskNavigation: string;
  returnLesson: string;
  returnDirectory: string;
  suggestedNext: string;
  revisitBackup: string;
  summary: (completed: number, total: number) => string;
  suggestion: Record<'start' | 'continue' | 'next' | 'revisit', SuggestionCopy>;
}

export const practicePathCopy: Record<MarketingLocale, PathCopy> = {
  en: {
    mapTitle: 'Find a mission',
    mapIntro:
      'Choose where to begin. The numbers suggest a route; every mission is open.',
    capture: 'Make new photographs',
    existing: 'Work with photographs you have',
    goal: 'What you’ll practice',
    relatedLesson: 'Related lesson',
    allMissions: 'Back to the mission map',
    taskNavigation: 'Keep learning',
    returnLesson: 'Return to the related lesson',
    returnDirectory: 'Choose another mission',
    suggestedNext: 'Suggested next practice',
    revisitBackup: 'Revisit safe backup and export',
    summary: (completed, total) =>
      `${completed} of ${total} checklists marked complete in this browser.`,
    suggestion: {
      start: {
        title: 'Try a first experiment',
        reason:
          'Light detective is a small place to start. You can also choose any mission below.',
        action: 'Try',
      },
      continue: {
        title: 'Pick up a mission you started',
        reason:
          'This task has an in-progress checklist in this browser. Suggestions follow the learning order, not your most recent visit.',
        action: 'Continue',
      },
      next: {
        title: 'Try another experiment',
        reason:
          'Here is a checklist you have not marked complete. It is a suggestion; you can revisit or skip to any mission.',
        action: 'Try',
      },
      revisit: {
        title: 'Keep experimenting',
        reason:
          'Every checklist is marked complete here. Try one with a different subject, or choose a mission to revisit. These marks are not a score or proof of mastery.',
        action: 'Revisit',
      },
    },
  },
  'zh-cn': {
    mapTitle: '找到适合的任务',
    mapIntro: '按现在的需要选起点。编号只是建议路线，每个任务都可以直接进入。',
    capture: '准备拍新的照片',
    existing: '整理手头已有的照片',
    goal: '你会练习什么',
    relatedLesson: '相关教程',
    allMissions: '返回任务路线图',
    taskNavigation: '继续学习',
    returnLesson: '返回相关教程',
    returnDirectory: '选择其他任务',
    suggestedNext: '建议的下一项练习',
    revisitBackup: '回看安全备份与导出',
    summary: (completed, total) =>
      `本浏览器已标记完成 ${completed} / ${total} 项任务清单。`,
    suggestion: {
      start: {
        title: '先试一个小实验',
        reason: '可以从光线侦探开始，也可以直接选择下方任何任务。',
        action: '试试',
      },
      continue: {
        title: '接着已开始的任务练习',
        reason:
          '本浏览器中，这项清单仍在进行。建议按学习顺序排列，并不表示这是你最近访问的任务。',
        action: '继续',
      },
      next: {
        title: '再试一个实验',
        reason:
          '这项清单尚未标记完成。它只是建议，你随时可以复习或跳到其他任务。',
        action: '试试',
      },
      revisit: {
        title: '换个问题，继续尝试',
        reason:
          '这里的清单已全部标记完成。可以换个主体重做一项，或任选任务复习。完成标记不是分数，也不证明已经掌握。',
        action: '重做',
      },
    },
  },
};
