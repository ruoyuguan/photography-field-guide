import { lightweightEditingPredictionFeedback } from '@data/lightweight-editing-practice';
import type { MarketingLocale } from '@utils/locale';
import {
  createLightweightEditingStore,
  isLightweightEditingReady,
  LIGHTWEIGHT_EDITING_STORAGE_KEY,
  type LightweightEditingProgress,
} from '@utils/practice/lightweight-editing-progress';

export const lightweightEditingUi = {
  en: {
    notStarted: 'Not started',
    inProgress: 'In progress',
    completed: 'Review completed',
    storagePersistent:
      'Only your checked items and answer ID are stored in this browser. Photos, file names, dimensions, notes, and metadata never enter this page.',
    storageRecovered:
      'Invalid or outdated saved items were reset safely. Review the checklist before continuing; no photo information was read.',
    storageMemory:
      'Browser storage is unavailable. This task still works, but changes last only until this page is closed or reloaded.',
    chooseFirst: 'Choose one prediction before checking.',
    confirmReset:
      'Reset only this lightweight-editing practice? Other mission progress, preferences, photographs, and local files will not be changed.',
    resetDone:
      'This practice was reset. Other task progress and preferences were preserved.',
    resetMemory:
      'This page was reset, but browser storage is unavailable. An older saved copy may remain; no other task or preference was changed.',
    requirements:
      'To mark the review complete: solve the prediction, finish all three local steps, and check all three self-review statements.',
    ready:
      'The process checklist is ready. Mark it complete only after your local review; this is not an aesthetic score.',
    completion:
      'Review marked complete. Keep the source and backup so you can revisit every decision.',
  },
  'zh-cn': {
    notStarted: '未开始',
    inProgress: '进行中',
    completed: '复盘已完成',
    storagePersistent:
      '此浏览器只保存勾选项与答案 ID。照片、文件名、尺寸、笔记和元数据都不会进入本页。',
    storageRecovered:
      '无效或过期的保存项已安全重置。继续前请复核清单；本站没有读取任何照片信息。',
    storageMemory:
      '浏览器存储不可用。任务仍可使用，但更改只会保留到本页关闭或刷新。',
    chooseFirst: '请先选择一个预测，再检查答案。',
    confirmReset:
      '只重置这项轻量后期练习吗？其他任务进度、偏好设置、照片和本地文件都不会改变。',
    resetDone: '本练习已重置，其他任务进度与偏好设置均已保留。',
    resetMemory:
      '本页已重置，但浏览器存储不可用，旧的保存副本可能仍在；其他任务与偏好设置未改变。',
    requirements:
      '标记复盘完成前，请答对预测题、完成三项本地操作，并勾选三项自主复盘。',
    ready: '流程清单已齐全。完成本地复盘后再标记；这不是审美评分。',
    completion: '复盘已标记完成。保留原片和备份，以后仍可重审每个决定。',
  },
} as const;

function activate(progress: LightweightEditingProgress): void {
  if (progress.status !== 'completed' || !isLightweightEditingReady(progress))
    progress.status = 'in-progress';
}

