# 让朋友查看网站，同时保留私有开发仓库

更新与资料核对：2026-10-29。本文是发布方案，不表示网站已经上线；本轮没有创建账号、仓库、授权或部署。

## 目前可以分享哪个网址

`http://localhost:7100/` 是本机开发地址，外地朋友不能通过这个地址访问你的电脑。原先预期的 `https://ruoyuguan.github.io/photography-field-guide/` 本轮实测仍为 HTTP 404。只有部署成功并从外部打开检查后，才能把实际网址交给朋友。

源码仓库是否公开，与网页是否可以公开访问，是两项不同的选择。公开网页中的文字、图片、HTML、CSS 与浏览器 JavaScript 都可被访问；可以继续私有保存开发文档、MDX 源文件和 Git 历史。

## 按你不想增加授权的偏好，优先使用现有 GitHub 账号

建议保持当前开发仓库私有，另建一个**只保存网站构建产物的公开发布仓库**，由它提供 GitHub Pages。这样使用现有 GitHub 账号，不需要把私有开发仓库授权给 Vercel 或 Cloudflare。这是根据 GitHub 支持预先构建的静态文件所作的项目方案；GitHub Free 支持公开仓库的 Pages，部分付费计划也支持私有仓库来源。[GitHub Pages 支持范围](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[发布静态文件](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

具体发布时再执行：

1. 确定发布仓库名称和最终网址。项目站的路径通常随发布仓库名称变化，不能继续盲用原仓库的路径。
2. 按该网址设置构建用的 `SITE_ORIGIN` 和 `SITE_BASE`。本项目已验证 `/` 与 `/photography-field-guide` 两种路径；其他名称需要对应复验。
3. 只把 `dist/` 内的网站文件放入发布仓库根目录，保留 Pagefind、`_astro` 等生成目录。使用分支发布时按 GitHub 指引添加 `.nojekyll`。
4. 在发布仓库设置 Pages 的发布分支。用朋友能够访问的外部网络检查首页、中文深层页、搜索及练习，再分享控制台实际给出的地址。

开发仓库可以继续按自己的节奏保存，不必为了首次展示而公开其源码或把全部开发历史推送到发布仓库。发布仓库中的产物仍然公开；它也不会自动跟随本地开发变化，更新时需要重新构建并发布。

## 如果连成品发布仓库也不想公开

可以使用托管平台的**手动上传**，不接入 GitHub 仓库。你仍需要该平台的账号，但不需要授予它读取开发仓库的权限。

- **Cloudflare Pages Direct Upload**：在本地构建，再从控制台上传构建目录或压缩包；可在同一项目继续更新。Direct Upload 项目之后不能直接改为 Git 集成模式，若未来需要自动发布，应另建项目。[官方流程](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- **Vercel Drop**：直接拖入静态网站文件或文件夹，无需 Git 集成或命令行；每次 Drop 创建新项目，后续持续更新的便利性应另行考虑。[官方说明](https://vercel.com/changelog/vercel-drop)

因此，Kimi 提议的 Vercel Git 集成是可行路径，但“先推送最新源码并授权私有仓库”只适用于那条路径，并非所有静态发布的必要条件。按你当前偏好，先考虑现有 GitHub 账号加独立成品发布仓库；若不接受任何公开仓库，再考虑手动上传。

## 本项目当前边界

本轮完成本地代码整合和验收，没有更改仓库可见性，没有提交、推送或部署。正式域名、生产环境的 canonical、平台 404 行为、真实朋友访问与反馈，均需要首次上线后另外验收。静态网站的练习进度按浏览器与站点来源保存，不会自动从 `localhost` 同步到新域名或另一位朋友的设备。
