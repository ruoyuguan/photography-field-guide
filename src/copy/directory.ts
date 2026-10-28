import type { MarketingLocale } from '@utils/locale';

const en = {
  common: {
    external: 'opens the source website in a new tab',
    checked: 'Checked',
    yes: 'Yes',
    no: 'No',
    unknown: 'Unknown',
    all: 'All',
    reset: 'Reset filters',
    noScript:
      'Filtering needs JavaScript. Every published entry remains available below.',
    official: 'Official',
    independent: 'Independent',
    community: 'Community',
    sources: 'Sources and verification',
  },
  glossary: {
    metaTitle: 'Photography Glossary',
    metaDescription:
      'Search photography terms in English and Chinese, with aliases, misconceptions, examples, and links to complete explanations.',
    eyebrow: 'Vocabulary without the jargon wall',
    title: 'Photography glossary',
    intro:
      'Search either language, including aliases. Each term links back to a complete explanation instead of ending at a one-line definition.',
    query: 'Search terms and aliases',
    placeholder: 'Try crop factor, 光圈, EXIF…',
    showing: 'Showing {shown} of {total} terms',
    empty: 'No term matches this search. Try an English or Chinese alias.',
    misconception: 'Common misconception',
    example: 'Example',
    read: 'Read the complete explanation',
    related: 'Related terms',
  },
  gear: {
    metaTitle: 'Camera & Lens Learning Guides',
    metaDescription:
      'Verified Fujifilm X-T5 and XF16–50mm specifications, explained through practical photography lessons and compatible-pair examples.',
    eyebrow: 'Use equipment to understand principles',
    title: 'Camera and lens guides',
    intro:
      'A small, sourced equipment library—not a ranking or shopping list. The first examples are the Fujifilm X-T5 and XF16–50mmF2.8–4.8 R LM WR.',
    camera: 'Camera',
    lens: 'Lens',
    open: 'Open equipment guide',
    pairTitle: 'Learn with the compatible pair',
    pairIntro:
      'Both examples use the FUJIFILM X mount. This native mount match is the compatibility claim; no adapter or full-frame coverage is implied.',
    pairCamera:
      '23.5 × 15.7 mm APS-C sensor, X mount, and in-body stabilization.',
    pairLens:
      '16–50 mm actual focal-length range, with a manufacturer-stated 24–76 mm full-frame equivalent view.',
    pairSamples: 'Open the specifically evidenced camera/lens sample entry',
    official: 'Manufacturer page',
    manual: 'Online manual',
    specifications: 'Verified specifications',
    sensor: 'Sensor',
    mount: 'Mount',
    pixels: 'Effective pixels',
    ibis: 'In-body stabilization',
    formats: 'Still-image formats',
    focal: 'Actual focal length',
    equivalent: 'Manufacturer full-frame equivalent',
    maxAperture: 'Maximum aperture',
    minAperture: 'Minimum aperture',
    ois: 'Lens OIS',
    notListed:
      'Not listed as an OIS lens; the camera’s IBIS is a separate mechanism.',
    cameraLessonTitle: 'What this camera helps you learn',
    cameraLessonOne:
      'Its 23.5 × 15.7 mm sensor is one real APS-C example, not a universal APS-C dimension. Use it to distinguish physical size, crop factor, and equivalent field of view.',
    cameraLessonTwo:
      'The official specification lists a five-axis sensor-shift stabilization mechanism. It can compensate for some camera motion; it cannot freeze a moving subject.',
    cameraLessonThree:
      'JPEG, HEIF, RAW, and TIFF are listed separately. RAW conversion and EXIF metadata are not interchangeable with the image encoding itself.',
    lensLessonTitle: 'Read the name without guessing',
    lensLessonOne:
      '16–50 mm is the physical zoom range. F2.8–4.8 gives only the maximum aperture at the wide and telephoto ends; intermediate values must not be invented by interpolation. F22 is the minimum aperture, so the lens is not limited to F2.8–4.8.',
    nameR: 'R: a dedicated aperture ring.',
    nameLM: 'LM: a linear motor for autofocus.',
    nameWR:
      'WR: weather resistance, not a guarantee of waterproofing or permission to ignore the manual.',
    nameOIS:
      'OIS identifies optical lens stabilization when present in a lens name; it is not the same as in-body stabilization.',
    lensNamingNote:
      'Letter meanings follow the manufacturer naming convention explained in PCMag’s lens-name guide; product numbers and endpoint apertures come from the official specification.',
    learn: 'Related lessons',
    back: 'Back to equipment',
    checked: 'Official specification checked',
  },
  galleries: {
    metaTitle: 'Photography Sample Gallery Directory',
    metaDescription:
      'Filter link-only camera, lens, and specifically evidenced camera/lens sample galleries, with clear EXIF, original-file, and rights status.',
    eyebrow: 'Look closely at the evidence',
    title: 'External sample galleries',
    intro:
      'Links lead to the original publisher. No photographs are copied or hotlinked here. A compatible camera and lens do not prove that every photograph used that combination.',
    query: 'Search titles and topics',
    placeholder: 'Try X-T5, lens, official…',
    scope: 'Equipment scope',
    camera: 'Camera',
    lens: 'Lens',
    subject: 'Topic',
    provider: 'Provider type',
    exif: 'Displayed exposure information',
    originals: 'Original files',
    scopes: {
      general: 'General gallery',
      camera: 'Camera',
      lens: 'Lens',
      combination: 'Specific camera/lens evidence',
    },
    showing: 'Showing {shown} of {total} gallery links',
    empty:
      'No gallery matches these filters. Reset them to see every verified entry.',
    visit: 'Visit the source gallery',
    evidence: 'Scope evidence',
    rights: 'Link only; no image reuse rights are claimed.',
    limitedScope:
      'This entry refers only to the specifically captioned sample, not to every image on the source page.',
  },
  resources: {
    metaTitle: 'Photography Learning Resources',
    metaDescription:
      'Curated official documentation, independent photography tutorials, and sample galleries with purposes, audiences, languages, and verification dates.',
    eyebrow: 'Go to the original source',
    title: 'Learning resources',
    intro:
      'A curated directory of specifications, manuals, tutorials, and galleries. Provider type describes who publishes a resource; it is not a universal accuracy score.',
    query: 'Search resources and purposes',
    placeholder: 'Try sensor, manual, depth of field…',
    category: 'Category',
    provider: 'Provider type',
    language: 'Resource language',
    audience: 'Learning stage',
    categories: {
      manual: 'Manual',
      specification: 'Specification',
      tutorial: 'Tutorial',
      software: 'Software',
      community: 'Community',
      gallery: 'Gallery',
    },
    audiences: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      technical: 'Technical',
    },
    showing: 'Showing {shown} of {total} resources',
    empty: 'No resource matches these filters.',
    purpose: 'Why use it',
    note: 'Editorial note',
    verified: 'Link, identity, and stated scope checked',
    visit: 'Visit resource',
  },
  about: {
    metaTitle: 'About Photography Field Guide',
    metaDescription:
      'The project’s learning goals, source and review principles, contribution path, external-image policy, and license boundaries.',
    eyebrow: 'A field guide, not a gear leaderboard',
    title: 'About this project',
    intro:
      'Photography Field Guide helps beginners connect camera settings with their effects, in English and Simplified Chinese, without turning specifications into buying advice.',
    goalTitle: 'Learning goals',
    goalBody:
      'Start with observation and light, then connect sensor size, field of view, aperture, shutter time, ISO, exposure stops, depth of field, and image files. Each core lesson includes an example, misconceptions, a controlled experiment, and sources. Equipment appears as a concrete example, not as a prerequisite for learning.',
    qualityTitle: 'Quality and scientific limits',
    qualityBody:
      'Physical focal length does not change with sensor size. Crop factor is not applied to ordinary exposure settings. ISO does not create additional photons. Depth of field is not a complete description of background blur. Calculators state their assumptions, and nominal rounded settings are not presented as exact physical constants.',
    sourcesTitle: 'Sources and review',
    sourcesBody:
      'Product facts use manufacturer specifications or manuals. General explanations use traceable educational references, with simplified or outdated claims excluded where necessary. Dates record actual checks, not bulk imports. An accessible link does not prove equipment scope, EXIF availability, or reuse permission.',
    contributeTitle: 'Participate',
    contributeBody:
      'Useful contributions include paired English/Chinese edits, cited corrections, reproducible calculator tests, and clearly scoped external resources. The repository may remain private during development; public contributions are possible only where repository access is enabled. Do not upload another photographer’s work without documented permission.',
    repository: 'Project repository',
    copyrightTitle: 'Copyright and licenses',
    copyrightBody:
      'The site is based on the open-source ScrewFast template and retains its MIT notice. That software license does not automatically license new articles, third-party photographs, or a photographer’s future work. External galleries are link-only; their images remain on the publisher’s website with their original rights and attribution.',
    license: 'Read the MIT license',
  },
};

