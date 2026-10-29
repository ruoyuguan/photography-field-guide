import { backupAndExportMission } from './missions/backup-and-export.ts';
import { neighborhoodStoryMission } from './missions/neighborhood-story.ts';
import { photoReviewMission } from './missions/photo-review.ts';
import { subjectBackgroundMission } from './missions/subject-background.ts';

export type PracticeLocale = 'en' | 'zh-cn';

export interface PracticeMission {
  id: string;
  number: number;
  version: number;
  visual: 'direction' | 'framing' | 'story' | 'review' | 'backup';
  articlePath: string;
  nextId?: string;
  copy: Record<
    PracticeLocale,
    {
      metaTitle: string;
      metaDescription: string;
      title: string;
      lessonTitle: string;
      intro: string;
      duration: string;
      goal: string;
      equipment: string[];
      prerequisites: string;
      prediction: {
        title: string;
        question: string;
        choices: { id: string; label: string; explanation?: string }[];
        correctChoiceId: string;
        hint: string;
        correct: string;
        incorrect: string;
        explanation: string;
      };
      observation: {
        heading?: string;
        title: string;
        intro: string;
        modelTitle: string;
        modelNote: string;
        steps: { id: string; title: string; detail: string }[];
        checklist: string[];
      };
      reflection: {
        title: string;
        intro: string;
        checks: { id: string; label: string }[];
        note: string;
      };
    }
  >;
}

export const practiceCopy = {
  en: {
    metaTitle: 'Photography practice missions',
    metaDescription:
      'Short bilingual photography missions with predictions, visual models, field observation, and private self-review.',
    eyebrow: 'Learn by doing',
    title: 'Photography missions',
    intro:
      'Predict one change, test it, and review what you see. No account, upload, score, or forced unlock.',
    open: 'Open mission',
    progress: 'Your progress in this browser',
    notStarted: 'Not started',
    inProgress: 'In progress',
    completed: 'Marked complete',
    clearAll: 'Clear all practice progress',
    confirmClear:
      'Clear only Photography Field Guide practice progress in this browser? Your theme and other site data will not change.',
    cleared: 'Practice progress cleared.',
    clearedMemory:
      'Progress is cleared on this page. Some saved progress could not be removed and may return after a reload.',
    noScript:
      'JavaScript is unavailable. Every mission remains readable, including the answer explanation. Progress controls are hidden.',
  },
  'zh-cn': {
    metaTitle: '摄影练习任务',
    metaDescription:
      '通过预测、图示、实拍观察与私密自评完成简短的中英双语摄影任务。',
    eyebrow: '在做中学',
    title: '摄影任务',
    intro:
      '先预测一个变化，再动手验证并复盘。无需账号或上传，不打分，也不强制解锁。',
    open: '开始任务',
    progress: '本浏览器中的进度',
    notStarted: '尚未开始',
    inProgress: '进行中',
    completed: '已标记完成',
    clearAll: '清除全部练习进度',
    confirmClear:
      '只清除此浏览器中摄影指南的练习进度吗？主题和其他网站数据不会改变。',
    cleared: '练习进度已清除。',
    clearedMemory:
      '本页进度已清除。部分已保存的进度未能移除，刷新后可能再次出现。',
    noScript:
      '当前无法使用 JavaScript。任务目标、步骤和答案解释仍可完整阅读，进度控件已隐藏。',
  },
} as const;

