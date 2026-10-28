# Photography Field Guide — Phase 0 / 1 审查与架构报告

审查日期：2026-10-28（Asia/Shanghai）。

**结论：继续使用现有 ScrewFast / Astro / Starlight 底座，先修复 URL 与文档国际化，再建立内容契约和两个独立工具。现有定制值得保留；当前内容仍处于初稿阶段。**

本轮完成仓库审查、隔离构建验证及 Phase 1 设计文档。下述新路由、数据集合、校验器与计算工具均为后续实施方案，不代表已实现。原网站源码未修改，也没有提交、推送、正式部署或改变仓库可见性。

## A. Repository Audit

### 实际目录与 Git 基线

| 项目              | 本轮核实结果                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| 当前项目目录      | `/Users/ruoyu/photography-field-guide`；原工作已完整迁移至此，本文中的问题描述是迁移前审查快照      |
| 审查时源码目录    | `/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/photography-field-guide`，已迁移    |
| 设计文档          | 现已纳入当前项目的 `docs/`；各阶段实现状态以代码验收为准                                            |
| 审查时分支与 HEAD | `main`，`5f63be6`，历史仅有 `Initial commit`                                                        |
| remote            | SSH origin 指向 `ruoyuguan/photography-field-guide`；没有 upstream                                  |
| 未提交工作        | 76 个已跟踪文件有修改／删除，diff 统计 +599 / −3375；另有未跟踪的双语教程、中文页面、文案与品牌素材 |
| 上游版本          | 可确认来自 ScrewFast 模板结构；本地没有可追溯的上游 tag/commit，不能给出精确 ScrewFast 发行版本     |
| 远端状态          | 未 fetch，未读取远端 CI 或仓库设置；本地跟踪引用不能证明与 GitHub 实时同步                          |

这些未提交文件构成当前开发基线。重新克隆 origin 不能恢复其中的本地定制，后续不可用重新初始化、reset 或模板覆盖替代迁移。

