import type { FormatId } from '../utils/photography/format-comparison';

type FormatLabel = { title: string; note: string };
export const formatComparisonCopy = {
  en: {
    metaTitle: 'Sensor & film format comparison',
    description:
      'Compare physical image areas at one shared scale, from Micro Four Thirds to medium-format and 4×5 film.',
    title: 'How big is the image area?',
    halfFrameTitle: 'Half-frame film and digital APS-C',
    halfFrameIntro:
      'Compare the Pentax 17 film frame with the Fujifilm X-T5 sensor. The starting outlines use each camera’s normal horizontal hold. The Pentax frame is vertical and the X-T5 frame is horizontal. Rotate either camera and its frame rotates with it.',
    openHalfFrame: 'Compare half-frame film with APS-C',
    backToPentax: 'Back to the Pentax 17 example',
    intro:
      'Choose two formats. The outlines share one scale, so twice the width really means twice the width. A format name describes an image area; it does not rank your photographs.',
    back: 'All tools',
    a: 'Format A · solid amber',
    b: 'Format B · dashed blue',
    diagram: 'Physical image areas, centered at the same scale',
    diagramDescription:
      'The solid amber and dashed blue outlines show the selected widths and heights. Exact values follow the diagram.',
    scaleNote:
      'Original geometry diagram. Both outlines use the same millimeter scale; the whole diagram fits the screen. This is not a field-of-view or image-quality simulation.',
    ratio: 'Area B ÷ area A',
    dimensions: 'Width × height',
    area: 'Area',
    aspect: 'Width ÷ height',
    crop: '35 mm diagonal crop factor',
    noScript:
      'Without JavaScript, the comparison shown and the full dimensions table remain available. Format selection requires JavaScript.',
    summary: '{b} has {ratio}× the image area of {a}.',
    fallback: 'Dimensions at a glance',
    format: 'Format',
    assumptions: 'How to read the comparison',
    notes: [
      'Full frame here is the nominal 36 × 24 mm reference. Actual digital sensors and usable recording areas vary; APS-C and digital medium format are families, not one universal size.',
      'The 6×6 preset uses a 56 × 56 mm exposed frame, as specified for the Fujifilm GX680III 6×6 mask. 120 names a roll-film type; it does not mean a 120 mm frame. Other cameras and masks can differ.',
      'The 4×5 preset uses the 120 × 96 mm reference image area in Schneider’s XENAR lens brochure. It is not the 127 × 101.6 mm nominal sheet size. Film holders mask the sheet edges; measure your own gate for exact work.',
      'Area alone does not predict brightness, noise, detail, depth of field or aesthetic quality. Lens, exposure, technology, processing and output conditions also matter.',
      'Diagonal crop factor compares diagonals to 36 × 24 mm. With different aspect ratios, it cannot simultaneously match horizontal and vertical fields of view. It does not change a lens’s physical focal length.',
    ],
    formulas: 'Calculations and units',
    formulaText:
      'Width w and height h are in mm. Area A = w × h (mm²); aspect ratio r = w / h; diagonal d = √(w² + h²) (mm); crop factor C = √(36² + 24²) / d. Area ratio = A_B / A_A. Ratios have no units; display rounding does not affect the calculation.',
    continue: 'Continue with focal length & field of view',
    sources: 'Sources for the dimensions',
    checked:
      'The original dimension references were checked on 2026-11-05. The Pentax 17 half-frame specification was checked on 2026-11-07.',
    error:
      'Choose two available formats. The previous comparison remains visible.',
    labels: {
      'micro-four-thirds': {
        title: 'Micro Four Thirds · representative',
        note: '17.3 × 13.0 mm; Olympus E-PL7 sensor image area as a representative example.',
      },
      'aps-c': {
        title: 'APS-C · representative',
        note: '23.5 × 15.7 mm, as specified for X-T5; other APS-C sensors differ.',
      },
      'full-frame': {
        title: 'Full frame · nominal',
        note: '36 × 24 mm reference; actual full-frame sensors can be slightly smaller.',
      },
      'digital-medium': {
        title: 'Digital medium format · 44×33 class',
        note: '43.8 × 32.9 mm, as specified for GFX100RF; digital medium format also includes other sizes.',
      },
      'film-6x6': {
        title: '120 film · 6×6 frame example',
        note: '56 × 56 mm exposed frame, using the GX680III optional 6×6 mask as the reference.',
      },
      'film-half-frame': {
        title: '35 mm film · half-frame example',
        note: 'Pentax 17 exposes a frame 17 mm wide and 24 mm high when held horizontally. These are frame dimensions, while 35 mm identifies the film format.',
      },
      'film-4x5': {
        title: '4×5 film · reference image area',
        note: '120 × 96 mm image-area reference from Schneider’s XENAR brochure; holder openings vary.',
      },
    } satisfies Record<FormatId, FormatLabel>,
  },
  'zh-cn': {
    metaTitle: '数码与胶片画幅比较',
    description:
      '用统一比例比较 M43、APS-C、全画幅、数码中画幅、120 和 4×5 胶片的实际成像区域。',
    title: '成像区域究竟有多大？',
    halfFrameTitle: '胶片半格与数码 APS-C',
    halfFrameIntro:
      '对照 Pentax 17 的胶片曝光画面和富士 X-T5 的传感器。起始对照按两台相机正常横持时的方向绘制。Pentax 17 记录竖幅，X-T5 记录横幅。转动机身，画面方向也会随之改变。',
    openHalfFrame: '对照胶片半格与 APS-C',
    backToPentax: '返回 Pentax 17 案例',
    intro:
      '选择两个画幅。两条边框采用同一比例，宽度两倍就确实画成两倍。画幅名称描述成像区域，不是照片的等级。',
    back: '所有工具',
    a: '画幅 A · 琥珀色实线',
    b: '画幅 B · 蓝色虚线',
    diagram: '统一比例、居中叠放的成像区域',
    diagramDescription:
      '琥珀色实线和蓝色虚线分别显示所选画幅的宽和高；图下提供准确数值。',
    scaleNote:
      '原创几何示意图。两条边框采用相同的毫米比例，整图随屏幕缩放；它不模拟视角或成像质量。',
    ratio: 'B 面积 ÷ A 面积',
    dimensions: '宽 × 高',
    area: '面积',
    aspect: '宽 ÷ 高',
    crop: '相对 35 mm 的对角线裁切系数',
    noScript:
      '关闭 JavaScript 后，仍可阅读当前对比图和完整尺寸表；切换画幅需要 JavaScript。',
    summary: '{b}的成像面积是{a}的 {ratio} 倍。',
    fallback: '全部参考尺寸',
    format: '画幅',
    assumptions: '这些数值可以说明什么？',
    notes: [
      '这里以标称 36 × 24 mm 作为全画幅参考。实际传感器和有效记录区域可能不同；APS-C 与数码中画幅都不是只有一种尺寸。',
      '6×6 预设采用富士 GX680III 的 6×6 遮幅框所对应的 56 × 56 mm 实际曝光区域。120 是卷片规格名称，不是 120 mm 宽的画面；其他相机和遮幅框可能不同。',
      '4×5 预设采用施耐德 XENAR 镜头资料中的 120 × 96 mm 成像区域参考，并非标称 127 × 101.6 mm 的整张胶片尺寸。片夹会遮住边缘；精确工作应测量自己的曝光窗口。',
      '仅凭面积无法预测画面亮度、噪声、细节、景深或审美效果；镜头、曝光、技术、处理及输出条件也会影响结果。',
      '裁切系数按对角线与 36 × 24 mm 比较。长宽比不同，就不能同时匹配水平和垂直视角；它不会改变镜头的物理焦距。',
    ],
    formulas: '计算方法与单位',
    formulaText:
      '宽 w、高 h 的单位均为 mm。面积 A = w × h（mm²）；长宽比 r = w / h；对角线 d = √(w² + h²)（mm）；裁切系数 C = √(36² + 24²) / d。面积比 = A_B / A_A。比值没有单位，显示时的舍入不参与后续计算。',
    continue: '继续理解焦距与视角',
    sources: '尺寸依据',
    checked:
      '原有尺寸资料于 2026-11-05 核查。Pentax 17 半格规格于 2026-11-07 核查。',
    error: '请选择两个可用画幅；先前的比较仍保留。',
    labels: {
      'micro-four-thirds': {
        title: 'Micro Four Thirds（M43）参考',
        note: '17.3 × 13.0 mm，采用奥林巴斯 E-PL7 的传感器成像尺寸示例。',
      },
      'aps-c': {
        title: 'APS-C 参考',
        note: '23.5 × 15.7 mm，采用 X-T5 的规格；其他 APS-C 传感器可能不同。',
      },
      'full-frame': {
        title: '全画幅（标称参考）',
        note: '36 × 24 mm；实际全画幅数码传感器可能略小。',
      },
      'digital-medium': {
        title: '数码中画幅（44×33 类）',
        note: '43.8 × 32.9 mm，采用 GFX100RF 的规格；数码中画幅还有其他尺寸。',
      },
      'film-6x6': {
        title: '120 胶片（6×6 曝光区域示例）',
        note: '56 × 56 mm，采用 GX680III 的选配 6×6 遮幅框实际曝光尺寸。',
      },
      'film-half-frame': {
        title: '35 mm 胶片（半格示例）',
        note: 'Pentax 17 横持时的曝光画面宽 17 mm、高 24 mm。35 mm 指胶卷规格。',
      },
      'film-4x5': {
        title: '4×5 胶片（成像区域参考）',
        note: '120 × 96 mm，采用施耐德 XENAR 资料中的参考成像区域；片夹开口可能不同。',
      },
    } satisfies Record<FormatId, FormatLabel>,
  },
};

