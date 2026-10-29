# Phase 3F · C4 验收记录

日期：2026-10-29（Asia/Shanghai）。

## 1. 范围与保留事项

本轮交付 C4“照片筛选与复盘”的中英完整教程与任务，形成“拍摄 → 比较 → 解释取舍 → 下一次改进”的学习闭环。开发在 `/Users/ruoyu/Documents/kimi/tasks/2026-10-28/13-30-24-c1663a01/photography-field-guide-sync` 中进行，正式项目为 `/Users/ruoyu/photography-field-guide`。

本轮开始时以 C3 白名单脚本只读比较 448 个文件，源目录与正式项目没有未审阅差异。正式项目原有分支、提交、未跟踪文件和 stash 均不属于本轮清理范围。不提交、不推送、不部署。

## 2. 实际代码与内容

- 新增两份 `learn/field-practice/photo-review.mdx` 中英教程、两份 `practice/photo-review.astro` 中英任务页面、原创六格概念模型和双语任务数据。
- 任务 ID 为 `photo-review`，编号 04，版本 1，约 20 分钟。包含一个预测、三个本地筛选／复盘步骤及三个自评项。
- 使用读者自己的约 9–24 张本地照片；C1–C3 是可选素材，不是强制先修。不上传照片，不保存文件名、EXIF、GPS、自由文本或审美评分。
- C3 的下一任务接入 C4；C4 教程链接回 C1–C3，支持重复学习循环，不生成空下一任务链接。
- 更新中英 Learn 导览、C3 教程、任务索引、路由与产物检查、进度单测及完整浏览器回归。
- 所有原片操作都在读者自己的照片查看器中完成。本站只提供流程和保存任务勾选，不提供删除、备份或自动筛选功能。

## 3. 运行环境与隔离副本自动检查

Node：`v24.22.1`。pnpm：`10.34.9`，通过 `npm exec --yes --package=pnpm@10.34.9 -- pnpm …` 调用。

