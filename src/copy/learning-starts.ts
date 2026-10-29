import type { MarketingLocale } from '@utils/locale';

export type LearningStartId = 'beginner' | 'shoot' | 'review';

interface LearningStart {
  id: LearningStartId;
  title: string;
  description: string;
  linkLabel: string;
  path: string;
}

interface LearningStartsCopy {
  heading: string;
  intro: string;
  cards: LearningStart[];
}

export const learningStartsCopy: Record<MarketingLocale, LearningStartsCopy> = {
  en: {
    heading: 'Choose what you want to do',
    intro:
      'Choose any entry. You do not need to finish other lessons or missions first.',
    cards: [
      {
        id: 'beginner',
        title: 'I’m new to photography',
        description:
          'Start with what makes a photograph: light, timing, and the choices you make.',
        linkLabel: 'What is photography?',
        path: '/learn/getting-started/what-is-photography/',
      },
      {
        id: 'shoot',
        title: 'I want to take photos',
        description:
          'Use a camera or phone, a small object, and a movable lamp to compare two light directions.',
        linkLabel: 'Try Light detective',
        path: '/practice/light-direction/',
      },
      {
        id: 'review',
        title: 'I already have photos',
        description:
          'Compare a small set of your photos and explain what you keep. Preserve the originals; nothing is uploaded.',
        linkLabel: 'Try photo review',
        path: '/practice/photo-review/',
      },
    ],
  },
  'zh-cn': {
    heading: '按你现在的需要开始',
    intro: '任选一个入口，无需先读完其他教程或完成其他任务。',
    cards: [
      {
        id: 'beginner',
        title: '刚开始学摄影',
        description: '先理解一张照片与光线、时机和你的选择有什么关系。',
        linkLabel: '摄影到底是什么？',
        path: '/learn/getting-started/what-is-photography/',
      },
      {
        id: 'shoot',
        title: '现在就想拍',
        description: '用相机或手机、小物件和可移动的灯，对照两种光线方向。',
        linkLabel: '试试光线侦探',
        path: '/practice/light-direction/',
      },
      {
        id: 'review',
        title: '已经有照片',
        description:
          '比较手头的一小组照片，说明为何保留。原片不删，也不上传照片。',
        linkLabel: '试试筛选与复盘',
        path: '/practice/photo-review/',
      },
    ],
  },
};
