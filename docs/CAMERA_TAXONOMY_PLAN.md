# 相机分类与摄影基础：架构、覆盖清单与分批验收

日期：2026-11-05（Asia/Shanghai）。本文件承接用户本次《相机分类与摄影知识体系建设提示词》，记录内容架构和缺口，不把规划清单当作已交付百科，也不把历史报告中的通过结果当作本轮回归。

## 1. 首批审查基线与复用决定

唯一开发目录是 `/Users/ruoyu/photography-field-guide`。只读开始时，Git 工作区干净，分支 `main` 跟踪 `origin/main`；实际 HEAD 为 `f43ccce36d4537d5e70379bdf76efd949c237a90`（`docs: add Simplified Chinese README`）。这是首批开发前的基线。最新的发布与本地状态见 [当前项目状态](STATUS.md)。

已阅读 `AI_GUIDE.md`、`docs/STATUS.md`、`README.md`、`package.json`、`astro.config.mjs`、`docs/ROADMAP.md`、开发流程提示词、来源清单，以及对应内容集合、页面、计算模块和检查脚本。实际栈为 Astro 7、Starlight、Tailwind CSS 4 和 TypeScript；依赖精确版本以当前 lockfile 为准。本轮不升级依赖、不重建模板、不创建第二份项目副本。

| 现有模块   | 已看到的实现                                                                        | 本轮复用方式                                                           |
| ---------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Learn      | `src/content/docs/learn/` 与 `zh-cn/learn/`，46 份文档；既有7个侧栏分组             | 保留长文教学与现有 slug；光学结构教程放入合适的现有分组                |
| 术语       | `src/content/glossary/*.json`，34 条中英记录；`GlossaryView.astro` 支持双语别名过滤 | 以同一记录生成可链接的术语详情；不另外建立第二份概念定义               |
| 器材       | `cameras/fujifilm-x-t5.json`、镜头记录及共享 `GearDetailView.astro`                 | X-T5 分类关联回同一器材记录，规格不重复维护                            |
| 计算       | `src/utils/photography/crop-factor.ts`、原生输入与 SVG 工具                         | 复用对角线、几何与校验规则；新的画幅比较不改变原计算器默认值或现有进度 |
| 双语与部署 | `localePath()`、`MainLayout`、元数据工具、根路径与项目子路径                        | 新增路由仍为英文无前缀、中文 `/zh-cn/`；不另造语言系统                 |
| 来源       | `sourceReferenceSchema`、`SourceLinks.astro`、文章元数据                            | 继续记录 URL、标题、定位、核查日及支持的具体主张                       |
| 引用检查   | `src/utils/content-validation.ts` 检查文章、术语、型号引用及日期                    | 增补新实体的稳定 ID、引用、已发布目标与译文检查                        |
| 既有练习   | C1–C6 与两份既有存储                                                                | 完整保留；分类知识不新增账号、审美分数或第三份练习进度                 |

**最小方案：**新增一个 `/cameras/` 分类入口，先让16个组织维度有可读的简答、交叉关系与真实有效的后续入口；继续使用 Learn 承载深入原理、Glossary 承载词义、Gear 承载具体设备。维度不是互斥的商品树，“历史”“用途”“文件流程”也是知识组织轴，不能误写成16种互斥相机。

本轮只做首批可完整审阅的纵向实现；首批为来源充分的7个核心维度生成详情；另外9个维度保留可读总览，所有历史格式及其余设备档案分批扩展。没有正文时不生成占位路由、不展示失效入口。下文明确列出的首批路由是本轮实施范围，其他目标路径是后续设计；实际文件和通过结果由交付报告记录。

## 2. 关系模型与页面职责

