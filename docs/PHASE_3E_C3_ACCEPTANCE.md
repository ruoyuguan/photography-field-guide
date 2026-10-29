# Phase 3E · C3 验收记录

日期：2026-10-29（Asia/Shanghai）。

## 1. 范围与保留事项

本轮交付 C3“一次城市散步＋三张照片讲一个地方”的中英完整版本。开发在 `/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/photography-field-guide-sync` 中进行。

同步前复核原项目 `main` 分支、HEAD `29983b37a111074bf7b045c3110b4f7dfb789ae2`、相对 `origin/main` 领先 5 个提交及已有工作区状态。原 `stash@{0}: On main: pre-sync Kimi Phase 3B 2026-10-28` 保持存在。本轮不提交、不推送、不部署，也不验证远端 CI 或生产地址。

## 2. 实际代码变更

新增：

- 两份 `learn/field-practice/neighborhood-story.mdx` 中英教程；
- 两个 `practice/neighborhood-story.astro` 中英任务页面；
- `NeighborhoodStoryModel.astro` 原创三格模型；
- `missions/neighborhood-story.ts` 双语任务数据；
- `browser-story-checks.mjs` 完整 C3 浏览器回归。

修改：

- `src/data_files/practice.ts`：登记 C3，增加 `story` 类型与可选本地化观察标题，通用观察清单不再指定两张照片；
- `PracticeMission.astro`：增加三格模型分支，不改变 C1／C2 交互；
- `missions/subject-background.ts`：C2 的下一任务指向 C3，任务版本仍为 1；
- 中英 Learn 导览及 C2 教程：加入实际存在的 C3 入口；
- `smoke.mjs`、`check-build.mjs`、`browser-check.mjs`：纳入 C3 路由、搜索、内容与浏览器检查；
- `browser-framing-checks.mjs`：更新 C2 已有下一任务及 C3 索引状态；
- `tests/practice/progress.test.ts`：新增 C3 独立恢复与重置测试。

沿用存储键 `photography-field-guide:practice:v1`。C3 为版本 1，不需要迁移；没有增加照片、EXIF、位置或自由文本字段。

## 3. 运行环境与自动检查

Node：`v24.22.1`。pnpm：`10.34.9`，通过 `npm exec --yes --package=pnpm@10.34.9 -- pnpm …` 调用。

