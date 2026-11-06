import type { MarketingLocale } from '@utils/locale';

interface FocusDistanceCopy {
  title: string;
  intro: string;
  practiceTitle: string;
  practiceIntro: string;
  pentaxLink: string;
  methods: readonly {
    id: 'fixed-focus' | 'manual-zones' | 'autofocus';
    title: string;
    example: string;
    body: string;
  }[];
  cases: readonly {
    id: 'too-close' | 'pentax-zone' | 'approaching';
    prompt: string;
    choices: readonly {
      id: string;
      label: string;
      result: string;
      feedback: string;
    }[];
  }[];
}

export const focusDistanceCopy: Record<MarketingLocale, FocusDistanceCopy> = {
  en: {
    title: 'Three ways to set focus distance',
    intro:
      'Start with what can change on the camera you are using. Then decide what to do when your subject gets closer.',
    pentaxLink: 'See the Pentax 17 classification',
    methods: [
      {
        id: 'fixed-focus',
        title: 'Fixed focus',
        example: 'Fujifilm QuickSnap Flash (27 exposures)',
        body: 'The camera uses a preset focus distance. Fujifilm recommends a subject distance of at least 1 m for this QuickSnap. Change your camera position if the subject is too close.',
      },
      {
        id: 'manual-zones',
        title: 'Manual distance zones',
        example: 'Pentax 17 in Standard mode',
        body: 'Estimate how far away the subject is and turn the ring to a distance preset. In Full Auto on this camera, focus stays at a preset regardless of the ring position.',
      },
      {
        id: 'autofocus',
        title: 'Autofocus',
        example: 'Fujifilm X-T5 in AF-S or AF-C',
        body: 'The camera adjusts focus for the subject it detects in the active area. Use AF-S when you want to acquire and hold focus, or AF-C when you want it to keep updating.',
      },
    ],
    practiceTitle: 'Choose what to change',
    practiceIntro:
      'Pick an option to see what it would do. Try the other option to compare the reasoning.',
    cases: [
      {
        id: 'too-close',
        prompt:
          'A detail is about 0.5 m from your QuickSnap. What gives you a better chance of getting it in focus?',
        choices: [
          {
            id: 'half-press',
            label: 'Half-press to focus closer',
            result: 'Try again.',
            feedback:
              'The QuickSnap uses fixed focus, so a half-press cannot move its focus closer. Fujifilm recommends shooting at least 1 m away.',
          },
          {
            id: 'step-back',
            label: 'Step back to at least 1 m',
            result: 'That fits.',
            feedback:
              'Moving back puts the subject in the recommended distance range. The camera still uses the same preset focus.',
          },
        ],
      },
      {
        id: 'pentax-zone',
        prompt:
          'On a Pentax 17 in Standard mode, you switch from a person about 3 m away to someone about 1.2 m away. What should you change?',
        choices: [
          {
            id: 'nearer-preset',
            label: 'Select a nearer distance preset',
            result: 'That fits.',
            feedback:
              'Turn the zone ring to the nearer distance setting before you shoot. The ring sets the subject distance for focusing.',
          },
          {
            id: 'af-area',
            label: 'Select a smaller autofocus area',
            result: 'Try again.',
            feedback:
              'An autofocus area describes where an AF camera looks in the frame. The Pentax 17 distance ring in Standard mode sets how far away to focus.',
          },
        ],
      },
      {
        id: 'approaching',
        prompt:
          'A person walks toward your X-T5. With shutter-button AF enabled and Pre-AF off, which mode keeps updating focus as you hold the button halfway?',
        choices: [
          {
            id: 'af-s',
            label: 'AF-S',
            result: 'Try again.',
            feedback:
              'After acquiring focus, AF-S holds that distance while you keep the button halfway down. The person may walk closer than that distance.',
          },
          {
            id: 'af-c',
            label: 'AF-C',
            result: 'That fits.',
            feedback:
              'AF-C keeps updating for changes in subject distance while you hold the button halfway. Keep the active area on the intended subject.',
          },
        ],
      },
    ],
  },
  'zh-cn': {
    title: '三种设定对焦距离的方式',
    intro: '先看你手上的相机能调什么，再判断主体靠近时该怎么做。',
    pentaxLink: '查看 Pentax 17 的相机分类',
    methods: [
      {
        id: 'fixed-focus',
        title: '固定焦点',
        example: '富士 QuickSnap Flash（27 张）',
        body: '相机使用预设对焦距离。富士建议这款 QuickSnap 与主体至少相距 1 米。主体太近时，可以后退再拍。',
      },
      {
        id: 'manual-zones',
        title: '手动距离档',
        example: 'Pentax 17 标准模式',
        body: '先估计主体距离，再转动对焦环选档。这台相机在全自动模式下使用预设焦点，对焦环的位置不会改变焦点。',
      },
      {
        id: 'autofocus',
        title: '自动对焦',
        example: '富士 X-T5 的 AF-S 或 AF-C',
        body: '相机会根据有效区域里检测到的主体调整对焦。想合焦后保持该距离，可以用 AF-S。想让相机持续更新，可以用 AF-C。',
      },
    ],
    practiceTitle: '选一个做法',
    practiceIntro: '展开任一选项看结果，也可以试另一个，比较各自的理由。',
    cases: [
      {
        id: 'too-close',
        prompt: '你用 QuickSnap 拍一个约 0.5 米外的细节，怎样更有机会拍清楚？',
        choices: [
          {
            id: 'half-press',
            label: '半按快门，让相机对得更近',
            result: '再想想。',
            feedback:
              'QuickSnap 的焦点固定，半按快门无法把对焦距离调近。富士建议至少离主体 1 米。',
          },
          {
            id: 'step-back',
            label: '退到至少 1 米远再拍',
            result: '这个做法合适。',
            feedback:
              '后退能让主体进入建议的拍摄距离，相机仍使用同一个预设焦点。',
          },
        ],
      },
      {
        id: 'pentax-zone',
        prompt:
          'Pentax 17 设在标准模式。你刚拍完约 3 米外的人，接下来要拍约 1.2 米外的人。你会调整什么？',
        choices: [
          {
            id: 'nearer-preset',
            label: '改用较近的距离档',
            result: '这个做法合适。',
            feedback:
              '拍摄前用对焦环选较近的距离档。对焦环设定的是要对焦的主体距离。',
          },
          {
            id: 'af-area',
            label: '把自动对焦区域调小',
            result: '再想想。',
            feedback:
              '自动对焦区域决定相机在画面的哪里找主体。Pentax 17 在标准模式下用距离档设定对焦的远近。',
          },
        ],
      },
      {
        id: 'approaching',
        prompt:
          '有人朝你的 X-T5 走来。半按快门对焦已启用，预对焦（Pre-AF）已关闭。半按不放时，哪种模式会持续更新焦点？',
        choices: [
          {
            id: 'af-s',
            label: 'AF-S 单次自动对焦',
            result: '再想想。',
            feedback:
              'AF-S 合焦后会在半按期间保持该距离，人可能走到更近的位置。',
          },
          {
            id: 'af-c',
            label: 'AF-C 连续自动对焦',
            result: '这个做法合适。',
            feedback:
              'AF-C 会在半按期间随主体距离变化更新焦点。拍摄时让有效对焦区域继续覆盖你想拍的人。',
          },
        ],
      },
    ],
  },
};
