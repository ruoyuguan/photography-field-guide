import type { MarketingLocale } from '@utils/locale';

interface FilmProcessCopy {
  title: string;
  intro: string;
  columns: [string, string, string];
  examples: { id: string; name: string; process: string; result: string }[];
  question: string;
  answer: string;
}

const films = [
  { id: 'ektar-100', name: 'Kodak Ektar 100' },
  { id: 'ektachrome-e100', name: 'Kodak Ektachrome E100' },
  { id: 'hp5-plus', name: 'Ilford HP5 Plus' },
  { id: 'xp2-super', name: 'Ilford XP2 Super' },
  { id: 'vision3-250d', name: 'Kodak Vision3 250D' },
] as const;

export const filmProcessCopy: Record<MarketingLocale, FilmProcessCopy> = {
  en: {
    title: 'Five films you might send to a lab',
    intro:
      'HP5 Plus and XP2 Super both produce black-and-white negatives. Compare the processes their manufacturer specifies.',
    columns: ['Film example', 'Process', 'Developed image'],
    examples: [
      { ...films[0], process: 'C-41', result: 'Color negative' },
      { ...films[1], process: 'E-6', result: 'Color positive (transparency)' },
      {
        ...films[2],
        process: 'B&W development',
        result: 'Black-and-white negative',
      },
      { ...films[3], process: 'C-41', result: 'Black-and-white negative' },
      { ...films[4], process: 'ECN-2', result: 'Color negative' },
    ],
    question:
      'Ilford specifies C-41 for XP2 Super in both 135 and 120. What would you tell the lab?',
    answer:
      'Give the film name, the format you used, and C-41. Both formats produce black-and-white negatives. Ask for scans separately if you want digital copies.',
  },
  'zh-cn': {
    title: '五种胶片的送洗示例',
    intro:
      'HP5 Plus 和 XP2 Super 冲洗后都是黑白负片。对照看看厂商为它们指定的工艺有何不同。',
    columns: ['胶片示例', '冲洗工艺', '冲洗结果'],
    examples: [
      { ...films[0], process: 'C-41', result: '彩色负片' },
      { ...films[1], process: 'E-6', result: '彩色正像（透明片）' },
      { ...films[2], process: '黑白冲洗', result: '黑白负片' },
      { ...films[3], process: 'C-41', result: '黑白负片' },
      { ...films[4], process: 'ECN-2', result: '彩色负片' },
    ],
    question:
      'ILFORD 为 135 和 120 两种规格的 XP2 Super 都指定了 C-41 工艺。送洗时，你会告诉店家哪些信息？',
    answer:
      '告诉冲洗店胶卷名称、你用的规格，以及 C-41 工艺。两种规格冲洗后都是黑白负片。如果你想要数字文件，可以另问扫描服务。',
  },
};