| 检查                                                                  | 结果                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm format:check`                                                   | 通过                                                                       |
| `pnpm test:unit`                                                      | 29／29 通过，包含 C1／C2 回归和 C3 独立进度                                |
| `pnpm build`（根路径）                                                | 通过；40 份 Learn 文档、52 条结构化记录、72 个 HTML 页面                   |
| `pnpm test:smoke`（根路径）                                           | 72 页及 8 个缺失／退役路由通过                                             |
| `pnpm test:build`（根路径）                                           | 内部链接、资源、SEO、manifest、robots、sitemap、搜索产物及可见文本检查通过 |
| `PFG_SCREENSHOT_DIR=docs/audit-evidence/c3-browser pnpm test:browser` | 完整通过，无未预期页面异常                                                 |
| `SITE_BASE=/photography-field-guide pnpm build`                       | 通过；72 个 HTML 页面                                                      |
| `SITE_BASE=/photography-field-guide pnpm test:smoke`                  | 72 页及 8 个缺失／退役路由通过                                             |
| `SITE_BASE=/photography-field-guide pnpm test:build`                  | 通过                                                                       |
| 恢复根路径 `pnpm build`                                               | 通过；默认 `dist/` 为根路径版本                                            |

每次构建的类型检查结果为 0 errors、0 warnings，保留 5 个既有模板 hints，没有重写无关模板模块。

首次产物检查发现 6 条错误：中英 C3 教程各有三个构图链接多退了一级目录。已将 `../composition/…` 修为 `../../composition/…`，重新执行构建、根路径检查、完整浏览器检查与子路径检查，全部通过。此问题没有被计为提前通过。

## 4. 浏览器与内容验收

在最新静态构建上实际检查：

- 英文搜索 `three photos` 找到英文 C3 教程，中文搜索 `三张照片` 找到中文教程；
- 1366×768 下任务目标与第一个预测操作可见；没有下一任务空链接或页面级横向溢出；
- 空预测提示、错误解释、重试、正确答案、提示与答案揭示；答错或查看答案不冒充已掌握；
- C3 不渲染方向滑块或 C2 双图，环境／主体／细节三格始终同时存在；三个实拍步骤、三个自评项和完成状态可保存；
- 刷新恢复进度，深路由语言切换共享进度；取消重置保留状态，确认重置 C3 后 C1＋C2 仍已完成，索引状态同步；
- 禁用 localStorage 后，当前页面内存中的 C3 仍可答题和完成；禁用 JavaScript 后，双语答案、自评说明和三格模型仍可阅读；
- 390×844 触控操作及附近反馈，200% 等效 CSS 视口下的答案焦点和布局；C1、C2、计算器、目录与其他既有浏览器检查一并回归。

截图保存在 `docs/audit-evidence/c3-browser/`。最终 C3 截图包括英文／中文桌面教程、英文桌面任务、中文手机教程、中文手机任务与反馈，以及 200% 等效视口；同目录也保留 C1／C2 回归截图。已先检查文件大小，再读取英文／中文桌面教程、英文桌面任务、中文手机教程与反馈、200% 视口截图进行视觉复核；未发现三格模型或页面的横向裁切。

## 5. 来源与内容边界

2026-10-29 实际打开并阅读：

- Digital Photography School：How to Tell Better Visual Stories with Travel Photography 的“Establishing shot”“The detail shot”“Putting it all together”；
- iPhotography：Photo Stories 的“How to Collage Photos Together”及 FAQ；
- Digital Photography School：How to Shoot Sequence Photos to Capture a Story 的场景、主体和细节示例。

它们支持环境／细节的信息作用、互补序列及筛选排序方式。正文把三者定义为信息角色，而非必须用广角／中焦／微距的规则，也没有把一种排列包装为客观审美答案。

没有复制、下载或热链来源照片，没有虚构实拍经历或样片 EXIF。`https://photographylife.com/photo-series-tips` 曾返回 403，未作为已核查来源引用；没有因此批量刷新其他资源的核查日期。

## 6. 未执行项与限制

- 未做真实读者测试、完整屏幕阅读器验收或全面 WCAG 2.2 AA 审核；自动检查与截图走查不等于这些审查。
- 三格插画不是实拍样片或精确透视模拟；自评不判断照片的艺术质量。
- 没有上传或自动分析照片，没有完成后续“筛选与复盘”独立任务。
- 未公开仓库、发布网站或检查远端 CI。
- 200% 等效视口截图中的吸顶导航覆盖部分上方内容属于现有页面行为，本轮未宣称解决所有缩放或导航问题。
- 测试脚本清理其启动的预览与 Chrome；没有为验收保留常驻开发服务器。

## 7. 白名单同步与原目录复测

白名单脚本比较了开发副本中的 448 个文件，没有发现未审阅差异。首轮同步仅复制审查清单中的 46 个文件到 `/Users/ruoyu/photography-field-guide`，并逐文件进行 SHA-256 核验；没有覆盖白名单之外的差异。

以下结果来自正式目录的独立执行，不沿用开发副本的测试结果：

| 检查                                                                  | 结果                                                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm format:check`                                                   | 通过                                                                |
| `pnpm test:unit`                                                      | 29／29 通过                                                         |
| 根路径 `build`、`test:smoke`、`test:build`                            | 通过；40 份 Learn 文档、52 条结构化记录、72 页及 8 个缺失／退役路由 |
| `PFG_SCREENSHOT_DIR=docs/audit-evidence/c3-browser pnpm test:browser` | 完整真实 Chrome 检查通过，无未预期页面异常                          |
| `/photography-field-guide` 子路径 `build`、`test:smoke`、`test:build` | 通过；72 页及 8 个缺失／退役路由                                    |
| 恢复根路径 `pnpm build`                                               | 通过；默认 `dist/` 为根路径版本                                     |

三次构建的类型检查均为 0 errors、0 warnings、5 个既有 hints。复测后再次确认原项目仍为 `main`，HEAD 仍为 `29983b37a111074bf7b045c3110b4f7dfb789ae2`，相对 `origin/main` 领先 5 个提交，原 stash 保留。没有提交、推送、部署或清理已有未提交工作。
