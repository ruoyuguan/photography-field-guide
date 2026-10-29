# Photography Field Guide — MVP v0.1 预览版

整理日期：2026-10-30（Asia/Shanghai）。这是当前本地代码的首发范围和发布准备，不是已发布版本或 Git 标签。

## 首发目标

让摄影新手完成一条清楚的闭环：找到适合的起点 → 理解一个概念 → 用工具或练习验证 → 解释一次取舍 → 找到下一步。英文默认，简体中文可切换；手机与电脑都能使用，不需账号。

## 冻结的 MVP 范围

| 层级         | 首发内容                                                                 | 读者能做什么                                                 |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 核心入口     | 首页与 Learn 的三个起点、六任务路线图                                    | 从零理解、马上拍摄或整理已有照片，所有任务自由进入           |
| 摄影基础     | 22 组双语主题教程与一组导览，共 46 份文档                                | 学习画幅、焦距、曝光、对焦、色彩、用光、构图及照片工作流     |
| 互动工具     | 画幅／等效焦距、曝光档位两个工具                                         | 改变输入，看图示、数值、条件和解释；区分曝光与 ISO 输出映射  |
| 实践闭环     | C1 光线、C2 主体背景、C3 三张照片、C4 筛选复盘、C5 备份导出、C6 轻量后期 | 预测、读反馈、重试、本地实践、自评，返回教程或继续另一项任务 |
| 学习支持     | 搜索、34 个术语、来源与 About                                            | 找到术语、对应教程和可追溯资料                               |
| 已有辅助内容 | 相机／镜头各一、13 个资源、3 条范围明确的外部样片记录                    | 继续查阅；作为辅助入口保留，不以数据库规模作为首发目标       |

现有器材和样片入口保留，不删已有内容；不再扩充规模来推迟首发。当前共 84 个 HTML 页面、52 条结构化记录，仍使用原有两个进度存储空间。

本版不加入账号、云同步、照片上传、自动审美评分、真实文件删除、器材购物排行、更多计算器或 C7。练习进度只是当前浏览器中的自报清单，不能证明掌握程度或备份安全。

## 首发验收门槛

- 本批验证生产配置 `SITE_ORIGIN=https://ruoyuguan.github.io`、`SITE_BASE=/photography-field-guide`，不得用本地根路径产物直接发布项目站。
- 80 项单测、生产构建、84 页路由及未知／旧路由、内部链接／锚点／资源、SEO／搜索产物检查通过。
- 已有完整根路径自动 Chrome、C6 专项与窄屏证据继续保留；它们不代表真实朋友试用、完整子路径浏览器流程或全面 WCAG 审核。
- 上线后另验收实际公网首页、中文深层页、搜索、任务反馈与恢复、未知页和移动端，再邀请朋友使用。

当前结论为**可准备首发的本地 MVP 候选**。GitHub Actions 的实际运行、仓库可见性和 Pages 生产部署尚未执行。

## 地址与个人主页的关系

使用当前仓库名称并按默认 GitHub Pages 项目站发布后，预计为：

| 用途               | 地址                                                          |
| ------------------ | ------------------------------------------------------------- |
| 个人主页，保持现状 | https://ruoyuguan.github.io/                                  |
| 摄影站英文首页     | https://ruoyuguan.github.io/photography-field-guide/          |
| 摄影站中文首页     | https://ruoyuguan.github.io/photography-field-guide/zh-cn/    |
| 英文学习导览       | https://ruoyuguan.github.io/photography-field-guide/learn/    |
| 英文练习目录       | https://ruoyuguan.github.io/photography-field-guide/practice/ |

GitHub 将账号站放在根路径，将项目站放在仓库名对应的子路径。这是两个仓库各自发布的网站；本次配置只从摄影仓库构建并上传 `dist/`，不向 `ruoyuguan.github.io` 个人主页仓库写文件。[GitHub 官方地址规则](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

截至本轮只读查询：个人主页 HTTP 200，摄影项目预期地址 HTTP 404。上表是**发布成功后的预计地址**，不是现在可分享的网站。将来改仓库名或启用自定义域名，应同步调整配置和验收。

两个路径共享同一浏览器来源，不构成完全隔离的站点。摄影任务使用独立前缀键，重置只删除摄影进度；不能把子路径隔离解释为安全边界。localhost 的进度不会自动同步到 github.io。

## 本地发布准备

新增 `.github/workflows/pages.yml`，名称为 **Publish photography MVP to GitHub Pages**：

- 只接受手动运行，不由 push、公开仓库或 PR 自动触发。
- 只允许当前摄影仓库的 main 构建；固定正确的域名与项目子路径。
- 构建和检查通过后，只上传 `dist/`；不把开发文档或截图打进网站产物。
- 部署写权限限于部署任务，使用 GitHub 自带 Pages，不接入 Vercel 等额外托管平台。

现有 `ci.yml` 仅运行检查，不负责上线；新增工作流补上发布步骤。该文件随 MVP 源码提交保存；推送成功后会出现在摄影仓库的 Actions 中，但仍需先配置 Pages 来源并手动运行。[GitHub 自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 真正上线时的顺序

1. **确定仓库公开范围。** 公开源码仓库也会公开其中的开发文档与历史。当前问题库含维护者设备与背景记录；本轮保留全部原文件，没有替你删改历史或修改可见性。只发布网页产物与公开整个开发仓库是两项不同决定。
2. 提交并推送当前 MVP（用户已授权本次执行）。仅改变远端仓库可见性，不会自动上传本地更新。
3. 使用 GitHub Free 时，先使这个项目仓库满足公开仓库的 Pages 条件；已有支持私有 Pages 的付费计划可另选私有来源，无需为此额外注册托管平台。
4. 摄影仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
5. 在摄影仓库的 **Actions → Publish photography MVP to GitHub Pages → Run workflow** 选择 main，手动运行。
6. 等部署成功，以 workflow 输出或 Pages 设置给出的实际网址为准，执行公网验收，再发给朋友。

发布目标仅为摄影仓库，不改个人主页仓库、根路径首页或其 Pages 设置。GitHub Free 的公开仓库条件和 Sources 设置见 [官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 尚未完成的事项

用户已授权提交与推送 MVP；公开仓库与实际部署仍不在本次操作范围内。线上 Pages 开关、环境保护规则、Actions 实际安装／运行、生产 404 回退与朋友所在网络的访问效果，仍需首次实际部署后确认。后续用 [读者试用指南](READER_TRIAL_GUIDE.md) 收集具体困惑，再决定扩写内容。

## 本轮本地验证结果

80 项单元测试、生产子路径构建与 84 页路由／产物检查、C6 专项及全项目格式检查均通过。手动工作流通过 YAML 解析与触发条件、仓库／分支、权限及 dist 产物边界核对；未在 GitHub 实际运行。生产配置验证结束后已恢复根路径构建并重新通过路由与产物检查，供日常本地使用。

命令、退出码、HTTP 状态与未执行项见 [MVP 验收记录](audit-evidence/2026-10-30-mvp-release/verification.json)。本轮没有改网页功能代码，因此没有重复完整浏览器回归；既有浏览器证据见 [学习入口验收](LEARNING_PATH_UX_REVIEW.md)。
