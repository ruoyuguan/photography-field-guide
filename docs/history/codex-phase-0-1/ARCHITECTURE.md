# Photography Field Guide — Phase 1 架构设计提案

日期：2026-10-28（Asia/Shanghai）  
状态：设计提案；本文件中的路由、集合、接口、校验器与工具均尚未实现。  
审查对象：`/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/photography-field-guide`。本文件保存在当前 Codex 工作目录，未修改原仓库。

## 1. 实施原则与可复用边界

继续采用现有 Astro 静态站点、TypeScript、Tailwind CSS、MDX 和 Starlight。教程保留 Starlight 的阅读排版、目录、语言支持和 Pagefind 搜索；独立目录与工具页复用 `MainLayout.astro`、现有导航、页脚和 SEO 组件。优先修改共享数据和路径函数，不重新初始化模板。

工具采用原生表单、局部 TypeScript 和原创 SVG，不引入 Svelte、React、数据库、登录系统或后端。当前商业示例组件尚未等于公开功能：清理时先检查引用，再删除无用集合、视图、文案和图片。保留 LICENSE 与必要版权信息。

双语页面共用实体身份和数值数据，分别维护叙述内容。型号与参数用于说明原理；站点结构不依赖某个品牌。没有内容或真实功能的栏目不进入导航，不创建占位按钮。

## 2. 路由与学习路径

以下为站点内部逻辑路由，不包含未来部署的 `base`。英文使用无语言前缀路径，中文统一使用 `/zh-cn/`；同一内容的 slug 保持一致。

| 栏目          | 英文                        | 简体中文                          | 渲染与职责                              |
| ------------- | --------------------------- | --------------------------------- | --------------------------------------- |
| Home          | `/`                         | `/zh-cn/`                         | Astro；介绍项目、开始学习与精选入口     |
| Learn         | `/learn/`                   | `/zh-cn/learn/`                   | Starlight；学习地图与先修顺序           |
| 核心教程      | `/learn/<category>/<slug>/` | `/zh-cn/learn/<category>/<slug>/` | MDX；完整教学内容                       |
| Glossary      | `/glossary/`                | `/zh-cn/glossary/`                | Astro；双语术语检索、稳定锚点与教程链接 |
| Tools         | `/tools/`                   | `/zh-cn/tools/`                   | Astro；仅列可用工具                     |
| 画幅工具      | `/tools/crop-factor/`       | `/zh-cn/tools/crop-factor/`       | Astro + 局部 TS + SVG                   |
| 曝光工具      | `/tools/exposure-stops/`    | `/zh-cn/tools/exposure-stops/`    | Astro + 局部 TS + SVG                   |
| Gear          | `/gear/`、`/gear/<id>/`     | 对应 `/zh-cn/gear/...`            | Astro；机身、镜头与组合学习入口         |
| Galleries     | `/galleries/`               | `/zh-cn/galleries/`               | Astro；外部样片链接与筛选               |
| Resources     | `/resources/`               | `/zh-cn/resources/`               | Astro；精选资料与核查信息               |
| About         | `/about/`                   | `/zh-cn/about/`                   | Astro；项目、编辑政策、贡献与版权       |
| Notes（后续） | `/notes/`、`/notes/<slug>/` | 对应中文路径                      | 有真实笔记后启用                        |

Learn 按 `getting-started → sensor-lens → exposure → image-quality → composition → field-practice → workflow` 组织。分类表示知识位置，先修引用表示实际依赖；不强迫读者把整类文章全部读完才进入下一类。

前十篇核心教程依次覆盖摄影、数字成像、传感器尺寸、焦距与画幅系数、光圈、快门、ISO、曝光档位、景深、RAW/JPEG/EXIF。入门地图不计入十篇正式教程。保留已有曝光三角文章，但明确光圈、快门与 ISO 对光曝光量的作用不同。

现有 `/start-here/` 拟迁至 `/learn/`，`/basics/...` 拟迁至相关 Learn 分类。迁移前生成明确的旧新路径表，同步更新首页、侧栏、正文、语言切换、smoke 和搜索检查。网站尚未公开时直接迁移成本最低；若发现旧链接已对外使用，另提供静态重定向页并验证目标，而不是删除所有兼容入口。