export const practiceUiCopy = {
  en: {
    missionLabel: 'Mission 01',
    back: 'All missions',
    readLesson: 'Read Understanding Light',
    goal: 'Your goal',
    duration: 'Time',
    equipment: 'You need',
    prerequisites: 'Useful prior knowledge',
    prediction: '1 · Predict',
    observation: '2 · Observe and make two photos',
    reflection: '3 · Review it yourself',
    checkAnswer: 'Check answer',
    retry: 'Try another answer',
    hint: 'Need a hint?',
    showAnswer: 'Show answer and explanation',
    answerTitle: 'Answer and explanation',
    chooseFirst: 'Choose one prediction before checking.',
    correct: 'That prediction fits the model.',
    incorrect: 'Not quite. Compare which surfaces face the lamp, then retry.',
    modelTitle: 'Compare the direction model',
    modelFront: 'Front light',
    modelSide: 'Light from camera-left',
    directionControl: 'Move the lamp between front and camera-left',
    directionValue: 'Current model',
    frontDescription:
      'The lamp is near the camera axis. The camera-facing surface is lit; the cast shadow extends behind the object.',
    sideDescription:
      'The lamp is at camera-left. Left-facing surfaces receive direct light; the cast shadow extends generally to camera-right.',
    camera: 'Camera, fixed',
    object: 'Object, fixed',
    lamp: 'Same lamp, similar distance',
    lightRays: 'Light travel',
    shadow: 'Cast shadow',
    view: 'Top-down concept view',
    observationChecklist: 'What to compare in your photos',
    markStep: 'Mark this action done',
    reflectionIntro:
      'There is no aesthetic score. Choose the observations you can support.',
    complete: 'Mark mission complete',
    completed: 'You marked this mission complete.',
    keepGoing:
      'You can revise any answer or reset without losing access to the lesson.',
    reset: 'Reset this mission',
    confirmReset: 'Reset only this mission in this browser?',
    resetDone: 'This mission was reset.',
    resetMemory:
      'This mission is reset for this page only. Earlier saved progress may return after a reload because browser storage refused the change.',
    status: 'Mission status',
    notStarted: 'Not started',
    inProgress: 'In progress',
    storagePersistent: 'Progress is saved only in this browser.',
    storageMemory:
      'Browser storage is unavailable. Progress will last only for this page visit.',
    storageRecovered:
      'Invalid or older saved progress was reset safely. New progress can be saved.',
    noScript:
      'JavaScript is unavailable. Read the task and answer below, or print this page for your shoot. Interactive controls and saving are hidden.',
    returnToLesson: 'Return to the lesson for the full explanation',
    privacy:
      'No photos, EXIF, location, or free-text reflections are collected or saved.',
  },
  'zh-cn': {
    missionLabel: '任务 01',
    back: '全部任务',
    readLesson: '阅读《看懂光线》',
    goal: '你的目标',
    duration: '用时',
    equipment: '需要准备',
    prerequisites: '有帮助的先修知识',
    prediction: '1 · 先预测',
    observation: '2 · 观察并拍两张照片',
    reflection: '3 · 自己复盘',
    checkAnswer: '检查答案',
    retry: '换个答案重试',
    hint: '需要提示？',
    showAnswer: '查看答案与解释',
    answerTitle: '答案与解释',
    chooseFirst: '请先选择一个预测，再检查。',
    correct: '这个预测符合图中的条件。',
    incorrect: '还差一点。比较哪些表面朝向台灯，然后再试一次。',
    modelTitle: '比较光线方向模型',
    modelFront: '正面光',
    modelSide: '来自画面左侧的光',
    directionControl: '在正面与画面左侧之间移动台灯',
    directionValue: '当前模型',
    frontDescription:
      '台灯靠近相机轴线。朝向相机的表面被照亮，投影延伸到物体后方。',
    sideDescription:
      '台灯位于画面左侧。朝左的表面接收直射光，投影大致向画面右侧延伸。',
    camera: '相机，固定',
    object: '物体，固定',
    lamp: '同一台灯，近似距离',
    lightRays: '光的传播方向',
    shadow: '投影',
    view: '俯视概念图',
    observationChecklist: '照片中要比较什么',
    markStep: '将此操作标记为完成',
    reflectionIntro: '这里没有审美评分。只勾选你有画面依据的观察。',
    complete: '将任务标记为完成',
    completed: '你已将此任务标记为完成。',
    keepGoing: '可以修改答案或重置，教程与任务始终可以访问。',
    reset: '重置此任务',
    confirmReset: '只重置此浏览器中的当前任务吗？',
    resetDone: '当前任务已重置。',
    resetMemory:
      '仅重置了本页任务。浏览器拒绝修改存储，刷新后可能恢复此前保存的记录。',
    status: '任务状态',
    notStarted: '尚未开始',
    inProgress: '进行中',
    storagePersistent: '进度只保存在当前浏览器中。',
    storageMemory: '浏览器存储不可用。进度仅在本次页面访问期间保留。',
    storageRecovered: '损坏或旧版进度已安全重置，可以保存新的进度。',
    noScript:
      '当前无法使用 JavaScript。仍可阅读任务与答案，或打印本页带去拍摄；互动控件与保存功能已隐藏。',
    returnToLesson: '返回教程，阅读完整解释',
    privacy: '不收集或保存照片、EXIF、位置或自由文本反思。',
  },
} as const;

