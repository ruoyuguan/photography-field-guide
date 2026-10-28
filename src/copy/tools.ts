import type { MarketingLocale } from '@utils/locale';

const en = {
  index: {
    metaTitle: 'Interactive Photography Tools',
    metaDescription:
      'Explore crop factor, equivalent focal length, angle of view, and exposure stops with bilingual, keyboard-friendly photography calculators.',
    eyebrow: 'Learn by changing one variable at a time',
    title: 'Interactive photography tools',
    intro:
      'Use small, transparent models to connect camera settings with their effects. Every result includes its assumptions; none of these tools predicts a real camera JPEG.',
    cropTitle: 'Crop factor & equivalent focal length',
    cropDescription:
      'Compare real sensor dimensions, calculate equivalent focal length, and see horizontal, vertical, and diagonal angles of view.',
    exposureTitle: 'Exposure stops comparison',
    exposureDescription:
      'Compare two aperture, shutter, and ISO settings while keeping light exposure separate from nominal ISO output mapping.',
    open: 'Open tool',
    formula: 'Model',
  },
  common: {
    back: 'Back to tools',
    reset: 'Reset example',
    millimeters: 'mm',
    meters: 'm',
    degrees: '°',
    errors: {
      required: 'Enter a value; this field cannot be empty.',
      invalid: 'Use a decimal number or a simple fraction such as 1/125.',
      positive: 'Enter a number greater than zero.',
      nonFinite: 'Enter a finite number; NaN and Infinity are not supported.',
      range: (min: number, max: number) =>
        `Enter a value from ${min} to ${max} for this tool.`,
      calculation:
        'Check the highlighted field. Results are hidden until every input is valid.',
    },
  },
  crop: {
    metaTitle: 'Crop Factor & Equivalent Focal Length Calculator',
    metaDescription:
      'Calculate crop factor from real sensor dimensions, equivalent focal length, three axes of angle of view, and an approximate distant field width.',
    title: 'Crop factor & equivalent focal length',
    intro:
      'Compare a lens on two sensor sizes. The lens keeps its physical focal length; “equivalent” describes the field of view on your chosen reference format.',
    interactiveTitle: 'Build your comparison',
    referenceHeading: 'Reference sensor',
    targetHeading: 'Target sensor',
    preset: 'Sensor preset',
    presets: {
      fullFrame: 'Full frame — 36 × 24 mm',
      fujifilmApsC: 'Fujifilm X-T5 APS-C — 23.5 × 15.6 mm',
      nikonDx: 'Nikon DX example — 23.5 × 15.7 mm',
      canonApsC: 'Canon APS-C example — 22.3 × 14.9 mm',
      microFourThirds: 'Micro Four Thirds — 17.3 × 13 mm',
      custom: 'Custom dimensions',
    },
    width: 'Width',
    height: 'Height',
    focalLength: 'Actual lens focal length',
    distance: 'Subject distance (distant-field estimate)',
    axis: 'Angle shown in the diagram',
    axes: {
      horizontal: 'Horizontal',
      vertical: 'Vertical',
      diagonal: 'Diagonal',
    },
    results: 'Calculated results',
    cropFactor: 'Diagonal crop factor',
    equivalent: 'Reference-equivalent focal length',
    angleHorizontal: 'Target horizontal angle of view',
    angleVertical: 'Target vertical angle of view',
    angleDiagonal: 'Target diagonal angle of view',
    fieldWidth: 'Approximate horizontal field width at the subject',
    nominal: 'Separate nominal APS-C shortcut',
    nominalNote:
      'This extra line always uses exactly 1.5× for comparison. It is not substituted for the dimension-based result above.',
    physical:
      'The actual focal length does not change. Keep the camera in the same position when comparing perspective; cropping is not optical magnification.',
    aspect:
      'Crop factor uses the diagonal. If aspect ratios differ, matching the diagonal angle does not match horizontal and vertical angles at the same time.',
    sensorDiagram: 'Sensor dimensions — proportional geometry',
    sensorDiagramDescription:
      'Both rectangles use the same scale and are centered for comparison. Labels identify the reference and target.',
    referenceLegend: 'Reference',
    targetLegend: 'Target',
    angleDiagram: 'Angle of view — geometric schematic',
    angleDiagramDescription:
      'The selected axis is calculated with a rectilinear lens model. Triangle length is adjusted only to fit the diagram; its angle follows the result.',
    camera: 'Camera position',
    noScript:
      'JavaScript is unavailable, so the controls are hidden. Static example: a 16 mm lens on a 1.5× APS-C sensor has a field of view similar to 24 mm on full frame. For real dimensions, crop factor = reference diagonal ÷ target diagonal.',
    formulaTitle: 'The model in three equations',
    formulas: [
      'crop factor c = √(wᵣ² + hᵣ²) ÷ √(wₜ² + hₜ²)',
      'equivalent focal length = actual focal length × c',
      'angle of view = 2 × atan(sensor dimension ÷ (2 × focal length))',
      'distant field width ≈ subject distance × sensor width ÷ focal length',
    ],
    assumptionsTitle: 'Assumptions and limits',
    assumptions: [
      'Ideal rectilinear projection and distant-focus geometry; fisheye lenses, focus breathing, close-focus behavior, and distortion correction are not simulated.',
      'Sensor dimensions are in millimetres. The tool accepts 1–200 mm dimensions and 1–2000 mm focal lengths; these are calculator limits, not claims about what equipment exists.',
      'The field-width estimate uses the horizontal sensor dimension and becomes less suitable for close-up photography.',
    ],
  },
  exposure: {
    metaTitle: 'Exposure Stops Calculator',
    metaDescription:
      'Compare two aperture, shutter-speed, and ISO settings. Separate sensor light exposure from simplified nominal ISO output mapping.',
    title: 'Exposure stops comparison',
    intro:
      'Compare before and after settings in stops. Aperture and shutter determine the light-exposure model; ISO is shown separately as a nominal output-mapping change.',
    interactiveTitle: 'Compare two settings',
    before: 'Before',
    after: 'After',
    aperture: 'Aperture f-number',
    shutter: 'Shutter time (seconds or fraction)',
    iso: 'ISO setting',
    apertureSlider: 'Aperture — logarithmic f-number scale',
    shutterSlider: 'Shutter — logarithmic time scale',
    isoSlider: 'ISO — logarithmic scale',
    results: 'Comparison results',
    sensorExposure: 'Light exposure per unit sensor area',
    sensorExposureNote:
      'Calculated from aperture and shutter only. Positive stops mean more light exposure; negative stops mean less.',
    nominalOutput: 'Simplified nominal output mapping',
    nominalOutputNote:
      'Light-exposure stops plus ISO-mapping stops. This is not a prediction of JPEG pixel brightness.',
    isoMapping: 'Nominal ISO mapping change',
    apertureChange: 'Aperture contribution',
    shutterChange: 'Shutter contribution',
    ratio: 'Relative ratio',
    stops: 'stops',
    isoTruth:
      'Changing ISO alone does not change the light-exposure result and does not create more photons. Camera gain, read noise, highlight headroom, tone curves, saturation, and automatic processing require camera-specific analysis.',
    scale: 'Scale',
    scaleNote:
      'Markers span −4 to +4 stops. A marker at an edge means the value is at or beyond that end; read the exact text result.',
    sensorTrack: 'Light exposure',
    outputTrack: 'Nominal output',
    noScript:
      'JavaScript is unavailable, so the controls are hidden. Static example: doubling only ISO leaves light exposure unchanged (0 stops) and adds +1 stop in the simplified output-mapping model.',
    formulaTitle: 'Keep the two calculations separate',
    formulas: [
      'light exposure ratio H₂/H₁ = (t₂/t₁) × (N₁/N₂)²',
      'light exposure stops = log₂(H₂/H₁)',
      'nominal ISO mapping stops = log₂(ISO₂/ISO₁)',
      'nominal output stops = light exposure stops + ISO mapping stops',
    ],
    assumptionsTitle: 'Assumptions and limits',
    assumptions: [
      'Scene luminance, lens transmission, and other optical conditions are fixed. The light-exposure result is per unit sensor area, not total light over differently sized sensors.',
      'Common f-numbers are rounded labels: f/2.8 to f/4 is approximately, not exactly, one stop less light exposure.',
      'The ISO term describes only a nominal linear output-mapping comparison. It does not estimate photons, noise, clipping, or real JPEG brightness.',
    ],
  },
};