当前中文文档的站点标题入口、侧栏分组与搜索部分文案存在实际本地化遗漏。首轮必须使用当前 Starlight 的 `Astro.locals.starlightRoute`，并对齐 sidebar / UI 使用的语言查找键，验证中文页面中的导航仍落到中文内容。根 `404.html` 与语言菜单 `/404/` 也须纳入路由登记的特例。

## 3. 内容存储、唯一身份与翻译存在性

建议新增目录仅在对应内容投入使用时创建：

```text
src/content/docs/
  learn/index.mdx
  learn/<category>/<slug>.mdx
  zh-cn/learn/index.mdx
  zh-cn/learn/<category>/<slug>.mdx
src/content/glossary/       # 每个语义术语一个结构化条目
src/content/cameras/        # 共享事实数据 + 双语说明
src/content/lenses/
src/content/resources/
src/content/galleries/
src/content/exercises/      # 出现跨文章复用需求后启用
src/components/tools/
src/utils/photography/
src/data_files/tools.ts     # 可用工具的 ID 与路由登记
scripts/validate-content.mjs
```

Starlight 教程继续使用 `docsLoader()`。其他小型集合使用 Astro 的文件或 glob loader 加 Zod schema；具体 JSON/YAML 选择以编辑便利为准，不引入自制内容框架。

文章具有三种不同身份，不能混用：

1. **语义身份 `translationKey`**：如 `focal-length-crop-factor`，在所有语言中稳定；先修与术语引用指向它。
2. **语言版本身份**：`(translationKey, locale)`，全站唯一。`locale` 从内容路径推导，不另写一份可能冲突的 frontmatter。
3. **实际路由**：由 loader 输出和路径规则确定，不从标题推导。分类调整或标题翻译不能悄悄改变实体关联。

构建时从真实条目生成文章登记表，记录语义身份、语言、实际 URL、公开状态。页面和 SEO 只查询登记表，不机械地给任意 pathname 加 `/zh-cn`。

语言切换优先指向相同 `translationKey` 的公开译文。若译文缺失，按钮明确标注“暂无中文译文，阅读 English”，直接指向英文原文；不得指向不存在的中文路径，也不得将英文正文伪装成已完成中文页。hreflang 仅输出实际存在且内容对应的可索引版本。Glossary 的双语检索使用两种术语、各自别名与缩写；显示语言由当前页面决定。

## 4. Article schema 与草稿发布策略

当前 `src/content.config.ts` 使用 `docsSchema()`，可以保留并扩展。以下为拟议结构，示例仅展示文章元数据字段：

```ts
docs: defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      translationKey: z.string().min(1),
      category: z.enum([
        'getting-started', 'sensor-lens', 'exposure', 'image-quality',
        'composition', 'field-practice', 'workflow',
      ]),
      difficulty: z.enum(['beginner', 'intermediate', 'technical']),
      reviewStatus: z.enum(['draft', 'in-review', 'published']),
      prerequisites: z.array(z.string()).default([]),
      relatedConcepts: z.array(z.string()).default([]),
      relatedTools: z.array(z.string()).default([]),
      sources: z.array(sourceReferenceSchema).default([]),
      lastReviewed: isoDateSchema.optional(),
    }),
  }),
}),
```

`sourceReferenceSchema` 与 `isoDateSchema` 为后续实现的公共 schema；日期须校验为真实 ISO 日历日期，不能只用宽松字符串。

**草稿必须真正退出生产路由。** 审查时已从安装的 Starlight 0.42.6 本地源码确认：`dist/schema.js` 提供 `draft: boolean`，`dist/utils/routing/index.js` 在 production 过滤 `draft:true` 条目。因此沿用 Starlight 原生 `draft`，并在构建期强制以下一致性：

| 编辑状态    | Starlight `draft` | 生产可见性                 |
| ----------- | ----------------- | -------------------------- |
| `draft`     | `true`            | 不生成教程路由             |
| `in-review` | `true`            | 不生成教程路由             |
| `published` | `false`           | 满足来源与审核条件后才生成 |