function initialize(root: HTMLElement): void {
  const locale: MarketingLocale =
    root.dataset.locale === 'zh-cn' ? 'zh-cn' : 'en';
  const ui = lightweightEditingUi[locale];
  const store = createLightweightEditingStore();
  const form = root.querySelector<HTMLFormElement>('[data-prediction-form]');
  const answer = root.querySelector<HTMLDetailsElement>(
    '[data-answer-details]'
  );
  if (!form || !answer) return;

  let quizFeedback: string | null = null;
  let completionFeedback: string | null = null;
  let draftChoiceId = store.getState().prediction.choiceId;
  let hasDraftChoice = false;

  const render = () => {
    const progress = store.getState();
    const status = root.querySelector('[data-mission-status]');
    if (status)
      status.textContent =
        progress.status === 'completed'
          ? ui.completed
          : progress.status === 'in-progress'
            ? ui.inProgress
            : ui.notStarted;

    const notice = root.querySelector<HTMLElement>('[data-storage-notice]');
    if (notice) {
      const kind = store.getNotice();
      notice.textContent =
        kind === 'memory'
          ? ui.storageMemory
          : kind === 'recovered'
            ? ui.storageRecovered
            : ui.storagePersistent;
      notice.dataset.storageState = kind;
    }

    root
      .querySelectorAll<HTMLInputElement>('[data-prediction-choice]')
      .forEach(input => {
        input.checked = input.value === draftChoiceId;
      });
    root
      .querySelectorAll<HTMLInputElement>('[data-observation-step]')
      .forEach(input => {
        input.checked = progress.observationStepIds.includes(
          input.dataset.observationStep ?? ''
        );
      });
    root
      .querySelectorAll<HTMLInputElement>('[data-reflection-check]')
      .forEach(input => {
        input.checked = progress.reflectionCheckIds.includes(
          input.dataset.reflectionCheck ?? ''
        );
      });

    const feedback = root.querySelector<HTMLElement>('[data-quiz-feedback]');
    const text =
      quizFeedback ??
      lightweightEditingPredictionFeedback(
        locale,
        progress.prediction.choiceId
      );
    if (feedback) {
      feedback.hidden = !text;
      feedback.textContent = text ?? '';
      feedback.dataset.choiceId = progress.prediction.choiceId ?? '';
      feedback.dataset.correct = String(progress.prediction.solved);
      feedback.className = progress.prediction.solved
        ? 'mt-3 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100'
        : 'mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100';
    }
    const retry = root.querySelector<HTMLButtonElement>('[data-retry-answer]');
    if (retry)
      retry.hidden = !(
        progress.prediction.choiceId && !progress.prediction.solved
      );

    const complete = root.querySelector<HTMLButtonElement>(
      '[data-complete-mission]'
    );
    if (complete) {
      complete.disabled = !isLightweightEditingReady(progress);
      complete.textContent =
        progress.status === 'completed'
          ? ui.completed
          : (complete.dataset.label ?? '');
      complete.setAttribute(
        'aria-pressed',
        String(progress.status === 'completed')
      );
    }
    const completion = root.querySelector<HTMLElement>(
      '[data-completion-feedback]'
    );
    if (completion)
      completion.textContent =
        completionFeedback ??
        (progress.status === 'completed'
          ? ui.completion
          : isLightweightEditingReady(progress)
            ? ui.ready
            : ui.requirements);
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector<HTMLInputElement>(
      '[data-prediction-choice]:checked'
    );
    if (!selected) {
      quizFeedback = ui.chooseFirst;
      render();
      return;
    }
    store.update(progress => {
      progress.prediction.choiceId = selected.value;
      activate(progress);
    });
    draftChoiceId = selected.value;
    completionFeedback = null;
    hasDraftChoice = false;
    quizFeedback = lightweightEditingPredictionFeedback(locale, selected.value);
    render();
  });
  root
    .querySelectorAll<HTMLInputElement>('[data-prediction-choice]')
    .forEach(input =>
      input.addEventListener('change', () => {
        draftChoiceId = input.value;
        hasDraftChoice = true;
        quizFeedback = '';
        render();
      })
    );
  root.querySelector('[data-retry-answer]')?.addEventListener('click', () => {
    store.update(progress => {
      progress.prediction.choiceId = undefined;
      activate(progress);
    });
    draftChoiceId = undefined;
    completionFeedback = null;
    hasDraftChoice = false;
    quizFeedback = '';
    render();
    root.querySelector<HTMLInputElement>('[data-prediction-choice]')?.focus();
  });
  root.querySelector('[data-show-answer]')?.addEventListener('click', () => {
    store.update(progress => {
      progress.prediction.revealed = true;
      activate(progress);
    });
    answer.open = true;
    render();
    answer.querySelector('summary')?.focus();
  });
  answer.open = store.getState().prediction.revealed;
  answer.addEventListener('toggle', () => {
    if (!answer.open || store.getState().prediction.revealed) return;
    store.update(progress => {
      progress.prediction.revealed = true;
      activate(progress);
    });
    render();
  });

  root
    .querySelectorAll<HTMLInputElement>('[data-observation-step]')
    .forEach(input =>
      input.addEventListener('change', () => {
        const id = input.dataset.observationStep ?? '';
        const checked = input.checked;
        completionFeedback = null;
        store.update(progress => {
          progress.observationStepIds = checked
            ? [...new Set([...progress.observationStepIds, id])]
            : progress.observationStepIds.filter(stepId => stepId !== id);
          activate(progress);
        });
        render();
      })
    );
  root
    .querySelectorAll<HTMLInputElement>('[data-reflection-check]')
    .forEach(input =>
      input.addEventListener('change', () => {
        const id = input.dataset.reflectionCheck ?? '';
        const checked = input.checked;
        completionFeedback = null;
        store.update(progress => {
          progress.reflectionCheckIds = checked
            ? [...new Set([...progress.reflectionCheckIds, id])]
            : progress.reflectionCheckIds.filter(checkId => checkId !== id);
          activate(progress);
        });
        render();
      })
    );

  root
    .querySelector('[data-complete-mission]')
    ?.addEventListener('click', () => {
      if (!isLightweightEditingReady(store.getState())) {
        completionFeedback = ui.requirements;
        render();
        return;
      }
      store.update(progress => {
        progress.status = 'completed';
      });
      completionFeedback = ui.completion;
      render();
    });
  root.querySelector('[data-reset-mission]')?.addEventListener('click', () => {
    if (!window.confirm(ui.confirmReset)) return;
    store.reset();
    form.reset();
    draftChoiceId = undefined;
    hasDraftChoice = false;
    answer.open = false;
    quizFeedback = '';
    completionFeedback =
      store.getNotice() === 'memory' ? ui.resetMemory : ui.resetDone;
    render();
    root.querySelector<HTMLElement>('[data-prediction-heading]')?.focus();
  });

  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== LIGHTWEIGHT_EDITING_STORAGE_KEY)
      return;
    if (!root.isConnected) return;
    const progress = store.getState();
    if (!hasDraftChoice) draftChoiceId = progress.prediction.choiceId;
    if (!progress.prediction.revealed) answer.open = false;
    quizFeedback = hasDraftChoice ? '' : null;
    completionFeedback = null;
    render();
  });

  root
    .querySelectorAll<HTMLElement>('[data-editing-interactive]')
    .forEach(el => {
      el.hidden = false;
    });
  root.querySelectorAll<HTMLElement>('[data-editing-static]').forEach(el => {
    el.hidden = true;
  });
  render();
}

export function initializeLightweightEditingPractice(): void {
  const run = () =>
    document
      .querySelectorAll<HTMLElement>('[data-lightweight-editing-practice]')
      .forEach(root => {
        if (root.dataset.initialized === 'true') return;
        initialize(root);
        root.dataset.initialized = 'true';
      });
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  document.addEventListener('astro:page-load', run);
}
