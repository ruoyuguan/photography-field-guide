import type { PracticeMission } from '../practice.ts';

export const subjectBackgroundMission: PracticeMission = {
  id: 'subject-background',
  number: 2,
  version: 1,
  visual: 'framing',
  articlePath: '/learn/composition/subject-and-background/',
  nextId: 'neighborhood-story',
  copy: {
    en: {
      metaTitle: 'Frame cleanup: subject and background',
      metaDescription:
        'Predict a subject–background alignment change, compare two concept frames, make two controlled photographs, and review distractions and retained context.',
      title: 'Frame cleanup',
      lessonTitle: 'Subject and Background',
      intro:
        'Change your viewpoint, inspect the edges, and decide what deserves to remain in the frame.',
      duration: 'About 20 minutes',
      goal: 'Make two photographs with unchanged focal length and approximately consistent subject size. Explain what distraction you removed or separated, and why you kept another element.',
      equipment: [
        'Any camera or phone that lets you keep the focal length and exposure settings fixed',
        'A stationary subject with a visible background, in a safe place where you can take a small sideways step',
        'One background distraction to compare and one contextual element you may want to keep',
      ],
      prerequisites:
        'A repeatable focal length and basic exposure are enough. This task is about viewpoint and framing, not achieving a particular amount of background blur.',
      prediction: {
        title: 'Before you change your viewpoint',
        question:
          'Keep the subject and focal length fixed. Take a small, safe step sideways, aim back at the subject, and reframe to approximately the same subject size. Which result is the best prediction?',
        choices: [
          {
            id: 'relative-alignment',
            label:
              'The subject and background can shift into a different relative alignment, allowing an overlapping distraction to separate.',
          },
          {
            id: 'better-by-rule',
            label:
              'The second photograph must be better because the subject will automatically follow the rule of thirds.',
          },
          {
            id: 'automatic-blur',
            label:
              'The aperture must open and the background must become blurred, even though no lens setting changed.',
          },
        ],
        correctChoiceId: 'relative-alignment',
        hint: 'Imagine lines from two different camera positions through the nearby subject toward a distant pole. Where does that pole appear relative to the subject?',
        correct:
          'A position change followed by reframing changes near–far alignment. That can separate a background element from the subject without changing the lens.',
        incorrect:
          'A sideways move does not automatically improve a photograph, impose a composition rule, or change aperture. Look for the change in relative alignment.',
        explanation:
          'When you move the camera and aim back at a nearby subject, near and far elements project into a different relative alignment. This parallax can move an overlapping pole or bright shape away from the subject. The exact amount depends on camera movement and scene distances, and a small handheld reframe only keeps subject size approximately consistent. The second frame is another compositional possibility, not an automatic aesthetic improvement.',
      },
      observation: {
        title: 'Compare the concept, then make your own pair',
        intro:
          'Both diagram frames are always visible. Compare alignment, edges, and retained context before going out to shoot.',
        modelTitle: 'Compare two framing possibilities',
        modelNote:
          'Concept illustration only: one stationary subject, unchanged focal length, approximately consistent subject size, and a small sideways camera move. It is not an exact perspective simulation or a quality judgment.',
        steps: [
          {
            id: 'compare-frames',
            title: 'Compare the two concept frames',
            detail:
              'Name the overlapping background element, the partial edge detail, and the contextual tree. Explain which changed and which was deliberately retained.',
          },
          {
            id: 'make-initial-photo',
            title: 'Make the initial photograph',
            detail:
              'Choose a stationary subject and scan all four edges. Keep the focal length, focus choice, aperture, shutter time, and ISO fixed. Identify one distraction and one potentially useful context element.',
          },
          {
            id: 'make-shifted-photo',
            title: 'Shift safely and make the second photograph',
            detail:
              'Take a small sideways step, aim back at the subject, and reframe to approximately the same subject size. Keep the lens and exposure settings unchanged. Do not enter an unsafe or restricted position.',
          },
        ],
        checklist: [
          'Did the subject and background become more separated, or did a different overlap appear?',
          'What did you remove or retain at the edges, and why?',
          'What do foreground, background, and negative space contribute? Did subject size, light, or another condition also change?',
        ],
      },
      reflection: {
        title: 'Explain your choices rather than score the photograph',
        intro:
          'There is no ideal rule-of-thirds placement or background-blur target. Choose only observations you can support in your own pair.',
        checks: [
          {
            id: 'edge-and-space-review',
            label:
              'I checked all four edges and can describe how a layer or the surrounding space affects the subject.',
          },
          {
            id: 'distraction-review',
            label:
              'I can identify a distraction I removed or separated, or explain why the change did not help.',
          },
          {
            id: 'context-review',
            label:
              'I can explain why I kept a particular element, or why I deliberately chose a frame without that context.',
          },
        ],
        note: 'If the second frame introduced a new distraction, keep both and try another safe viewpoint. That is useful evidence, not a failed photograph.',
      },
    },
    'zh-cn': {
      metaTitle: '整理画面：主体与背景',
      metaDescription:
        '预测主体与背景对齐关系的变化，比较两幅概念图，拍摄两张控制变量的照片，并复盘干扰与保留的环境。',
      title: '整理画面',
      lessonTitle: '主体与背景',
      intro: '改变视点、检查边缘，再决定哪些元素值得留在画面中。',
      duration: '约 20 分钟',
      goal: '在焦距不变、主体大小近似一致的条件下拍摄两张照片。说明你移除或分离了什么干扰，以及为何保留另一个元素。',
      equipment: [
        '任意能保持焦距和曝光设置不变的相机或手机',
        '一个带可见背景的静止主体，以及可以安全小幅侧移的拍摄位置',
        '一个用于对照的背景干扰，以及一个可能希望保留的环境元素',
      ],
      prerequisites:
        '能保持焦距和基本曝光一致即可。本任务关注视点与取景，不要求获得特定程度的背景虚化。',
      prediction: {
        title: '改变视点之前',
        question:
          '固定主体和焦距。安全地小幅侧移，重新对准主体，并让主体在画面中的大小近似一致。哪个预测最合理？',
        choices: [
          {
            id: 'relative-alignment',
            label: '主体与背景的相对对齐关系可以改变，从而分离原本重叠的干扰。',
          },
          {
            id: 'better-by-rule',
            label: '第二张照片一定更好，因为主体会自动符合三分法。',
          },
          {
            id: 'automatic-blur',
            label: '即使没有调整镜头设置，光圈也一定会开大，背景一定会变模糊。',
          },
        ],
        correctChoiceId: 'relative-alignment',
        hint: '想象从两个不同相机位置出发，穿过近处主体、延伸到远处竖杆的直线。竖杆会出现在主体旁边的什么位置？',
        correct:
          '改变机位再重新构图，会改变远近元素的相对对齐关系。不换镜头，也可能让背景元素与主体分离。',
        incorrect:
          '侧移不会自动让照片更好，不会强制套用构图规则，也不会改变光圈。应观察相对对齐关系的变化。',
        explanation:
          '移动相机并重新对准近处主体时，近处与远处元素会形成不同的相对对齐关系。这种视差可以让重叠的竖杆或亮斑从主体旁边移开。具体变化取决于机位移动量与场景距离；手持小幅重新构图只能让主体大小近似一致。第二个画面是另一种构图可能，不自动代表审美上的进步。',
      },
      observation: {
        title: '先比较概念图，再拍自己的对照组',
        intro:
          '两幅图会始终同时保留。实拍之前，先比较对齐关系、边缘和保留的环境。',
        modelTitle: '比较两种构图可能',
        modelNote:
          '仅为概念插图：同一静止主体、焦距不变、主体大小近似一致，相机小幅侧移。不是精确透视模拟，也不是质量评价。',
        steps: [
          {
            id: 'compare-frames',
            title: '比较两幅概念图',
            detail:
              '说出与主体重叠的背景、边缘局部细节和环境小树。解释哪些发生了变化，哪些被有意保留。',
          },
          {
            id: 'make-initial-photo',
            title: '拍摄初始画面',
            detail:
              '选择静止主体并检查四条边。固定焦距、对焦选择、光圈、快门时间和 ISO。找出一个干扰和一个可能有用的环境元素。',
          },
          {
            id: 'make-shifted-photo',
            title: '安全侧移，拍摄第二张',
            detail:
              '小幅侧移，重新对准主体，让主体大小近似一致。保持镜头和曝光设置不变，不要进入危险或禁止进入的位置。',
          },
        ],
        checklist: [
          '主体与背景是否更分离了，还是出现了新的重叠？',
          '你在边缘移除或保留了什么？为什么？',
          '前景、背景与留白分别贡献了什么？主体大小、光线或其他条件是否也变了？',
        ],
      },
      reflection: {
        title: '解释自己的选择，不给照片打分',
        intro:
          '这里没有理想的三分法位置或背景虚化目标。只勾选能在自己的两张照片中找到依据的观察。',
        checks: [
          {
            id: 'edge-and-space-review',
            label: '我检查了四条边，并能说明某个层次或周围留白如何影响主体。',
          },
          {
            id: 'distraction-review',
            label:
              '我能指出移除或分离的一个干扰，或者解释为什么这次变化没有帮助。',
          },
          {
            id: 'context-review',
            label:
              '我能说明为何保留某个元素，或者为何有意选择不含这个环境信息的画面。',
          },
        ],
        note: '如果第二个画面出现新干扰，保留两张照片，再尝试另一个安全机位。这也是有用证据，不代表照片失败。',
      },
    },
  },
};