校验器必须拒绝 `reviewStatus: draft` 却 `draft:false` 的组合。已发布文章必须有审核日期及真实来源；现有文章不能为通过校验而批量填写虚构审核结果。开发模式可预览草稿，公开验收以 production build 为准。

自建 Learn 索引、站内相关推荐、翻译登记表、Gear/Resource 目录和 `getStaticPaths()` 都必须显式过滤未发布记录。自定义集合的 `draft` 不具有 Starlight 的自动路由过滤能力。构建后检查未发布 URL 没有出现在 HTML 链接、sitemap 和 Pagefind 索引中；“不在导航显示”不能代替禁止生成页面。

## 5. 最小 TypeScript 实体提案

以下接口用于说明数据契约，不是已存在的代码。集合 schema 验证字段，构建期验证器验证跨实体关系和业务约束。正式实现时尽量从 schema 推导 TypeScript 类型，避免接口与 schema 各维护一份。

```ts
type Locale = "en" | "zh-cn";
type Localized<T> = Record<Locale, T>;
type ReviewStatus = "draft" | "in-review" | "published";
type Difficulty = "beginner" | "intermediate" | "technical";
type Category =
  | "getting-started"
  | "sensor-lens"
  | "exposure"
  | "image-quality"
  | "composition"
  | "field-practice"
  | "workflow";
type Availability = "yes" | "no" | "unknown";

interface SourceReference {
  url: string;
  title: string;
  locator?: string; // 页码、章节、规格字段；便于复核
  accessedOn: string; // ISO date；实际读过来源后记录
  supports: string; // 此来源支持哪个事实或模型
}

interface Article {
  translationKey: string;
  locale: Locale; // 从内容路径计算，不另写 frontmatter
  url: string; // 从实际路由计算
  title: string;
  summary: string; // 对应已有 description
  category: Category;
  difficulty: Difficulty;
  prerequisites: string[];
  relatedConcepts: string[];
  relatedTools: string[];
  sources: SourceReference[];
  reviewStatus: ReviewStatus;
  draft: boolean;
  lastReviewed?: string;
  // 正文保留在 MDX；不复制进另一份 JSON。
}

interface GlossaryTerm {
  id: string;
  term: Localized<string>;
  aliases: Localized<string[]>;
  shortDefinition: Localized<string>;
  misconceptions: Localized<string[]>;
  example: Localized<string>;
  articleKey?: string;
  relatedTerms: string[];
  sources: SourceReference[];
  reviewStatus: ReviewStatus;
}

interface SensorSpec {
  formatId: string; // 分类 ID；不把 APS-C 当作唯一固定尺寸
  widthMm: number;
  heightMm: number;
}

interface Camera {
  id: string;
  brand: string;
  model: string;
  mountId: string;
  sensor: SensorSpec;
  specifications: {
    effectiveMegapixels?: number;
    hasIBIS?: boolean;
    fileFormats: string[];
  };
  description: Localized<string>;
  manufacturerUrl: string;
  documentationUrl: string;
  articleKeys: string[];
  sources: SourceReference[];
  reviewStatus: ReviewStatus;
}

interface Lens {
  id: string;
  brand: string;
  model: string;
  mountId: string;
  imageCircleFormatId: string;
  focalLengthMm: { min: number; max: number };
  maximumAperture: { wide: number; tele: number };
  minimumAperture?: { wide: number; tele: number };
  hasOIS?: boolean;
  description: Localized<string>;
  manufacturerUrl: string;
  articleKeys: string[];
  sources: SourceReference[];
  reviewStatus: ReviewStatus;
  // 未核实的中间焦距最大光圈曲线保持未知，不进行线性插值冒充规格。
}

interface Verification {
  availability?: "unchecked" | "accessible" | "blocked" | "broken";
  identity?: "unchecked" | "confirmed" | "mismatch";
  scopeEvidence?: string;
  rights?: { use: "link-only" | "licensed" | "unknown"; evidence?: string };
  status: "unreviewed" | "verified" | "unavailable" | "needs-review";
  lastChecked?: string;
  lastVerified?: string;
  resolvedUrl?: string;
  evidence?: string;
}

interface ExternalResource {
  id: string;
  title: Localized<string>;
  provider: string;
  providerType: "official" | "independent" | "community";
  category:
    | "manual"
    | "specification"
    | "tutorial"
    | "software"
    | "community"
    | "gallery";
  url: string;
  languages: string[];
  audience: Difficulty[];
  purpose: Localized<string>;
  editorialNote: Localized<string>;
  tags: string[];
  verification: Verification;
  reviewStatus: ReviewStatus;
}

type GalleryScope =
  | { type: "general" }
  | { type: "camera"; cameraId: string }
  | { type: "lens"; lensId: string }
  | { type: "combination"; cameraId: string; lensId: string };

interface GalleryLink {
  id: string;
  resourceId: string; // 复用 URL、提供者、来源类型与语言
  scope: GalleryScope;
  subjectTags: string[];
  hasExif: Availability;
  hasOriginalFiles: Availability;
  imageRightsNote: Localized<string>;
  verification: Verification; // 针对器材匹配、EXIF 等具体声明复核
  reviewStatus: ReviewStatus;
}

interface PracticeExercise {
  id: string;
  title: Localized<string>;
  difficulty: Difficulty;
  prerequisiteArticles: string[];
  requiredGear: Localized<string[]>;
  objective: Localized<string>;
  procedure: Localized<string[]>;
  expectedObservations: Localized<string[]>;
  reflectionQuestions: Localized<string[]>;
  reviewStatus: ReviewStatus;
}
```

