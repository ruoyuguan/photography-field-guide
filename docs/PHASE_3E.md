# Phase 3E · 一次城市散步与三张照片

日期：2026-10-29（Asia/Shanghai）。

## 本轮范围

交付 C3“一次城市散步＋三张照片讲一个地方”的中英完整版本。保留并回归 C0—C2、既有教程、工具、器材与资源目录。不增加上传、自动照片评审、账号或审美评分，不公开仓库、提交、推送或部署。

## 教学目标

读者从“拍了很多照片，却说不清一个地方”的困惑出发，先写一句观察意图，再制作、筛选和排序三张有关联的照片。读者需要能够：

- 区分环境、主体与细节三种信息角色；
- 解释每张图新增了什么，而不是只计算照片数量；
- 把这些角色理解为观察提示，而非广角／中焦／微距的器材规定；
- 根据各张图的意图检查曝光、对焦、运动与白平衡；
- 比较至少两种排序，不把某种顺序当作普遍正确的审美答案。

练习不要求拍摄陌生人，可在室内或熟悉地点完成。三格原创概念图用小店、自行车和车铃展示联系，不是实拍样片、精确透视模拟或唯一模板。

## 任务设计

任务英文名为 **Three photos, one place**，稳定 ID 为 `neighborhood-story`，编号 03，版本 1。

1. **预测**：判断环境、主体与细节互补的画面是否比近似重复画面更有潜力说明一个地方；正确答案 ID 为 `complementary-information`。
2. **实拍**：完成 `make-environment-photo`、`make-subject-photo`、`make-detail-photo` 三个观察步骤。先有一句意图，再按现场需要选择拍摄顺序。
3. **自评**：使用 `distinct-roles`、`intentional-sequence`、`technical-review` 三项检查信息分工、排序理由和技术选择。完成只由读者标记。

三格图示始终显示，不为静态叙事增加无意义滑块。没有唯一的播放顺序，也没有对照片好坏自动评分。

## 与既有架构的连接

- `src/data_files/missions/neighborhood-story.ts` 保存双语任务；`src/data_files/practice.ts` 登记任务并支持 `story` 模型及本地化观察标题。
- `NeighborhoodStoryModel.astro` 提供原创三格 SVG；`PracticeMission.astro` 复用既有预测、反馈、观察、自评、重置与本地进度逻辑。
- 教程路由为 `/learn/field-practice/neighborhood-story/` 及 `/zh-cn/learn/field-practice/neighborhood-story/`；任务路由为对应的 `/practice/neighborhood-story/`。
- Practice 索引继续从任务数据生成；C2 的下一任务指向 C3，C3 暂无下一任务，没有空链接。
- 沿用 `photography-field-guide:practice:v1`，按任务 ID 与版本隔离。C3 重置不影响 C1／C2，不保存照片、EXIF、位置或自由文本反思。

## 内容与来源

两份 MDX 使用相同教学结构，包含问题、简答、原创三格 SVG、三种信息角色、替代场景、技术连接、排序复盘、常见误区、任务入口及来源。正文关联既有曝光、自动对焦、白平衡与构图教程。

2026-10-29 实际打开并阅读：

- Digital Photography School：How to Tell Better Visual Stories with Travel Photography 的“Establishing shot”“The detail shot”“Putting it all together”。
- iPhotography：Photo Stories 的“How to Collage Photos Together”及 FAQ。
- Digital Photography School：How to Shoot Sequence Photos to Capture a Story 的场景、主体和细节示例。

这些来源支持信息角色及小组序列的组织方式，不支持强制镜头组合或审美评分。没有复制、下载或热链第三方照片。

## 验收与同步

实现与首轮验收在隔离副本 `photography-field-guide-sync` 完成。构建包含 40 份 Learn 文档、52 条结构化记录和 72 个 HTML 页面，29 项单元测试通过。完整命令、浏览器场景、链接修正、截图及未执行范围见 [C3 验收记录](PHASE_3E_C3_ACCEPTANCE.md)。

验收后按白名单同步到 `/Users/ruoyu/photography-field-guide`，并独立复测；不覆盖无关既有工作。真实读者测试、完整屏幕阅读器验收和全面 WCAG 审核不在本轮完成范围内。
