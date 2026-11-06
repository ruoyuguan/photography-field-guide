import type { MarketingLocale } from '@utils/locale';

interface FlashSyncCopy {
  title: string;
  intro: string;
  legend: string;
  scope: string;
  panels: Record<
    'full-open' | 'traveling-slit',
    { title: string; caption: string; alt: string }
  >;
  notes: readonly { title: string; body: string }[];
  question: string;
  answer: string;
}

export const flashSyncCopy: Record<MarketingLocale, FlashSyncCopy> = {
  en: {
    title: 'Mechanical curtains and flash sync',
    intro:
      'In a mechanical focal-plane shutter, the first curtain uncovers the frame and the second covers it again. These views show where light from one brief main flash reaches the sensor at the moment it fires.',
    legend: 'Hatched area · receives this flash',
    scope:
      'This sketch shows flash contribution only. Ambient light can still expose each part of the frame as the curtains travel.',
    panels: {
      'full-open': {
        title: 'Full frame open',
        caption:
          'The first curtain has cleared the frame. The second has yet to cover it, so the flash can reach the entire frame.',
        alt: 'The hatched flash area fills the whole sensor frame.',
      },
      'traveling-slit': {
        title: 'Traveling slit',
        caption:
          'Above the normal sync limit the second curtain starts before the first has cleared the frame. At this instant, the flash reaches only the narrow opening between them.',
        alt: 'A hatched horizontal strip is open to flash. The curtains cover the areas above and below it.',
      },
    },
    notes: [
      {
        title: 'Normal flash sync',
        body: 'For a single main pulse, the camera times the flash within the full opening. Check the fastest normal sync speed in the manual for your camera and shutter mode.',
      },
      {
        title: 'High-speed sync (HSS)',
        body: 'A compatible camera and flash can use a rapid train of pulses as the slit crosses the frame. This usually reduces effective flash range.',
      },
      {
        title: 'Electronic front-curtain shutter (EFCS)',
        body: 'The sensor starts exposure electronically and the mechanical rear curtain ends it. Check the manual for flash support in that mode.',
      },
    ],
    question:
      'Your camera has a mechanical focal-plane shutter and your flash fires a single main pulse. A photo shows a band with little flash light. What shutter setting would you check first?',
    answer:
      'Check whether the shutter speed exceeds the normal sync limit for that camera and mode. Try the documented sync speed or a slower one so the main pulse can fire while the whole frame is open.',
  },
  'zh-cn': {
    title: '机械帘幕与闪光同步',
    intro:
      '机械焦平面快门用前帘露出画面，再由后帘盖住画面。下面两幅图定格在一次短促主闪发出的瞬间，显示这次闪光能到达传感器的哪些区域。',
    legend: '斜线区域 · 接收到这次闪光',
    scope:
      '图中只比较闪光的贡献。帘幕移动时，环境光仍可能依次照到画面的各个区域。',
    panels: {
      'full-open': {
        title: '整帧敞开',
        caption: '前帘已经完全让开，后帘还没盖住画面，闪光可以到达整帧。',
        alt: '标有斜线的闪光受光区覆盖了整个传感器画框。',
      },
      'traveling-slit': {
        title: '狭缝扫过画面',
        caption:
          '快于普通同步上限时，前帘还没完全让开，后帘已经开始移动。此刻，闪光只能到达两帘之间的狭缝。',
        alt: '闪光只照到中间带斜线的横条。上下两块区域都被帘幕遮挡。',
      },
    },
    notes: [
      {
        title: '普通闪光同步',
        body: '单次主闪安排在整帧敞开的时段。最快的普通同步速度，以说明书中对应快门模式的限制为准。',
      },
      {
        title: '高速同步（HSS）',
        body: '相机和闪光灯都支持时，闪光灯可以在狭缝扫过画面的过程中快速连续闪光。这样通常会缩短闪光的有效距离。',
      },
      {
        title: '电子前帘快门（EFCS）',
        body: '传感器以电子方式启动曝光，再由机械后帘结束曝光。该模式能否使用闪光，要查机型说明书。',
      },
    ],
    question:
      '你用机械焦平面快门和只发一次主闪的闪光灯拍照，照片出现一条几乎没有被闪光照亮的区域。你会先检查哪个快门设置？',
    answer:
      '先检查快门速度是否快过该相机和模式的普通同步上限。试用说明书给出的同步速度或更慢的设置，让主闪能在整帧敞开时发出。',
  },
};