首版器材组合可由实际 Camera/Lens ID 配对产生入口，不必立即增加独立 Kit 集合。配对必须校验卡口与已知适用范围；未来的转接、全画幅裁切模式和电子功能限制采用显式数据，不能仅凭相同品牌推断兼容。

术语与目录条目的双语字段在正式发布时完整；草稿可以留在单独编辑文件中，但不能用空字符串伪装译文。若后续目录实体允许缺译，应将类型改为显式部分翻译并复用译文存在性登记机制，不使用静默回退掩盖缺项。

## 6. 资源核查与构建期引用验证

资源信息分别记录提供者身份、页面可达性、页面身份、范围证据与图片许可。官方身份由 `providerType` 表达，核查记录表达其余维度；`verified` 仅概括明确列出的声明，不能覆盖尚未核查的许可或范围。社区资源可以有价值，但不因此变成官方资料；官方页面也可能移动或不含样片。

`lastChecked` 记录最近检查，`lastVerified` 只在核实内容时更新。`verified` 要求真实日期、最终 URL 和证据说明。HTTP 200、搜索摘要或域名知名度不足以证明型号匹配、EXIF 或原图可用性。自动检查遇到登录、地区限制或反爬阻挡时记录原因，不能直接认定不存在。页面版权声明与展示许可单独核查，外链可访问不意味着允许转载。

构建期验证器拟执行：

1. 校验实体 ID 和 `(translationKey, locale)` 唯一，slug 规范、单位与数值有效。
2. 检查所有文章、术语、工具、器材与资源引用存在；先修图无环，不接受自依赖。
3. 检查已发布条目的必填来源、审核日期、双语字段以及 `draft` 一致性；日期不得在未来。
4. 检查公开链接目标可生成；公开正文不能链接未发布教程。缺译回退目标必须真实存在。
5. 检查 gallery scope 必需字段、卡口和器材匹配；`yes` 的 EXIF/原图声明须有对应核查依据。
6. 检查 URL 协议与结构、重复资源、核查状态与日期一致性。合并真正重复资源，允许有明确用途差异的多个页面。
7. 对 production 产物扫描内部 href/src、canonical/hreflang、sitemap 与搜索索引，覆盖根路径和模拟 `base` 路径。

外链网络检查作为独立维护任务，避免所有离线构建都依赖第三方在线状态。新来源入库仍需实际核查，失败结果不能在没有证据时被改成 Verified。