- **Dimension（维度）：**新增 `taxonomyDimensions` 内容集合，数据位于 `src/content/taxonomy/*.json`，由 `taxonomyDimensionSchema` 验证。稳定 ID、顺序、中英名称、读者问题、范围与排除项、已发表术语关联、相关维度与有效教程入口共同回答“按什么标准描述”。
- **Concept（概念）：**继续使用 glossary 记录，增加可选 `dimensionIds`、`explanation`、`lastReviewed`、`exampleCameraIds`；中英名称、缩写放在原 term/aliases，避免把 CCD、CMOS、X-Trans 放进同一互斥枚举。
- **Camera（型号）：**继续以 `cameras` 集合为规格唯一来源；可选 `classifications` 关联保存稳定 `dimensionId`／`conceptId` 和中英值，来源支持具体断言。不推断未查到的传感器结构、快门实现或样片归属。
- **Technical attribute（属性）：**不是强制单选类别；同一相机可以具有多个快门模式，BSI 与 stacked 可以同时为真。未知用缺省或明确未知表达，不用 false 代替未核实。
- **Source（来源）：**保留既有来源字段；来源的“可打开”“身份正确”“支持某主张”是不同判断。不能仅复制搜索摘要就写为已核查。
- **Cross-reference（关系）：**术语—维度、术语—术语、型号—术语、文章—术语用稳定 ID。相关不是从属；仅在关系确实是子类时使用 parent。