export type ToolsCopy = typeof en;

const zhCN: ToolsCopy = {
  index: {
    metaTitle: '交互摄影工具',
    metaDescription:
      '通过中英双语、支持键盘操作的摄影计算器，探索画幅系数、等效焦距、视角与曝光档位。',
    eyebrow: '每次只改变一个变量，观察因果关系',
    title: '交互摄影工具',
    intro:
      '用透明、简明的模型理解相机设置与成像结果。每项结果都附有模型条件，这些工具不用于预测真实相机 JPEG。',
    cropTitle: '画幅系数与等效焦距',
    cropDescription:
      '比较真实传感器尺寸，计算等效焦距，并观察水平、垂直与对角线视角。',
    exposureTitle: '曝光档位比较',
    exposureDescription:
      '比较前后两组光圈、快门与 ISO，同时分清光曝光和 ISO 名义输出映射。',
    open: '打开工具',
    formula: '模型',
  },
  common: {
    back: '返回工具目录',
    reset: '重置示例',
    millimeters: 'mm',
    meters: 'm',
    degrees: '°',
    errors: {
      required: '请输入数值，此字段不能为空。',
      invalid: '请输入十进制数值或 1/125 这样的简单分数。',
      positive: '请输入大于零的数值。',
      nonFinite: '请输入有限数值，不支持 NaN 或 Infinity。',
      range: (min: number, max: number) =>
        `请输入本工具支持的 ${min} 至 ${max} 范围内的数值。`,
      calculation: '请检查标出的字段；所有输入有效后才会显示计算结果。',
    },
  },
  crop: {
    metaTitle: '画幅系数与等效焦距计算器',
    metaDescription:
      '根据真实传感器尺寸计算画幅系数、等效焦距、三个方向的视角，以及远距离取景宽度近似值。',
    title: '画幅系数与等效焦距',
    intro:
      '比较同一支镜头在两种传感器尺寸上的取景范围。镜头的物理焦距不会改变，“等效”描述的是相对于所选参考画幅的视角。',
    interactiveTitle: '设置比较条件',
    referenceHeading: '参考传感器',
    targetHeading: '目标传感器',
    preset: '传感器预设',
    presets: {
      fullFrame: '全画幅——36 × 24 mm',
      fujifilmApsC: '富士 X-T5 APS-C——23.5 × 15.6 mm',
      nikonDx: '尼康 DX 示例——23.5 × 15.7 mm',
      canonApsC: '佳能 APS-C 示例——22.3 × 14.9 mm',
      microFourThirds: 'M4/3——17.3 × 13 mm',
      custom: '自定义尺寸',
    },
    width: '宽度',
    height: '高度',
    focalLength: '镜头实际焦距',
    distance: '拍摄距离（远距离近似）',
    axis: '图示显示的视角方向',
    axes: { horizontal: '水平', vertical: '垂直', diagonal: '对角线' },
    results: '计算结果',
    cropFactor: '对角线画幅系数',
    equivalent: '相对于参考画幅的等效焦距',
    angleHorizontal: '目标画幅水平视角',
    angleVertical: '目标画幅垂直视角',
    angleDiagonal: '目标画幅对角线视角',
    fieldWidth: '主体距离处的近似水平取景宽度',
    nominal: '单独列出的 APS-C 常用近似',
    nominalNote:
      '这一行始终固定使用 1.5× 作近似对照，不会用它替代上方按真实尺寸计算的结果。',
    physical:
      '镜头实际焦距不会改变。比较透视关系时应保持相机位置不变；裁切不是镜头的光学放大。',
    aspect:
      '画幅系数按对角线定义。宽高比不同时，即使对角线视角一致，水平和垂直视角也不会同时一致。',
    sensorDiagram: '传感器尺寸——按比例几何图',
    sensorDiagramDescription:
      '两个矩形采用相同缩放并居中叠放，文字标签分别标出参考与目标画幅。',
    referenceLegend: '参考画幅',
    targetLegend: '目标画幅',
    angleDiagram: '视角——几何示意图',
    angleDiagramDescription:
      '所选方向按直线投影模型计算。三角形长度仅为适应画面而调整，夹角跟随计算结果。',
    camera: '相机位置',
    noScript:
      '当前无法使用 JavaScript，因此交互控件已隐藏。静态示例：16 mm 镜头用于 1.5× APS-C 传感器时，视角约等于全画幅上的 24 mm。按真实尺寸计算时，画幅系数＝参考画幅对角线÷目标画幅对角线。',
    formulaTitle: '模型公式',
    formulas: [
      '画幅系数 c＝√(wᵣ²＋hᵣ²)÷√(wₜ²＋hₜ²)',
      '等效焦距＝实际焦距 × c',
      '视角＝2 × atan（传感器方向尺寸÷（2 × 焦距））',
      '远距离取景宽度≈拍摄距离 × 传感器宽度÷焦距',
    ],
    assumptionsTitle: '模型条件与限制',
    assumptions: [
      '采用理想直线投影和远距离对焦几何，不模拟鱼眼、呼吸效应、近摄行为或畸变校正。',
      '传感器尺寸单位为毫米。本工具接受 1–200 mm 尺寸和 1–2000 mm 焦距，这是计算器范围，不表示超出范围的设备不存在。',
      '取景宽度使用传感器水平尺寸作远距离近似，不适用于近摄精确计算。',
    ],
  },
  exposure: {
    metaTitle: '曝光档位计算器',
    metaDescription:
      '比较前后两组光圈、快门和 ISO 设置，分清传感器光曝光与简化的 ISO 名义输出映射。',
    title: '曝光档位比较',
    intro:
      '以档位比较调整前后的参数。光圈和快门决定光曝光模型，ISO 则单独作为名义输出映射变化显示。',
    interactiveTitle: '比较两组设置',
    before: '调整前',
    after: '调整后',
    aperture: '光圈系数（F 数值）',
    shutter: '快门时间（秒或分数）',
    iso: 'ISO 设置',
    apertureSlider: '光圈——对数 F 数值刻度',
    shutterSlider: '快门——对数时间刻度',
    isoSlider: 'ISO——对数刻度',
    results: '比较结果',
    sensorExposure: '单位传感器面积的光曝光',
    sensorExposureNote:
      '仅由光圈和快门计算。正档位表示光曝光增加，负档位表示减少。',
    nominalOutput: '简化的名义输出映射',
    nominalOutputNote:
      '光曝光档位加 ISO 映射档位，不用于预测真实 JPEG 像素亮度。',
    isoMapping: 'ISO 名义映射变化',
    apertureChange: '光圈贡献',
    shutterChange: '快门贡献',
    ratio: '相对比例',
    stops: '档',
    isoTruth:
      '仅改变 ISO 不会改变光曝光结果，也不会产生更多光子。相机增益、读出噪声、高光余量、色调曲线、饱和与自动处理需要结合具体机型分析。',
    scale: '刻度',
    scaleNote:
      '标记覆盖 −4 至 +4 档。标记位于边缘时表示结果达到或超出该端，请读取准确的文字结果。',
    sensorTrack: '光曝光',
    outputTrack: '名义输出',
    noScript:
      '当前无法使用 JavaScript，因此交互控件已隐藏。静态示例：只将 ISO 加倍时，光曝光保持不变（0 档），简化输出映射增加 +1 档。',
    formulaTitle: '把两项计算分开',
    formulas: [
      '光曝光比例 H₂/H₁＝(t₂/t₁) × (N₁/N₂)²',
      '光曝光档位＝log₂(H₂/H₁)',
      'ISO 名义映射档位＝log₂(ISO₂/ISO₁)',
      '名义输出档位＝光曝光档位＋ISO 映射档位',
    ],
    assumptionsTitle: '模型条件与限制',
    assumptions: [
      '场景亮度、镜头透光率和其他光学条件保持不变。光曝光结果按单位传感器面积计算，不是不同尺寸传感器的总进光量。',
      '常见光圈数值经过取整：f/2.8 到 f/4 约减少一档光曝光，并非严格等于一档。',
      'ISO 项只描述简化的线性名义输出映射，不估算光子、噪声、剪切或真实 JPEG 亮度。',
    ],
  },
};

export const toolsCopy: Record<MarketingLocale, ToolsCopy> = {
  en,
  'zh-cn': zhCN,
};