export const missions: PracticeMission[] = [
  {
    id: 'light-direction',
    number: 1,
    version: 1,
    visual: 'direction',
    articlePath: '/learn/composition/understanding-light/',
    nextId: 'subject-background',
    copy: {
      en: {
        metaTitle: 'Light detective: front versus side light',
        metaDescription:
          'Predict how moving one lamp changes visible surfaces and shadows, compare a concept model, and review two controlled photographs.',
        title: 'Light detective',
        lessonTitle: 'Understanding Light',
        intro:
          'Find out what changes when only the direction of one lamp changes.',
        duration: 'About 15 minutes',
        goal: 'Explain the visible difference between front light and light from camera-left, using surfaces and shadows as evidence.',
        equipment: [
          'Any camera or phone that lets you keep the same framing and exposure',
          'One small, stable object such as a mug, and one movable lamp',
          'A safe, dim room with little other light; keep the lamp and cables secure',
        ],
        prerequisites:
          'A basic exposure control is enough. This task is not about focal length, depth of field, white balance, or exposure compensation.',
        prediction: {
          title: 'Before you move the lamp',
          question:
            'Keep the object, camera, exposure, lamp, and approximate lamp distance fixed. Move the lamp from near the camera to camera-left. Which result is the best prediction?',
          choices: [
            {
              id: 'longer-focal-length',
              label:
                'The lens focal length increases, so the object appears larger.',
              explanation:
                'This choice treats a lighting change as a lens change. The focal length and camera position stay fixed, so moving the lamp does not magnify the object. Look instead for a different lit surface and a shadow that falls away from the new lamp position.',
            },
            {
              id: 'left-surfaces-right-shadow',
              label:
                'Left-facing surfaces receive more direct light, and the cast shadow extends generally to camera-right.',
              explanation:
                'With the camera, object, exposure, and approximate lamp distance fixed, a lamp at camera-left favors left-facing surfaces. The object blocks light on the opposite side, so the cast shadow extends generally to camera-right. Reflected room light can soften that shadow; this predicts direction rather than identical overall brightness.',
            },
            {
              id: 'always-brighter',
              label:
                'Every part of the scene must become brighter because the lamp moved.',
              explanation:
                'This choice assumes that moving a light adds illumination everywhere. At a similar lamp distance, changing direction can brighten some surfaces and darken others because their orientation and occlusion change. Compare particular surfaces instead of expecting the whole scene to brighten.',
            },
          ],
          correctChoiceId: 'left-surfaces-right-shadow',
          hint: 'Trace a line from the lamp to the object. Ask which visible surfaces face it and where the object blocks the light.',
          correct:
            'The lamp now illuminates a different set of surfaces. The shadow falls away from it, generally toward camera-right in this top-down model.',
          incorrect:
            'Changing direction does not change the lens or guarantee a universal brightness change. Look at surface orientation and occlusion instead.',
          explanation:
            'With the camera and object fixed, moving the lamp to camera-left favors surfaces that face left. A simple cast shadow extends away from the lamp, generally to camera-right. Real rooms add reflected light and other sources, so a shadow need not be black. Keeping exposure fixed makes the comparison clearer; it does not promise identical overall brightness.',
        },
        observation: {
          title: 'See the model, then test it with a real object',
          intro:
            'The diagram compares direction only. It is not a rendered photograph or a lighting simulation.',
          modelTitle: 'Compare the direction model',
          modelNote:
            'Concept model: one identical lamp at a similar distance; fixed object, camera, framing, and exposure. Brightness and shadow shape are schematic, not measured.',
          steps: [
            {
              id: 'compare-model',
              title: 'Compare the two diagram positions',
              detail:
                'Move the direction slider. Name the lit surface and the cast-shadow direction before continuing.',
            },
            {
              id: 'make-front-photo',
              title: 'Make the front-light photo',
              detail:
                'Place the lamp near the camera axis, slightly above the object if needed. Keep the object, camera, zoom, focus, aperture, shutter time, and ISO fixed. Use a safe exposure you can repeat.',
            },
            {
              id: 'make-side-photo',
              title: 'Make the camera-left photo without changing exposure',
              detail:
                'Move only the lamp to camera-left at a similar distance. Do not move the object or camera, and do not use auto exposure compensation between frames. Make the second photo.',
            },
          ],
          checklist: [
            'Which camera-visible surfaces are brighter or darker?',
            'Where does the cast shadow point, and what actually blocks the light?',
            'Did distance, room light, exposure, or framing also change? Note that before drawing a conclusion.',
          ],
        },
        reflection: {
          title: 'Use your photographs as evidence',
          intro:
            'This is self-review, not a judgment of whether your photographs are good.',
          checks: [
            {
              id: 'surface-evidence',
              label:
                'I can point to a visible surface whose illumination changed with lamp direction.',
            },
            {
              id: 'shadow-evidence',
              label:
                'I can describe the cast-shadow direction without assuming it must be completely dark.',
            },
            {
              id: 'controlled-variables',
              label:
                'I checked whether another important condition changed between the two frames.',
            },
          ],
          note: 'If the comparison was unclear, repeat it with less ambient light or a simpler background. That is a new experiment, not a failed photograph.',
        },
      },
      'zh-cn': {
        metaTitle: '光线侦探：正面光与侧光',
        metaDescription:
          '预测移动一盏灯后受光表面与阴影的变化，比较概念图，并复盘两张控制变量的照片。',
        title: '光线侦探',
        lessonTitle: '看懂光线',
        intro: '只改变一盏灯的方向，看看画面到底发生了什么。',
        duration: '约 15 分钟',
        goal: '用受光表面和阴影作为证据，解释正面光与来自画面左侧的光有什么可见差别。',
        equipment: [
          '任意能保持构图和曝光一致的相机或手机',
          '一个稳定的小物体，例如马克杯，以及一盏可移动的台灯',
          '其他光线较弱的安全房间；固定好灯具和电线',
        ],
        prerequisites:
          '会保持基本曝光一致即可。本任务不讨论焦距、景深、白平衡或曝光补偿。',
        prediction: {
          title: '移动台灯之前',
          question:
            '固定物体、相机、曝光、台灯和近似灯距，只把台灯从相机附近移到画面左侧。哪个预测最合理？',
          choices: [
            {
              id: 'longer-focal-length',
              label: '镜头焦距变长，所以物体看起来更大。',
              explanation:
                '这个选项把光线变化当成了镜头变化。焦距与机位都保持不变，移动台灯不会把物体放大。应观察哪个表面改为受光，以及投影如何背向新的灯位延伸。',
            },
            {
              id: 'left-surfaces-right-shadow',
              label: '朝左的表面接收更多直射光，投影大致向画面右侧延伸。',
              explanation:
                '相机、物体、曝光和近似灯距固定时，画面左侧的台灯更容易直接照亮朝左的表面。物体在另一侧挡住光，因此投影大致向画面右侧延伸。房间反射光可能让阴影变浅；这个预测说明方向，不保证整体亮度相同。',
            },
            {
              id: 'always-brighter',
              label: '因为台灯移动了，画面每个部分都一定更亮。',
              explanation:
                '这个选项假设移动光源会让所有地方都增加受光。灯距近似不变时，方向变化会改变表面朝向与遮挡，某些表面可能变亮，另一些可能变暗。应比较具体表面，而不是预期整幅画面都变亮。',
            },
          ],
          correctChoiceId: 'left-surfaces-right-shadow',
          hint: '从台灯向物体画一条线：哪些可见表面朝向它？物体又在哪里挡住了光？',
          correct:
            '台灯现在照亮了另一组表面。在这幅俯视模型中，阴影背向台灯，大致向画面右侧延伸。',
          incorrect:
            '改变方向不会改变镜头，也不保证整体亮度必然变化。应观察表面朝向与遮挡。',
          explanation:
            '相机和物体固定时，把台灯移到画面左侧，会让朝左的表面更容易被直接照亮。简单投影背向台灯，大致向画面右侧延伸。真实房间还有反射光和其他光源，所以阴影不一定是黑的。固定曝光能让比较更清楚，但不意味着整体亮度一定相同。',
        },
        observation: {
          title: '先看模型，再用真实物体验证',
          intro: '图示只比较方向，不是渲染照片，也不是光照模拟。',
          modelTitle: '比较光线方向模型',
          modelNote:
            '概念模型：同一盏灯、近似距离；物体、相机、构图和曝光固定。亮度与阴影形状仅为示意，不是实测结果。',
          steps: [
            {
              id: 'compare-model',
              title: '比较图中的两个灯位',
              detail: '移动方向滑块。继续之前，先说出受光表面与投影方向。',
            },
            {
              id: 'make-front-photo',
              title: '拍摄正面光照片',
              detail:
                '把台灯放在相机轴线附近，需要时略高于物体。固定物体、相机、变焦、对焦、光圈、快门时间和 ISO，使用安全且可重复的曝光。',
            },
            {
              id: 'make-side-photo',
              title: '不改变曝光，拍摄左侧光照片',
              detail:
                '只把台灯以近似距离移到画面左侧。不要移动物体或相机，也不要在两张照片之间重新进行自动曝光补偿。拍下第二张。',
            },
          ],
          checklist: [
            '相机能看到的哪些表面变亮或变暗了？',
            '投影指向哪里？究竟是什么挡住了光？',
            '灯距、环境光、曝光或构图是否也改变了？下结论前先检查。',
          ],
        },
        reflection: {
          title: '用自己的照片寻找证据',
          intro: '这只是自我复盘，不评价照片好不好。',
          checks: [
            {
              id: 'surface-evidence',
              label: '我能指出一个可见表面，它的受光随灯位方向发生了变化。',
            },
            {
              id: 'shadow-evidence',
              label: '我能描述投影方向，同时不假设阴影一定全黑。',
            },
            {
              id: 'controlled-variables',
              label: '我检查了两张照片之间是否还有重要条件发生变化。',
            },
          ],
          note: '如果对照不清楚，可以减少环境光或换一个更简单的背景再试。这是新的实验，不代表照片失败。',
        },
      },
    },
  },
  subjectBackgroundMission,
  neighborhoodStoryMission,
  photoReviewMission,
  backupAndExportMission,
];

export function missionById(id: string): PracticeMission | undefined {
  return missions.find(mission => mission.id === id);
}
