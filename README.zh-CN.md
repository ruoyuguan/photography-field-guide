# Photography Field Guide

**[English](README.md)** | **简体中文**

一个面向摄影新手的中英双语学习网站，使用 Astro、Starlight 和 Tailwind CSS 构建。默认语言为英文；简体中文内容位于 `/zh-cn/`。

本项目基于开源的 [ScrewFast](https://github.com/mearashadowfax/ScrewFast) 模板构建，并保留其 MIT 许可证。

## 贡献者

- [@ruoyuguan](https://github.com/ruoyuguan) — 项目负责人，负责产品方向、内容决策与发布。

### AI 辅助开发

- **Kimi（Moonshot AI）** — 功能实现、调试、自动化检查、文档编写与工程交付。
- **ChatGPT（OpenAI）** — 产品架构、内容设计、技术审查与 MVP 完善。

AI 助手为本项目的开发提供支持。项目负责人主导工作，并对已发布的变更作最终决定。

## 当前范围

- 英文与简体中文学习路径：22 篇主题教程加 1 篇导览，按 23 组双语配对维护，共 46 份 MDX 文档。
- 按学习意图提供共享起点链接、精简的六任务路线图、基于浏览器进度的建议与情境化返回入口；所有任务均可自由进入。
- 六个双语实践任务：光线方向、主体与背景取景、用三张照片讲述街区故事、照片筛选与复盘、安全备份与导出，以及轻量后期。任务包括预测、解释性反馈、本地观察或操作、自我复盘和无需账号的浏览器进度，不进行审美评分。C5 与 C6 相连；后期练习分别比较亮度、白平衡与裁切，并允许保留未修改的最终版本。
- 两个互动工具：画幅／等效焦距与曝光档位；使用无障碍原生输入控件，并配有经过测试的计算逻辑。
- 可搜索的双语术语表，收录 34 个术语。
- 相机与镜头指南、三个范围明确的外部样片链接，以及 13 个精选资源。
- 本地化导航、语言切换、文档搜索、404 页面、元数据，以及根路径／子路径部署检查。

当前源码包含 52 条结构化记录和 84 个 HTML 路由。经审查的交接检查点为 `95f19f4`；本 MVP 提交在此基础上加入 C5、C6、学习路径改进、审查修复和手动发布准备。当前验证结果记录于 [docs/STATUS.md](docs/STATUS.md)。已执行的检查及限制见 [C6 集成审查](docs/C6_INTEGRATION_REVIEW.md)。历史报告仅为当时快照，不代表当前功能清单。

### 路由

| 板块     | 英文                     | 简体中文                       |
| -------- | ------------------------ | ------------------------------ |
| 首页     | `/`                      | `/zh-cn/`                      |
| 学习     | `/learn/`                | `/zh-cn/learn/`                |
| 练习     | `/practice/`             | `/zh-cn/practice/`             |
| 工具     | `/tools/`                | `/zh-cn/tools/`                |
| 画幅系数 | `/tools/crop-factor/`    | `/zh-cn/tools/crop-factor/`    |
| 曝光档位 | `/tools/exposure-stops/` | `/zh-cn/tools/exposure-stops/` |
| 术语     | `/glossary/`             | `/zh-cn/glossary/`             |
| 器材     | `/gear/`                 | `/zh-cn/gear/`                 |
| 样片     | `/galleries/`            | `/zh-cn/galleries/`            |
| 资源     | `/resources/`            | `/zh-cn/resources/`            |
| 关于     | `/about/`                | `/zh-cn/about/`                |

## 本地开发

约定的本地检出目录为 `/Users/ruoyu/photography-field-guide`。请在此目录运行开发命令和检查。

使用 Node.js **22.23.4 或更高版本**以及 pnpm **10.34.9**。对于支持 `.node-version` 的版本管理器，该文件会选择 Node 24.22.1。

```bash
cd /Users/ruoyu/photography-field-guide
pnpm install --frozen-lockfile
pnpm dev
```

要明确指定主机或端口：

```bash
pnpm dev -- --host 0.0.0.0 --port 4321
```

如果未全局安装 pnpm，以下经过验证的等效命令会使用锁定版本，且不会更改项目依赖：

```bash
npm exec --yes --package=pnpm@10.34.9 -- pnpm dev
```

## 检查

```bash
pnpm format:check
pnpm test:unit
pnpm build
pnpm test:smoke
pnpm test:build
```

`pnpm test:unit` 当前包含 80 项用例，涵盖摄影公式、单位与边界输入、任务反馈、练习进度持久化／恢复／独立重置，以及 C1–C6 综合目录。执行结果以当前验证记录为准。`pnpm build` 会运行类型检查、验证内容、在 `dist/` 中生成静态网站，并压缩 HTML。smoke 测试检查所有当前公开页面及已停用／未知路由。产物测试检查内部链接与资源、canonical／hreflang URL、404 `noindex`、manifest、robots、sitemap 和搜索产物。

完成根路径生产构建后，可选的真实浏览器检查会验证语言菜单、中文导航、中英文搜索、按比例绘制的画幅图、计算器结果、滑块与输入同步、键盘操作、重置与错误状态、无 JavaScript 回退、移动端溢出、任务反馈、本地进度、备份／导出学习、受限存储下的主题控件、六任务目录、C5 → C6 导航、两个进度命名空间，以及共享的后期练习场景几何：

```bash
pnpm build
pnpm test:browser
```

浏览器检查使用已安装的 Google Chrome（必要时通过 `CHROME_BIN` 覆盖）和临时生产预览。它在系统临时目录中使用用户配置文件，并且只关闭自己启动的 Chrome 与预览进程。正常完成、错误、SIGINT 和 SIGTERM 共用清理流程。SIGKILL 或系统崩溃无法执行 JavaScript 清理。该检查不属于 CI；Starlight 会在开发服务器中禁用实际的 Pagefind 搜索。

测试 GitHub Pages 项目子路径：

```bash
SITE_BASE=/photography-field-guide pnpm build
SITE_BASE=/photography-field-guide pnpm test:smoke
SITE_BASE=/photography-field-guide pnpm test:build
```

子路径测试后，再次运行普通的根路径构建，使 `dist/` 与默认本地配置一致。CI 会运行两种构建。

## 项目结构

- `src/pages/` 和 `src/pages/zh-cn/` — 营销页面路由；Starlight 提供 Learn 路由。
- `src/content/docs/learn/` 和 `src/content/docs/zh-cn/learn/` — 双语配对文章。
- `src/content/{glossary,cameras,lenses,resources,galleries}/` — 结构化记录。
- `src/utils/content-schema.ts` — 共享 Zod schema 和严格的 ISO 日期验证。
- `src/utils/content-validation.ts` — 双语配对、发布、引用、前置条件、挂载点和资源核查检查。
- `src/content/i18n/zh-CN.yml` — 本地化 Starlight／Pagefind 界面文本。
- `src/components/tools/` 和 `src/views/ToolsIndexView.astro` — 本地化工具界面和客户端控制器。
- `src/utils/photography/` 和 `tests/photography/` — 纯摄影计算与公式测试。
- `src/data_files/practice-catalog.ts` 和 `src/utils/practice/index-progress.ts` — C1–C6 导航和进度摘要。C6 保留现有专用存储键；目录读取两个存储，不做迁移。“清除所有练习进度”只删除这两个练习键，保留主题和其他浏览器数据。
- `src/utils/deployment.ts` 和 `src/utils/locale.ts` — 感知部署环境的 URL 与语言路由。
- `scripts/smoke.mjs` 和 `scripts/check-build.mjs` — 本地生产输出检查。
- `scripts/browser-check.mjs` 和 `scripts/browser-tool-checks.mjs` — 临时预览浏览器检查。
- `docs/` — 原始需求、仓库审查、架构、内容、资源和路线图文档。

已发布的非导览文章必须具有真实来源和审查日期。未发布草稿必须使用 `draft: true`；它们不会成为生产路由。公开的外部资源必须具有经过核查的目标和证据。网络可用性与离线构建被明确区分。

## 部署

输出为静态网站，适合部署到 GitHub Pages、Vercel 或 Netlify 等服务。`SITE_ORIGIN` 控制公开源站（默认 `https://ruoyuguan.github.io`）；`SITE_BASE` 独立控制部署前缀（默认 `/`）。不要将前缀合并进源站。

MVP 已在 `/photography-field-guide/` 准备好仅手动触发的 GitHub Pages 工作流。它不会因推送或拉取请求自动部署。发布范围和步骤见 [MVP 发布范围与步骤](docs/MVP_RELEASE.md)；目前尚未发布网站。根路径静态托管可以为缺失页面提供 `404.html`。系统也会生成 `/zh-cn/404/`，但特定语言的回退行为取决于最终托管平台；不得将有效中文页面重写到该页面。

由于网站尚未发布，旧的 `/start-here/` 与 `/basics/...` 路由已停用且未设置重定向。今后更改公开 URL 前，应重新评估这一决定。

开发期间仓库可以保持私有。公开仓库与本地运行是两个独立决定。

## 品牌资源

仓库中的栅格资源可以使用安装了 Pillow 的 Python 环境重新生成：

```bash
python scripts/generate_brand_assets.py
```

## 许可证

MIT。见 [`LICENSE`](LICENSE)。保留 ScrewFast 的原始版权与许可证声明。

如果希望在不公开开发仓库、也不要求第三方访问 GitHub 的情况下与朋友分享，请参阅[分享方案](docs/SHARING_WITHOUT_GITHUB_ACCESS.md)。本次本地审查未进行公开部署。

内容审查日期采用维护者在 Asia/Shanghai 时区的创作日期，包括 UTC 环境下的 CI 构建。当前入口路径审查与限制见 [学习路径 UX 审查](docs/LEARNING_PATH_UX_REVIEW.md)。如需针对浏览器开发进行重点检查，使用 `PFG_BROWSER_SCOPE=learning-paths pnpm test:browser`；默认命令仍运行完整测试套件。
