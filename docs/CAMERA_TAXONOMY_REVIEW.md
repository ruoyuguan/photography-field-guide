# 相机分类首批开发与验收

复核于 2026-11-06（Asia/Shanghai）。工作目录为 `/Users/ruoyu/photography-field-guide`。本轮起点是 `f43ccce36d4537d5e70379bdf76efd949c237a90`，`main` 跟踪 `origin/main`。恢复时保留了中断前的工作区改动及 stash `52b3bbdf14a8a57ea938a4db5763982927867118`。成果位于本地工作区。

## 首批范围

- 分类入口 `/cameras/` 用问题组织 16 个维度。记录介质、取景结构、镜头系统、画幅、传感器技术、传感器结构和彩色采样已有双语详情。
- 8 个双语词条增加简答、辨析、实例、参考资料和交叉链接。词典继续共用原集合，X-T5 档案展示七个独立维度。
- 取景教程用五幅原创 SVG 展示单反取景和曝光、双反、联动测距旁轴及数码无反。画幅工具用同一比例尺比较六种代表性记录区域。
- 英文默认。中文使用相同页面身份和 `/zh-cn/` 前缀。已有教程、练习和分类可通过 Learn 或 Explore 相互进入。

实际读取了用户任务说明、项目维护指南、状态、路线图、问题库、README、现有内容结构、双语路由和计算工具测试。完整的 16 维覆盖矩阵、15 项物理主题和 16 个候选相机型号见 [架构与覆盖计划](CAMERA_TAXONOMY_PLAN.md)。

## 复核发现

| 问题                                             | 处理与位置                                                                                                                                   |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 词典搜索把相关词隐藏后，站内链接跳到了不可见卡片 | `directory-filters.ts` 仅在目标受筛选阻挡时清除筛选，并显示、滚动和聚焦词条。浏览器覆盖 Full frame → APS-C 及返回。                          |
| 后台标签可能暂停词典重置所等待的绘制帧           | 重置后的结果更新放到浏览器恢复表单值后的任务中执行。浏览器覆盖缩写及双语别名的筛选和重置。                                                   |
| 分类和词条详情起初未进入 Learn 的搜索索引        | `MainLayout.astro` 允许分类、术语详情、器材详情和画幅工具明确进入现有索引。生产索引包括每种语言各 43 页，真实查询覆盖 DSLR、单反和取景光路。 |
| 深色页面继承黑色标题，分类卡片标题层级也有跳跃   | 分类、术语及器材详情设定两种主题的默认文字颜色。分类总览在维度问题下使用正确的子标题层级。                                                   |
| 已发表词条可通过校验后指向草稿词条               | `taxonomy-validation.ts` 拒绝无效的已发表关联，单测覆盖草稿和缺失目标。                                                                      |
| MILC 与 CFA 作为同义别名会混淆层级               | 无反词条解释 MILC 的可换镜头条件，X-Trans 词条将 CFA 用作通称。DSLR 的实时取景补上直接支持的厂商手册。                                       |
| 画幅图的蓝色虚线在实际页面消失                   | 比较图改用项目主题已定义的蓝色调。浏览器确认两条轮廓分别上色，并保留虚线样式。                                                               |
| 取景光路图的编号与图例显示不对应                 | 恢复文字图例的序号，供读者对应图内标记。浏览器核对列表样式，复查移动端截图。                                                                 |
| 隐藏标签页尝试播放切换动画时抛出异常             | Starlight 页在隐藏状态或启用减少动态效果时采用浏览器的普通导航。真实搜索导航复测通过。                                                       |

## 来源和模型边界

厂商规格按对应型号核查。CIPA 的出货分类用于说明固定与可换镜头这条轴。CCD 与 CMOS、器件结构及滤色排列分别引用传感器厂商技术资料和数据格式规范。胶片实例区分片材规格和记录区域，6×6 使用 GX680III 的选配遮幅框数据，4×5 采用施耐德技术资料中的代表性成像区域。公式用原始尺寸计算，展示时舍入。页面列出实际访问日期与来源。

