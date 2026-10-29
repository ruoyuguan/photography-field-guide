import type { PracticeMission } from '../practice.ts';

export const neighborhoodStoryMission: PracticeMission = {
  id: 'neighborhood-story',
  number: 3,
  version: 1,
  visual: 'story',
  articlePath: '/learn/field-practice/neighborhood-story/',
  nextId: 'photo-review',
  copy: {
    en: {
      metaTitle: 'One city walk: three photos of a place',
      metaDescription:
        'Plan three complementary photographs, compare an original three-frame concept, make your own sequence, and review what each image contributes.',
      title: 'Three photos, one place',
      lessonTitle: 'A City Walk',
      intro:
        'Give three photographs different jobs so that together they reveal more than three near-identical views.',
      duration: 'About 30 minutes',
      goal: 'During one short walk, make an environment photograph, a subject photograph, and a detail photograph. Explain what each contributes, then choose an order that fits your intention.',
      equipment: [
        'Any camera or phone; one familiar lens or focal-length range is enough',
        'A safe, accessible place such as a quiet street, market exterior, park, or an indoor room',
        'A small notebook or mental note for one sentence about what makes the place distinctive',
      ],
      prerequisites:
        'Basic exposure and focus control are enough. You do not need a wide, normal, and macro lens, and you do not need to photograph strangers.',
      prediction: {
        title: 'Before you begin the walk',
        question:
          'You want three photographs to explain a small neighborhood cafe. Which plan is most likely to add useful information across the set?',
        choices: [
          {
            id: 'three-identical-frames',
            label:
              'Three nearly identical frames of the same facade must explain more because there are more files.',
            explanation:
              'This choice counts files rather than new information. Repeated views can serve a deliberate comparison, such as a change over time, but three nearly identical facade frames may leave the same questions about this cafe unanswered. Ask what the second and third photographs add for the stated goal.',
          },
          {
            id: 'complementary-information',
            label:
              'One frame establishes the setting, one shows a particular subject or activity within it, and one reveals a relevant small detail.',
            explanation:
              'For the stated goal of explaining this cafe, setting, a particular subject or activity, and a relevant detail can answer different questions. They still need a shared idea to connect them. This makes the plan useful for this information goal; it does not prescribe the most artistic images or their only valid order.',
          },
          {
            id: 'required-lens-sequence',
            label:
              'The only correct method is to use a wide, normal, and macro lens in that fixed order.',
            explanation:
              'This choice makes equipment and order stand in for information roles. Different lenses can change framing, but their names do not establish what a viewer learns. One familiar lens can serve these roles where access and focusing distance allow; choose the sequence for your idea.',
          },
        ],
        correctChoiceId: 'complementary-information',
        hint: 'Ask what a viewer could learn from the second and third frames that was not already clear in the first.',
        correct:
          'Complementary roles can add setting, a focal point, and evidence that a wider view might miss. The photographs still need a shared idea to connect them.',
        incorrect:
          'More files do not guarantee more information, and equipment names do not create a story. Compare what each planned frame would contribute.',
        explanation:
          'Environment, subject, and detail are useful information roles rather than mandatory lens settings. A setting can orient the viewer, a particular subject can show what happens or belongs there, and a detail can supply evidence or texture. Three complementary frames are not automatically aesthetically better, but they have more potential to communicate different aspects of one place than three near-duplicates. Their order remains an editorial choice.',
      },
      observation: {
        heading: '2 · Make and review three photos',
        title: 'Use three information roles, not three equipment rules',
        intro:
          'The concept frames stay visible. Plan your own sentence first, then make three photographs in any order that suits the place and conditions.',
        modelTitle: 'Three connected views of one cafe corner',
        modelNote:
          'Original concept illustration, not sample photography or an exact perspective simulation. Repeated amber color and the bicycle/bell details connect the frames; these are possible roles, not the only correct template.',
        steps: [
          {
            id: 'make-environment-photo',
            title: 'Make an environment photograph',
            detail:
              'Finish this sentence first: “This place is distinctive because …” Then include enough surroundings to orient a viewer. Check the edges and retain elements that support that sentence.',
          },
          {
            id: 'make-subject-photo',
            title: 'Make a subject photograph',
            detail:
              'Choose one object, activity, or relationship within the place. Move or reframe to clarify it without losing all context. Focus deliberately and choose a shutter time appropriate to any movement.',
          },
          {
            id: 'make-detail-photo',
            title: 'Make a detail photograph',
            detail:
              'Find a small feature that supports the same idea: wear, a label, a repeated shape, or a trace of use. Get close only where safe and permitted; confirm focus and do not assume you need a macro lens.',
          },
        ],
        checklist: [
          'What new information does each photograph supply? Which two are most similar, and could one be replaced?',
          'What visual or conceptual clue connects the three frames without forcing them to look identical?',
          'Try at least two sequences. What changes when the detail opens the set instead of closing it?',
        ],
      },
      reflection: {
        title: 'Review the information and your intention',
        intro:
          'There is no aesthetic score or universally correct sequence. Select only the observations you can support with your own three photographs.',
        checks: [
          {
            id: 'distinct-roles',
            label:
              'I can explain a distinct contribution from each frame, or identify a repeated frame I want to replace.',
          },
          {
            id: 'intentional-sequence',
            label:
              'I compared at least two orders and can explain why my chosen sequence fits the idea, without calling it the only correct order.',
          },
          {
            id: 'technical-review',
            label:
              'I checked focus, motion, exposure, and color in relation to each frame’s purpose rather than applying one setting rule to all three.',
          },
        ],
        note: 'Keep a near-duplicate or an unclear frame while reviewing. It can show you what to change on the next walk; do not delete useful evidence just to make the set look finished.',
      },
    },
    'zh-cn': {
      metaTitle: '一次城市散步：用三张照片讲一个地方',
      metaDescription:
        '规划三张信息互补的照片，比较原创三格概念图，完成自己的实拍序列，再复盘每张图贡献了什么。',
      title: '三张照片，一个地方',
      lessonTitle: '一次城市散步',
      intro: '让三张照片承担不同任务，比三张近乎重复的视角提供更多信息。',
      duration: '约 30 分钟',
      goal: '在一次短散步中，分别拍下环境、主体与细节照片。说明每张图的贡献，再选择符合自己表达意图的排列顺序。',
      equipment: [
        '任意相机或手机；一支熟悉的镜头或一个常用焦段范围就足够',
        '安全、允许拍摄的地点，例如安静街道、市场外部、公园或室内房间',
        '用笔记或心里记下的一句话：这个地方为什么值得被看见',
      ],
      prerequisites:
        '会控制基本曝光与对焦即可。不需要广角、中焦和微距镜头各一支，也不需要拍摄陌生人。',
      prediction: {
        title: '开始散步之前',
        question:
          '你想用三张照片说明一家社区小店的特点。哪个计划最有可能让整组照片提供更有用的信息？',
        choices: [
          {
            id: 'three-identical-frames',
            label:
              '同一张门面拍三份近乎重复的照片，文件更多，说明的信息就一定更多。',
            explanation:
              '这个选项把文件数量当成了新增信息。重复视角可以用于有意的比较，例如记录时间变化；但三张近乎相同的门面照，可能仍让观者对小店的同一些问题得不到回答。应问第二张与第三张为本题目标补充了什么。',
          },
          {
            id: 'complementary-information',
            label:
              '一张交代环境，一张呈现其中的具体对象或活动，一张揭示与主题有关的小细节。',
            explanation:
              '针对说明这家小店的目标，环境、具体对象或活动、相关细节可以回答不同问题。三张仍需要一个共同想法来连接。这个计划对本题的信息目标有帮助，但不规定哪种照片最有艺术性，也不规定唯一有效的排序。',
          },
          {
            id: 'required-lens-sequence',
            label: '唯一正确的方法是按固定顺序使用广角、中焦和微距镜头。',
            explanation:
              '这个选项用器材和顺序代替了信息角色。不同镜头能改变取景，名称本身却不说明观者学到了什么。在拍摄位置和最近对焦距离允许时，一支熟悉的镜头也能承担这些角色；排序应服务自己的想法。',
          },
        ],
        correctChoiceId: 'complementary-information',
        hint: '想一想：第二张与第三张能让观者知道哪些第一张尚未说清楚的信息？',
        correct:
          '互补的信息角色可以补充环境、视觉重点，以及大画面容易遗漏的证据。三张照片仍需要一个共同想法来连接。',
        incorrect:
          '文件数量不保证信息更多，器材名称也不会自动生成故事。应比较每个计划中的画面能贡献什么。',
        explanation:
          '环境、主体与细节是有用的信息角色，不是强制的镜头设置。环境帮助观者定位，具体主体展示这里有什么或正在发生什么，细节补充证据或质感。三张互补的照片不自动代表审美上更好，但与三张近乎重复的照片相比，它们更有可能表达一个地方的不同方面。排列顺序仍是编辑选择。',
      },
      observation: {
        heading: '2 · 实拍并复盘三张照片',
        title: '使用三种信息角色，而不是三条器材规则',
        intro:
          '概念图始终保留。先用一句话写下自己的意图，再按适合现场的条件与顺序拍摄三张照片。',
        modelTitle: '同一个小店街角的三种视角',
        modelNote:
          '原创概念插图，不是实拍样片或精确透视模拟。重复出现的琥珀色与自行车、车铃线索连接三格；这些只是可能的信息角色，不是唯一正确模板。',
        steps: [
          {
            id: 'make-environment-photo',
            title: '拍一张环境照片',
            detail:
              '先补完一句话：“这个地方特别之处在于……”再保留足以帮助观者定位的周围环境。检查边缘，留下支持这句话的元素。',
          },
          {
            id: 'make-subject-photo',
            title: '拍一张主体照片',
            detail:
              '选择此地的一个对象、活动或关系。通过移动或重新构图把它表达清楚，同时不要失去全部环境信息。主动选择对焦点，并根据运动情况选择快门时间。',
          },
          {
            id: 'make-detail-photo',
            title: '拍一张细节照片',
            detail:
              '寻找能支持同一想法的小特征：磨损、标签、重复形状或使用痕迹。只在安全且允许的位置靠近；确认对焦，不要默认必须使用微距镜头。',
          },
        ],
        checklist: [
          '每张照片新增了什么信息？哪两张最接近，能否替换其中一张？',
          '什么视觉或概念线索把三张照片连接起来，又不要求它们看起来完全一样？',
          '至少尝试两种排序。让细节先出现、而不是最后出现，会改变什么？',
        ],
      },
      reflection: {
        title: '复盘信息与表达意图',
        intro:
          '这里没有审美评分，也没有普遍正确的顺序。只勾选能在自己的三张照片里找到依据的观察。',
        checks: [
          {
            id: 'distinct-roles',
            label: '我能说明每张图的不同贡献，或指出一张希望替换的重复画面。',
          },
          {
            id: 'intentional-sequence',
            label:
              '我比较过至少两种顺序，能解释所选顺序为何符合主题，同时不把它称为唯一正确顺序。',
          },
          {
            id: 'technical-review',
            label:
              '我根据每张图的目的检查了对焦、运动、曝光与颜色，而不是把同一个参数规则套给全部三张照片。',
          },
        ],
        note: '复盘时先保留近似重复或意思不清的画面。它能提示下一次散步要改变什么；不要只为了让整组看起来完成就删掉有用的证据。',
      },
    },
  },
};
