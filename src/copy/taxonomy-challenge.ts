import type { MarketingLocale } from '@utils/locale';

export const taxonomyChallengeQuestions = [
  { id: 'format-and-viewfinder', termId: 'dslr', correctChoice: 2 },
  { id: 'fixed-lens-and-focus', termId: 'fixed-lens', correctChoice: 0 },
] as const;

type QuestionId = (typeof taxonomyChallengeQuestions)[number]['id'];
type Choice = { label: string; feedback: string };

interface ChallengeCopy {
  title: string;
  intro: string;
  correct: string;
  incorrect: string;
  retry: string;
  showAnswer: string;
  returnToQuestion: string;
  questions: Record<
    QuestionId,
    { prompt: string; readMore: string; choices: [Choice, Choice, Choice] }
  >;
}

export const taxonomyChallengeCopy: Record<MarketingLocale, ChallengeCopy> = {
  en: {
    title: '60-second classification challenge',
    intro:
      'Use the three cameras above to make two predictions. Pick an answer to see why it works or where it goes wrong.',
    correct: 'Correct.',
    incorrect: 'Try again.',
    retry: 'Reset this question',
    showAnswer: 'Show the answer and explanation',
    returnToQuestion: 'Back to the classification question',
    questions: {
      'format-and-viewfinder': {
        prompt:
          'The X-T5 and Nikon D200 both use APS-C. Does that mean their viewfinders work the same way?',
        readMore: 'Read about DSLR viewfinders',
        choices: [
          {
            label: 'Yes. APS-C tells you how both viewfinders work.',
            feedback:
              'APS-C describes the size of the recording area. The comparison shows that the X-T5 uses electronic viewing and the D200 uses optical viewing.',
          },
          {
            label:
              'No. Whether the lens can be changed determines the viewing method.',
            feedback:
              'Both cameras have interchangeable lenses, yet they use different viewing methods. Look at the viewfinder row in the comparison.',
          },
          {
            label:
              'No. Recording area and viewfinder design describe different things.',
            feedback:
              'The X-T5 shows a sensor feed in its electronic viewfinder. The D200 uses a mirror and prism to send light from the lens to its optical viewfinder. Both record on APS-C sensors.',
          },
        ],
      },
      'fixed-lens-and-focus': {
        prompt: 'The GFX100RF has a built-in lens. Can it still autofocus?',
        readMore: 'Read about fixed-lens cameras',
        choices: [
          {
            label: 'Yes. A lens can adjust focus even when it stays attached.',
            feedback:
              'The GFX100RF can autofocus with its built-in lens. “Fixed lens” tells you whether the lens can be swapped, “prime” tells you it has one focal length, and autofocus tells you how the camera sets focus.',
          },
          {
            label: 'No. A built-in lens can focus at only one distance.',
            feedback:
              '“Fixed” describes how the lens attaches. The GFX100RF can focus at different distances even though its lens stays on the camera.',
          },
          {
            label: 'Only after you zoom.',
            feedback:
              'Zoom changes focal length. Autofocus adjusts the distance at which the subject looks sharp. The GFX100RF can autofocus at its single focal length.',
          },
        ],
      },
    },
  },
  'zh-cn': {
    title: '60 秒分类挑战',
    intro: '用上面三台相机做两次判断。选一个答案，看看理由和你想的一不一样。',
    correct: '答对了。',
    incorrect: '再想想。',
    retry: '重试这一题',
    showAnswer: '展开答案与解释',
    returnToQuestion: '返回分类挑战原题',
    questions: {
      'format-and-viewfinder': {
        prompt:
          'X-T5 和 Nikon D200 都是 APS-C 画幅。它们的取景器工作方式一样吗？',
        readMore: '了解数码单反的取景方式',
        choices: [
          {
            label: '一样。看 APS-C 标签就知道两台相机如何取景。',
            feedback:
              'APS-C 描述记录区域的尺寸。对照里可以看到，X-T5 用电子取景，D200 用光学取景。',
          },
          {
            label: '不一样。取景方式由镜头能否更换决定。',
            feedback:
              '两台相机都能更换镜头，但取景方式不同。再看一眼对照里的「取景与光学结构」。',
          },
          {
            label: '不一样。记录区域与取景结构描述的是两件事。',
            feedback:
              'X-T5 的电子取景器显示传感器画面。D200 用反光镜和棱镜，把镜头进来的光送到光学取景器。两台都用 APS-C 传感器记录影像。',
          },
        ],
      },
      'fixed-lens-and-focus': {
        prompt: 'GFX100RF 的镜头装在机身上，不能更换。它还能自动对焦吗？',
        readMore: '了解固定镜头相机',
        choices: [
          {
            label: '能。镜头装在机身上，也可以调节对焦。',
            feedback:
              'GFX100RF 能用内置镜头自动对焦。「固定镜头」说的是能否换镜头，「定焦」说的是只有一个焦距，「自动对焦」说的是相机怎样对准焦点。',
          },
          {
            label: '不能。内置镜头只能对在一个距离上。',
            feedback:
              '这里的「固定」说的是镜头如何连接机身。GFX100RF 的镜头不用拆下来，也能对准不同距离的主体。',
          },
          {
            label: '只有先变焦，才能自动对焦。',
            feedback:
              '变焦改变镜头的焦距。自动对焦调整的是哪个距离上的主体最清晰。GFX100RF 只有一个焦距，也能自动对焦。',
          },
        ],
      },
    },
  },
};
