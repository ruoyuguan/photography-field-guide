import type { MarketingLocale } from '@utils/locale';

interface TimingPanelCopy {
  title: string;
  caption: string;
  alt: string;
}

interface ShutterTimingCopy {
  title: string;
  intro: string;
  timeAxis: string;
  rowLabels: readonly [string, string, string];
  panels: Record<
    'rolling-long' | 'rolling-short' | 'global-short',
    TimingPanelCopy
  >;
  note: string;
  question: string;
  answer: string;
}

export const shutterTimingCopy: Record<MarketingLocale, ShutterTimingCopy> = {
  en: {
    title: 'Rolling and global shutter timing',
    intro:
      'The length of a bar shows how long that row collects light. The left edge shows when its exposure starts.',
    timeAxis: 'Time',
    rowLabels: ['First', 'Middle', 'Last'],
    panels: {
      'rolling-long': {
        title: 'Rolling · longer exposure',
        caption:
          'Each row collects light for the same duration. The first row starts earlier than the last.',
        alt: 'Three equal long bars start and end progressively farther to the right.',
      },
      'rolling-short': {
        title: 'Rolling · shorter exposure',
        caption:
          'The bars get shorter. The gap between the first and last start times stays the same.',
        alt: 'Three equally short bars start at the same times as the three long bars in the previous panel.',
      },
      'global-short': {
        title: 'Global · shorter exposure',
        caption:
          'All rows start and finish together. The camera can read the captured signals afterward.',
        alt: 'Three short bars have aligned starts and aligned ends.',
      },
    },
    note: 'All three sketches use the same time scale and show three representative sensor rows. The first-to-last gap is measured between exposure starts. Times are illustrative and vary with camera and mode.',
    question:
      'A vertical post moves sideways across the frame. In the same rolling shutter mode with unchanged scan timing, what happens if you shorten each row’s exposure?',
    answer:
      'Each row collects light over a shorter stretch of the post’s motion, so the edges can look sharper. The first and last rows still capture the moving post at different times, so it can still lean.',
  },
  'zh-cn': {
    title: '滚动快门与全局快门的曝光时序',
    intro:
      '横条越长，这一行收集光线的时间就越长。横条左端表示这一行开始曝光的时刻。',
    timeAxis: '时间',
    rowLabels: ['首行', '中间行', '末行'],
    panels: {
      'rolling-long': {
        title: '滚动快门 · 较长曝光',
        caption: '每行收集光线的时长相同。首行比末行更早开始。',
        alt: '三条等长的横条从上到下依次向右错开，起点和终点都不对齐。',
      },
      'rolling-short': {
        title: '滚动快门 · 较短曝光',
        caption: '横条变短，首行和末行开始曝光的时间差保持不变。',
        alt: '三条等长的短横条与上一张图的三条长横条分别从同一时刻开始。',
      },
      'global-short': {
        title: '全局快门 · 较短曝光',
        caption: '各行同时开始和结束曝光。相机可以随后读出已记录的信号。',
        alt: '三条短横条的起点对齐，终点也对齐。',
      },
    },
    note: '三幅图使用同一时间尺度，只画出传感器上三条有代表性的行。首末行时差按两行的曝光起点计算。实际时序因相机和模式而异。',
    question:
      '一根竖直的杆子横向经过画面。如果保持同一种滚动快门模式和扫描时序，只缩短每行曝光，照片会怎样？',
    answer:
      '每行记录的是杆子移动的一小段，边缘可能更清晰。首行和末行仍在不同时刻记录这根杆子，所以它仍可能看起来是斜的。',
  },
};
