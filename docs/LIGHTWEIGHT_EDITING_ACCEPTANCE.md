# 轻量后期首篇教程：独立验收与交接

日期：2026-10-29（Asia/Shanghai）。本记录只覆盖轻量后期的第一篇中英教程，不代表 C6 完整任务或共享范围已经交接完成。

## 本批完成的内容

- 英文：`/learn/workflow/lightweight-editing/`。
- 中文：`/zh-cn/learn/workflow/lightweight-editing/`。
- 从同一幅原创概念场景分别比较明暗、白平衡和裁切，不把它们描述为必须叠加的三步滤镜。
- 说明后期改变已捕获信息的呈现，不改变已经完成的曝光；RAW／JPEG 都不保证无限恢复；裁切不改变视点，也不创造细节。
- 提供约 10–15 分钟的本地练习：保留来源、分别对照、按接收场景的尺寸复盘。网站不读取、上传或保存照片及练习笔记。
- 六幅 SVG 均有可访问标题与描述；不依赖脚本、第三方图片或在线服务。
- 双向语言切换、对应 canonical、站内相关教程及 C5 工作流入口已接入新文章自身的链接。
- 三篇 Adobe 官方资料在本轮重新打开核对，保留访问日期与各自支持的软件行为；示意图不是 Adobe 教程或样片的复制。

新增实现文件：

- `src/content/docs/learn/workflow/lightweight-editing.mdx`
- `src/content/docs/zh-cn/learn/workflow/lightweight-editing.mdx`
- `src/components/learn/LightweightEditingModel.astro`
- `scripts/check-lightweight-editing.mjs`
- `scripts/browser-lightweight-editing.mjs`

## 边界与现有工作

本批没有修改共享 Practice 注册、任务控制器、既有教程、Learn 总入口、配置、`scripts/smoke.mjs`、`scripts/check-build.mjs`、README、STATUS 或路线文档，也没有改写 C5 验收记录。工作区中原有的已修改与未跟踪内容保持保留。

未执行 Git 提交、推送、回滚、stash 应用／删除、部署或仓库可见性变更。HEAD 仍为 `95f19f4977321760f850f255674a2f9998326602`；既有 `stash@{0}` 仍存在。

## 已修正的问题

1. 中文搜索“轻量后期”最初为零结果。实际索引将“轻量”作为复合词，而浏览器分词会查询“轻／量／后期”；在这篇文章已有的 `search_aliases[content]` 中补齐对应分词后，真实中文搜索框能够找到并打开目标文章。没有用更短的查询替代原验收条件。
2. 初次深色截图只改变了系统外观模拟，页面仍是实际浅色偏好。最终测试通过网站真实主题按钮设置深色，并断言 `data-theme="dark"` 后再截图。
3. 英文首段不自然的“important brightness readable”改为明确的“important subject easy to see”。
4. 中文 Adobe 来源说明中的“裁切预览”更正为“高光／阴影溢出预览”。

## 实际检查

运行环境为 Node 24.22.1，通过项目现有依赖和 npm 脚本执行；没有安装新依赖。

| 检查                                                      | 实际结果                                                                                                             |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`                                       | 38／38 通过                                                                                                          |
| 根路径 `npm run build`                                    | 通过；46 篇文章、52 个结构化条目、82 页；类型检查 0 错误、0 警告、6 个提示                                           |
| 根路径 `npm run test:smoke`                               | 既有 80 页及 8 个未知／旧路由通过；该共享清单不含新增两篇                                                            |
| `node scripts/check-lightweight-editing.mjs`              | 根路径两篇产物、三组对照、SVG 描述、语言选项、canonical、相关链接及无脚本回退通过                                    |
| `node scripts/browser-lightweight-editing.mjs`            | 中英搜索、语言切换、C5 链接、桌面、390×844 深色移动端、683×384 窄视口、无 JavaScript 原生 details 与页面异常检查通过 |
| 五个新增实现文件的 Prettier 检查                          | 通过                                                                                                                 |
| `SITE_BASE=/photography-field-guide npm run build`        | 82 页通过                                                                                                            |
| 同一子路径下 `npm run test:smoke`                         | 既有 80 页及 8 个未知／旧路由通过                                                                                    |
| 同一子路径下 `node scripts/check-lightweight-editing.mjs` | 新增两篇的子路径产物通过                                                                                             |
| 最终恢复根路径构建、smoke、专项静态／浏览器检查           | 通过；`dist/` 为根路径版本                                                                                           |

六个提示不属于本批新增组件；其中包括保留共享范围 `practice-controller.ts:42` 的未使用变量，本批未顺手修改。

### 保留的共享检查失败

根路径和子路径的 `npm run test:build` 都实际运行并保留了失败结果：

```text
Build checks failed (1):
- Expected 80 HTML files, found 82.
```

原因是共享 `PUBLIC_ROUTES` 仍是新增文章前的清单，不是缺失页面、错误链接或构建失败。为遵守不碰共享未交接范围的要求，本批没有自行修改该清单，也没有把此项写成通过。共享范围交接时应同时把两篇新文章加入 `scripts/check-build.mjs` 与 `scripts/smoke.mjs`，再重跑两种 base 的完整检查。

全项目 `npm run format:check` 也已实际运行，目前仅因共享的 `src/components/practice/practice-controller.ts` 与 `src/utils/practice/feedback.ts` 未通过。五个新增实现文件、本记录及验证 JSON 均单独通过格式检查。原始失败保留在 `final-format.log`；本批未改动上述共享文件。

## 截图和原始证据

目录：`docs/audit-evidence/2026-10-29-lightweight-editing/`。

- `lightweight-editing-en-1366x768.png`：英文首屏与教程入口。
- `lightweight-editing-crop-en-1366x768.png`：英文裁切前后对照。
- `lightweight-editing-zh-dark-390x844.png`：实际深色主题的中文移动端阅读。
- `lightweight-editing-crop-zh-390x844.png`：中文移动端裁切对照与边缘。
- `verification.json`：检查状态、范围和交接事项。
- `final-scoped-verification.log`：最终根路径构建、smoke、专项静态／浏览器与格式检查。
- `root-verification.log`、`base-verification.log`：包含上述共享页数清单失败，未删除或改写。

截图已实际读取复核；这只是开发者视觉走查，不是真实读者测试或全面无障碍审核。

## 尚未完成及建议交接顺序

1. 由共享范围的接续开发者把新文章加入总路由／构建清单，并统一更新当前状态文档。
2. 在 Practice 共享范围可修改后，再把现有本地练习扩展为完整中英 C6 任务；不要提前显示空任务或未完成入口。
3. 接续 C1–C4 情境反馈等另一批工作，避免覆盖本记录明确保留的修改。
4. 完整浏览器回归、全项目格式检查、真实读者测试和必要的无障碍检查仍应在集成后执行。本轮未在子路径重跑交互浏览器套件，未做跨浏览器矩阵或公开部署验证。
