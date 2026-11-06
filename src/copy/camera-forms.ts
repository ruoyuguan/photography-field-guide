import type { MarketingLocale } from '@utils/locale';

const xT5BodyGrams = 557;
const xf16To50Grams = 240;
const xT5KitGrams = xT5BodyGrams + xf16To50Grams;
const rx100Dimensions = '101.6 × 58.1 × 42.8 mm';
const p950Dimensions = '140.2 × 109.6 × 149.8 mm';

export const cameraFormExamples = [
  {
    id: 'rx100-vii',
    name: 'Sony RX100 VII',
    grams: 302,
    equivalentRange: '24–200 mm',
  },
  {
    id: 'p950',
    name: 'Nikon COOLPIX P950',
    grams: 1005,
    equivalentRange: '24–2,000 mm',
  },
  {
    id: 'x-t5-kit',
    name: 'Fujifilm X-T5 + XF16–50 mm',
    grams: xT5KitGrams,
    equivalentRange: '24–76 mm',
  },
] as const;

type CameraFormId = (typeof cameraFormExamples)[number]['id'];

interface CameraFormCopy {
  title: string;
  searchAliases?: string;
  intro: string;
  weightLabel: string;
  approx: string;
  equivalentLabel: string;
  setupLabel: string;
  taskLabel: string;
  weightNote: string;
  bodyLink: string;
  lensLink: string;
  examples: Record<
    CameraFormId,
    { title: string; setup: string; task: string }
  >;
  practiceTitle: string;
  practiceIntro: string;
  cases: readonly {
    id: string;
    prompt: string;
    choices: readonly {
      id: string;
      label: string;
      result: string;
      feedback: string;
    }[];
  }[];
}