export type DirectoryCopy = typeof en;

const zhCN: DirectoryCopy = {
  common: {
    external: '在新标签页打开来源网站',
    checked: '核查日期',
    yes: '有',
    no: '无',
    unknown: '未知',
    all: '全部',
    reset: '重置筛选',
    noScript: '筛选功能需要 JavaScript；下方仍保留全部已发布条目。',
    official: '官方',
    independent: '独立作者／机构',
    community: '社区',
    sources: '来源与核查记录',
  },
  glossary: {
    metaTitle: '摄影术语词典',
    metaDescription:
      '用中英文及别名检索摄影术语，查看常见误区、示例和完整教程链接。',
    eyebrow: '不让术语成为学习障碍',
    title: '摄影术语词典',
    intro:
      '可用两种语言及别名检索。每个术语都链接到完整解释，而不是停在一行定义。',
    query: '搜索术语与别名',
    placeholder: '试试裁切系数、ISO、EXIF……',
    showing: '显示 {total} 个术语中的 {shown} 个',
    empty: '没有匹配的术语，请尝试中文或英文别名。',
    misconception: '常见误区',
    example: '示例',
    read: '阅读完整解释',
    related: '相关术语',
  },
  gear: {
    metaTitle: '相机与镜头学习指南',
    metaDescription:
      '经官方资料核查的富士 X-T5 与 XF16–50mm 规格，以及结合摄影原理的器材学习入口。',
    eyebrow: '用具体器材理解通用原理',
    title: '相机与镜头指南',
    intro:
      '一个小型、可溯源的器材资料库，不做排名或购买导向。首批示例为富士 X-T5 与 XF16–50mmF2.8–4.8 R LM WR。',
    camera: '相机',
    lens: '镜头',
    open: '打开器材指南',
    pairTitle: '用这套兼容组合学习',
    pairIntro:
      '两件器材都采用富士 X 卡口。这里仅说明原生卡口兼容，不暗示需要转接，也不暗示镜头覆盖全画幅。',
    pairCamera: '23.5 × 15.7 mm APS-C 传感器、X 卡口及机身防抖。',
    pairLens: '实际焦距 16–50 mm，厂商标注全画幅等效视角 24–76 mm。',
    pairSamples: '查看有明确标注的机身／镜头组合样片条目',
    official: '厂商页面',
    manual: '在线说明书',
    specifications: '已核实规格',
    sensor: '传感器',
    mount: '卡口',
    pixels: '有效像素',
    ibis: '机身防抖',
    formats: '静态图像格式',
    focal: '实际焦距',
    equivalent: '厂商标注全画幅等效',
    maxAperture: '最大光圈',
    minAperture: '最小光圈',
    ois: '镜头 OIS',
    notListed: '此镜头未标为 OIS 镜头；相机机内防抖是另一套独立机制。',
    cameraLessonTitle: '可以用它理解哪些概念',
    cameraLessonOne:
      '23.5 × 15.7 mm 传感器是一个真实的 APS-C 示例，不是所有 APS-C 的统一尺寸。可用它区分物理尺寸、画幅系数和等效视角。',
    cameraLessonTwo:
      '官方规格列出五轴传感器位移防抖机构。它可补偿部分相机运动，但不能凝固移动的主体。',
    cameraLessonThree:
      'JPEG、HEIF、RAW 和 TIFF 分别列出。RAW 转换与 EXIF 元数据都不能和图像编码本身混为一谈。',
    lensLessonTitle: '读懂名称，不靠猜测',
    lensLessonOne:
      '16–50 mm 是实际变焦范围。F2.8–4.8 只表示广角端与长焦端的最大光圈，不能插值编造中间焦距的数值。最小光圈为 F22，因此镜头并不是只能在 F2.8–4.8 之间使用。',
    nameR: 'R：带有独立光圈环。',
    nameLM: 'LM：使用线性马达驱动自动对焦。',
    nameWR: 'WR：具备耐候防护，不等于保证完全防水，也不意味着可以忽视说明书。',
    nameOIS: '镜头名称中的 OIS 表示光学镜头防抖；它与机身防抖不是同一概念。',
    lensNamingNote:
      '字母含义参考 PCMag 的镜头命名指南；焦距数字与两端光圈来自厂商官方规格。',
    learn: '相关教程',
    back: '返回器材目录',
    checked: '官方规格核查日期',
  },
  galleries: {
    metaTitle: '摄影样片画廊目录',
    metaDescription:
      '筛选仅提供外链的机身、镜头及有明确组合证据的样片，并标明 EXIF、原始文件与版权状态。',
    eyebrow: '看清样片背后的证据',
    title: '外部样片画廊',
    intro:
      '链接跳转到原始发布方，本站不复制或热链照片。相机与镜头可以兼容，并不能证明每张照片都使用了这套组合。',
    query: '搜索标题与主题',
    placeholder: '试试 X-T5、镜头、官方……',
    scope: '器材范围',
    camera: '相机',
    lens: '镜头',
    subject: '主题',
    provider: '来源性质',
    exif: '页面展示曝光信息',
    originals: '原始文件',
    scopes: {
      general: '综合画廊',
      camera: '机身',
      lens: '镜头',
      combination: '具体机身／镜头证据',
    },
    showing: '显示 {total} 条画廊链接中的 {shown} 条',
    empty: '没有符合这些条件的画廊，请重置筛选查看全部已核查条目。',
    visit: '访问来源画廊',
    evidence: '范围证据',
    rights: '仅提供链接，不主张图片转载许可。',
    limitedScope: '此条目仅指有明确标注的样片，不代表来源页中的所有照片。',
  },
  resources: {
    metaTitle: '摄影学习资源',
    metaDescription:
      '精选官方文档、独立摄影教程和样片画廊，说明用途、适合阶段、语言与核查时间。',
    eyebrow: '回到原始来源',
    title: '摄影学习资源',
    intro:
      '整理规格、说明书、教程与画廊。来源性质说明发布者是谁，并不是适用于一切内容的准确性评分。',
    query: '搜索资源与用途',
    placeholder: '试试传感器、说明书、景深……',
    category: '分类',
    provider: '来源性质',
    language: '资源语言',
    audience: '学习阶段',
    categories: {
      manual: '说明书',
      specification: '规格',
      tutorial: '教程',
      software: '软件',
      community: '社区',
      gallery: '画廊',
    },
    audiences: {
      beginner: '入门',
      intermediate: '进阶',
      technical: '技术深入',
    },
    showing: '显示 {total} 条资源中的 {shown} 条',
    empty: '没有符合这些条件的资源。',
    purpose: '可以用来做什么',
    note: '编辑说明',
    verified: '链接、页面身份与所述范围已核查',
    visit: '访问资源',
  },
  about: {
    metaTitle: '关于摄影入门指南',
    metaDescription:
      '项目的学习目标、来源与审查原则、参与方式、外部图片政策及许可边界。',
    eyebrow: '一本摄影手册，不是器材排行榜',
    title: '关于这个项目',
    intro:
      'Photography Field Guide 用英文和简体中文帮助新手理解相机设置与成像结果之间的关系，不把规格表变成购买建议。',
    goalTitle: '学习目标',
    goalBody:
      '从观察与光线出发，逐步理解传感器尺寸、视角、光圈、快门时间、ISO、曝光档位、景深与图像文件。每篇核心教程都包含示例、常见误区、控制变量练习和来源。器材用于具体说明原理，不是开始学习的前提。',
    qualityTitle: '质量原则与科学边界',
    qualityBody:
      '传感器尺寸不会改变镜头的实际焦距；普通曝光设置不乘画幅系数；ISO 不会创造更多光子；景深不能完整描述背景虚化。计算工具会声明假设，取整后的标称参数也不会被当成精确物理常数。',
    sourcesTitle: '来源与审核',
    sourcesBody:
      '器材事实使用厂商规格或说明书，通用解释使用可追溯的教学资料；对其中简化或过时的说法会明确排除。日期记录真实核查，而不是批量导入。链接可访问并不能证明器材范围、EXIF 能力或转载许可。',
    contributeTitle: '参与方式',
    contributeBody:
      '有价值的贡献包括中英配对修订、有来源的纠错、可复现的计算器测试，以及范围明确的外部资源。仓库在开发期间可以保持私有，只有开放访问时才能接收公开贡献。未经明确许可，不要上传其他摄影师的作品。',
    repository: '项目仓库',
    copyrightTitle: '版权与许可',
    copyrightBody:
      '本站基于开源 ScrewFast 模板，并保留其 MIT 声明。软件许可不会自动覆盖新写文章、第三方照片或摄影师未来提供的作品。外部画廊仅提供链接，照片仍保留在发布方网站，权利与署名不因链接而改变。',
    license: '阅读 MIT 许可证',
  },
};

export const directoryCopy: Record<MarketingLocale, DirectoryCopy> = {
  en,
  'zh-cn': zhCN,
};
