import type { PracticeMission } from '../practice.ts';

export const backupAndExportMission: PracticeMission = {
  id: 'backup-and-export',
  number: 5,
  version: 1,
  visual: 'backup',
  nextId: 'lightweight-editing',
  articlePath: '/learn/workflow/backup-and-export/',
  copy: {
    en: {
      metaTitle: 'Keep photo originals, check a backup, and export a copy',
      metaDescription:
        'Retain the complete original shoot, check an independent backup, and inspect a purpose-specific export locally without uploading or deleting photographs.',
      title: 'Keep originals, export a copy',
      lessonTitle: 'Safe Backup and Export',
      intro:
        'Carry a selection from the review task into a local delivery copy, while keeping the complete original shoot available.',
      duration: 'About 25 minutes, plus copying time',
      goal: 'Distinguish the complete original set, an independent backup, and a selected export; check recovery and inspect the exported file before sharing.',
      equipment: [
        'One small shoot and one to three selected photographs; the photo-review mission is an optional starting point',
        'A trusted local viewer or editor, and separate physical storage for an actual independent backup',
        'If separate storage is unavailable, read and plan the backup step; leave actions you have not done unmarked',
      ],
      prerequisites:
        'No particular camera, RAW format, paid editor, account, or earlier mission is required. Use the originals you actually captured, including camera JPEGs when those are your originals.',
      prediction: {
        title: 'Before you make the delivery copy',
        question:
          'You have selected three photographs from a shoot. Which workflow preserves the option to revisit the full shoot and check a file for its intended audience?',
        choices: [
          {
            id: 'retain-backup-export-inspect',
            label:
              'Retain the complete originals, check an independent backup and a sample recovery, then export selected copies separately and inspect their image and metadata locally.',
            explanation:
              'For this goal, retaining the whole shoot keeps future selections possible, separate storage supports recovery from working-drive loss, and inspecting the actual export checks what the audience would receive. A recovered sample tests part of the backup, so note what remains unchecked; a task mark does not certify your files.',
          },
          {
            id: 'export-replaces-originals',
            label:
              'Back up only the C4 shortlisted export JPEGs, leaving the other original files on the working drive alone.',
            explanation:
              'This choice protects the shortlist instead of the complete capture set. The other originals still have only one working-drive copy; an export may also omit capture data, especially when made from RAW. Back up the retained originals, then treat the selected JPEGs as separate delivery copies.',
          },
          {
            id: 'sync-proves-recovery',
            label:
              'Copy originals into another folder on the working drive and sync it; mark backup complete without checking retention or recovery.',
            explanation:
              'This choice treats another folder and completed sync as recovery evidence. A same-drive folder shares that drive’s failure, and sync may propagate deletion. A service may offer retention or recovery, but you need to check its coverage and restore behavior rather than infer them from a visible file or sync status.',
          },
        ],
        correctChoiceId: 'retain-backup-export-inspect',
        hint: 'Ask what survives if the working drive fails, what happens if a deletion synchronizes, and whether the exported file still contains the original capture data.',
        correct:
          'The original set supports future choices, a separate backup supports recovery, and the export serves one delivery purpose. Each needs its own check.',
        incorrect:
          'Backing up only selected exports leaves the remaining originals unprotected and may omit RAW data. A same-drive folder shares drive failure, while sync needs checked retention and recovery; neither visibility nor sync completion establishes a recoverable backup.',
        explanation:
          'Selection is a reversible editorial decision; it does not define which originals remain protected. Preserve the complete small shoot during this exercise, including RAW plus JPEG if both were captured. A separate backup must be usable for recovery, rather than merely visible in a synced gallery or another folder on the same device. An exported derivative serves a stated use and may change pixels, rendering, compression, and metadata. Reopen and inspect it locally. A successful sample recovery is useful evidence, but does not certify every file or remove every risk. This website cannot verify your files or authorize erasing a card.',
      },
      observation: {
        heading: '2 · Check the local workflow',
        title: 'Protect the full shoot, then prepare a selected copy',
        intro:
          'Work in your own trusted local software. The diagram explains file roles; it does not copy, inspect, upload, or delete anything.',
        modelTitle: 'One original set, two different purposes',
        modelNote:
          'Original process diagram, not a file manager or a backup-status display. Expanding a scenario or checking a task box does not verify any photograph.',
        steps: [
          {
            id: 'retain-and-check-backup',
            title: 'Retain the complete shoot and check recovery',
            detail:
              'Copy rather than move the originals, keeping the card or source intact. Include all captured formats, not only the C4 shortlist. Make a backup on separate physical storage, check coverage, and recover a representative sample into a separate folder without overwriting working files. Open that recovered sample in compatible software. Sample checks do not prove every file is intact; do not delete or format anything for this task.',
          },
          {
            id: 'export-for-purpose',
            title: 'Export a selected copy for one purpose',
            detail:
              'Choose one to three reviewed photographs and state a use such as an ordinary web preview. Export into a separate destination. JPEG with sRGB is one web example when supported; choose pixel dimensions and compression for the actual destination. PPI alone does not set on-screen pixel dimensions. Keep the originals and their backup unchanged.',
          },
          {
            id: 'inspect-export-locally',
            title: 'Inspect the actual exported file locally',
            detail:
              'Open the exported file, rather than only the editor preview. Check orientation, crop, readable detail, pixel dimensions, and rendering. Inspect metadata with a trusted local tool and review location, names, contact details, and visible identifiers in the image or filename. If the tool cannot verify a field, leave it unknown and investigate before sharing. No upload is required.',
          },
        ],
        checklist: [
          'Does the retained original set include unselected frames and each format you captured, rather than only the delivery copies?',
          'Can you recover a checked sample from separate storage, and what does that sample leave untested?',
          'Does the actual exported file serve the chosen use, and what identifying information remains in its pixels, name, or metadata?',
        ],
      },
      reflection: {
        title: 'Record only the checks you actually made',
        intro:
          'These are your own observations. The website does not certify a backup, inspect metadata, or decide that sharing is safe.',
        checks: [
          {
            id: 'originals-and-recovery',
            label:
              'I retained the complete original set, checked a separate backup and sample recovery, and can state what that sample did not test.',
          },
          {
            id: 'purposeful-export',
            label:
              'I made a separate selected export and can explain its intended use and pixel dimensions without treating it as an original-file backup.',
          },
          {
            id: 'export-privacy-review',
            label:
              'I inspected the actual export locally and checked identifying image content, filename, and metadata; any unresolved field remains unknown.',
          },
        ],
        note: 'Leave unfinished checks unmarked and return when ready. Completion records your own learning activity; it is not a backup guarantee or permission to delete, format, or publish.',
      },
    },
    'zh-cn': {
      metaTitle: '保留照片原片、检查备份并导出副本',
      metaDescription:
        '保留完整拍摄原片，检查独立备份，再在本地检查符合用途的导出文件；无需上传或删除照片。',
      title: '保留原片，导出副本',
      lessonTitle: '安全备份与导出',
      intro:
        '把复盘任务中的候选照片变成符合用途的本地交付副本，同时保留完整拍摄原片。',
      duration: '约 25 分钟，另加复制时间',
      goal: '区分完整原片、独立备份与入选照片的导出副本；检查恢复，并在分享前检查实际导出文件。',
      equipment: [
        '一次小规模拍摄与其中一至三张入选照片；可从照片筛选与复盘任务接续',
        '可信的本地查看器或编辑器；实际独立备份还需要分开的物理存储设备',
        '暂时没有独立存储时，可以阅读并规划备份步骤；没有实际完成的操作先不勾选',
      ],
      prerequisites:
        '不要求特定相机、RAW 格式、付费编辑器、账号或先完成其他任务。保留实际拍到的原文件；如果只拍了相机 JPEG，它们就是需要保护的原片。',
      prediction: {
        title: '制作交付副本之前',
        question:
          '你从一次拍摄中选出了三张照片。哪套流程既保留重新查看完整拍摄的可能，也能针对接收者检查交付文件？',
        choices: [
          {
            id: 'retain-backup-export-inspect',
            label:
              '保留完整原片，检查独立备份并抽样恢复，再将入选照片单独导出，在本地检查画面与元数据。',
            explanation:
              '针对本题目标，保留完整拍摄让日后仍能重新选择，分开的存储支持工作盘丢失后的恢复，检查实际导出则核对接收者将看到什么。恢复样本只检查了备份的一部分，应记下未覆盖之处；任务标记不认证文件可靠。',
          },
          {
            id: 'export-replaces-originals',
            label:
              '只备份 C4 精选照片的导出 JPEG，其他原文件仍只放在工作盘上。',
            explanation:
              '这个选项保护的是精选交付文件，而非完整拍摄集。其余原片仍只有工作盘上的一份；导出还可能遗漏拍摄数据，尤其是从 RAW 生成时。应备份保留的原片，再把精选 JPEG 作为单独的交付副本。',
          },
          {
            id: 'sync-proves-recovery',
            label:
              '把原片复制到工作盘上的另一个文件夹并同步，不检查保留策略或恢复，就标记备份完成。',
            explanation:
              '这个选项把另一个文件夹和同步完成当成了恢复证据。同盘文件夹共享硬盘故障风险，同步又可能传播删除。服务也许提供保留或恢复功能，但需要核查覆盖范围与实际恢复行为，不能从看见文件或同步状态推断出来。',
          },
        ],
        correctChoiceId: 'retain-backup-export-inspect',
        hint: '想一想：工作盘损坏后还剩什么？删除操作同步后会怎样？导出文件是否仍包含原始拍摄数据？',
        correct:
          '完整原片支持日后重新选择，独立备份支持恢复，导出文件服务某次交付；三者分别需要检查。',
        incorrect:
          '只备份精选导出文件，会漏掉其余原片，也可能遗漏 RAW 数据。同盘文件夹共享硬盘故障风险，同步则仍需核查保留策略与恢复；看见文件或同步完成，都不能说明备份已经可恢复。',
        explanation:
          '筛选是可撤销的编辑决定，不决定哪些原文件仍应得到保护。本练习保留整次小规模拍摄；如果拍了 RAW 加 JPEG，两者都保留。独立备份需要能用于恢复，不能只是在同步相册或同一设备的另一文件夹里看见文件。导出副本服务明确用途，像素、呈现、压缩和元数据都可能变化，应在本地重新打开检查。成功恢复一个样本提供了有用证据，但不证明每个文件都完整，也不消除所有风险。本站不能检查你的文件，更不能据此确认可以清空存储卡。',
      },
      observation: {
        heading: '2 · 检查本地工作流',
        title: '先保护完整拍摄，再准备入选副本',
        intro:
          '在自己信任的本地软件中操作。图示解释文件的职责，不会复制、检查、上传或删除任何文件。',
        modelTitle: '一套原片，两种不同用途',
        modelNote:
          '原创流程图，不是文件管理器或备份状态显示。展开情境或勾选任务，都不表示已经验证任何照片。',
        steps: [
          {
            id: 'retain-and-check-backup',
            title: '保留完整拍摄，并检查恢复',
            detail:
              '复制而非移动原片，保留卡或来源不变。包含全部实际拍摄格式，而非只保存 C4 候选。在分开的物理存储设备上建立备份，检查覆盖范围，再把代表性样本恢复到另一个文件夹，不覆盖工作文件。用兼容软件打开恢复的样本。抽样不证明所有文件都完整；不要为完成本任务删除或格式化任何内容。',
          },
          {
            id: 'export-for-purpose',
            title: '为一种用途导出入选副本',
            detail:
              '选择复盘后的一至三张照片，说明一种用途，例如普通网页预览。导出到单独的位置。软件支持时，JPEG 配合 sRGB 是一种网页示例；像素尺寸与压缩应符合实际接收要求。PPI 数字本身不决定屏幕上的像素尺寸。保留原片与其备份不变。',
          },
          {
            id: 'inspect-export-locally',
            title: '在本地检查实际导出文件',
            detail:
              '打开实际导出文件，不只看编辑器预览。检查方向、裁切、必要细节、像素尺寸与呈现。用可信的本地工具查看元数据，检查位置、姓名、联系方式，以及画面和文件名中的可识别信息。工具不能核实的字段保留未知，分享前继续检查；无需上传。',
          },
        ],
        checklist: [
          '完整保留的原片是否包含未入选画面，以及实际拍摄的各个格式，而非只有交付文件？',
          '能否从独立存储中恢复并打开样本？这次抽样还没有检查什么？',
          '实际导出文件是否符合用途？画面、文件名与元数据中还剩哪些可识别信息？',
        ],
      },
      reflection: {
        title: '只记录自己实际做过的检查',
        intro:
          '这些是你的自主观察。本站不认证备份、不检查元数据，也不判断分享是否安全。',
        checks: [
          {
            id: 'originals-and-recovery',
            label:
              '我保留了完整原片，检查了独立备份并抽样恢复，而且能说明抽样没有覆盖的部分。',
          },
          {
            id: 'purposeful-export',
            label:
              '我单独导出了入选副本，能说明其用途与像素尺寸，没有把它当作原文件备份。',
          },
          {
            id: 'export-privacy-review',
            label:
              '我在本地检查了实际导出文件的画面、文件名与元数据中的可识别信息；未解决字段仍保留未知。',
          },
        ],
        note: '未完成的检查先不勾选，准备好后可以回来继续。完成标记只记录自主学习，不保证备份可靠，也不表示可以删除、格式化或公开分享。',
      },
    },
  },
};
