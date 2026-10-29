# Phase 3C · C0／C1 验收记录

日期：2026-10-29（Asia/Shanghai）。

## 1. 代码范围与版本

功能最初在隔离副本 `/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/photography-field-guide-c1` 中实现并验收。随后复制原仓库快照进行只读核对：原仓库位于 `main`，HEAD 为 `29983b37a111074bf7b045c3110b4f7dfb789ae2`，相对 `origin/main` 领先 5 个提交；有 33 个已跟踪文件修改、文档类未跟踪文件和一个已有 stash。逐文件比较确认，原快照与验收副本之间只有 C0／C1 差异。

合并结果在工作区同步副本复测后写回 `/Users/ruoyu/photography-field-guide`，保留原 Git 历史、未提交工作和 stash；未执行提交、推送或部署。

范围仅为 C0 与 C1。C2“主体与背景”和 C3“三张照片讲一个地方”未实现，对应路由保持 404，Practice 索引不展示空入口。

## 2. 交付内容

- C0：主导航收为 Learn、Practice、Tools、Explore；语言切换保留深路由；教程、Practice 索引和真实任务可以互相到达。
- C1：中英“看懂光线”教程，解释方向、软硬、反差，提供原创概念 SVG、控制变量实验和已记录来源。
- C1：中英“光线侦探”任务，包含预测、错误解释、重试、提示、答案、双灯位概念模型、真实拍摄清单、自评、完成标记、单任务重置与全部清除。
- 进度使用稳定任务／步骤 ID 与版本；跨语言共享。localStorage 不可用时保留本次访问的内存状态；无脚本时仍能阅读任务和答案。任务不上传照片或文字反思。
- 新增 9 项进度单元测试，总单测 27 项；扩展搜索、路由、产物和真实浏览器回归。
- 走查后增大手机观察标签的触控区域并补充焦点样式；修复中文教程可见 Markdown 粗体星号，新增去除 script／style 后的可见文本产物检查。

## 3. 运行环境与命令

Node：`v24.22.1`；pnpm：`10.34.9`，通过 `npm exec --yes --package=pnpm@10.34.9 -- pnpm …` 调用。

| 检查                                               | 结果                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `format:check`                                     | 通过；初次发现中文 MDX 格式问题，运行 Prettier 后复测通过                      |
| `build`（根路径）                                  | 通过；36 份 Learn 文档、52 条结构化记录、64 个 HTML 页面                       |
| `test:unit`                                        | 27／27 通过                                                                    |
| `test:smoke`（根路径）                             | 64 页及 12 个缺失／退役路由通过                                                |
| `test:build`（根路径）                             | 内部链接、资源、SEO、manifest、robots、sitemap、搜索产物及中文可见粗体检查通过 |
| `test:browser`                                     | 完整通过，无未预期页面异常                                                     |
| `SITE_BASE=/photography-field-guide … build`       | 通过；64 个 HTML 页面                                                          |
| `SITE_BASE=/photography-field-guide … test:smoke`  | 64 页及 12 个缺失／退役路由通过                                                |
| `SITE_BASE=/photography-field-guide … test:build`  | 通过                                                                           |
| 恢复根路径后的 `build`、`test:smoke`、`test:build` | 均通过；默认 `dist/` 为根路径版本                                              |

每次构建的类型检查结果为 0 errors、0 warnings，保留 5 个既有模板 hints：`InsightDetail.astro` 的未使用事件参数、`Navbar.astro` 的两处未使用变量、`PricingSection.astro` 的未使用接口、`Bookmark.astro` 的未使用属性。本轮未借故重写这些无关模板模块。

## 4. 真实浏览器与视觉走查

已在最新静态构建上检查：

- 中英文真实搜索及结果落点、深路由语言切换、教程和任务移动端布局。
- 首次任务进入、预测、错误反馈、重试、正确答案、提示、答案揭示、观察、自评、完成、刷新持久化。
- 键盘方向滑块、可访问读值、跨语言共享进度、单任务重置、全部清除且保留主题。
- 损坏／旧版本／伪造进度、存储被禁用后的内存任务、无脚本教程与任务、多实例隔离。
- 390×844 触控、1366×768 首屏动线，以及 200% 等效桌面视口下的焦点与布局。
- 中文教程截图复核：可见的 `**` 已消失；产物中该页也不再含此标记。

截图目录：`/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/phase-c1-screenshots/`。其中 `lesson-zh-desktop.png` 已在最终修复后重新生成并读取复核。

## 5. 来源核查

本轮重新打开 [Cambridge in Colour：Introduction to Portrait Lighting](https://www.cambridgeincolour.com/tutorials/portrait-lighting.htm)。相关章节支持：单一主光下方向改变阴影／高光位置，表观光源大小影响过渡，移近光源会同时改变软硬与照明。文章 frontmatter 记录具体章节、用途和 2026-10-29 访问日期；未批量刷新其他资源的 lastVerified。

## 6. 未执行项与限制

- 未做真实读者测试、完整 WCAG 2.2 AA 审核或全部教程逐句科学审稿；自动检查通过不等于这些审查完成。
- 未实现 C2／C3，未公开仓库，未发布网站，未验证远端 CI 或生产地址。
- 已同步回原项目，但未执行 Git 提交或推送；工作区中的 C0／C1 改动仍待用户审阅后单独提交。
- 临时测试预览和浏览器配置由测试脚本清理，不作为常驻服务；原项目已有预览不属于本轮清理对象。