已读 README、AI_GUIDE、CONTEXT、package/lockfile、Astro/Starlight/TypeScript 配置、CI、LICENSE、路由、文案、内容集合及检查脚本。也查阅了 [ScrewFast 上游 AI_GUIDE](https://github.com/mearashadowfax/ScrewFast/blob/main/AI_GUIDE.md)；本地已改写的指导文件与实际代码优先决定实现方式。

### 真实技术栈与现有页面

| 依赖         | manifest、lockfile 与已安装版本 |
| ------------ | ------------------------------- |
| Astro        | 7.4.2                           |
| Starlight    | 0.42.6                          |
| Tailwind CSS | 4.3.3                           |
| TypeScript   | 6.0.3                           |
| MDX          | 8.1.1                           |
| Preline      | 5.0.0                           |

静态构建，无数据库、认证或后端。`build` 已串联 `astro check`、`astro build` 与 HTML 后处理；CI 已有 frozen install、格式、构建、smoke 检查。

实际页面是英文／中文首页与 404，以及四组双语文档：`start-here` 导览、`basics/sensor-formats`、`basics/equivalent-focal-length`、`basics/exposure-triangle`。共 12 份 HTML；导览加三篇概念稿不能计作十篇完整核心教程。目前没有 `/learn/`、术语库、器材库、资源目录、画廊索引或交互工具。

### 主要发现与优先级

| 优先级 | 发现、证据与影响                                                                                                                                                                                         | 最小处理                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 高     | `astro.config.mjs:8` 把项目子路径放入 `site`，未设置 `base`。本次新构建首页 canonical 含 `/photography-field-guide`，Starlight 文档 canonical/hreflang 与 sitemap 却位于域名根路径。                     | 独立配置 origin/base，统一页面、资源与 SEO 路径；验证根路径及项目子路径。    |
| 高     | `Meta.astro:24,75–77` 的 OG 图、manifest、sitemap、favicon，以及 `robots.txt.ts:20` 的 sitemap 指向域根；加一行 base 无法自动修复这些硬编码。                                                            | 集中 URL helper，覆盖所有输出入口，防止双重 base。                           |
| 中     | 中文文档的页头品牌和 GUIDES 入口实际指向英文 `/` 与 `/start-here/`。`SiteTitle.astro:2` 依赖 `Astro.props.locale`，与当前 Starlight 路由数据接口不匹配。                                                 | 使用当前版本的 `Astro.locals.starlightRoute`，再经过统一路径函数生成链接。   |
| 中     | 中文侧栏仍出现 Getting Started、Photography Basics、Start Here。配置中的 translations 使用 `zh-cn`，当前 locale 的 lang 为 `zh-CN`；实际渲染证明翻译未命中。中文搜索也有 Clear、results for 等英文文案。 | 对齐语言查找键，修正搜索文案并做实际界面回归。                               |
| 中     | 当前 shell 的 Node 20.17.0 不满足已安装 Astro 的 `>=22.23.4`。README 只写 Node 22+；README pnpm 10、CI pnpm 9，安装记录则是 pnpm 10.34.9。                                                               | 固定并对齐 Node 与包管理器；保持当前依赖版本。                               |
| 中     | `locale.ts:123` 无条件拼接译文路径；当前页面成对不代表未来缺译安全。                                                                                                                                     | 从真实已发布内容生成语言登记表，hreflang 只输出存在的对应版本。              |
| 中     | `content.config.ts:106` 仅有 docs 和模板 products/blog/insights；缺文章审核、来源、先修、术语、器材、资源与画廊契约。                                                                                    | 扩展 Starlight schema，新增小型结构化集合及跨引用校验。                      |
| 中     | 三篇基础稿各约几十行，缺来源、审核时间、完整练习与分层讲解；已有 ISO 与物理焦距的核心口径正确。                                                                                                          | 审阅、迁移并逐篇扩写，保持正确说明，不批量填入虚构审核日期。                 |
| 中     | `HomeView.astro:69–85` 全幅框为 394×246，APS-C 框为 262×175，未用同一物理比例绘制；旁边又标注 3:2。                                                                                                      | 按明确的传感器宽高统一缩放，区分概念插画和定量几何图。                       |
| 低     | 根 404 产物为 `404.html`，语言菜单却生成 `/404/`。212 次本地锚链接检查中有两处指向该无对应静态文件的路径。现有 smoke 对 `/404` 做特殊映射，未捕获此问题。                                                | 对 404 使用明确路由、状态和语言策略，检查未知 URL，而不只直接打开 404 模板。 |
| 低     | 源码仍有法语商业集合、价格、认证、假表单和客户评价；公开路由已移除，不能说它们仍显示在现有页面。                                                                                                         | 先追踪依赖再清理；避免把旧模块重新引入新页面。                               |
| 低     | `process-html.mjs:6` 优先处理 `.vercel/output/static`，若有残留可能选错产物；构建另有 5 个提示。                                                                                                         | 让后处理明确使用本次输出；逐步处理未用变量和旧 Props 接口。                  |

GitHub 项目站应将域名与 `base` 分开配置，并同步处理内部链接；此修复方向与 [Astro 官方 GitHub Pages 部署说明](https://docs.astro.build/en/guides/deploy/github/) 一致。部署平台仍待维护者决定。

### 本轮独立验证

为了保护原 checkout，复制其当前内容和依赖到 `/private/tmp/pfg-audit-20261028.1sIoJU`，在隔离副本中运行。使用 bundled Node **24.22.1**；没有安装或升级项目依赖。

| 检查                   | 结果                                                                                             | 证据与限制                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Astro 类型检查         | 0 errors、0 warnings、5 hints                                                                    | [build.log](audit-evidence/build.log)；115 个文件                                                            |
| 静态构建与 HTML 后处理 | 成功，12 页                                                                                      | 与 package build 脚本相同的底层命令                                                                          |
| Prettier               | 通过                                                                                             | [format.log](audit-evidence/format.log)                                                                      |
| 现有 smoke             | 12 项通过                                                                                        | [smoke.log](audit-evidence/smoke.log)；只证明现有脚本覆盖的行为                                              |
| 静态内部锚链接         | 212 次检查，2 处 404 路径问题                                                                    | [static-inspection.json](audit-evidence/static-inspection.json)；不代表部署 URL 或所有资源均正确             |
| Pagefind 引擎查询      | `focal length` 4 条、`ISO` 3 条、`等效焦距` 4 条、`传感器` 1 条；结果语言和本地目标正确          | [英文](audit-evidence/search-en.json)、[中文](audit-evidence/search-zh-cn.json)；Node 适配器直接查询生成索引 |
| 实际搜索界面           | 英文 `focal length`、中文 `等效焦距` 各 4 条，点击结果到正确教程                                 | 浏览器真实操作；中文文案未完整本地化                                                                         |
| 文档语言切换           | 英文传感器教程切到对应中文教程                                                                   | 主语言选择器正确；页头回站链接另有上述问题                                                                   |
| 移动布局抽查           | 请求 390×844 视口；中英首页 scrollWidth/clientWidth 为 390/390，英文和中文等效焦距教程为 375/375 | 文档有垂直滚动条；四页未见页面级横向溢出，不等于全部页面或完整无障碍验收                                     |
| 桌面抽查               | 中文首页 1280px，未见页面级横向溢出                                                              | 仅代表该页面和视口                                                                                           |

实际执行的构建命令为 `node node_modules/astro/bin/astro.mjs check`、`node node_modules/astro/bin/astro.mjs build`、`node process-html.mjs`；格式与 smoke 也直接调用已安装 CLI／脚本。当前 bundled pnpm 11 尝试在复制依赖上自动安装，因无 TTY 中止，因此没有把这一点记作 `pnpm build` 或全新 frozen install 通过。正常依赖安装与远端 CI 仍待统一版本后验证。

搜索当前只索引四篇英文与四篇中文文档；首页及未来自定义目录不能假设自动纳入。默认能力来自 [Starlight 的 Pagefind 搜索集成](https://starlight.astro.build/guides/site-search/)，本次已补实际查询证据，但尚无跨语言同义词检索或全站搜索验收。

## B. Product Architecture

定位为“理解摄影的双语教育手册”，围绕学习问题组织，而不是产品销售或按发布时间排序的博客。英文默认，中文使用 `/zh-cn/`，两种语言保持相同内容 slug。

| 栏目        | 英文逻辑路径                                               | 中文逻辑路径            | 页面职责                               |
| ----------- | ---------------------------------------------------------- | ----------------------- | -------------------------------------- |
| Home        | `/`                                                        | `/zh-cn/`               | 项目介绍、两类读者入口、路线与精选内容 |
| Learn       | `/learn/` 与 `/learn/<category>/<slug>/`                   | 对应 `/zh-cn/learn/...` | 系统教学、目录、先修与延伸关系         |
| Glossary    | `/glossary/`                                               | `/zh-cn/glossary/`      | 双语名称、别名、解释、稳定术语锚点     |
| Tools       | `/tools/`、`/tools/crop-factor/`、`/tools/exposure-stops/` | 对应中文路径            | 解释参数关系的独立工具                 |
| Gear        | `/gear/`、`/gear/<id>/`                                    | 对应中文路径            | 真实规格、使用说明与教学链接           |
| Galleries   | `/galleries/`                                              | `/zh-cn/galleries/`     | 外部样片入口与范围筛选                 |
| Resources   | `/resources/`                                              | `/zh-cn/resources/`     | 按用途分类的可靠资料                   |
| About       | `/about/`                                                  | `/zh-cn/about/`         | 维护、编辑、来源、参与及版权           |
| Notes，后续 | `/notes/`                                                  | `/zh-cn/notes/`         | 有真实学习记录时启用                   |

这些是**逻辑路径**，与最终部署前缀分离。`/learn/` 迁移时同步处理首页、侧栏、正文、语言链接与 smoke；已被外部使用的旧链接需要兼容策略。

学习路线按 Getting Started → Sensor & Lens → Exposure → Image Quality → Composition → Field Practice → Workflow。文章的先修图表达实际依赖，不能将“必须读完整章”设为所有人的门槛。首十篇完整教程及后续主题见 [ROADMAP](ROADMAP.md)；用户的完整选题和设备背景已原样保存在 [PROJECT_BRIEF](PROJECT_BRIEF.md)。

首版器材只做 X-T5、XF16–50mm 与组合学习入口；导航在栏目有真实内容后才启用。Glossary 的检索同时匹配中英文名称、缩写和别名；Galleries 则按来源、设备范围、主题和经过核实的 EXIF／文件能力筛选。

## C. Technical Design

保留 Astro 静态渲染、TypeScript、Tailwind、MDX 与 Starlight。当前规模的两个工具使用**原生控件 + 局部 TypeScript + SVG**，已有栈足够，不需要为滑块引入 Svelte 或完整前端应用。

| 可复用部分                                    | 改造方式                                                        |
| --------------------------------------------- | --------------------------------------------------------------- |
| MainLayout、Navbar、Footer、copy、middleware  | 保留外壳与文案注入，改为教育栏目 ID，增加正确的 base 与语言路径 |
| Starlight 文档、侧栏、目录和搜索              | 文档移入 Learn，扩展元数据；修正当前覆盖组件和语言查找键        |
| locale.ts、metadata.ts、Meta.astro            | 保留集中入口，改为真实路由登记 + base-aware URL                 |
| Content Collections 与 Zod                    | 管理教程和少量结构化事实，不创建数据库或自制 CMS                |
| 深色模式、焦点样式、Lenis reduced-motion 分支 | 复用并回归检查；后续按实际使用裁剪全局脚本                      |
| build、format、smoke 与 CI                    | 对齐环境后补数据、链接、公式及真实交互验收                      |
| LICENSE                                       | 保留 Emil Gulamov 的 MIT 通知；不替换许可                       |

Starlight 的 root locale 可承载无 `/en/` 前缀的英文，其同名内容路径可关联译文；这个方向符合 [Starlight 官方国际化机制](https://starlight.astro.build/guides/i18n/)。自定义 Astro 页面另建真实内容登记表，避免把 Starlight 的回退机制误当作全站现成能力。

工具的纯计算模块不读取 DOM。画幅使用对角线比 `c = d_reference / d_target`，等效焦距为 `f × c`；视角为理想直线投影、远距离近似下的 `2 atan(dimension / 2f)`。不同宽高比必须区分水平、垂直与对角视角。

曝光工具分别输出 `H₂/H₁ = (t₂/t₁)(N₁/N₂)²` 和名义 ISO 映射增量；后者不能进入捕获光子数的计算。F2.8→F4 的光曝光变化约 −1.029 档，应测试为近似一档；快门加倍为 +1 档；仅 ISO 加倍时光曝光不变。模型的假设、边界、错误处理和签名见 [ARCHITECTURE](ARCHITECTURE.md)。

## D. Content Model

完整接口提案与构建期规则见 [ARCHITECTURE 第 4–6 节](ARCHITECTURE.md#4-article-schema-与草稿发布策略)。最小实体如下：

| 实体             | 稳定身份、事实与关系                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Article          | 跨语言 translationKey；路径推导 locale/URL；沿用 title/description/body；分类、难度、先修、术语/工具引用、来源、状态、lastReviewed |
| GlossaryTerm     | ID；中英名称、别名、定义、误区、例子；文章与相关术语引用                                                                           |
| Camera           | ID、品牌型号、卡口、真实传感器宽高、类型化规格、双语说明、官方资料与事实来源                                                       |
| Lens             | ID、卡口、图像圈类别、物理焦距范围、两端最大/最小光圈、OIS 状态、来源与相关教程                                                    |
| ExternalResource | ID、URL、提供者性质、类别、语言、双语用途、阶段、标签、核查证据和日期                                                              |
| GalleryLink      | 引用资源 ID；scope 为通用、相机、镜头或组合；设备引用、主题、版权、EXIF/原始文件三态与范围证据                                     |
| PracticeExercise | 初期随教程维护；出现复用需求后独立，记录目标、步骤、预期观察与反思问题                                                             |

关键约束是 ID 与语言版本唯一、引用存在、先修无环、公开内容不指向草稿、机身镜头匹配有据、已发布教程有来源及真实审核日期。正式实现从 schema 推导类型，避免维护两套重复定义。

Starlight 当前版本原生支持 `draft:true` 的生产路由过滤；编辑状态还必须与 draft 字段一致。自定义集合、目录、相关推荐、sitemap 与搜索另行过滤。仅添加 `status: draft` 枚举不会自动隐藏页面。

资源的官方身份、可达性、页面身份、范围证据和图片许可分别判断。HTTP 200 不是“内容与版权全部 verified”；机身画廊与镜头画廊也不能自动合并成该组合的样片。详细规则见 [RESOURCE_POLICY](RESOURCE_POLICY.md)。

## E. UI/UX Direction

沿用现有中性色、少量琥珀强调、深色模式与摄影品牌基础，逐步形成清楚、克制的知识手册风格。无需因为审美重新制作整个模板。

首页首屏回答网站用途与起点，提供“从零学习”和“已有相机”两条路线；之后是短学习地图、核心问题、已可用工具、器材案例和资源。每一个入口只指向真实内容。

教程保持稳定阅读宽度、清晰目录和连续的学习关系。十段教学结构配合 Beginner / Deeper Understanding / Technical Notes；公式定义符号和单位，技术推导可选阅读。细则见 [CONTENT_GUIDELINES](CONTENT_GUIDELINES.md)。

工具采用“输入 → 标注图 → 文本结果 → 条件解释 → 相关教程”的顺序。滑块有数字输入替代、键盘操作、可见焦点和字段级错误；SVG 不只靠颜色表达。没有脚本时保留有价值的静态解释。几何图标明模型条件，概念插图不冒充实拍效果模拟。

WCAG 2.2 AA 是设计目标。本轮抽查没有页面级横向溢出，但尚未执行完整对比度、读屏、200% 缩放、平板与全路径键盘审计，不宣称全面达标。

## F. Implementation Roadmap

| 阶段              | 可验收交付                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Phase 0 / 1，本轮 | 审查、独立运行证据、愿景、架构与模型、内容规范、资源政策、分批路线                                               |
| Phase 2A          | 对齐环境；修复 URL/SEO、文档语言入口与标签、404、定量图；迁移 Learn；引入文章契约和内容引用校验                  |
| Phase 2B          | 完成画幅/等效焦距与曝光档位两个双语工具、Tools 索引、科学计算/非法输入测试、键盘与手机验收                       |
| Phase 2C          | 全部必需栏目、10 篇完整双语教程、X-T5 和 XF16–50mm 完整资料页与组合入口、逐项核实的资源/样片、明确范围的可靠搜索 |
| Phase 3           | 扩充实践、构图、术语、练习与持续审查机制                                                                         |
| Phase 4           | 按需开发景深估算、相机设置、本地 EXIF、自有画廊等                                                                |

每批同时交付功能、内容和证据，类型/格式/构建/smoke/引用/内部链接均过关才扩大范围。涉及计算时加有意义的公式测试；涉及界面时验证实际交互和移动端。不用文件数量代替教学质量。详细退出门槛见 [ROADMAP](ROADMAP.md)。

## G. Risks and Open Questions

**能通过检查解决的工程问题已有明确方向**：栈无需更换、局部 TypeScript 足够、默认语言与路径沿用用户要求、来源与翻译需要结构化记录。这些不需用户逐项决定。

仍需后续核实或人工决定的事项是：

1. **工作目录的长期归属。** 实际代码位于 Kimi 任务目录，本轮文档在当前 Codex 工作区。后续若迁入当前目录，必须完整保留 Git 历史、未提交及未跟踪内容，再核对指纹；不从 origin 重新开始。
2. **部署域名与平台。** 先验证根路径/子路径两种构建；正式绑定、部署与仓库公开仍由用户决定。本轮没有检查 GitHub 当前可见性、远端 CI 或 ruleset 执行状态。
3. **内容与作品许可。** 保留模板 MIT；原创文章与真实照片的授权范围尚未决定，不推定照片使用代码许可。
4. **外链与器材行为。** 本轮阅读了官方 X-T5 与镜头规格页，确认关键种子事实；用户给出的整套资源、样片、固件和菜单行为尚未逐项核实，不能批量标 verified。
5. **数值定义。** 使用 X-T5 官方标称 23.5×15.7mm 与 36×24mm 计算，对角系数约 1.5309，16mm 得约 24.49mm；日常 1.5× 则为约 24mm。厂商镜头标注另为 24–76mm，应并列说明，保留“标称尺寸模型”“日常近似”“厂商标注”的区别。依据为 [X-T5 官方规格](https://www.fujifilm-x.com/global/products/cameras/x-t5/specifications/) 与 [镜头官方规格](https://www.fujifilm-x.com/global/products/lenses/xf16-50mmf28-48-r-lm-wr/specifications/)，计算由尺寸推导，并非厂商承诺的精确视角。
6. **验证范围。** 全新依赖安装、远端 CI、模拟 base 产物、真实托管 404、全站搜索与完整无障碍尚未通过验收；不能用本次 12 页 smoke 替代。

## H. Proposed First Implementation

建议第一批代码只完成 **Phase 2A 的基础修复**；工具放入随后独立切片。文件路径均相对于实际网站仓库。

| 文件                                                                     | 第一批最小修改                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `package.json`、README、两个 CI workflow；可选 `.node-version`           | 固定 Node 与 pnpm，建议以当前已安装 pnpm 10.34.9 为统一起点，不全面升级依赖 |
| `astro.config.mjs`、`constants.ts`、`locale.ts`、`metadata.ts`           | 分离 origin/base，统一路径与尾斜杠，生成真实译文对应关系                    |
| `Meta.astro`、`robots.txt.ts`、`manifest.json.ts`、404 与 LanguagePicker | 修复社交图、资源与 sitemap，明确 404 的语言路径及 noindex 策略              |
| `components/ui/starlight/SiteTitle.astro` 与相关覆盖组件                 | 使用当前路由数据接口，修复中文回站链接、侧栏/搜索/无障碍标签                |
| `HomeView.astro`、copy 与导航数据                                        | 修正画幅图尺寸比例，改用教育栏目 ID，并逐步采用已确定的项目副标题           |
| `content/docs/learn/` 与 `content/docs/zh-cn/learn/`                     | 迁移现有四组文档，更新全部引用和侧栏；不借迁移生成十篇空稿                  |
| `content.config.ts`、拟增 `scripts/validate-content.mjs`                 | 扩展 Article schema，验证状态、来源、双语配对和引用；为其他集合逐步准备契约 |
| `scripts/smoke.mjs` 及拟增路径验收脚本                                   | 覆盖真实语言落点、SEO、资源、内部链接、未知路由与两种 base 模式             |

第一批退出标准：现有中英内容继续可访问，文档内导航不意外切到英文，部署路径规则一致，定量图有明确几何依据，类型/格式/构建/路由及引用检查通过，新增未完成栏目不出现在公开导航。

随后才新增 `src/utils/photography/`、`src/components/tools/`、双语 Tools 页面及公式测试，分别验收两个工具。当前没有执行这批网站代码修改；本轮实际写入的是上述设计与审查文档、原始需求存档及验证证据。
