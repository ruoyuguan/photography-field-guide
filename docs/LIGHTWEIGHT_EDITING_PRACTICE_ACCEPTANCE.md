# C6「轻量后期」独立练习：验收与交接

日期：2026-10-29（Asia/Shanghai）。本记录只覆盖本轮新增的独立中英练习及两篇轻量后期教程中的入口，不表示共享 Practice 注册、C1–C4 反馈或其他助手未完成部分已经交接。

## 完成内容

- 英文任务：`/practice/lightweight-editing/`。
- 中文任务：`/zh-cn/practice/lightweight-editing/`。
- 稳定任务 ID：`lightweight-editing`；内容／进度版本：`1`。
- 英文教程与中文教程分别增加通往对应语言任务的链接。
- 一道条件明确的客观预测题：区分后期呈现亮度、已记录光线和空白高光中的信息；包含逐选项反馈、提示、答案解释、错误后重试。
- 三步本地操作：保护原片／备份并写明用途；分别进行明暗、白平衡、裁切对照且逐项撤销；导出独立副本并检查实际像素尺寸、呈现与隐私。
- 三项自主复盘：用途与来源、逐组对照证据、衍生副本适用性。完成按钮只有在预测正确、三项操作和三项复盘均完成后才可用。
- 完成只是读者的流程复盘标记，不是审美评分、掌握程度证明或细节恢复保证。
- 复用已有六幅原创 SVG 作为可展开的概念复习；不伪装成照片编辑器、实测色彩或真实样片。
- 无 JavaScript 时仍可阅读预测选项、提示、答案、概念图、三项操作及自主复盘，原生 `details` 可用。

## 独立进度与隐私边界

共享 `createPracticeStore()` 会按全局任务注册表过滤任务，不能直接保存这条独立任务。因此本轮使用专用小存储，而没有修改共享注册表、控制器或进度模型。

- 专用键：`photography-field-guide:practice:lightweight-editing:v1`。
- 中英页面共用同一份答案 ID、答案展开状态、步骤勾选、复盘勾选与显式完成状态。
- 正确性由当前内容重新推导，不信任保存的 `solved`。
- 损坏 JSON、错误版本、未知答案和未知清单项安全恢复，并给出提示。
- 读取失败不会覆盖已有数据；写入失败后继续使用内存状态，并明确说明无法持久保存。
- 重置只移除本任务键，保留共享任务进度、主题和其他偏好；删除失败时页面内存仍重置并如实提示。
- 不提供文件选择、自由文本或照片上传；不保存照片、文件名、尺寸、位置、笔记或元数据。

## 文件范围

新增：

- `src/data_files/lightweight-editing-practice.ts`
- `src/utils/practice/lightweight-editing-progress.ts`
- `src/components/practice/LightweightEditingPractice.astro`
- `src/components/practice/lightweight-editing-controller.ts`
- `src/views/LightweightEditingPracticeView.astro`
- `src/pages/practice/lightweight-editing.astro`
- `src/pages/zh-cn/practice/lightweight-editing.astro`
- `tests/practice/lightweight-editing-progress.test.ts`
- `scripts/check-lightweight-editing-practice.mjs`
- `scripts/browser-lightweight-editing-practice.mjs`
- 本记录及 `docs/audit-evidence/2026-10-29-lightweight-editing-practice/`

只在上一轮已有的两篇轻量后期教程中增加任务入口：

- `src/content/docs/learn/workflow/lightweight-editing.mdx`
- `src/content/docs/zh-cn/learn/workflow/lightweight-editing.mdx`

未修改共享 Practice 注册表／控制器／进度文件、共享路由清单、C1–C4 内容、全局状态／路线文档或另一助手正在处理的部分。未安装新依赖，未提交、推送、部署、回滚或操作 stash。

## 实际验收

运行环境：Node 24.22.1、项目现有依赖、真实 Google Chrome（隔离临时配置）。测试预览与浏览器均在专项脚本结束后关闭；未停止工作区原有的其他预览进程。