export const cameraFormCopy: Record<MarketingLocale, CameraFormCopy> = {
  en: {
    title: 'Three ways to carry a camera and lens',
    intro:
      'Compare these specific setups by what goes in your bag, how you change framing, and what you want to photograph.',
    weightLabel: 'Carry weight',
    approx: 'About',
    equivalentLabel: 'Optical range, 35 mm equivalent',
    setupLabel: 'What you carry',
    taskLabel: 'Example task',
    weightNote: `All weights include a battery, memory card and the lens shown. The X-T5 kit adds the ${xT5BodyGrams} g body with battery and card to the ${xf16To50Grams} g lens. The bars use the same scale. Allow extra room and weight for anything else you carry.`,
    bodyLink: 'X-T5 body',
    lensLink: 'XF16–50 mm lens',
    examples: {
      'rx100-vii': {
        title: 'Small camera with built-in zoom',
        setup: `One camera with an integrated zoom, about ${rx100Dimensions} (W × H × D). Compare that with the space in your bag.`,
        task: 'On a walk, frame a whole storefront, then zoom in on a sign across the street.',
      },
      p950: {
        title: 'All-in-one long zoom (bridge camera)',
        setup: `One camera with an integrated long zoom, about ${p950Dimensions} (W × H × D, excluding protrusions).`,
        task: 'Photograph a wide shoreline and then a distant bird with the same built-in lens.',
      },
      'x-t5-kit': {
        title: 'Interchangeable-lens kit',
        setup:
          'An X-mount body with one mounted lens. Check the packed size with the lens attached and add any spare lenses you plan to bring.',
        task: 'Use this zoom for a market scene. Choose a compatible specialist lens when the assignment changes.',
      },
    },
    practiceTitle: 'Which detail helps you decide?',
    practiceIntro:
      'Pick the information you would check first. Open either choice to compare the reasoning.',
    cases: [
      {
        id: 'small-bag',
        prompt:
          'You want to fit the X-T5 kit into a small bag and compare its carry weight with the P950. Which figures should you use?',
        choices: [
          {
            id: 'body-only',
            label: `The body’s dimensions and ${xT5BodyGrams} g`,
            result: 'Try again.',
            feedback: `The ${xT5BodyGrams} g includes the battery and card, but the lens still has to fit and be carried. Check both figures for the assembled kit.`,
          },
          {
            id: 'assembled-kit',
            label: 'The assembled kit’s dimensions and weight',
            result: 'That fits.',
            feedback: `With this lens the kit is about ${xT5KitGrams} g before extra accessories. Measure it with the lens mounted to see if it fits your bag.`,
          },
        ],
      },
      {
        id: 'one-lens',
        prompt:
          'From the same spot, you need a wide scene and a tight view of a distant subject. You want to use a single built-in lens. What would you check?',
        choices: [
          {
            id: 'equivalent-range',
            label: 'The built-in lens’s optical range in 35 mm equivalent',
            result: 'That fits.',
            feedback:
              'Compare both ends of the range. The wider end helps frame the scene, and the longer end gives a tighter view from the same spot.',
          },
          {
            id: 'form-label',
            label: 'Whether the product category says compact',
            result: 'Try again.',
            feedback:
              'Compact is also a catalogue label. Nikon lists the P950 as a compact digital camera and calls it a bridge camera. Its optical range tells you more about the framing available.',
          },
        ],
      },
    ],
  },
  'zh-cn': {
    title: '三套相机，分别要带什么？',
    // The browser can split 机身 into two words when it normalizes a query.
    searchAliases: '机 身 与 产品 形态',
    intro: '用三个具体组合对照装包体积、取景范围和拍摄任务。',
    weightLabel: '携带重量',
    approx: '约',
    equivalentLabel: '光学变焦范围（35 mm 等效）',
    setupLabel: '实际要带什么',
    taskLabel: '拍摄示例',
    weightNote: `三组重量都计入电池、存储卡和所示镜头。X-T5 套装由含电池和卡的 ${xT5BodyGrams} g 机身加上 ${xf16To50Grams} g 镜头得出。横条使用同一尺度。带额外配件时，把它们的体积和重量也算进去。`,
    bodyLink: 'X-T5 机身',
    lensLink: 'XF16–50 mm 镜头',
    examples: {
      'rx100-vii': {
        title: '便携内置变焦相机',
        setup: `一台内置变焦的相机，约 ${rx100Dimensions}（宽 × 高 × 深）。可以用随身包的空余尺寸对照。`,
        task: '散步时先拍整个店面，再拉近拍街对面的招牌。',
      },
      p950: {
        title: '一体式长变焦相机（桥式）',
        setup: `一台内置长变焦的相机，约 ${p950Dimensions}（宽 × 高 × 深，不含凸出部分）。`,
        task: '在岸边先拍开阔的水面，再用同一支内置镜头拍远处的鸟。',
      },
      'x-t5-kit': {
        title: '可换镜头套装',
        setup:
          '一台 X 卡口机身加一支已装上的镜头。装包前量整套尺寸，另算要带的备用镜头。',
        task: '先用这支变焦镜头拍集市。遇到其他任务时，可以换上适合的兼容镜头。',
      },
    },
    practiceTitle: '先查哪一项规格？',
    practiceIntro: '任选一个做法，看看它能帮你回答什么。',
    cases: [
      {
        id: 'small-bag',
        prompt:
          '你想把 X-T5 套装放进小包，并与 P950 比较携带重量。该查哪组数据？',
        choices: [
          {
            id: 'body-only',
            label: `机身尺寸和 ${xT5BodyGrams} g 的重量`,
            result: '再想想。',
            feedback: `${xT5BodyGrams} g 已含电池和卡，但还要带上镜头。比较时要算装上镜头的尺寸和重量。`,
          },
          {
            id: 'assembled-kit',
            label: '装上镜头后的整套尺寸和重量',
            result: '这个做法合适。',
            feedback: `装上这支镜头约 ${xT5KitGrams} g，额外配件另算。量好装上镜头的尺寸，再确认小包是否装得下。`,
          },
        ],
      },
      {
        id: 'one-lens',
        prompt:
          '你站在同一个位置，既要拍开阔场景，也要把远处主体拍大，而且只想用一支内置镜头。先看什么？',
        choices: [
          {
            id: 'equivalent-range',
            label: '内置镜头的光学变焦范围（35 mm 等效）',
            result: '这个做法合适。',
            feedback:
              '把广角端和长焦端一起看。同一位置上，广角端能容纳更多场景，长焦端能取更窄的范围。',
          },
          {
            id: 'form-label',
            label: '产品类别是否写着「小型数码相机」',
            result: '再想想。',
            feedback:
              '「小型」也会用作目录分类。尼康把 P950 列在小型数码相机中，也称它为桥式相机。要判断取景能有多宽或多窄，直接看等效焦距范围。',
          },
        ],
      },
    ],
  },
};