| 路由                                     | 内容职责                                         | 设计状态                                                                                                                                  |
| ---------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/cameras/` 与 `/zh-cn/cameras/`         | 多维分类总览、展开简答、已存在条目的交叉导航     | 本轮首批                                                                                                                                  |
| `/glossary/`                             | 同一术语数据的中英／缩写检索                     | 既有，扩充入口                                                                                                                            |
| `/glossary/<id>/`                        | 可独立分享的概念说明、误区、例子、来源与反向关联 | 首批只为已发表且补齐深入解释的8个术语生成；不为其余旧词条制造薄页                                                                         |
| `/gear/fujifilm-x-t5/`                   | X-T5 既有规格、官方文档和分类关系                | 既有，首批衔接                                                                                                                            |
| `/learn/sensor-lens/camera-viewfinding/` | 分层解释取景与光学结构，配原创光路图             | 本轮示范教程                                                                                                                              |
| `/tools/format-comparison/`              | 两画幅按同一物理比例比较、面积与对角线比         | 本轮比较工具                                                                                                                              |
| `/cameras/<dimension-id>/`               | 单一维度分层说明，连接相关术语和型号             | 首批7维：recording-medium、optical-architecture、lens-system、format、sensor-technology、sensor-architecture、color-sampling；其余9维后续 |
| `/gear/<camera-id>/`                     | 新设备的多维实例档案                             | 后续逐个核查，不批量生成薄页                                                                                                              |

首批补齐的8个术语 ID 为 `slr`、`dslr`、`mirrorless`、`ccd`、`cmos`、`x-trans`、`fixed-lens`、`prime-lens`；其余34条既有记录继续正常检索，不强迫它们填写伪造的长解释。

不复制独立 Fundamentals 站点或第二套词典。初期用现有 Learn 分组连接物理主题；当多个完整长文形成清楚的阅读顺序后，再决定是否增设专题索引。

## 3. 全部16维度内容覆盖清单

状态含义：**既有**只表示本轮审查时读到了相应内容，不表示本轮重新验证了它的外部来源；**首批**表示本轮计划交付的定义／索引或示范功能，最终通过情况须另看实际报告；**待展开**表示用户范围被保留但尚无完整正文。每节均保留全部用户指定术语；“概述中提及”不等于完成详细百科。

### D01 · 记录介质与成像媒介（`recording-medium`）

**必须覆盖：**化学摄影、Film Photography、Digital Photography、Instant Photography、数码与即时成像混合系统、Daguerreotype、Wet Plate、Dry Plate、纸基感光摄影、Pinhole Photography 及其他实验记录方式。

**关系：**化学摄影不只限于柔性胶片；即时成像可以是化学记录，混合即时设备可先数码记录再打印。针孔描述光学成像方式，不决定记录介质。

**既有：**`digital-camera-works` 仅解释数码成像链，不覆盖化学工艺史。**首批：**总览区分记录／输出与光学结构。**待展开：**胶片、板基／纸基、即时与混合系统说明及历史证据；目标 `/cameras/recording-medium/`。交叉 D02、D12、D15、D16。

### D02 · 取景与光学结构（`optical-architecture`）

**必须覆盖：**SLR、DSLR、TLR、Rangefinder Camera（联动测距旁轴）、Mirrorless Camera、MILC、Optical Viewfinder、Electronic Viewfinder、Direct Optical Finder、Waist-Level Finder、View Camera／Technical Camera、Ground-Glass Focusing、Box Camera、Folding Camera、Pinhole Camera。

**关系：**SLR 可以用胶片或数码；DSLR 是数码单反。EVF、直视光学取景、腰平取景属于取景方式，箱式／折叠式也描述机身结构。相机有光学取景器不代表它是单反；旁轴式外观不证明有联动测距机构。数码无反常指现代产品类，MILC 更明确限定可换镜头；“微单”是中文市场用语。

**既有：**数码成像文章没有系统光路对照。**首批：**原创 SLR、TLR、联动旁轴与数码无反光路示范，入门说明与词义关联。**待展开：**座机毛玻璃、腰平、箱式、折叠与针孔的独立条目；目标 `/cameras/optical-architecture/`。交叉 D01、D03、D10。

### D03 · 镜头系统（`lens-system`）

**必须覆盖：**Fixed-Lens Camera、Interchangeable-Lens Camera、Prime Lens、Zoom Lens、Wide-Angle、Standard、Telephoto、Super-Telephoto、Macro、Fisheye、Tilt-Shift、Perspective-Control Lens、Anamorphic Lens、Pancake Lens、Cine Lens、Extender／Teleconverter、Optical Image Stabilization、不同卡口系统（含 XF／GF 的区别）。

**关系：**固定镜头是不可更换，定焦是固定焦距，固定焦点是对焦方式。变焦不等于改变机位导致的透视变化。卡口机械／电子兼容性与成像圈覆盖分开；XF、GF 是各自系统的产品命名，不是所有镜头的通用光学类别。

**既有：**焦距、景深、透视及 XF16–50 规格。**首批：**固定／可换与定焦／变焦的二维辨析。**待展开：**特殊镜头、各卡口兼容边界、增倍镜与稳定系统；目标 `/cameras/lens-system/`。交叉 D04、D09、D11。

### D04 · 画幅与感光尺寸（`format`）

**数码范围：**手机及小型规格、1/2.3-type、1/1.3-type、1-type、Micro Four Thirds、APS-C、APS-H、Full Frame、44×33 类数码中画幅、更大数码中画幅。

**胶片范围：**110、126、127、135、Half-Frame 35mm、传统35mm标准画幅、APS／IX240、120、220、645、6×6、6×7、6×9、6×12、6×17、4×5英寸、5×7英寸、8×10英寸及其他典型大画幅。

**关系：**135／120／220 是胶片系统或卷片规格名称，不能把数字直接当曝光宽度。120 能用于多种画框；220 与120的片长／背纸安排不同，不自动决定不同画幅。“全画幅”以传统36×24mm为参考，较大格式并不矛盾。数码中画幅不是一个固定尺寸，也不自动等于所有120画框。光学格式的 type 命名不表示传感器宽／高／对角线等于标称英寸。

**既有：**36×24、代表 APS-C 与 X-T5 的精确尺寸；等效计算及同机位条件。**首批：**M43、APS-C、全画幅、数码中画幅、代表120画框与4×5级画框的两两同尺度对照，显示尺寸、面积、长宽比、面积比、35mm对角线系数；按来源标注代表尺寸／曝光范围与名义格式的区别。**待展开：**全部小型／历史格式逐项核查和说明；目标 `/cameras/format/`。交叉 D01、D03、D05、D16。

### D05 · 传感器基础技术（`sensor-technology`）

**必须覆盖：**CCD、CMOS、EMCCD、sCMOS、ICCD、特殊科研 CCD／CMOS、红外探测器、InGaAs、热成像探测器。

**关系：**CCD／CMOS 描述技术实现，不是外观或复古画风等级；EMCCD、ICCD、sCMOS 需说明具体噪声／增益／读出语境。InGaAs 是材料体系，热成像也不是某一种通用 CCD。中文“CCD”常代指老式数码便携机，只能作为语用解释，不能替代定义。

**既有：**通用 sensor 术语、ISO／噪声入门；无系统 CCD／CMOS 辨析。**首批：**CCD、CMOS 的概念定义与误区，关联已核实 X-T5。**待展开：**电荷／信号读出概念图、科学探测器；目标 `/cameras/sensor-technology/`。交叉 D06、D07、D14。

### D06 · 传感器结构（`sensor-architecture`）

**必须覆盖：**FSI、BSI、Stacked、Global Shutter、Rolling Shutter、Pixel Architecture、Readout Architecture、Pixel Binning、Dual Conversion Gain。

**关系：**基础半导体技术、入光结构、层叠集成与曝光／读出时序分别描述。BSI 与 stacked 可以共存；stacked 不保证 global shutter；全局曝光也不意味着整帧数字数据瞬间传出。Pixel binning 区分电荷域／模拟域／数字合并，不能统一宣称增加动态范围。

**既有：**快门文章提及分行读出。**首批：**总览明确各轴不能互斥排列。**待展开：**结构图、增益与合并条件、时序细节；目标 `/cameras/sensor-architecture/`。交叉 D05、D07、D08。

### D07 · 彩色采样与滤色阵列（`color-sampling`）

**必须覆盖：**Bayer CFA、X-Trans CFA、Quad Bayer、Foveon X3、Monochrome Sensor、Color Filter Array、Demosaicing、Multi-Spectral Filter Array。

**关系：**X-Trans 是彩色滤阵设计，可以用于 CMOS；Foveon X3 利用深度方向的采样方式，不能称为普通平面 Bayer 阵列。单色、彩色阵列与多光谱取样说明各自边界，不能把重建算法等同于硬件阵列。

**既有：**数码成像链概述彩色重建；胶片模拟文章不等于 CFA 教程。**首批：**X-Trans 与 CMOS 的跨维关系。**待展开：**各采样结构、去马赛克与输出条件；目标 `/cameras/color-sampling/`。交叉 D05、D06、D15。

### D08 · 快门系统（`shutter`）

**必须覆盖：**Mechanical Shutter、Electronic Shutter、Focal-Plane Shutter、Leaf Shutter、Electronic Front-Curtain Shutter、Rolling Shutter、Global Shutter、Bulb、Flash Synchronization、Shutter Shock、Rolling-Shutter Distortion。

**关系：**机械结构、模式和曝光时序不互斥；机械帘幕在较高速度下也可能逐行形成曝光时差。B门描述持续控制方式，不是另一种传感器。闪光同步与具体模式／帘幕／读出限制相关。

**既有：**`shutter-speed` 的曝光时间、运动模糊、抖动与滚动伪影辨析。**首批：**总览交叉引用既有正文。**待展开：**机械／电子时序图、叶片／焦平面／前帘与闪光边界；目标 `/cameras/shutter/`。交叉 D06、D11。

### D09 · 对焦系统（`focusing`）

**必须覆盖：**Fixed Focus、Zone Focus、Manual Focus、Autofocus、Contrast-Detection AF、Phase-Detection AF、Hybrid AF、Single AF、Continuous AF、Tracking AF、Face／Eye Detection、Focus Peaking、Depth of Field、Hyperfocal Distance。

**关系：**操作方法、测量原理、连续控制、主体识别与辅助显示分开。固定焦距不表示固定焦点；景深与超焦距需声明容许弥散圈及观看条件，不承诺所有像素都一样锐利。

**既有：**autofocus、AF-S／AF-C／手动／区域、景深教程；未见完整超焦距推导。**首批：**索引既有文章并澄清分类层次。**待展开：**固定／区域对焦、测距原理与超焦距模型；目标 `/cameras/focusing/`。交叉 D02、D03。

### D10 · 机身与产品形态（`form-factor`）

**必须覆盖：**Compact Camera、Point-and-Shoot Camera、Premium Compact Camera、Bridge Camera、System Camera、Modular Camera、Medium Format Body、Large Format Field Camera、Technical Camera、Action Camera、Pocket Gimbal Camera、Smartphone Camera、360-Degree Camera、Instant Camera、Body Camera、Drone Camera。

**关系：**形态、使用场景与市场定位存在交叉；便携／桥式／高端不是画质等级。中画幅机身也须另查格式；instant 有时描述输出流程。

**既有：**尚无系统条目。**首批：**总览定义范围及避免质量排名。**待展开：**各产品形态与代表设备；目标 `/cameras/form-factor/`。交叉 D01、D04、D13、D14。

### D11 · 控制、曝光与稳定（`exposure-control`）

**必须覆盖：**Mechanical Camera、Electronically Controlled Camera、Manual Exposure、Aperture Priority、Shutter Priority、Program AE、Auto Exposure、ISO、Exposure Compensation、Metering Modes、White Balance、Dynamic Range、In-Body Image Stabilization、Lens Stabilization、Exposure Bracketing。

**关系：**机身控制依赖、拍摄模式、测光、图像渲染和稳定是不同功能。胶片相机也可以电子控制；手动曝光不等于纯机械相机。防抖只补偿可处理范围内的相机运动，不冻结主体。

**既有：**P/A/S/M、补偿、测光、ISO、白平衡、IBIS及抖动。**首批：**关联已有术语／教程。**待展开：**控制依赖、动态范围、包围与稳定测试条件；目标 `/cameras/exposure-control/`。交叉 D01、D08、D15。

### D12 · 胶片与化学工艺（`film-process`）

**必须覆盖：**Black-and-White Negative、Color Negative、Color Reversal、Black-and-White Reversal、Instant Film、Motion Picture Film、C-41、E-6、ECN-2、黑白冲洗、Film ISO、Film Grain、Film Scanning。

**关系：**片基／尺寸、感光材料、正负像与冲洗工艺分别说明。不同材料不能仅凭“彩色胶片”交换处理流程；电影胶片涉及具体涂层和工艺。首批不提供化学操作配方。

**既有：**胶片模拟文章明确不等同真实胶片，但未讲化学流程。**首批：**总览区分真实记录工艺与数字风格。**待展开：**材料和厂商工艺文档核实；目标 `/cameras/film-process/`。交叉 D01、D04、D15。

### D13 · 用途与专业领域（`applications`）

**必须覆盖：**Documentary Photography、Street Photography、Landscape Photography、Portrait Photography、Architecture Photography、Wildlife Photography、Sports Photography、Commercial Photography、Fashion Photography、Scientific Imaging、Astrophotography、Microscopy、Machine Vision、Surveillance、Aerial Photography、Cinematography。

**关系：**用途不是互斥机身分类，也不是品牌用途承诺；同一器材可用于多个题材。能力取决于成像条件与整个系统。

**既有：**街区故事、构图、光线实拍任务，不能算全部领域已覆盖。**首批：**导向已有实践。**待展开：**按真实读者需要形成用途说明；目标 `/cameras/applications/`。交叉 D03、D10、D14。

### D14 · 特殊成像（`specialized-imaging`）

**必须覆盖：**Panoramic Camera、Stereoscopic Camera、Light-Field Camera、Infrared Camera、Thermal Camera、Ultraviolet Camera、Multispectral Camera、Hyperspectral Camera、Time-of-Flight Camera、Depth Camera、Event Camera、Line-Scan Camera、TDI Camera、High-Speed Camera、X-ray Camera、Gated Camera、Photon-Counting Camera。

**关系：**波段、空间／时间采样、深度测量与探测器工作机制可交叉；红外反射摄影不等于热成像，事件流不等于固定帧率视频。此处只承诺准确入口及适当定义，科研操作教程不纳入大众摄影首批。

**既有：**无独立条目。**首批：**总览标示边界。**待展开：**逐项查科研机构、厂家技术文档或原始论文；目标 `/cameras/specialized-imaging/`。交叉 D05、D06、D13。

### D15 · 文件与后期（`workflow`）

**必须覆盖：**RAW、DNG、JPEG、HEIF／HEIC、TIFF、Lossless／Lossy Compression、Image Metadata／EXIF、Color Space、Color Profile、White Balance、Film Simulation、LUT、Log Video、Film Scanning、Digital Darkroom、Computational Photography。

**关系：**RAW 可以有不同压缩方式，不能由文件名推断整体无损；HEIF是容器体系，HEIC的用法须说明编码关系；胶片模拟是渲染方法，LUT是映射，Log是编码／传递曲线语境。它们不描述取景光路。

**既有：**RAW／JPEG／HEIF／EXIF、白平衡、胶片模拟／配方／LUT、备份导出、轻量后期与C5／C6。**首批：**接回既有学习闭环。**待展开：**DNG、TIFF、压缩、色彩空间／配置、Log、扫描与计算摄影；目标 `/cameras/workflow/`。交叉 D01、D07、D12。

### D16 · 系统与历史（`history`）

**必须覆盖：**大画幅与120／135系统的发展、胶片单反兴起、旁轴发展、自动曝光与自动对焦、早期数码／CCD、CMOS发展、DSLR到现代无反、数码中画幅、手机计算摄影。

**关系：**不是所有系统沿一条“旧技术被新技术完全取代”的直线演进；不同历史路线共存。首次商业化、专利、实验原型与流行时间不能混为一个“发明日期”。

**既有：**个别文章背景句，不是完整历史模块。**首批：**总览提示术语历史来源。**待展开：**以博物馆、档案、厂商原始手册和可追踪史料建立时间线；目标 `/cameras/history/`。交叉 D01、D02、D04、D05、D15。

## 4. 15项物理基础的复用与缺口

| 主题                        | 已有实际正文／计算                                  | 本轮与后续边界                                              |
| --------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| 1. 焦距与视角               | `equivalent-focal-length`；`calculateAngleOfView()` | 复用；说明直线投影／远场模型与轴向                          |
| 2. 光圈与 F-number          | `aperture`；f-number术语                            | 复用入瞳与焦距定义；透射 T 值后续另核                       |
| 3. 曝光、光圈、快门、ISO    | `exposure-triangle`及各篇独立正文                   | 复用；ISO不增加入射光子                                     |
| 4. EV                       | exposure-stops及计算器提供档位关系                  | EV定义与EV100需分开，后续补完整变量和ISO条件                |
| 5. 景深与超焦距             | `depth-of-field`提供条件辨析                        | 超焦距公式／容许弥散圈与极限待补，不假定已有计算器          |
| 6. 等效焦距与裁切系数       | `crop-factor.ts` 与既有工具                         | 复用；不同长宽比不保证水平和垂直视角同时匹配                |
| 7. 传感器面积               | `sensor-formats`静态比较                            | 首批比较工具显示 A=w×h、单位mm²、面积比与对角线系数         |
| 8. 像素数量与间距           | photosite与输出pixel的区别                          | 量化像素间距、有效区域和排列假设待补                        |
| 9. 信噪比与光子散粒噪声     | ISO／image-noise入门                                | Poisson近似、√N及读出噪声组合待补，注明电子数／光子数和效率 |
| 10. 动态范围与量化深度      | ISO／高光余量背景                                   | DR定义、饱和／噪声阈值、位深区别待补，不能等同              |
| 11. 衍射、Airy Disk、解析力 | 未有完整正文                                        | 待核波长、F数、理想圆孔、焦平面与输出条件                   |
| 12. MTF                     | 未有完整正文                                        | 待核空间频率、对比度、方向、光圈和实测／设计图区别          |
| 13. 曝光时间与运动模糊      | `shutter-speed`                                     | 复用；后续模型需主体速度、方向、距离与倍率                  |
| 14. 机械／电子快门时序      | 数码成像与快门篇定性说明                            | 后续独立时序图，曝光长度与整帧扫描时间分开                  |
| 15. 防抖原理与局限          | IBIS、camera-shake、快门教程                        | 复用相机运动／主体运动区别；级数与测试条件待补              |

所有新公式必须同时给变量、量纲、条件、例子与适用边界。数值在计算模块保持原精度，界面只做显示舍入；不能从显示结果反推新的计算。几何矩形使用同一 mm→SVG 比例，不能分别充满各自画框造成尺寸误导。

## 5. 全部16个真实型号的案例计划

**已有型号事实与本轮新增分类分开复核。**X-T5 在首批已有档案。GFX100RF 和 D200 已完成第二批档案。Pentax 17 已有胶片半格案例与对照。其余型号的用途列为核查目标，待补足可靠来源后再生成档案。

| 型号                     | 计划用于说明的交叉关系                                     | 状态与核查门槛                                                          |
| ------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Fujifilm X-T5            | 数码、无反、可换镜头、APS-C、CMOS、X-Trans、机械／电子模式 | 既有 `/gear/fujifilm-x-t5/`；本轮逐条补分类证据，不以旧来源日期冒充复核 |
| Fujifilm GFX100S II      | 数码中画幅、无反、GF可换镜头系统                           | 待核官方产品规格及手册                                                  |
| Fujifilm GFX100 II       | 大于全画幅的数码格式与系统关系                             | 待核，不能与S II合并规格                                                |
| Fujifilm GFX100RF        | 数码中画幅与固定镜头可以共存                               | 第二批 `/gear/fujifilm-gfx100rf/`，依据富士产品规格和手册               |
| Canon EOS 5D Mark IV     | DSLR、全画幅、CMOS与可换镜头                               | 待核官方规格／手册                                                      |
| Nikon FM2                | 胶片SLR与机械控制语境                                      | 待核版本、测光电源与机械功能边界                                        |
| Nikon D200               | 数码SLR与CCD，不等于卡片外形                               | 第二批 `/gear/nikon-d200/`，依据尼康说明书和产品档案                    |
| Leica M6                 | 胶片、可换镜头、联动测距旁轴                               | 待核具体版本，避免跨年份拼接                                            |
| Rolleiflex代表双反型号   | 双镜头取景／拍摄光路与120格式                              | 先选一个有可靠手册的明确型号，禁止“Rolleiflex通用规格”                  |
| Ricoh GR III             | 数码、APS-C、固定镜头与定焦                                | 待核官方规格及对焦能力                                                  |
| Sony RX100 VII           | 固定镜头与变焦、1-type标签                                 | 待核实际尺寸、规格命名和镜头范围                                        |
| Pentax 17                | 胶片半格与APS-C数码不是同义词                              | 本地 `/gear/pentax-17/`，依据理光规格、特性页和 FAQ                     |
| Fujifilm Instax mini 99  | 化学即时成像记录流程                                       | 待核官方手册和输出／取景关系                                            |
| Fujifilm Instax mini Evo | 数码捕获与即时打印混合                                     | 待核捕获、存储和打印分别使用什么介质                                    |
| Canon IXUS 70            | 旧式便携数码、CCD与产品俗称                                | 待核地区别名、型号一致性及原手册                                        |
| DJI Osmo Action 5 Pro    | 运动相机形态与传感器／输出属性                             | 待核官方规格；不把用途当作单一技术类别                                  |

每个档案至少有一条直接支持其多维归属的可靠来源，来源不足时保留未知。新增型号可以先仅发表简短但完整的分类档案，无需伪装成实际评测；原厂样片默认只提供链接，转载许可另核。

## 6. 首批施工与后续次序

1. **审查与建模（本轮）：**完成本文件覆盖清单，保留16维全部范围；锁定已存在与待核查项，检查实际 HEAD／stash与并行改动。
2. **首批纵向实现（本轮）：**16维分类入口、7个核心维度详情、8个新术语的词典详情、X-T5关系、光路示范教程、两画幅比较。每个页面都有简答、可操作入口与来源，不创建空的16套子站。
3. **第二批：**先用 GFX100RF、D200 和 X-T5 的四维对照连接取景结构、镜头系统、画幅与传感器技术。固定焦点与色彩采样按读者问题继续补充。
4. **第三批：**先做 Pentax 17 半格案例与数码 APS-C 同尺度对照。其他胶片／数码格式、即时混合流程和历史按已核实来源逐项展开。
5. **第四批：**按明确问题补科学成像与进阶物理。各主题独立成可读文章；保留范围边界，不宣称有限清单囊括所有摄影设备。
6. **持续复盘：**继续既有读者试用计划，记录读者是否能解释一台设备同时落在多个维度、能否找到相应来源和返回既有练习。自动浏览器检查不等于读者试用。

## 7. 工程风险与验收门槛

| 风险                     | 已定位处                                          | 必须验证的行为                                                                              |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 新页未进入显式清单       | `scripts/check-build.mjs`、`scripts/smoke.mjs`    | 新的双语路由进入检查；仍检查全部原页面和退休路径，不能只改总数放行                          |
| 词条数量变化令旧断言失真 | `scripts/browser-directory-checks.mjs` 原34条断言 | 使用本轮已发表数或明确预期；别名检索、清空复原都实际验证                                    |
| 分类变第二份词典         | `content-schema.ts`与新增维度数据                 | 定义只存在于原glossary；关联字段只保存ID，重复／缺失引用构建失败                            |
| 旧可选字段阻断既有内容   | `glossarySchema`、`cameraSchema`                  | 渐进扩展并给旧数据合理默认，不要求旧34词一次补伪造长文                                      |
| 已发表关系指向草稿       | `content-validation.ts`                           | 只生成已发表路由；已发表实体不静默指向不存在或未发表概念                                    |
| 语言或子路径漂移         | `localePath()`、`alternatePaths()`、metadata      | 深层词条／分类／工具切换保持语义对应；根路径和base均核对canonical、hreflang、静态资源与锚点 |
| SVG比例错误              | 比较工具的几何模块与原创图解                      | 物理比例、面积、对角线单位与极值有数值测试；机械光路图不冒充精密工程尺寸                    |
| 过滤后锚点被隐藏         | `GlossaryView.astro`与目录过滤                    | 术语独立页可分享；相关词是链接，不能只是不可操作的文字串                                    |
| 拓展破坏既有练习         | shared catalog与存储控制器                        | 本轮不改C1–C6数据及存储；必要浏览器回归确认返回／继续和存储仍工作                           |
| 来源日期虚假             | 来源字段与文档                                    | 只有实际打开阅读才更新核查日；未核链接保留待核，不让来源数量替代主张匹配                    |

**内容检查：**双语核心事实一致；16维索引不混淆从属和相关；每个首批定义有简答、误区与例子；每个新增数值的来源／单位／名义范围明确；型号属性不能由系列名猜测。

**计算检查：**面积、比值、对角线、比例反转、同格式比较、不同长宽比、非法输入或坏ID、显示舍入；保留既有crop-factor和exposure-stops回归。

**浏览器检查：**英文与中文、原生键盘、390px窄屏与桌面、深／浅色、减少动画、200%等效视口、无JavaScript、选择后结果同步、深层语言切换、搜索与返回。页面能读和控件能点须分别验收；SVG标题／描述、表单标签、结果文本不依赖颜色。

**命令检查：**按实际变更执行格式、单测、类型／构建、smoke、产物检查；生产base后恢复日常根路径产物。必要时添加专用浏览器检查并接入默认套件。只将实际运行通过的项目写为通过，失败与未执行分别列出。

本计划不证明本轮任何测试已经通过，也不证明网站已经部署。首批最终范围、页面清单、命令和截图对应的真实视口需由最终验收记录给出。

## 8. 内容维护操作

**新增术语：**先查现有ID和别名，复用同一概念；在glossary集合补齐中英名称／别名／定义／误区／例子／来源，添加有效关联，再确认详情页生成与双语检索。若只是营销别称，写入aliases并解释语境，不能建立伪科学类型。

**新增维度：**先判断是否已有组织轴，写清分类依据与不包含什么；使用稳定ID、中英名称、排序、相关维度及已有条目ID。若维度只给出待展开计划，不能生成没有可读正文的独立页。

**新增型号：**优先原厂规格和手册，记录准确名称／版本／地区别名；数据存入cameras集合，分类引用现有概念。机型名、传感器尺寸和快门模式必须来自同一可辨认版本；图片只做外链或明确授权素材。

**维护译文：**稳定ID和关系共用；事实、公式、单位和限定条件相同，措辞可符合各语言习惯。英文默认不变；先补对应译文再发表，不能让中文语言切换跳回首页掩盖缺页。

**新增来源：**记录标题、机构、URL、章节、实际阅读日期与支持的主张。外链失效不等于原结论立刻错误；保留原引用，补替代证据或降低发表状态，不能默默改成无关产品页面。

**更新产品：**检查的是旧型号还是后继型号；保留历史产品的身份，不把新机规格覆盖到旧ID。将稳定物理概念与不断变化的机型事实分开，更新来源日期时说明实际复核范围。

**交付与复盘：**更新STATUS和本轮验收记录，保留历史失败与证据；记录已完成、待展开及未验证项。提交、推送、公开、部署和个人主页改动均不包含在这次本地内容施工中。
