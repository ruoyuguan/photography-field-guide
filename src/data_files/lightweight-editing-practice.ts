import type { MarketingLocale } from '@utils/locale';

export const LIGHTWEIGHT_EDITING_MISSION_ID = 'lightweight-editing';
export const LIGHTWEIGHT_EDITING_VERSION = 1;

/**
 * C6 content with its original independent progress key. practice-catalog exposes
 * it alongside shared tasks without duplicating or migrating saved progress.
 */
export const lightweightEditingMission = {
  id: LIGHTWEIGHT_EDITING_MISSION_ID,
  version: LIGHTWEIGHT_EDITING_VERSION,
  copy: {
    en: {
      metaTitle: 'Lightweight Editing Practice: Three Comparisons',
      metaDescription:
        'Predict an editing outcome, protect an original, compare three changes separately, and inspect an exported copy without uploading a photograph.',
      title: 'Lightweight editing: three comparisons, one photograph',
      intro:
        'Turn the editing lesson into a small local experiment. Predict what a rendering change can do, work on copies in your own software, then review the result at its destination size.',
      goal: 'Preserve the source, isolate brightness, color, and crop decisions, and inspect a separate derivative. This is a process review, not a score for your photograph.',
      duration: '15–20 minutes',
      equipment: [
        'One photograph whose original and independent backup you have already checked.',
        'Local editing software that supports undo, a working or virtual copy, or separately stored editing instructions.',
        'Paper or your own local notes for the photograph’s purpose. Do not enter those notes here.',
      ],
      prerequisites:
        'Complete Safe Backup and Export first. No account, particular application, photo upload, or file access by this website is required.',
      prediction: {
        title: 'Predict before you adjust',
        question:
          'A protected original shows a dark face and a window that is entirely blank white. On a working copy, you raise the exposure control just enough to make the face easier to read. Which outcome and next action are technically sound?',
        choices: [
          {
            id: 'brighter-adds-captured-light',
            label:
              'The adjustment adds light to the completed capture, so the window must now contain recoverable detail.',
            feedback:
              'The editor changes the rendering, not the light already recorded. Compare the face and the blank window without assuming missing detail has returned.',
          },
          {
            id: 'compare-without-assuming-recovery',
            label:
              'The face may become easier to read while the blank window still lacks detail; compare the result and keep the original intact.',
            feedback:
              'Yes. Brightening can improve subject readability without reconstructing information absent from the file. Inspect the actual copy and preserve the source.',
          },
          {
            id: 'neutralize-and-crop-together',
            label:
              'Apply a neutral white balance and a tight crop at the same time so the brighter result is necessarily the correct interpretation.',
            feedback:
              'Brightness, color intent, and framing are separate decisions. Neutral or tighter is not automatically better; undo between controlled comparisons.',
          },
        ],
        correctChoiceId: 'compare-without-assuming-recovery',
        hint: 'Separate what changes in the displayed rendering from what was recorded when the shutter closed. Also separate subject readability from missing-highlight recovery.',
        explanation:
          'The exposure control changes the rendered image. It can make the face easier to see, but it cannot add photons to the completed capture or promise shapes in an entirely blank window. Recovery depends on the actual file. Keep the original, inspect important highlights and shadows, and judge the comparison rather than the slider position.',
      },
      modelTitle: 'Optional concept review before working locally',
      modelIntro:
        'Open these original SVG comparisons if you want a visual reminder. They are not your photograph, a calibrated color display, or a simulated editing application.',
      steps: [
        {
          id: 'protect-source-state-purpose',
          title: 'Protect the source and state the purpose',
          detail:
            'Leave the original and its independently checked backup untouched. Make a working or virtual copy. On paper or in local notes, finish: “For this photograph, I want the viewer to notice …”. Do not type that note into this page.',
          check:
            'I preserved the source and backup, prepared a reversible working copy, and stated a purpose outside this website.',
        },
        {
          id: 'compare-and-undo-separately',
          title: 'Compare three variables, one at a time',
          detail:
            'On reversible copies, test brightness, white balance, and crop separately. Inspect before/after at the same display size and undo before the next test. For brightness, inspect the subject and important highlights; for color, compare materials and atmosphere; for crop, check useful context and edges. Do not stack all three as a required recipe.',
          check:
            'I completed separate brightness, white-balance, and crop comparisons, undoing between tests and recording no photo information here.',
        },
        {
          id: 'export-and-inspect-derivative',
          title: 'Export a separate copy and inspect its actual size',
          detail:
            'Choose the unchanged source or an edited version according to your purpose. Export a separate derivative, reopen it, and check the rendered crop, brightness, color, necessary detail, and privacy. Read its actual pixel dimensions in your own software and decide whether they fit the intended display or print workflow; a successful export message alone is not enough.',
          check:
            'I reopened the derivative, checked its actual pixel dimensions and appearance for the intended use, and confirmed that it did not replace the original.',
        },
      ],
      reflection: {
        title: 'Review your decisions, not a score',
        intro:
          'Check each statement only when you can support it with what you observed locally. Keeping the unchanged source is a valid conclusion.',
        checks: [
          {
            id: 'source-and-purpose',
            label:
              'I can explain the intended use, and the original plus its backup remain available for another interpretation.',
          },
          {
            id: 'comparison-evidence',
            label:
              'For each isolated comparison, I can identify what became clearer or worse—including any important detail, context, or atmosphere that was lost.',
          },
          {
            id: 'derivative-fit',
            label:
              'I checked the actual derivative rather than assuming it was suitable, and I understand that cropping cannot create new detail in the retained area.',
          },
        ],
      },
    },
    'zh-cn': {
      metaTitle: '轻量后期练习：一张照片，三组对照',
      metaDescription:
        '先预测后期结果，再保护原片、分别比较三种调整，并检查导出副本；网站不会读取或上传照片。',
      title: '轻量后期练习：一张照片，三组对照',
      intro:
        '把后期教程变成一次本地小实验：先预测呈现变化能做什么，在自己的软件中对副本操作，再按接收场景的尺寸复盘。',
      goal: '保留来源，独立比较明暗、色彩与裁切决定，并检查单独的衍生副本。这是流程复盘，不是给照片打分。',
      duration: '15–20 分钟',
      equipment: [
        '一张已确认原片与独立备份都完好的照片。',
        '支持撤销、工作副本／虚拟副本，或单独保存编辑指令的本地软件。',
        '用于写下照片用途的纸张或本地笔记，不要把这些笔记输入本站。',
      ],
      prerequisites:
        '先完成“安全备份与导出”。无需注册、无需指定应用，本站也不需要读取或上传照片。',
      prediction: {
        title: '调整之前先预测',
        question:
          '受保护的原片中，人脸偏暗，窗户完全是空白白色。你在工作副本上把曝光控制调到足以看清人脸。哪种结果与下一步在技术上合理？',
        choices: [
          {
            id: 'brighter-adds-captured-light',
            label:
              '调整会为已经完成的拍摄补回光线，所以窗户现在一定拥有可恢复的细节。',
            feedback:
              '编辑器改变的是呈现，不是已经记录的光线。比较人脸与空白窗户，不要假设缺失细节已经回来。',
          },
          {
            id: 'compare-without-assuming-recovery',
            label:
              '人脸可能更容易辨认，但空白窗户仍可能缺少细节；应比较结果并保留原片。',
            feedback:
              '正确。调亮可以改善主体可读性，却不能重建文件中不存在的信息。检查实际副本，并保留来源。',
          },
          {
            id: 'neutralize-and-crop-together',
            label:
              '同时应用中性白平衡和紧凑裁切，这样调亮后的结果就一定是正确解释。',
            feedback:
              '明暗、色彩意图和取景是不同决定。中性或更紧不必然更好；应在受控对照之间逐项撤销。',
          },
        ],
        correctChoiceId: 'compare-without-assuming-recovery',
        hint: '区分显示呈现的变化与快门闭合时记录的信息，也区分主体可读性和缺失高光的恢复。',
        explanation:
          '曝光控制改变渲染后的图像，可以让人脸更容易看清，却不能为已经完成的拍摄增加光子，也不能保证全空白窗户出现形状。能否恢复取决于实际文件。保留原片，检查重要高光和阴影，根据对照而不是滑块位置作判断。',
      },
      modelTitle: '本地操作前的可选概念复习',
      modelIntro:
        '需要视觉提示时，可打开这些原创 SVG 对照。它们不是你的照片、校准色彩显示，也不是模拟编辑软件。',
      steps: [
        {
          id: 'protect-source-state-purpose',
          title: '保护来源，写明用途',
          detail:
            '不要改动原片及已独立核查的备份，制作工作副本或虚拟副本。在纸上或本地笔记中完成：“对于这张照片，我希望观者注意……”。不要把笔记输入本页。',
          check:
            '我已保留原片和备份，准备了可撤销的工作副本，并在本站之外写明用途。',
        },
        {
          id: 'compare-and-undo-separately',
          title: '三个变量，每次只比较一个',
          detail:
            '在可撤销副本上分别测试明暗、白平衡与裁切。以相同显示大小检查前后画面，每次撤销后再测试下一项。明暗看主体与重要高光，色彩比较材质与氛围，裁切检查有用环境与边缘。不要把三项叠加成必须执行的配方。',
          check:
            '我分别完成明暗、白平衡与裁切对照，在各项之间撤销，且没有在这里记录任何照片信息。',
        },
        {
          id: 'export-and-inspect-derivative',
          title: '导出独立副本，检查实际尺寸',
          detail:
            '按用途选择未改来源或编辑版本，导出单独的衍生副本并重新打开。检查实际裁切、明暗、色彩、必要细节和隐私；在自己的软件中读取实际像素尺寸，判断是否适合预期显示或打印流程，不能只看“导出成功”。',
          check:
            '我重新打开了衍生副本，按用途检查实际像素尺寸与呈现，并确认它没有替换原片。',
        },
      ],
      reflection: {
        title: '复盘决定，不给照片打分',
        intro:
          '只有能用本地观察支持某项陈述时才勾选。对照后保留未改来源，同样是有效结论。',
        checks: [
          {
            id: 'source-and-purpose',
            label:
              '我能说明预期用途，原片及其备份仍然保留，可以支持另一种解释。',
          },
          {
            id: 'comparison-evidence',
            label:
              '对每组独立对照，我都能指出什么变清楚或变差，包括是否损失重要细节、环境或氛围。',
          },
          {
            id: 'derivative-fit',
            label:
              '我检查了实际衍生副本，没有假设它一定合适；我也理解裁切不能在保留区域创造新细节。',
          },
        ],
      },
    },
  },
} as const;

export const LIGHTWEIGHT_EDITING_STEP_IDS =
  lightweightEditingMission.copy.en.steps.map(step => step.id);
export const LIGHTWEIGHT_EDITING_REFLECTION_IDS =
  lightweightEditingMission.copy.en.reflection.checks.map(check => check.id);

export function lightweightEditingPredictionFeedback(
  locale: MarketingLocale,
  choiceId: string | undefined
): string | null {
  if (!choiceId) return null;
  return (
    lightweightEditingMission.copy[locale].prediction.choices.find(
      choice => choice.id === choiceId
    )?.feedback ?? null
  );
}