| 检查                                                    | 实际结果                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run test:unit`                                     | 48／48 通过，其中本轮新增 10 项                                                      |
| 根路径 `npm run build`                                  | 通过；46 篇文章、52 个结构化条目、84 页；0 错误、0 警告、6 个既有提示                |
| 根路径 `npm run test:smoke`                             | 共享清单内 80 页及 8 个未知／旧路由通过                                              |
| `node scripts/check-lightweight-editing-practice.mjs`   | 中英任务、教程入口、语言与 canonical、三题／三步骤／三复盘、隐私及无脚本静态产物通过 |
| `node scripts/browser-lightweight-editing-practice.mjs` | 八组真实浏览器检查通过，页面异常为 0                                                 |
| `node scripts/browser-lightweight-editing.mjs`          | 既有教程的中英搜索、语言切换、C5 链接、桌面／移动／深色／无脚本回归通过              |
| `SITE_BASE=/photography-field-guide npm run build`      | 84 页通过，类型检查同为 0 错误、0 警告、6 个提示                                     |
| 子路径 `npm run test:smoke`                             | 共享清单内 80 页及 8 个未知／旧路由通过                                              |
| 子路径两个 lightweight-editing 静态专项检查             | 新任务及原教程产物均通过                                                             |
| 最终根路径恢复                                          | 已重新构建并复测；根路径 canonical 已核对                                            |

真实浏览器执行了以下路径，而非只检查 DOM 是否存在：

1. 英文空答案提示 → 错误答案情境反馈 → 重试 → 查看解释 → 正确答案 → 三步操作 → 三项复盘 → 完成。
2. 刷新恢复全部六项勾选、正确答案、解释展开与完成状态；中英切换后读取同一记录。
3. 中文单任务重置，验证共享任务键和主题保持不变。
4. 损坏 JSON 恢复为空状态并显示 `recovered` 提示。
5. 只屏蔽本任务存储读取时，操作仍在内存生效、提示 `memory`，刷新后不谎称已保存。
6. 使用真实键盘事件选择单选项并用空格激活提交按钮。
7. 六幅概念图的标题／描述、真实深色主题、390×844、683×384 和横向溢出检查。
8. 禁用 JavaScript 后的静态内容、原生答案／概念图展开及布局检查。

### 保留的共享检查失败

`npm run test:build` 已实际运行，仍失败于共享页数断言：

```text
Build checks failed (1):
- Expected 80 HTML files, found 84.
```

本轮新增两篇任务页，因此总数由 82 增至 84。这不是构建失败；独立静态检查已覆盖新增页面。按本轮隔离要求，没有修改共享 `scripts/check-build.mjs` 或 `scripts/smoke.mjs`。

全项目 `npm run format:check` 也已运行，目前仍只有以下共享文件未通过：

- `src/components/practice/practice-controller.ts`
- `src/utils/practice/feedback.ts`

本轮新增实现、测试和检查脚本均单独执行过 Prettier；上述共享文件未改动。

## 截图与证据

目录：`docs/audit-evidence/2026-10-29-lightweight-editing-practice/`。

- `c6-en-complete-1366x768.png`：英文正确预测与解释。
- `c6-en-review-1366x768.png`：英文完成标记与返回链接。
- `c6-zh-dark-390x844.png`：真实深色主题的中文移动端任务。
- `c6-zh-model-dark-390x844.png`：中文移动端原创明暗对照。
- `verification.json`：八组浏览器验收、截图清单与限制。
- `build-verification.json`：构建、单测、静态检查和保留失败项摘要。

四张截图均已实际读取复核。截图中的裁切、窗口和杯子是概念插图，不是照片或真实后期结果。

## 未覆盖范围与后续集成

- 新任务可从两篇轻量后期教程直接进入，但**尚未接入共享 Practice 总目录**，没有全局任务编号卡或虚构的下一任务。
- 等共享范围由另一助手完成后，再统一注册任务、更新总路由／页数断言及状态文档；不要直接替换独立命名空间而丢失已有进度。
- 未在子路径重跑交互浏览器套件；子路径完成了构建、路由、产物和静态链接验收。
- 未读取真实照片、未操作第三方编辑软件，未做真实读者测试、全面 WCAG 审核、跨浏览器矩阵或公开部署验证。
