import type { MarketingLocale } from '@utils/locale';

export type OpticalPathKind = 'slr' | 'tlr' | 'rangefinder' | 'mirrorless';

export const cameraOpticalPathsCopy = {
  en: {
    light: 'Solid arrows: light',
    signal: 'Dashed arrows: electronic image signal',
    linkage: 'Dotted line: mechanical focus coupling',
    scope:
      'Original functional diagram, not to scale. Internal lens groups, exact ray angles, and metering optics are omitted.',
    slr: {
      viewingTitle: 'SLR · normal optical viewing',
      exposureTitle: 'SLR · during an exposure',
      viewingDescription:
        'Light through the taking lens is reflected upward by the lowered mirror to a focusing screen and finder optics. A closed shutter prevents recording at the film or sensor.',
      exposureDescription:
        'The mirror is raised and the shutter opens to allow recording. The illustrated instant represents an open light path; it does not model the moving slit at high shutter speeds. The normal optical finder path is interrupted.',
      viewingLabels: [
        'Taking lens',
        'Lowered reflex mirror',
        'Focusing screen and finder optics',
        'Eyepiece',
        'Closed shutter; film or sensor behind it',
      ],
      exposureLabels: [
        'Taking lens',
        'Raised mirror',
        'Optical finder path interrupted',
        'Eyepiece',
        'Open shutter; film or sensor records',
      ],
    },
    tlr: {
      viewingTitle: 'TLR · separate viewing and taking lenses',
      exposureTitle: '',
      viewingDescription:
        'The upper lens sends light via a mirror to a top focusing screen. The lower taking lens sends light to film when its shutter opens. The lenses focus together but view from different positions.',
      exposureDescription: '',
      viewingLabels: [
        'Viewing lens',
        'Reflex mirror',
        'Top focusing screen',
        'Taking lens',
        'Film and taking shutter',
      ],
      exposureLabels: [],
    },
    rangefinder: {
      viewingTitle: 'Coupled rangefinder · separate view and measurement',
      exposureTitle: '',
      viewingDescription:
        'A direct finder view and light from a second measuring window combine at the eyepiece. The lens focus setting couples mechanically to the measurement system. The taking lens forms a separate image on film or a sensor.',
      exposureDescription: '',
      viewingLabels: [
        'Direct finder window',
        'Measuring window',
        'Combined finder and measuring patch',
        'Taking lens and focus coupling',
        'Film or sensor',
      ],
      exposureLabels: [],
    },
    mirrorless: {
      viewingTitle: 'Digital mirrorless · sensor image to display',
      exposureTitle: '',
      viewingDescription:
        'Scene light passes through the taking lens to the sensor. Electronic image information travels through processing to a display. The eyepiece views light emitted by that display, not the scene light continuing through the camera.',
      exposureDescription: '',
      viewingLabels: [
        'Taking lens',
        'Image sensor',
        'Image processing',
        'Electronic display and eyepiece',
        'Electronic signal path',
      ],
      exposureLabels: [],
    },
  },
  'zh-cn': {
    light: '实线箭头：光',
    signal: '虚线箭头：电子图像信号',
    linkage: '点线：机械对焦联动',
    scope: '原创功能示意图，不按比例绘制；省略镜片组、精确光线角度和测光光路。',
    slr: {
      viewingTitle: '单反 · 正常光学取景',
      exposureTitle: '单反 · 曝光过程中',
      viewingDescription:
        '来自摄影镜头的光被放下的反光镜向上反射，经对焦屏和取景光学系统到达目镜。快门关闭，胶片或传感器尚未记录这次曝光。',
      exposureDescription:
        '反光镜抬起，快门开启使感光面记录。图中只表示光路打开的一个瞬间，不模拟高速快门移动的狭缝；正常光学取景光路此时被中断。',
      viewingLabels: [
        '摄影镜头',
        '放下的反光镜',
        '对焦屏与取景光学系统',
        '目镜',
        '关闭的快门；后方为胶片或传感器',
      ],
      exposureLabels: [
        '摄影镜头',
        '抬起的反光镜',
        '光学取景光路中断',
        '目镜',
        '快门开启；胶片或传感器记录',
      ],
    },
    tlr: {
      viewingTitle: '双反 · 取景与摄影各用一支镜头',
      exposureTitle: '',
      viewingDescription:
        '上方镜头经反光镜把光送到顶部对焦屏；下方摄影镜头在快门开启时把光送到胶片。两支镜头联动对焦，但观察位置不同。',
      exposureDescription: '',
      viewingLabels: [
        '取景镜头',
        '反光镜',
        '顶部对焦屏',
        '摄影镜头',
        '胶片与摄影快门',
      ],
      exposureLabels: [],
    },
    rangefinder: {
      viewingTitle: '联动测距旁轴 · 取景、测距与摄影分开',
      exposureTitle: '',
      viewingDescription:
        '直接取景窗和另一个测距窗的光在目镜处合成，形成测距斑；镜头的对焦位置通过机械机构与测距系统联动。摄影镜头在胶片或传感器上另行成像。',
      exposureDescription: '',
      viewingLabels: [
        '直接取景窗',
        '测距窗',
        '合成后的取景与测距斑',
        '摄影镜头与对焦联动',
        '胶片或传感器',
      ],
      exposureLabels: [],
    },
    mirrorless: {
      viewingTitle: '数码无反 · 传感器图像送往显示器',
      exposureTitle: '',
      viewingDescription:
        '景物光穿过摄影镜头到达传感器，图像信息经电子处理送到显示器。目镜看到的是显示器发出的光，并非景物光继续穿过机身直达眼睛。',
      exposureDescription: '',
      viewingLabels: [
        '摄影镜头',
        '图像传感器',
        '图像处理',
        '电子显示器与目镜',
        '电子信号路径',
      ],
      exposureLabels: [],
    },
  },
} satisfies Record<MarketingLocale, unknown>;
