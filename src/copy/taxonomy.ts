import type { MarketingLocale } from '@utils/locale';
const en = {
  formatTool: 'Compare sensor and film areas',
  cropTool: 'Crop factor tool',
  exposureTool: 'Exposure stops tool',
  title: 'One camera, several descriptions',
  metaTitle: 'Camera Taxonomy — Classify by the Question',
  intro:
    '“Mirrorless”, “APS-C” and “CMOS” answer different questions. Start with the question you want to ask, then connect the descriptions of the same camera.',
  eyebrow: 'Camera taxonomy',
  start: 'Start with three questions',
  startIntro:
    'How is the image recorded? How do you see the scene? Can the lens be changed? Then add size, sensor and workflow details.',
  example: 'Read one real specification sheet',
  exampleIntro:
    'The X-T5 is digital, mirrorless, interchangeable-lens, APS-C, CMOS and X-Trans at the same time. Those labels belong to different dimensions.',
  exampleLink: 'See the X-T5 classification',
  dimensions: 'Choose a question',
  scope:
    'This map introduces 16 dimensions. Follow the linked explanations for detail; the map is a guide to relationships, not an exhaustive list of every historical or scientific camera.',
  expand: 'Show the distinction',
  terms: 'Concepts to connect',
  read: 'Read the explanation',
  deeper: 'Explore this dimension',
  back: 'Camera taxonomy',
  boundary: 'Keep these ideas separate',
  related: 'Related dimensions',
  references: 'Sources for this explanation',
  checked: 'Reviewed',
  external: 'opens in a new tab',
  glossary: 'Bilingual glossary',
  definition: 'In one sentence',
  explanation: 'How to understand it',
  misconception: 'Common confusion',
  exampleLabel: 'Example',
  termBack: 'Back to glossary',
  dimensionLabel: 'Classification dimensions',
  cameraExamples: 'Camera examples',
  detail: 'Definition and connections',
  selfCheck: 'Try it with a specification sheet',
  selfCheckText:
    'Find three labels for one camera. State which question each label answers. If two labels answer different questions, they need not be competing categories.',
  classifications: 'The same camera across dimensions',
  classificationsIntro:
    'Each row answers a different question. Follow the links to understand a label; no single row is a quality grade.',
};
export type TaxonomyCopy = typeof en;
const zh: TaxonomyCopy = {
  formatTool: '比较传感器与胶片面积',
  cropTool: '画幅系数工具',
  exposureTool: '曝光档位工具',
  title: '一台相机，可以有多种描述',
  metaTitle: '相机分类：先看它回答什么问题',
  intro:
    '“无反”“APS-C”和“CMOS”回答的是不同问题。先选择你想问的问题，再把同一台相机的多种描述联系起来。',
  eyebrow: '相机分类体系',
  start: '先问三个问题',
  startIntro:
    '图像如何记录？你如何看到取景画面？镜头能否更换？然后再了解尺寸、传感器和工作流。',
  example: '读懂一份真实规格表',
  exampleIntro:
    'X-T5 可以同时是数码、无反、可换镜头、APS-C、CMOS 和 X-Trans 相机。这些名称属于不同维度。',
  exampleLink: '查看 X-T5 的分类',
  dimensions: '选择一个问题',
  scope:
    '这张地图介绍 16 个维度，可沿链接进一步阅读。它帮助理解概念之间的关系，不声称穷尽历史与科学成像中的全部设备。',
  expand: '展开辨析',
  terms: '关联概念',
  read: '阅读解释',
  deeper: '深入这个维度',
  back: '相机分类',
  boundary: '把这些概念分开',
  related: '相关维度',
  references: '本条解释的来源',
  checked: '复核日期',
  external: '在新标签页打开',
  glossary: '双语术语词典',
  definition: '一句话理解',
  explanation: '进一步理解',
  misconception: '常见混淆',
  exampleLabel: '例子',
  termBack: '返回术语词典',
  dimensionLabel: '所属分类维度',
  cameraExamples: '相机实例',
  detail: '定义与知识关联',
  selfCheck: '拿一份规格表试一试',
  selfCheckText:
    '为一台相机找出三个描述，并说出每个描述回答什么问题。如果它们回答不同问题，就不一定是互相排斥的类别。',
  classifications: '从不同维度描述同一台相机',
  classificationsIntro:
    '每一行回答不同问题。沿链接理解术语，任何一行都不是画质等级。',
};
export const taxonomyCopy: Record<MarketingLocale, TaxonomyCopy> = {
  en,
  'zh-cn': zh,
};
