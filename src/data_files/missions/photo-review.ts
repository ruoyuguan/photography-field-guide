import type { PracticeMission } from '../practice.ts';

export const photoReviewMission: PracticeMission = {
  id: 'photo-review',
  number: 4,
  version: 1,
  visual: 'review',
  articlePath: '/learn/field-practice/photo-review/',
  copy: {
    en: {
      metaTitle: 'Select photos, review the shoot, and plan a reshoot',
      metaDescription:
        'Compare a six-frame concept sheet, select your own photos locally, separate technical evidence from editorial choices, and plan one change for the next shoot.',
      title: 'Select, review, reshoot',
      lessonTitle: 'Photo Selection and Review',
      intro:
        'Turn a small set of photographs into a selection you can explain and one useful idea for the next shoot.',
      duration: 'About 20 minutes',
      goal: 'Group similar frames, compare their purpose and technical usability, make a small selection without deleting the originals, and choose one specific change to test next time.',
      equipment: [
        'About 9–24 photographs from one short shoot; photos from any earlier mission or another session are equally welcome',
        'Any local camera, phone, or computer viewer that can show photographs side by side or in a consistent sequence',
        'An optional notebook for reasons and one next action; written notes stay outside this website',
      ],
      prerequisites:
        'No earlier mission is required. Basic exposure and focus vocabulary helps, but you do not need Lightroom, a particular camera, or a finished photo story.',
      prediction: {
        title: 'Before you choose the candidates',
        question:
          'You are selecting photographs for a stated purpose, not judging artistic worth. Which review process is the most defensible?',
        choices: [
          {
            id: 'purpose-and-evidence',
            label:
              'Compare how each frame serves the intention, check whether focus, motion, and exposure interfere with that use, and keep candidates reversible while deciding.',
          },
          {
            id: 'sharpest-always-wins',
            label:
              'Always choose the sharpest frame, even when it repeats information or misses the intended moment.',
          },
          {
            id: 'delete-unselected',
            label:
              'Delete every unselected frame during the first pass so that no comparison evidence remains.',
          },
        ],
        correctChoiceId: 'purpose-and-evidence',
        hint: 'Separate two questions: “Does this frame serve my purpose?” and “Can I see what this use requires?” Then ask whether your choice can be revisited.',
        correct:
          'Editorial fit and technical evidence answer different questions. A reversible candidate marker lets you compare both without prematurely destroying useful evidence.',
        incorrect:
          'Sharpness alone cannot decide what a photograph contributes, and immediate deletion removes evidence that could help the next shoot. Use purpose, technical inspection, and a reversible selection.',
        explanation:
          'A useful review checks both what a photograph means for the current purpose and whether its technical rendering supports that use. A soft frame may fail a detail-critical purpose, while intentional motion blur may be exactly what another photograph needs; neither rule works without context. Conversely, a technically clean frame can still be redundant. Marking candidates, rejects, or an album is different from erasing files. Keep the originals during this exercise so that an unselected frame can still reveal what to change next time.',
      },
      observation: {
        heading: '2 · Select and review your own photographs',
        title: 'Group first, compare second, then choose one next change',
        intro:
          'Use your own local viewer. The six concept frames demonstrate comparison groups, not automatic picks. Do not upload or delete photographs for this mission.',
        modelTitle:
          'A small contact sheet is a comparison space, not a scorecard',
        modelNote:
          'Original concept illustrations, not sample photographs or real EXIF. Similar frames are grouped to make differences easier to inspect; none is an objectively winning image.',
        steps: [
          {
            id: 'group-similar-frames',
            title: 'Group similar frames without deleting',
            detail:
              'Choose about 9–24 photographs from one shoot. Group near-duplicates or frames intended for the same role. Keep the originals and use flags, albums, or another reversible local method if available.',
          },
          {
            id: 'compare-purpose-and-technique',
            title: 'Compare purpose and technical usability',
            detail:
              'Within each group, compare frames at a consistent display size. Ask what each adds, then zoom only as needed to inspect intended focus, motion, and important highlights. Keep a small set of candidates; for a three-frame story, choose up to one for each useful role rather than forcing a quota.',
          },
          {
            id: 'plan-next-experiment',
            title: 'Turn one weakness into a next-shoot experiment',
            detail:
              'If you have more than one selected frame, compare at least two orders. Identify one information or technical gap and write one action for the next shoot: change the lamp direction, shift the viewpoint, adjust shutter time for the motion, or redefine a repeated role.',
          },
        ],
        checklist: [
          'What does each selected frame contribute, and what did one unselected near-duplicate help you notice?',
          'Which observed issue is technical, which is an editorial choice, and does either prevent the intended use?',
          'What single condition will you change next time, and what visible result will you compare?',
        ],
      },
      reflection: {
        title: 'Close the loop with evidence, not a score',
        intro:
          'Select only statements you can support with your own photographs. There is no automatic aesthetic judgment or requirement to keep a particular number.',
        checks: [
          {
            id: 'explain-selection',
            label:
              'I can explain why each selected frame belongs and what one unselected near-duplicate helped me learn.',
          },
          {
            id: 'review-technical-purpose',
            label:
              'I separated technical usability from editorial fit and checked whether the observed issue actually interferes with my intended use.',
          },
          {
            id: 'choose-next-change',
            label:
              'I chose one concrete condition to change on the next shoot and one visible result to compare.',
          },
        ],
        note: 'A selection is a decision for this purpose, not a permanent verdict. Keep the originals during this exercise; backup, deletion, and card formatting require a separate, verified workflow.',
      },
    },
    'zh-cn': {
      metaTitle: '筛选照片、复盘拍摄并计划下一次实践',
      metaDescription:
        '比较六格概念接触表，在本地筛选自己的照片，区分技术证据与编辑选择，再为下一次拍摄确定一项改动。',
      title: '筛选、复盘、再拍',
      lessonTitle: '照片筛选与复盘',
      intro:
        '把一小组照片整理成能够解释的选择，并得到一个对下一次拍摄有用的改进想法。',
      duration: '约 20 分钟',
      goal: '将近似画面分组，比较它们的用途与技术可用性，在不删除原片的情况下完成小组筛选，并确定下一次要测试的一项具体改动。',
      equipment: [
        '同一次短拍摄的约 9–24 张照片；可以使用此前任何任务或其他拍摄的照片',
        '任意能并排或按一致顺序显示照片的本地相机、手机或电脑查看器',
        '可选的纸质或本地笔记，用来记录理由和下一步；文字不会写入本网站',
      ],
      prerequisites:
        '不需要先完成其他任务。了解基本曝光与对焦词汇会有帮助，但不需要 Lightroom、特定相机或已经完成的组照。',
      prediction: {
        title: '选择候选照片之前',
        question:
          '你正在为一个明确用途筛选照片，而不是评判艺术价值。哪种复盘过程更有依据？',
        choices: [
          {
            id: 'purpose-and-evidence',
            label:
              '比较每张图如何服务拍摄意图，检查对焦、运动与曝光是否妨碍这一用途，并在决定期间保留可撤销的候选标记。',
          },
          {
            id: 'sharpest-always-wins',
            label: '永远选择最锐利的一张，即使它重复信息或错过了想表达的瞬间。',
          },
          {
            id: 'delete-unselected',
            label: '第一轮就删除全部未选照片，不留下任何可供比较的证据。',
          },
        ],
        correctChoiceId: 'purpose-and-evidence',
        hint: '分开两个问题：“这张是否符合我的用途？”“我能否看清这种用途需要的内容？”再想一想你的选择能否重新修改。',
        correct:
          '表达适配度与技术证据回答的是不同问题。可撤销的候选标记让你同时比较两者，又不提前毁掉有用的证据。',
        incorrect:
          '锐利程度不能独自决定照片的贡献，立即删除又会失去帮助下一次拍摄的证据。应结合用途、技术检查与可撤销的筛选。',
        explanation:
          '有用的复盘既检查照片对当前用途表达了什么，也检查技术呈现是否支持这种用途。一张脱焦照片可能不适合需要细节的任务，有意运动模糊却可能正是另一张照片所需；脱离语境，任何一条规则都不成立。反过来，技术干净的照片也可能只是重复。候选、排除或相册标记不等于抹除文件。本练习保留原片，让未选照片仍能提示下一次要改变什么。',
      },
      observation: {
        heading: '2 · 筛选并复盘自己的照片',
        title: '先分组，再比较，最后只选一项改动',
        intro:
          '使用自己的本地查看器。六格概念图演示比较分组，不是自动入选结果。本任务不要求上传或删除照片。',
        modelTitle: '小型接触表是比较空间，不是记分卡',
        modelNote:
          '原创概念插图，不是实拍样片或真实 EXIF。把近似画面分组，是为了更容易检查差别；没有哪张是客观获胜的照片。',
        steps: [
          {
            id: 'group-similar-frames',
            title: '将近似画面分组，不删除原片',
            detail:
              '选择同一次拍摄的约 9–24 张照片，把近似重复或承担相同预期角色的画面归为一组。保留原片；如果查看器支持，可使用旗标、相册或其他可撤销的本地整理方式。',
          },
          {
            id: 'compare-purpose-and-technique',
            title: '比较表达用途与技术可用性',
            detail:
              '在每组内以一致的显示大小比较，先问每张图新增了什么，再按需放大检查预期对焦位置、运动与重要高光。保留少量候选；三格组照可为每种有用角色至多选一张，但不硬凑数量。',
          },
          {
            id: 'plan-next-experiment',
            title: '把一个薄弱点变成下一次实验',
            detail:
              '如果入选多于一张，至少比较两种排序。找出一个信息或技术缺口，并写下下一次拍摄的一项行动：改变灯位、移动机位、根据运动调整快门时间，或重新定义重复的角色。',
          },
        ],
        checklist: [
          '每张入选照片贡献了什么？一张未选的近似画面又让你注意到了什么？',
          '哪个问题属于技术表现，哪个属于编辑选择？它们是否真的妨碍本次用途？',
          '下一次只改变哪个条件？准备比较哪一个可见结果？',
        ],
      },
      reflection: {
        title: '用证据闭合学习路径，而不是打分',
        intro:
          '只勾选能用自己的照片支持的陈述。没有自动审美判断，也不要求保留固定数量。',
        checks: [
          {
            id: 'explain-selection',
            label:
              '我能解释每张入选照片为何保留，以及一张未选近似画面让我学到了什么。',
          },
          {
            id: 'review-technical-purpose',
            label:
              '我区分了技术可用性与表达适配度，并检查观察到的问题是否真的妨碍本次用途。',
          },
          {
            id: 'choose-next-change',
            label:
              '我确定了下一次拍摄要改变的一个具体条件，以及要比较的一个可见结果。',
          },
        ],
        note: '筛选只是针对本次用途的决定，不是永久判决。本练习保留原片；备份、删除与存储卡格式化需要另一套经过核实的独立流程。',
      },
    },
  },
};
