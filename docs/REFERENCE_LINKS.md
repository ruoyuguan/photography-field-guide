# 重要网址与引用入口汇总

整理日期：2026-10-29。数据来源为本仓库与用户原始需求；本轮没有批量访问外部网站，也没有刷新任何资源的 lastVerified。以下记录区分用途、原始候选和历史核查，不能当作当前可用性保证。C1、C2、C3 与 C4 分别重新打开了教程实际引用的资料，记录见第 3 节；这不改变其他资源的历史核查日期。

## 1. 开发与项目入口

| 入口                                                                                    | 用途与状态                                                           |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [用户仓库](https://github.com/ruoyuguan/photography-field-guide)                        | 项目代码来源；私有／公开、远端CI和发布状态须实际查询，不能由配置推断 |
| [ScrewFast](https://github.com/mearashadowfax/ScrewFast)                                | 模板溯源；本地自定义与真实代码优先                                   |
| [ScrewFast AI_GUIDE](https://github.com/mearashadowfax/ScrewFast/blob/main/AI_GUIDE.md) | 上游开发约定；不能覆盖本地用户要求                                   |
| [Astro GitHub Pages 部署文档](https://docs.astro.build/en/guides/deploy/github/)        | site/base与项目子路径；实施相关任务时查当前文档                      |
| [Starlight 国际化](https://starlight.astro.build/guides/i18n/)                          | root locale、同名译文与回退；自定义Astro页需自己的对应机制           |
| [Starlight 搜索](https://starlight.astro.build/guides/site-search/)                     | Pagefind生产索引；目录存在不等于查询验收通过                         |

唯一开发目录：/Users/ruoyu/photography-field-guide。项目工作状态见 [STATUS.md](STATUS.md)，原始完整需求见 [PROJECT_BRIEF.md](PROJECT_BRIEF.md)。

历史 http://localhost:7100/ 和测试用 http://127.0.0.1:4328/ 只是临时预览地址，上次维护已关闭；不能当作生产站或永久可用书签。使用时由本轮实际服务输出确定地址与进程。GitHub Pages 的配置 origin/base 也不证明已经部署。

## 2. 已有资源记录（13条）

下表只转录 resources 集合保存的记录。所有条目的 lastVerified 当前记录为2026-10-28；官方身份、用途说明与历史核查均不表示本轮重新核验，更不自动授予照片转载许可。

| 资源                                                                                                                                                      | 提供者性质                    | 主要用途                                                | 记录核查日／ID                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| [JPEG 与 RAW 对比](https://www.adobe.com/creativecloud/file-types/image/comparison/jpeg-vs-raw.html)                                                      | Adobe／官方资料               | 比较面向传感器的 RAW 显影与已处理、压缩的 JPEG 交付。   | 2026-10-28；adobe-jpeg-raw                  |
| [Lightroom Classic 元数据基础与操作](https://helpx.adobe.com/lightroom-classic/desktop/organize-photos-in-lightroom-classic/metadata-basics-actions.html) | Adobe／官方资料               | 学习查看和编辑元数据，并在分享时考虑 GPS 隐私。         | 2026-10-28；adobe-metadata                  |
| [数码相机传感器教程](https://www.cambridgeincolour.com/tutorials/camera-sensors.htm)                                                                      | Cambridge in Colour／独立资料 | 了解感光单元、光子收集、色彩滤镜、转换与去马赛克。      | 2026-10-28；cambridge-camera-sensors        |
| [景深教程](https://www.cambridgeincolour.com/tutorials/depth-of-field.htm)                                                                                | Cambridge in Colour／独立资料 | 了解可接受清晰度、容许弥散圆、观看条件与距离。          | 2026-10-28；cambridge-depth-of-field        |
| [相机曝光教程](https://www.cambridgeincolour.com/tutorials/camera-exposure.htm)                                                                           | Cambridge in Colour／独立资料 | 学习光圈、快门时间、曝光取舍与档位比较。                | 2026-10-28；cambridge-exposure              |
| [相机测光与曝光教程](https://www.cambridgeincolour.com/tutorials/camera-metering.htm)                                                                     | Cambridge in Colour／独立资料 | 理解反射式测光，以及为什么可能需要曝光补偿。            | 2026-10-28；cambridge-metering              |
| [相机快门速度教程](https://www.cambridgeincolour.com/tutorials/camera-shutter-speed.htm)                                                                  | Cambridge in Colour／独立资料 | 理解曝光时长、主体运动、手持与追随拍摄。                | 2026-10-28；cambridge-shutter               |
| [富士 X-T5 在线说明书](https://fujifilm-dsc.com/en/manual/x-t5/)                                                                                          | FUJIFILM／官方资料            | 查询相机控制、快门模式、防抖、文件选项和机型限制。      | 2026-10-28；fujifilm-x-t5-manual            |
| [富士 X-T5 官方规格](https://fujifilm-x.com/global/products/cameras/x-t5/specifications/)                                                                 | FUJIFILM／官方资料            | 查询该机型的传感器尺寸及相机规格。                      | 2026-10-28；fujifilm-x-t5-specifications    |
| [富士 XF16-50mmF2.8-4.8 R LM WR 官方样片](https://www.fujifilm-x.com/global/products/lenses/xf16-50mmf28-48-r-lm-wr/)                                     | FUJIFILM／官方资料            | 查看厂商发布的镜头实拍样片。                            | 2026-10-28；fujifilm-xf16-50-samples        |
| [富士 XF16-50mmF2.8-4.8 R LM WR 官方规格](https://www.fujifilm-x.com/global/products/lenses/xf16-50mmf28-48-r-lm-wr/specifications/)                      | FUJIFILM／官方资料            | 核实实际焦距端点、全画幅等效范围和端点光圈规格。        | 2026-10-28；fujifilm-xf16-50-specifications |
| [Nikon DX 与 FX 画幅说明](https://www.nikonusa.com/learn-and-explore/c/products-and-innovation/the-dx-and-fx-formats)                                     | Nikon／官方资料               | 比较 36 × 24 mm 全画幅与尼康 DX，并查看 1.5× 视角示例。 | 2026-10-28；nikon-dx-fx                     |
| [什么是摄影中的 ISO？](https://photographylife.com/what-is-iso-in-photography)                                                                            | Photography Life／独立资料    | 了解 ISO 输出亮度、常见误区和相机设置示例。             | 2026-10-28；photography-life-iso            |

## 3. 文章已有引用，但未必属于Resources集合

以下按英文文章frontmatter去重提取。accessedOn表示原文章的来源记录日期；文章来源和公开资源目录是不同用途，不能因为正文曾引用就自动创建一个全面verified的资源条目。

| 资料                                                                                                                                                                                        | 关联文章                                                                                                                                                                                                                                                             | 原记录日期 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [Introduction to Portrait Lighting — Cambridge in Colour](https://www.cambridgeincolour.com/tutorials/portrait-lighting.htm)                                                                | [composition/understanding-light.mdx](../src/content/docs/learn/composition/understanding-light.mdx)；方向、表观光源大小与移近光源的联合影响；本轮重新打开相关章节                                                                                                   | 2026-10-29 |
| [How to Eliminate Background Distractions in Photographs — Photography Life](https://photographylife.com/how-to-eliminate-background-distractions-in-photographs)                           | [composition/subject-and-background.mdx](../src/content/docs/learn/composition/subject-and-background.mdx)；机位与背景关系、简洁背景及环境叙事；已打开并阅读“Use Clean and Neutral Backgrounds”与“Use the Background to Tell a Story”                                | 2026-10-29 |
| [Negative Space in Photography — Photography Life](https://photographylife.com/negative-space-in-photography)                                                                               | [composition/subject-and-background.mdx](../src/content/docs/learn/composition/subject-and-background.mdx)；留白围绕并突出主体，数量与位置是有意的构图选择；已打开并阅读“What is Negative Space?”与留白效果章节                                                      | 2026-10-29 |
| [How to Tell Better Visual Stories with Travel Photography — Digital Photography School](https://digital-photography-school.com/how-to-tell-better-visual-stories-with-travel-photography/) | [field-practice/neighborhood-story.mdx](../src/content/docs/learn/field-practice/neighborhood-story.mdx)；环境／细节的信息角色及非强制规则；已打开并阅读“Establishing shot”“The detail shot”“Putting it all together”                                                | 2026-10-29 |
| [Photo Stories — iPhotography](https://www.iphotography.com/blog/photo-stories/)                                                                                                            | [field-practice/neighborhood-story.mdx](../src/content/docs/learn/field-practice/neighborhood-story.mdx)；围绕共同主题变化景别、筛选与排序；已打开并阅读“How to Collage Photos Together”及 FAQ                                                                       | 2026-10-29 |
| [How to Shoot Sequence Photos to Capture a Story — Digital Photography School](https://digital-photography-school.com/shoot-sequence-photos-capture-story/)                                 | [field-practice/neighborhood-story.mdx](../src/content/docs/learn/field-practice/neighborhood-story.mdx)；场景、主体与细节的互补信息，不绑定固定镜头；已打开并阅读相关示例                                                                                           | 2026-10-29 |
| [How to browse and compare photos in Lightroom Classic — Adobe](https://helpx.adobe.com/lightroom-classic/desktop/viewing-photos/browse-compare-photos.html)                                | [field-practice/photo-review.mdx](../src/content/docs/learn/field-practice/photo-review.mdx)；Compare／Survey 的并排、多图比较与按需缩放；已打开并阅读相关章节                                                                                                       | 2026-10-29 |
| [How to flag, label, and rate photos in Lightroom Classic — Adobe](https://helpx.adobe.com/lightroom-classic/desktop/organize-photos-in-lightroom-classic/flag-label-rate-photos.html)      | [field-practice/photo-review.mdx](../src/content/docs/learn/field-practice/photo-review.mdx)；pick、reject、unflag 作为可调整的整理标记，不同于永久删除；已打开并阅读相关章节                                                                                        | 2026-10-29 |
| [How to Tell a Story With Your Camera — iPhotography](https://www.iphotography.com/blog/photo-stories/)                                                                                     | [field-practice/photo-review.mdx](../src/content/docs/learn/field-practice/photo-review.mdx)；围绕共同主题筛选与排序，不强制固定张数或顺序；已打开并阅读相关章节                                                                                                     | 2026-10-29 |
| [IMAGE QUALITY SETTING (Still Photography) — FUJIFILM X-T5 Owner’s Manual](https://fujifilm-dsc.com/en/manual/x-t5/menu_shooting/image_quality_setting/)                                    | [image-quality/film-simulations.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/film-simulations.mdx)；[image-quality/white-balance.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/white-balance.mdx) | 2026-10-28 |
| [The Playback Menu — FUJIFILM X-T5 Owner’s Manual](https://fujifilm-dsc.com/en/manual/x-t5/playback/menu_playback/)                                                                         | [image-quality/film-simulations.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/film-simulations.mdx)                                                                                                                                 | 2026-10-28 |
| [Autofocus — FUJIFILM X-T5 Owner’s Manual](https://fujifilm-dsc.com/en/manual/x-t5/taking_photo/autofocus/)                                                                                 | [image-quality/autofocus.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/autofocus.mdx)                                                                                                                                               | 2026-10-28 |
| [Exposure Compensation — FUJIFILM X-T5 Owner’s Manual](https://fujifilm-dsc.com/en/manual/x-t5/taking_photo/exposure/)                                                                      | [exposure/exposure-compensation.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/exposure/exposure-compensation.mdx)                                                                                                                                 | 2026-10-28 |
| [P, S, A, and M Modes — FUJIFILM X-T5 Owner’s Manual](https://fujifilm-dsc.com/en/manual/x-t5/taking_photo/shooting_mode/)                                                                  | [exposure/pasm-modes.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/exposure/pasm-modes.mdx)                                                                                                                                                       | 2026-10-28 |
| [Fujifilm X-Trans V Recipes — Fuji X Weekly](https://fujixweekly.com/fujifilm-x-trans-v-recipes/)                                                                                           | [image-quality/film-simulations.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/film-simulations.mdx)                                                                                                                                 | 2026-10-28 |
| [Export color lookup tables in Photoshop — Adobe](https://helpx.adobe.com/photoshop/desktop/save-and-export/export-files-to-different-formats/export-color-lookup-tables.html)              | [image-quality/film-simulations.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/film-simulations.mdx)                                                                                                                                 | 2026-10-28 |
| [Nikon reference manual — White Balance](https://onlinemanual.nikonimglib.com/z7_z6/en-nsg/05_basic_settings_02.html)                                                                       | [image-quality/white-balance.mdx](/Users/ruoyu/photography-field-guide/src/content/docs/learn/image-quality/white-balance.mdx)                                                                                                                                       | 2026-10-28 |

Photography Life 的 **How to Choose Between Similar Versions of a Photo** 在搜索结果中返回了相关正文摘录，但 C4 资料核查时直接访问返回 403；未列入上表，也未作为 C4 已直接核查的发布来源。搜索摘要不能代替直接核查。

## 4. 用户最初提供的种子入口

保留原始URL以便追踪，不为迁就当前页面而编造替代路径。未进入资源集合或文章证据的入口，发布前须重新打开核对；404、地区限制、重定向、登录和反爬分别记录。

| 原始入口                                                                                                                 | 当前记录关系／待办                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [X-T5产品主页](https://www.fujifilm-x.com/global/products/cameras/x-t5/)                                                 | 原始候选；与已核查specifications页用途不同                       |
| [X-T5独立官方画廊](https://www.fujifilm-x.com/global/products/cameras/x-t5/gallery/)                                     | 原始候选；不能用其他产品页样片替代其可用性核查                   |
| [X-T5在线说明书](https://fujifilm-dsc.com/en/manual/x-t5/)                                                               | 已有资源记录；本轮未重新核查                                     |
| [XF16–50中文产品页](https://www.fujifilm-x.com/zh-cn/products/lenses/xf16-50mmf28-48-r-lm-wr/)                           | 原始候选；另有global产品页资源记录，语言和路径分别核对           |
| [XF16–50独立sample-images入口](https://www.fujifilm-x.com/global/products/lenses/xf16-50mmf28-48-r-lm-wr/sample-images/) | 原始候选；当前资源指向产品页，不能据此宣称此路径已验证           |
| [X-Photographers](https://www.fujifilm-x.com/global/photographers/)                                                      | 原始候选；摄影师／作品入口，具体设备与版权另查                   |
| [DPReview X-T5样片](https://www.dpreview.com/samples/8778140925/fujifilm-x-t5-production-sample-gallery/)                | 原始候选，待核查标题、范围、EXIF与下载能力                       |
| [DPReview XF16–50样片](https://www.dpreview.com/samples/0574237868/fujifilm-xf16-50mm-f2-8-4-8-r-lm-wr-sample-gallery/)  | 原始候选，镜头范围不等于固定机身组合                             |
| [DPReview X-T5评测](https://www.dpreview.com/reviews/0162052316/fujifilm-x-t5-in-depth-review/)                          | 原始候选，区分测量、规格与编辑判断                               |
| [Flickr Camera Finder](https://www.flickr.com/cameras/)                                                                  | 原始候选；用户社区，不是厂商官方资料                             |
| [Flickr X-T5入口](https://www.flickr.com/cameras/fujifilm/x-t5)                                                          | 原始候选；过滤、元数据和图片范围待核查                           |
| [Cambridge in Colour教程目录](https://www.cambridgeincolour.com/tutorials.htm)                                           | 原始导航入口；具体教程已有部分资源记录                           |
| [Fuji X Weekly X-Trans V配方](https://fujixweekly.com/fujifilm-x-trans-v-recipes/)                                       | 已有胶片模拟文章引用；第三方配方，目录入库与机型兼容仍需单独证据 |
| [Fujifilm X RAW STUDIO](https://www.fujifilm-x.com/global/support/download/software/x-raw-studio/)                       | 原始候选；用途、系统和机型支持在实际介绍前核对                   |
| [Fujifilm XApp](https://www.fujifilm-x.com/global/support/download/software/fujifilm-xapp/)                              | 原始候选；版本、兼容性、权限和实际用途需核对                     |

后续还可按实际选题调查 Photography Life 的其他文章、OpticalLimits、LensTip、CameraLabs、PhotoPills。原始要求只给了部分名称，不在这里猜测具体文章URL。

## 5. 当前三条画廊范围记录

三条记录都引用同一个资源 fujifilm-xf16-50-samples，即 [镜头官方产品页](https://www.fujifilm-x.com/global/products/lenses/xf16-50mmf28-48-r-lm-wr/)。它们表达三种对象范围，不是三个独立画廊来源。

| 记录ID                         | 范围                         | 限制                       |
| ------------------------------ | ---------------------------- | -------------------------- |
| fujifilm-xf16-50-official      | 镜头                         | 不推断全部照片来自X-T5     |
| fujifilm-x-t5-official-caption | 明确标注X-T5的具体样片       | 不把整个镜头页归为X-T5画廊 |
| fujifilm-x-t5-xf16-50-official | 有具体标注证据的机身镜头组合 | 不扩大为所有照片的组合保证 |

这些记录中的hasExif=yes目前主要依据页面展示的拍摄参数；未来展示前应明确“页面参数”与“下载文件实际EXIF”是两个核查维度。hasOriginalFiles=unknown不能被文案改成可下载RAW。此索引不修改原始数据状态。

## 6. 后续维护规则

每次引用或发布前记录：原始URL、最终URL、标题、语言、提供者、用途、范围、支持的具体主张、检查方法与日期。官方身份、可达性、页面身份、科学适用条件、样片范围和图片权利分别判断。

外链应告诉读者为什么值得打开、到哪里能找到相关内容、可能有哪些语言或访问限制；默认文本链接。没有转载许可时不复制、下载或热链照片。

网络检查可独立执行，不把所有离线构建绑定到第三方在线状态。不要自动创建定时监控；如用户未来明确提出，再按其频率和通知要求配置。

## 7. 本轮 C5 官方引用与复查范围

2026-10-29 为 C5 实际打开以下页面；它们是文章主张的来源，不自动新增为资源集合全面 verified 条目，既有 13 条资源的 lastVerified 不变。

| 来源                                                                                                                                            | 本轮支持的具体主张                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [加拿大网络安全中心：备份提示](https://www.cyber.gc.ca/en/guidance/tips-backing-your-information-itsap40002)                                    | 分离存储、离线／异地、3-2-1 与恢复测试               |
| [Apple：管理 iCloud 存储](https://support.apple.com/en-us/108922)                                                                               | iCloud 照片的跨设备删除传播                          |
| [Adobe：目录备份](https://helpx.adobe.com/lightroom-classic/desktop/manage-catalogs-and-files/back-catalog.html)                                | Lightroom Classic 目录备份不包含照片文件             |
| [Adobe：导出到磁盘](https://helpx.adobe.com/lightroom-classic/desktop/export-photos/export-files-disk-or-cd.html)                               | 格式、尺寸、压缩、元数据分开选择；DNG 的位置移除限制 |
| [Adobe：色彩常见问题](https://helpx.adobe.com/lightroom-classic/desktop/technical-support/technical-issues/miscellaneous-issues/color-faq.html) | sRGB 用于普通网页用途的示例，不推广为所有输出标准    |
| [Fujifilm X-T5：存储卡](https://fujifilm-dsc.com/en/manual/x-t5/first_step/insert_card/)                                                        | 不中断写入与卡上原片处理风险                         |
| [Fujifilm X-T5：FORMAT](https://fujifilm-dsc.com/en/manual/x-t5/menu_setup/user_setting/)                                                       | 格式化包含受保护照片也会被移除，先保护重要文件       |

审查中还实际打开 Cambridge 光线、C4 两篇 Adobe、C3 两篇 DPS。C2 的 Photography Life 直接访问受限（402），iPhotography 返回 403；CISA 的候选 PDF 403，未纳入 C5 引用。这些失败不当作新的已验证记录。来源访问不等于对读者文件完成检查，具体引用范围见文章与本轮审查记录。

## 6. C6 与分享方案的本轮核对（2026-10-29）

本轮直接打开并读取 Adobe 的 [Develop 模块](https://helpx.adobe.com/lightroom-classic/desktop/help/applying-adjustments-develop-module-basic.html)、[影调与色彩](https://helpx.adobe.com/lightroom-classic/desktop/process-and-develop-photos/image-tone-color.html)、[裁切与拉直](https://helpx.adobe.com/lightroom-classic/desktop/help/crop-rotate-straighten.html)。分别支持 Lightroom Classic 保存编辑指令而不改原文件、呈现亮度与白平衡的操作区别，以及裁切边界／比例与旋转属于不同控制。软件专属行为未扩展为所有编辑器的保证；概念图不是实测变换或恢复效果承诺。

分享方案直接核对 [GitHub 静态发布](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)、[Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) 与 [Vercel Drop](https://vercel.com/changelog/vercel-drop)。这些材料支持可预先构建或手动上传，无须一律把私有开发仓库交给第三方读取；并不证明本站已部署。详见 [分享方案](SHARING_WITHOUT_GITHUB_ACCESS.md)。其他历史资源本轮未逐一重新访问，继续保留其各自核查状态。

## MVP Pages 发布依据（2026-10-30）

直接核对 GitHub 官方的 [账号站与项目站地址规则](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)、[配置发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)、[自定义发布工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 和 [deploy-pages v4 权限说明](https://github.com/actions/deploy-pages/tree/v4)。支持 MVP 项目子路径、手动 Actions 发布及必要权限，不证明本站已上线。当前域名未发生自定义域名跳转；将来改域名需重新核对继承规则。
