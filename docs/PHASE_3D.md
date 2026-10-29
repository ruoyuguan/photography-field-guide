# Phase 3D · 主体、背景与画面组织

日期：2026-10-29（Asia/Shanghai）。

## 本轮范围

本轮只交付 C2：中英“主体与背景”教程及“整理画面”完整学习任务。保留并回归 C0／C1 和既有教程、工具、器材及资源目录。不实现 C3“三张照片讲一个地方”，不增加空入口，不公开仓库、提交、推送或部署。

## 教学目标

读者从一个具体困惑出发：主体已经合焦，为什么画面仍然混乱？教程先给可执行的选择，再解释机位与远近元素相对对齐的关系。读者需要能够：

- 检查整个矩形画面和四条边，而不只盯着主体；
- 通过安全的小幅侧移与重新构图，比较主体和背景的关系；
- 区分前景、主体、背景与留白的作用；
- 说明为什么移除或保留某个环境元素，而不是把更干净、更模糊或符合三分法当作自动的质量提升。

图解是概念比较，不是精确透视模拟，也不对照片打分。

## 任务设计

“整理画面”的英文名为 **Frame cleanup**，稳定任务 ID 为 `subject-background`，编号 02，版本 1。

1. **预测**：固定主体和焦距，安全侧移并重新构图后，判断相对对齐关系如何变化。
2. **观察**：比较始终同时显示的两幅概念图，再拍摄自己的两张对照照片。三个观察步骤为 `compare-frames`、`make-initial-photo`、`make-shifted-photo`。
3. **自评**：用 `edge-and-space-review`、`distraction-review`、`context-review` 三项检查说明边缘、干扰和环境信息。完成由读者标记，不生成审美评分。

实拍建议固定焦距、对焦选择与曝光设置，主体大小近似一致；同时明确手持重新构图并非完美的控制变量实验。没有为静态构图比较增加无意义的方向滑块。

## 与既有架构的连接

- 在 `src/data_files/missions/subject-background.ts` 中保存双语任务内容和稳定 ID；`src/data_files/practice.ts` 负责登记任务。
- 复用 `PracticeMission.astro`、`PracticeMissionView.astro` 和本地进度存储。C2 使用 `FramingModel.astro`，C1 的方向模型和交互不变。
- 控制器允许无方向控制器的构图任务；只初始化实际存在的组件。
- 中英路由分别为 `/practice/subject-background/` 和 `/zh-cn/practice/subject-background/`；教程位于对应的 `/learn/composition/subject-and-background/`。
- Practice 索引、任务编号、C1 的下一任务和教程入口从登记数据生成。C2 没有下一任务，C3 路由保持 404。
- 沿用 `photography-field-guide:practice:v1`，按任务 ID 和版本隔离进度，无需迁移 C1；不保存照片或自由文本反思。

## 内容与来源

两份 MDX 正文具有相同教学结构、简答、原创概念 SVG、常见误区、控制变量实验、任务链接及来源。来源记录到具体章节和用途：

- Photography Life：How to Eliminate Background Distractions in Photographs，背景简洁与环境叙事的相关章节。
- Photography Life：Negative Space in Photography，留白定义及视觉效果的相关章节。

两条来源均在 2026-10-29 实际打开并阅读相关正文。未批量刷新既有资源的核查日期，也未复制第三方照片。

## 验收与同步

实现与验收在隔离副本 `photography-field-guide-sync` 中完成；最终按白名单同步到 `/Users/ruoyu/photography-field-guide`，不覆盖无关既有工作。当前构建为 38 份 Learn 文档、52 条结构化记录和 68 个 HTML 页面，28 项单元测试通过。

详细命令、浏览器场景、截图和限制见 [C2 验收记录](PHASE_3D_C2_ACCEPTANCE.md)。真实读者测试、完整屏幕阅读器验收及全面 WCAG 审核不在本轮已完成范围内。
