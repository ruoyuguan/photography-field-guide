import type { MarketingLocale } from '@utils/locale';

export const INSTANT_COMPARISON_PATH =
  '/cameras/recording-medium/#instant-film-comparison';

interface RecordingMediumCopy {
  title: string;
  intro: string;
  link: string;
  pentaxLink: string;
  printSize: string;
  question: string;
  answer: string;
  stages: [string, string, string];
  flows: Record<
    'pentax-17' | 'instax-mini-99' | 'instax-mini-evo',
    { kind: string; steps: [string, string, string] }
  >;
}

export const recordingMediumCopy: Record<MarketingLocale, RecordingMediumCopy> =
  {
    en: {
      title: 'Three ways to record a photo',
      intro:
        'Compare what captures the scene, where the image is kept, and how you get to see it.',
      link: 'Compare the three recording paths',
      pentaxLink: 'Explore the Pentax 17 half-frame case',
      printSize:
        'Both instax models use instax mini instant film. The visible image is 62 × 46 mm, and the whole sheet including the border is 86 × 54 mm. Both measurements describe the print. Sensor size is a separate specification.',
      question:
        'After you take a photo with mini Evo, where is it before you print?',
      answer:
        'It is saved as a digital image in the camera’s internal memory or on the memory card. The camera uses an instant film sheet only when you print.',
      stages: ['What captures the scene', 'What is kept', 'How you see it'],
      flows: {
        'pentax-17': {
          kind: '35 mm roll film',
          steps: [
            'Light from the lens exposes one half-frame on the roll.',
            'The roll holds the exposed frames.',
            'Develop the roll later to view the images on film or as scans.',
          ],
        },
        'instax-mini-99': {
          kind: 'Direct instant film exposure',
          steps: [
            'Light from the lens directly exposes a sheet of instax mini film.',
            'The exposed sheet holds the image.',
            'In normal shooting, the camera ejects the sheet and the image develops on it.',
          ],
        },
        'instax-mini-evo': {
          kind: 'Digital capture with optional instant printing',
          steps: [
            'A CMOS sensor records light from the lens.',
            'The camera saves a digital image in internal memory or on a microSD or microSDHC card.',
            'Review the image on the screen and choose whether to print it on instax mini film.',
          ],
        },
      },
    },
    'zh-cn': {
      title: '一张照片的三种记录方式',
      intro:
        '对照三台相机，看看场景由什么记录、影像保留在哪里，以及最后怎样看到照片。',
      link: '对照三台相机的记录方式',
      pentaxLink: '查看 Pentax 17 胶片半格案例',
      printSize:
        '两台 instax 都用 instax mini 即显胶片。可见画面是 62 × 46 mm，连边框的整张相纸是 86 × 54 mm。这两个尺寸都描述出片规格。传感器尺寸需单独查阅相机规格。',
      question: '用 mini Evo 拍完一张照片后，打印前照片在哪里？',
      answer:
        '数码照片已经保存在机身内存或存储卡上。选择打印时，相机才会使用即显胶片。',
      stages: ['什么记录场景', '留下什么', '怎样看到照片'],
      flows: {
        'pentax-17': {
          kind: '35 mm 卷装胶片',
          steps: [
            '镜头将光线投到胶卷上，曝光一个半格画面。',
            '胶卷保留已曝光的画格。',
            '之后冲洗胶卷，再查看冲洗后的胶片或扫描件。',
          ],
        },
        'instax-mini-99': {
          kind: '即显胶片直接曝光',
          steps: [
            '镜头将光线直接投到一张 instax mini 即显胶片上。',
            '曝光留下的影像保留在这张胶片上。',
            '普通拍摄时，相机自动吐片，影像在这张相纸上逐渐显现。',
          ],
        },
        'instax-mini-evo': {
          kind: '数码拍摄，可选即显打印',
          steps: [
            'CMOS 传感器记录镜头传来的光。',
            '相机把数码照片保存到机身内存或 microSD／microSDHC 卡。',
            '可以在屏幕上查看照片，也可以挑选照片打印到 instax mini 即显胶片上。',
          ],
        },
      },
    },
  };
