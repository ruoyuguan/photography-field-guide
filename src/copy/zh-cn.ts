import type { Copy } from './index';
import { en } from './en';

/**
 * Simplified Chinese copy table. Unused optional ScrewFast modules inherit
 * English strings from `en`; every string rendered by the photography site is
 * translated explicitly below.
 */
export const zhCN: Copy = {
  ...en,
  site: {
    description:
      '通过清晰的中英双语教程、图示和互动实验，理解画幅、焦距、光圈、快门与 ISO 等摄影基础。',
    descriptionShort: '以清晰讲解和视觉实验学习摄影基础的中英双语指南。',
    ogTitle: '摄影入门指南：真正理解你的相机',
    ogDescription:
      '通过实用教程理解全画幅、APS-C、等效焦距、光圈、快门和 ISO，为摄影打下扎实基础。',
  },
  layout: {
    skipToContent: '跳到主要内容',
    changeLanguage: '切换语言',
    toggleNavigation: '打开或关闭导航',
    darkTheme: '切换到深色主题',
    lightTheme: '切换到浅色主题',
    toggleTheme: '切换主题',
  },
  nav: {
    ...en.nav,
    labels: {
      ...en.nav.labels,
      home: '首页',
      learn: '学习',
      tools: '工具',
    },
    footer: {
      ...en.nav.footer,
      sectionTitles: {
        learn: '开始学习',
        project: '项目资源',
      },
      links: {
        orientation: '从这里开始',
        sensorFormats: '传感器与画幅',
        equivalentFocalLength: '等效焦距',
        exposureTriangle: '曝光三角',
        cropFactorTool: '画幅系数计算器',
        exposureStopsTool: '曝光档位计算器',
        repository: 'GitHub 仓库',
      },
      stayUpToDate: '摄影入门指南',
      stayUpToDateContent:
        '以中英双语讲解实用的摄影基础，通过清晰图示帮助新手真正理解相机与光线。',
      craftedBy: '一个开放学习项目。',
    },
  },
  notFound: {
    title: '页面未找到',
    subTitle: '这一帧暂时是空的。',
    content: '页面可能已经移动，但你的摄影学习路径仍然在这里。',
    goHome: '返回首页',
    goBack: '返回上一页',
  },
  home: {
    heroAlt: {
      title: '用图示理解摄影。',
      subTitle: '学习影响每一张照片的相机基础知识。',
      btn: '开始学习',
    },
    eyebrow: '为摄影新手准备的中英双语实用指南',
    hero: {
      title:
        '理解你的相机。<br /><span class="text-amber-500 dark:text-amber-400">看见光线。</span>',
      subTitle:
        '用清晰的讲解和视觉实验，把传感器画幅、焦距、光圈、快门与 ISO 联系起来，不再被术语吓退。',
      primaryBtn: '开始学习',
      secondaryBtn: '比较传感器画幅',
    },
    sensor: {
      title: '同一支镜头，不同的视角。',
      caption: '同一支镜头与拍摄位置下，按真实尺寸比例展示的裁切范围',
      fullFrame: '全画幅',
      apsc: 'APS-C',
      fullFrameSize: '36 × 24 mm',
      apscSize: '23.5 × 15.7 mm（富士 X-T5）',
      note: '图示按比例绘制：10 个 SVG 单位代表 1 mm。APS-C 矩形采用 X-T5 的尺寸示例，并非所有 APS-C 的统一规格；此图比较传感器范围，不改变镜头焦距。',
    },
    pathways: {
      title: '从真正重要的基础开始',
      subTitle:
        '沿着画幅、焦距到曝光的短路径学习。每篇教程都建立在前一篇之上，你可以用自己的相机验证这些概念。',
      items: [
        {
          id: 'sensors',
          title: '传感器与画幅',
          description: '看清全画幅与 APS-C 到底改变了什么，又没有改变什么。',
          linkText: '了解传感器尺寸',
        },
        {
          id: 'focal',
          title: '等效焦距',
          description: '理解为什么同一支镜头在较小传感器上会呈现更窄的视角。',
          linkText: '理解裁切系数',
        },
        {
          id: 'exposure',
          title: '曝光三角',
          description: '分清画面亮度、景深、运动模糊和实际到达传感器的光线。',
          linkText: '学习光圈、快门与 ISO',
        },
      ],
    },
    cta: {
      title: '先建立理解，再考虑添置器材。',
      subTitle:
        '从一篇简短的导览开始，再用中文或 English 按自己的节奏探索摄影基础。',
      button: '阅读入门导览',
    },
  },
};