export const formatDimensionSources = [
  {
    title: 'Olympus E-PL7 instruction manual · p.141, image pickup device',
    url: 'https://download.omsystem.com/pages/inst/epl7/manual_epl7_ENU.pdf#page=141',
  },
  {
    title: 'Fujifilm X-T5 · image sensor',
    url: 'https://www.fujifilm-x.com/global/products/cameras/x-t5/specifications/',
  },
  {
    title: 'Nikon D6 · nominal FX image area versus actual sensor',
    url: 'https://imaging.nikon.com/imaging/lineup/dslr/d6/',
  },
  {
    title: 'Fujifilm GFX100RF · image sensor',
    url: 'https://www.fujifilm-x.com/global/products/cameras/gfx100rf/specifications/',
  },
  {
    title: 'RICOH Imaging PENTAX 17 · Half-size format and frame dimensions',
    url: 'https://www.ricoh-imaging.co.jp/english/products/pentax17/feature/',
  },
  {
    title: 'Fujifilm GX680III · 6×6 format mask',
    url: 'https://fujifilm.jp/personal/filmandcamera/filmcamera/mediumformat/gx680iii/specs.html',
  },
  {
    title: 'Schneider XENAR brochure · p.2, 4×5 image area (archival scan)',
    url: 'https://www.pacificrimcamera.com/rl/02159/02159.pdf#page=2',
  },
];