| 检查                                                                 | 实际结果                                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm format:check`                                                  | 通过                                                                       |
| `pnpm test:unit`                                                     | 30／30 通过；包含 C4 三项操作、自评、刷新及独立重置                        |
| `pnpm build`（根路径）                                               | 通过；42 份 Learn 文档、52 条结构化记录、76 个 HTML 页面                   |
| `pnpm test:smoke`（根路径）                                          | 76 页及 8 个缺失／退役路由通过                                             |
| `pnpm test:build`（根路径）                                          | 内部链接、资源、SEO、manifest、robots、sitemap、搜索产物及中文可见文本通过 |
| `PFG_SCREENSHOT_DIR=<工作区>/phase-3f-screenshots pnpm test:browser` | 完整真实 Chrome 检查通过，无未预期页面异常                                 |
| `SITE_BASE=/photography-field-guide pnpm build`                      | 通过；42 份文档、52 条结构化记录、76 页                                    |
| 同子路径 `pnpm test:smoke`                                           | 76 页及 8 个缺失／退役路由通过                                             |
| 同子路径 `pnpm test:build`                                           | 通过                                                                       |
| 恢复根路径 `pnpm build`                                              | 通过；默认 `dist/` 已恢复根路径版本                                        |

类型检查为 0 errors、0 warnings、5 个既有模板 hints。本轮修掉了新模型中一个未使用 `prefix` 的 hint，没有重写无关模板模块。

## 4. 浏览器与视觉验收

在最新静态构建上实际检查：

- 英文搜索 `reversible selection` 和中文正文搜索 `照片筛选` 均能找到正确教程；教程与任务链接可往返。
- 1366×768 下目标与第一个预测操作可见；六格原创概念图分为环境、主体、细节三组，不混入 C1／C2 的交互模型。
- 空预测、错误解释、重试、正确反馈、提示、答案揭示、三项操作、三项自评、完成、刷新及深路由语言切换有效。
- C4 独立重置保留 C1–C3，索引状态正确；旧任务索引断言也纳入第四张任务卡。
- 禁用 localStorage 后可在内存中完成当前任务；禁用 JavaScript 后双语目标、步骤、答案和自评仍可阅读。
- 390×844 手机触控、邻近反馈、200% 等效 CSS 视口、焦点和页面横向溢出检查通过；C1–C3、计算器和目录一并回归。

截图保存在 `docs/audit-evidence/c4-browser/`。本轮 C4 证据包括中英桌面教程、英文桌面任务、中文手机教程、中文手机任务与操作状态、200% 等效视口。所有图像均小于 3 MB，已读取并复核上述桌面、手机及缩放画面；未发现六格模型或文字的页面级横向裁切。

验收过程中首轮搜索 `照片复盘` 未命中正文别名，改用正文实际存在的 `照片筛选` 后通过；这不是为失败断言随意修改正文。首轮完整交互回归还发现旧 C2 索引预期只有三张任务卡，已更新为包含 C4 并重跑全套检查。早期失败不计为通过。

## 5. 来源与内容边界

2026-10-29 实际打开并阅读：

- Adobe Lightroom Classic 的 **How to browse and compare photos in Lightroom Classic**：Compare／Survey 视图用于并排、多图比较与按需缩放。
- Adobe Lightroom Classic 的 **How to flag, label, and rate photos in Lightroom Classic**：pick、reject 与 unflag 是可调整的整理标记，与永久删除原文件不同。
- iPhotography 的 **How to Tell a Story With Your Camera**：围绕共同主题筛选与排序，不同照片为叙事作出贡献；不把其建议张数或顺序当成普遍规则。

Photography Life 的 **How to Choose Between Similar Versions of a Photo** 搜索结果返回了相关正文摘录，但直接访问为 403；未列为本轮已直接核查的发布来源。没有复制或热链第三方照片，没有虚构实拍、EXIF 或自动入选结果。

## 6. 未执行项与限制

- 未做真实读者测试、完整屏幕阅读器验收或全面 WCAG 2.2 AA 审核；自动检查和截图走查不等于这些审查。
- 六格插画是原创概念图，不是实拍样片；自评不是审美评分，任务完成不是技能认证。
- 本轮没有实现照片上传、EXIF 读取、删除、备份、批量文件管理或导出。
- 未公开仓库、发布网站或检查远端 CI。
- 200% 等效视口截图中的吸顶导航覆盖部分上方内容属于现有页面行为，本轮未宣称解决所有缩放或导航问题。
- 测试脚本清理其启动的临时预览与独立 Chrome，不保留常驻开发服务器。

## 7. 正式目录同步与独立复测

白名单脚本只读比较了 484 个文件，没有发现未审阅差异。首轮只纳入 C4 截图时，脚本正确阻止了同目录其他回归截图被静默同步；复核完整证据目录后，将全部 27 张截图及本批源码、脚本、文档纳入明确白名单。随后复制并逐文件 SHA-256 核验 54 个文件，没有覆盖白名单之外的差异。

以下结果来自正式目录 `/Users/ruoyu/photography-field-guide` 的独立执行，不沿用隔离副本结果：

| 检查                                                                  | 实际结果                                                            |
| --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm format:check`                                                   | 通过                                                                |
| `pnpm test:unit`                                                      | 30／30 通过                                                         |
| 根路径 `build`、`test:smoke`、`test:build`                            | 通过；42 份 Learn 文档、52 条结构化记录、76 页及 8 个缺失／退役路由 |
| `PFG_SCREENSHOT_DIR=docs/audit-evidence/c4-browser pnpm test:browser` | 完整真实 Chrome 检查通过，无未预期页面异常                          |
| `/photography-field-guide` 子路径 `build`、`test:smoke`、`test:build` | 通过；76 页及 8 个缺失／退役路由                                    |
| 恢复根路径 `pnpm build`                                               | 通过；默认 `dist/` 为根路径版本                                     |

三次构建的类型检查均为 0 errors、0 warnings、5 个既有 hints。正式目录同步前确认 `main`、HEAD `29983b37a111074bf7b045c3110b4f7dfb789ae2`、相对 `origin/main` 领先 5 个提交及原 stash 均保留。本轮没有提交、推送、部署、重置或清理已有未提交工作。