## 7. URL、部署 base 与 SEO 的统一原则

现有 `astro.config.mjs` 与 `SITE.url` 含 GitHub 项目站路径，但 `base` 未配置；现有 `localePath()` 和多个图标/manifest URL 使用根路径。此处需要统一修正，不能只给 Astro 加一行 base 就认为部署完成。

拟议路径处理顺序：

```text
内容身份 + 目标语言 → 已存在的逻辑路由 → base 前缀 → 对外路径
部署 origin + 对外路径 → canonical / hreflang / OG / sitemap URL
请求 pathname → 去除 base → 识别语言 → 查找逻辑路由
```

`site` 表达站点 origin，`base` 独立表达部署前缀。为根路径与 `/photography-field-guide/` 两种模式提供可测试配置；最终生产域名和托管平台由维护者决定。不得把某一平台的正式部署当作 Phase 1 已获授权。

仅一个共享 helper 添加 base，避免两次前缀；仅一个 helper 规范尾斜杠。绝对外链、锚点、查询参数与内部路由分开处理。修改 `splitLocale()` 时先移除 base，否则 `/photography-field-guide/zh-cn/...` 会被误识别为英文。

页面 title、description、图示说明与工具错误均翻译；共享品牌名不必强行翻译。OG 图片、favicon、manifest、robots 中 sitemap、Starlight 资源与 Pagefind 资源也纳入路径验收。canonical 使用真实生产 URL，不使用 `Astro.url.origin` 的开发默认值；404 页面不应成为可索引正常文章。私有源码仓库不等于网站访问控制，保持本地预览不需要先发布。

## 8. 工具契约、科学模型与输入验证

每个工具由纯计算函数、薄 UI 控制器与可访问的 SVG 组成。UI 文案在 copy 中按语言维护；计算模块不读取 DOM、不拼接翻译、不依赖 Astro，方便单元测试。每个实例只查询自身根节点，支持一页多个实例及导航后重新进入。避免重复事件绑定。

```ts
interface SensorDimensions {
  widthMm: number;
  heightMm: number;
}
type CalculationResult<T> =
  { ok: true; value: T } | { ok: false; field: string; code: string };

declare function calculateCropFactor(
  reference: SensorDimensions,
  target: SensorDimensions,
): CalculationResult<{ diagonalFactor: number }>;

declare function calculateEquivalentFocalLength(
  focalLengthMm: number,
  diagonalFactor: number,
): CalculationResult<{ equivalentMm: number }>;

declare function calculateAngleOfView(
  sensorDimensionMm: number,
  focalLengthMm: number,
): CalculationResult<{ degrees: number }>;

interface ExposureSettings {
  fNumber: number;
  shutterSeconds: number;
  iso: number;
}

declare function compareExposureStops(
  before: ExposureSettings,
  after: ExposureSettings,
): CalculationResult<{
  sensorExposureRatio: number;
  sensorExposureStops: number;
  nominalIsoMappingStops: number;
  nominalOutputStops: number;
}>;
```

上述签名是接口提案，正式实现须给出完整 TypeScript 函数体和返回类型。

### 8.1 画幅、等效焦距与视角

对角线为 `d = sqrt(width² + height²)`；画幅系数为 `c = d_reference / d_target`；等效焦距为 `f_equivalent = f_actual × c`。物理焦距不因此改变。预设同时显示真实尺寸计算值与日常近似值：例如采用约 1.5 的 APS-C 系数时，16 mm 约对应 24 mm；具体机身则使用核实尺寸，结果可能稍有差异。

直线投影模型的单方向视角为 `angle = 2 × atan(sensorDimension / (2 × focalLength))`，将弧度转为度数。分别计算水平、垂直和对角视角，不把对角 crop 当作所有方向都严格等效，尤其在比较 3:2 与 4:3 长宽比时。可选远距离取景宽度近似为 `W ≈ distance × sensorWidth / focalLength`，所有长度先统一单位。

