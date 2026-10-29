# Phase 3D · C2 验收记录

日期：2026-10-29（Asia/Shanghai）。

## 1. 范围与保留事项

本轮交付 C2“主体与背景＋整理画面”的中英完整版本。开发在 `/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/photography-field-guide-sync` 中进行。同步前重新核对原项目 `main` 分支、HEAD `29983b3`、相对 `origin/main` 领先 5 个提交及已有工作区状态；按白名单同步，不重置或覆盖无关修改。

C3 尚未实现，`/practice/neighborhood-story/` 及中文对应路由继续返回 404，Practice 不显示空入口。本轮不提交、不推送、不部署，也不验证远端 CI 或生产地址。

## 2. 实际代码变更

新增：

- `src/content/docs/learn/composition/subject-and-background.mdx`
- `src/content/docs/zh-cn/learn/composition/subject-and-background.mdx`
- `src/pages/practice/subject-background.astro`
- `src/pages/zh-cn/practice/subject-background.astro`
- `src/components/practice/FramingModel.astro`
- `src/data_files/missions/subject-background.ts`
- `scripts/browser-framing-checks.mjs`

修改：

- `src/data_files/practice.ts`：登记 C2，并使 C1 的下一任务指向 C2。
- `src/components/practice/PracticeMission.astro`：支持双图观察模型。
- `src/components/practice/practice-controller.ts`：方向控制器不存在时仍可初始化构图任务。
- `src/views/PracticeIndexView.astro`：从任务数据生成真实入口。
- 两种语言的 Learn 导览和 `understanding-light.mdx`：加入有效的 C2 入口。
- `scripts/smoke.mjs`、`scripts/check-build.mjs`、`scripts/browser-check.mjs`：纳入 C2 路由、内容、搜索和浏览器回归。
- `tests/practice/progress.test.ts`：新增 C2 进度校验、恢复及独立重置测试。

未修改 C1 的任务版本，仍使用既有存储键 `photography-field-guide:practice:v1`。C2 为版本 1，不需要数据迁移。

## 3. 运行环境与自动检查

Node：`v24.22.1`。pnpm：`10.34.9`，通过 `npm exec --yes --package=pnpm@10.34.9 -- pnpm …` 调用。

| 检查                                                                  | 结果                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm build`（根路径）                                                | 通过；38 份 Learn 文档、52 条结构化记录、68 个 HTML 页面                   |
| `pnpm format:check`                                                   | 通过                                                                       |
| `pnpm test:unit`                                                      | 28／28 通过；含 C1 回归和 C2 独立进度                                      |
| `pnpm test:smoke`（根路径）                                           | 68 页及 10 个缺失／退役路由通过                                            |
| `pnpm test:build`（根路径）                                           | 内部链接、资源、SEO、manifest、robots、sitemap、搜索产物及可见文本检查通过 |
| `PFG_SCREENSHOT_DIR=docs/audit-evidence/c2-browser pnpm test:browser` | 完整通过，无未预期页面异常                                                 |
| `SITE_BASE=/photography-field-guide pnpm build`                       | 通过；68 个 HTML 页面                                                      |
| `SITE_BASE=/photography-field-guide pnpm test:smoke`                  | 68 页及 10 个缺失／退役路由通过                                            |
| `SITE_BASE=/photography-field-guide pnpm test:build`                  | 通过                                                                       |
| 恢复根路径后的 `build`、`test:smoke`、`test:build`                    | 通过；默认 `dist/` 为根路径版本                                            |

每次构建的类型检查结果为 0 errors、0 warnings，保留 5 个既有模板 hints，没有重写无关模板模块。

缩短英文 SVG 说明后，浏览器测试中检查旧句子的断言按新文案更新并完整重跑。该失败是测试期望与修订文案不同，不是页面布局或任务逻辑错误；最终以完整通过的运行及截图复核为准。

## 4. 浏览器与内容验收

在最新静态构建上实际检查：

- 英文搜索 `negative space` 找到英文 C2 教程，中文搜索 `留白` 找到中文教程。
- 1366×768 下任务目标与第一个预测操作可见；没有下一任务空链接或页面级横向溢出。
- 空预测提示、错误解释、重试、正确答案、提示和答案揭示；答错或查看答案不冒充已掌握。
- 构图分支不渲染方向滑块，两个概念画面始终同时存在；三个观察步骤、三个自评项和完成状态可保存。
- 刷新恢复进度，深路由语言切换共享进度；重置 C2 保留已完成的 C1，索引状态同步。
- 禁用 localStorage 后，当前页面内存中的 C2 任务仍可完成；禁用 JavaScript 后，教程、双图、答案、自评说明和导航仍可阅读。
- 390×844 触控操作及附近反馈，200% 等效 CSS 视口下的答案焦点和布局；C1、计算器、目录和其他既有浏览器检查一并回归。
- 中文正文不显示意外的 Markdown 粗体星号；英文教程 SVG 底部说明经缩短后不再裁切。

截图保存在 `docs/audit-evidence/c2-browser/`。最终 C2 截图包括英文／中文桌面教程、英文桌面任务、中文手机教程、中文手机任务与反馈，以及 200% 等效视口；同目录也保留 C1 回归截图。

## 5. 来源核查

2026-10-29 实际打开并阅读以下页面的相关正文：

- Photography Life：How to Eliminate Background Distractions in Photographs，核对“Use Clean and Neutral Backgrounds”和“Use the Background to Tell a Story”。
- Photography Life：Negative Space in Photography，核对“What is Negative Space?”及留白效果章节。

这些来源支持机位与背景关系、保留环境的表达价值，以及留白的定义和作用。它们不支持把某种构图当作普适审美分数；正文已明确这一边界。没有复制、下载或热链来源照片。

## 6. 未执行项与限制

- 未做真实读者测试、完整屏幕阅读器验收或全面 WCAG 2.2 AA 审核；自动化与截图走查不等于这些审查。
- 概念图不是精确透视模拟，真实手持对照只近似控制变量；没有把图解或自评包装为照片质量评分。
- 未实现 C3，未公开仓库、发布网站或检查远端 CI。
- 200% 视口截图中吸顶导航覆盖部分上方内容属于现有页面行为；本轮未宣称解决所有缩放或导航问题。
- 测试脚本清理其启动的预览与 Chrome；没有把开发服务器作为常驻进程保留。