- [CIPA 出货分类](https://cipa.jp/stats/documents/common/cr300.pdf) · [X-T5 规格](https://www.fujifilm-x.com/global/products/cameras/x-t5/specifications/) · [GFX100RF 规格](https://www.fujifilm-x.com/global/products/cameras/gfx100rf/specifications/)
- [Hamamatsu 传感器说明](https://hub.hamamatsu.com/us/en/technical-notes/image-sensors/advances-in-cmos-image-sensors.html) · [Khronos 色彩采样规范](https://registry.khronos.org/DataFormat/specs/1.4/dataformat.1.4.html) · [Nikon D780 实时取景手册](https://onlinemanual.nikonimglib.com/d780/en/04_basic_photography_and_playback_01.html)
- [富士 GX680III 规格](https://fujifilm.jp/personal/filmandcamera/filmcamera/mediumformat/gx680iii/specs.html) · [Schneider XENAR 厂商资料档案，第 2 页](https://www.pacificrimcamera.com/rl/02159/02159.pdf#page=2)

## 实测结果

Node 24.22.1 和 pnpm 10.34.9。生产配置分别测试根路径与 `/photography-field-guide`，最终 `dist/` 为根路径版本。

| 命令                                                                                                           | 实测结果                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:unit`                                                                                               | 98 项通过。覆盖六种预设的 36 对面积和图形比例、单位与非法输入，以及缺失、草稿和错配的分类关系。                                                                            |
| 两种 base 下的 `pnpm build`                                                                                    | 各生成 120 页。类型检查 0 errors、0 warnings、5 个既有 hints。                                                                                                             |
| 两种 base 下的 `pnpm test:smoke` 和 `pnpm test:build`                                                          | 各检查 120 个页面和 8 条缺失或已退休路径。产物链接、锚点、资源、语言元数据、sitemap 和搜索索引通过。                                                                       |
| 根路径的 `node scripts/check-lightweight-editing.mjs` 与 `node scripts/check-lightweight-editing-practice.mjs` | 现有双语轻量后期教程和任务产物检查通过。                                                                                                                                   |
| 根路径的 `PFG_BROWSER_SCOPE=taxonomy pnpm test:browser`                                                        | Chrome 156 通过。分类导航、双语切换、词典聚焦与返回、Pagefind 搜索、两种语言各 36 对画幅、键盘和可信触控、光路折叠、深色窄屏及无脚本回退均已实测。专项日志记录零页面异常。 |
| 根路径的 `pnpm test:browser`                                                                                   | 整站 Chrome 回归通过，涵盖既有计算器、C1–C6、受限存储、学习路径和新分类。日志记录零页面异常。                                                                              |
| `pnpm format:check` 和 `git diff --check`                                                                      | 通过。                                                                                                                                                                     |

较早的浏览器尝试记录了失败位置。最初的截图和点击等待依赖绘制帧，键盘尝试没有提交 macOS 原生菜单中的选项，触控原始接口也曾超时。最终使用原生下拉框键盘前缀查找，并核对触控收到 `isTrusted` 且类型为 `touch` 的事件。视口覆盖 1366 × 768、390 × 844、320 × 640 和 683 × 384。后者用于检查 200% 等效可用宽度。

| 页面                                                                                   | Chrome 截图                                                                                         |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `/cameras/` 英文分类总览，1366 × 768                                                   | [分类总览](audit-evidence/2026-11-06-camera-taxonomy/browser/taxonomy-en-1366x768.png)              |
| `/zh-cn/tools/format-comparison/` 深色移动端，390 × 844，M43 与 4×5 成像区域           | [画幅比较](audit-evidence/2026-11-06-camera-taxonomy/browser/format-comparison-zh-dark-390x844.png) |
| `/zh-cn/learn/sensor-lens/camera-viewfinding/` 深色移动端，390 × 844，单反正常光学取景 | [取景光路](audit-evidence/2026-11-06-camera-taxonomy/browser/optical-paths-zh-dark-390x844.png)     |

完整输出见 [分类专项日志](audit-evidence/2026-11-06-camera-taxonomy/browser-focused.log)和 [整站回归日志](audit-evidence/2026-11-06-camera-taxonomy/browser-full.log)。浏览器操作覆盖根路径。子路径验收包括生产构建、路由和产物检查。

## 本批与下一批

分类总览已经覆盖 16 维，首批选择 7 个维度写成独立详情。下一批按覆盖计划补其余维度的深度说明、更多型号实例与进阶物理主题。可先用 [读者试用指南](READER_TRIAL_GUIDE.md) 观察读者能否从规格标签找回分类依据。真实读者、实体手机和完整辅助技术审核另行记录。