假设为理想无畸变直线投影、镜头焦距定义与远距离近似；近摄、呼吸效应、畸变校正和真实镜头成像不由此完整模拟。固定位置才能比较同一透视；改变拍摄距离必须在图中明确表现。SVG 中几何轮廓按毫米比例生成并标出尺寸，概念插画明确标注“示意”，不伪装成真实样片。

### 8.2 曝光档位与 ISO

固定场景亮度、透光率和其他光学条件，单位面积光曝光相对值为：

```text
H_after / H_before = (t_after / t_before) × (N_before / N_after)²
sensorExposureStops = log₂(H_after / H_before)
nominalIsoMappingStops = log₂(ISO_after / ISO_before)
nominalOutputStops = sensorExposureStops + nominalIsoMappingStops
```

正档位表示增加。F2.8 到 F4 约为减少一档，实际 `2 × log₂(2.8 / 4)` 不恰好等于 −1，因为常用刻度经过取整；快门时间加倍增加一档。快门秒数先解析为正有限数字，`1/125` 作为受限分数输入解析，禁止执行任意表达式。

ISO 部分描述相同处理假设下的名义输出映射，不表示捕获更多光子，不预测真实 JPEG 像素亮度、噪声、高光剪切或各相机增益电路。在光圈和快门不变时，仅改变 ISO 的单位面积光曝光结果必须保持不变。

首版曝光工具不估算真实光子数。如后续增加总进光量比较，须额外明确传感器面积、场景辐亮度、透光率、量子效率、曝光时间和比较构图；只能给出条件明确的相对量，不能从 ISO 直接推出总光子数。

### 8.3 非法输入、无障碍与测试

所有输入先验证类型、`Number.isFinite`、严格正值、工具设定范围以及单位。焦距、尺寸、F-number、快门和 ISO 不接受零或负数；中间运算溢出必须报告错误。空输入、NaN、Infinity、无法解析的分数、分母为零或越界值均返回字段错误，不用 0、Infinity 或上一次结果冒充当前有效结果。范围由工具能力定义并在 UI 显示，不声称超出范围的设备不存在。

滑块和数字输入同步，保留直接输入与键盘操作；错误通过可见文本、字段关联及合理的实时区域告知。SVG 具备说明，关键结果同时有普通文字，不能仅靠颜色区分。减少动态效果偏好下停止装饰动画，保留结果即时更新。

单元测试至少覆盖：相同尺寸 crop=1、代表性 APS-C 16 mm≈24 mm、实际尺寸和近似值区别、长宽比不同的水平/垂直视角、F2.8→F4 近似 −1 stop、快门加倍 +1 stop、仅 ISO 加倍时光曝光不变而名义输出 +1 stop、单位换算、非法与边界输入。界面检查覆盖中英错误、移动触控、键盘及页面导航后重新进入。

## 9. 两步实施边界与验收

**第一步：内容与路径基础。** 本次先交付 Phase 0 审查及 Phase 1 文档，不实现以上提案。进入首轮编码后，先保存现有基线，统一包管理和检查入口，再完成 `/learn/` 迁移、路径 helper、Article schema、草稿生产过滤、语言登记表及引用校验。同步修正首页链接、侧栏、SEO 和 smoke，不把“内容仍待审查”改成“已审核”。验收包括类型检查、构建、格式、全部旧新路由策略、内部链接、两种部署 base 和关键双语页面。

**第二步：可验收功能切片。** 实现纯计算模块与两个真正可用的工具，增加双语 Tools 索引并连接相关教程，完成上述公式与边界测试，检查 390 px 手机、桌面、键盘、语言对应与 Pagefind 的实际中英查询。随后分批加入术语、X-T5、XF16–50mm、核实的资源与样片链接，以及十篇完整双语教程。每一批都应拥有内容、功能和验收证据，未完成栏目继续不公开。

景深估算、相机设置探索、本地 EXIF、自有作品画廊与视频知识留至后续阶段。它们需要各自独立的科学模型、手册核查或隐私设计，不作为首轮基础迁移的依赖。公开仓库、正式部署、许可证重大变更及真实作品许可仍由维护者决定。
