import {
  missionById,
  practiceCopy,
  practiceUiCopy,
  type PracticeLocale,
} from '@data/practice';
import {
  createPracticeStore,
  emptyMissionProgress,
  type MissionProgress,
} from '@utils/practice/progress';

function localeOf(root: HTMLElement): PracticeLocale {
  return root.dataset.locale === 'zh-cn' ? 'zh-cn' : 'en';
}

function revealInteractive(root: HTMLElement): void {
  root
    .querySelectorAll<HTMLElement>('[data-practice-interactive]')
    .forEach(element => {
      element.hidden = false;
    });
  root
    .querySelectorAll<HTMLElement>('[data-static-choices]')
    .forEach(element => {
      element.hidden = true;
    });
  root
    .querySelectorAll<HTMLElement>('[data-static-reflection]')
    .forEach(element => {
      element.hidden = true;
    });
}

function initializeMission(root: HTMLElement): void {
  const mission = missionById(root.dataset.missionId ?? '');
  if (!mission) return;
  const locale = localeOf(root);
  const ui = practiceUiCopy[locale];
  const t = mission.copy[locale];
  const store = createPracticeStore();
  const form = root.querySelector<HTMLFormElement>('[data-prediction-form]');
  const answer = root.querySelector<HTMLDetailsElement>(
    '[data-answer-details]'
  );
  const slider = root.querySelector<HTMLInputElement>(
    '[data-direction-control]'
  );
  if (!form || !answer) return;
  let quizFeedback: string | null = null;
  let completionFeedback: string | null = null;

  const current = (): MissionProgress =>
    store.getState().missions[mission.id] ?? emptyMissionProgress(mission);
  const markActivity = (progress: MissionProgress) => {
    if (progress.status !== 'completed') progress.status = 'in-progress';
  };
  const setQuizFeedback = (message: string | null) => {
    quizFeedback = message;
  };

  const renderDirection = () => {
    if (!slider) return;
    const side = slider.value === '1';
    root.dataset.direction = side ? 'side' : 'front';
    const label = side ? ui.modelSide : ui.modelFront;
    slider.setAttribute('aria-valuetext', label);
    const labelElement = root.querySelector('[data-direction-label]');
    const description = root.querySelector('[data-direction-description]');
    if (labelElement) labelElement.textContent = label;
    if (description)
      description.textContent = side ? ui.sideDescription : ui.frontDescription;
  };

  const render = () => {
    const progress = current();
    const status = root.querySelector('[data-mission-status]');
    if (status)
      status.textContent =
        progress.status === 'completed'
          ? ui.completed
          : progress.status === 'in-progress'
            ? ui.inProgress
            : ui.notStarted;

    const notice = root.querySelector('[data-storage-notice]');
    if (notice) {
      const kind = store.getNotice();
      notice.textContent =
        kind === 'memory'
          ? ui.storageMemory
          : kind === 'recovered'
            ? ui.storageRecovered
            : ui.storagePersistent;
    }

    root
      .querySelectorAll<HTMLInputElement>('[data-prediction-choice]')
      .forEach(input => {
        input.checked = input.value === progress.prediction.choiceId;
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
    const derivedFeedback = progress.prediction.choiceId
      ? progress.prediction.solved
        ? t.prediction.correct
        : t.prediction.incorrect
      : null;
    const feedbackText = quizFeedback ?? derivedFeedback;
    if (feedback) {
      feedback.hidden = !feedbackText;
      feedback.textContent = feedbackText ?? '';
      feedback.className =
        'mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100';
    }
    const retry = root.querySelector<HTMLButtonElement>('[data-retry-answer]');
    if (retry)
      retry.hidden = !(
        progress.prediction.choiceId && !progress.prediction.solved
      );
    if (progress.prediction.revealed) answer.open = true;

    const complete = root.querySelector<HTMLButtonElement>(
      '[data-complete-mission]'
    );
    if (complete) {
      complete.textContent =
        progress.status === 'completed' ? ui.completed : ui.complete;
      complete.setAttribute(
        'aria-pressed',
        String(progress.status === 'completed')
      );
    }
    const completion = root.querySelector('[data-completion-feedback]');
    if (completion)
      completion.textContent =
        completionFeedback ??
        (progress.status === 'completed' ? ui.completed : '');
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const selected = form.querySelector<HTMLInputElement>(
      '[data-prediction-choice]:checked'
    );
    if (!selected) {
      setQuizFeedback(ui.chooseFirst);
      render();
      return;
    }
    const correct = selected.value === t.prediction.correctChoiceId;
    store.update(mission.id, progress => {
      progress.prediction.choiceId = selected.value;
      markActivity(progress);
    });
    setQuizFeedback(correct ? t.prediction.correct : t.prediction.incorrect);
    render();
  });
  root
    .querySelectorAll<HTMLInputElement>('[data-prediction-choice]')
    .forEach(input =>
      input.addEventListener('change', () => {
        setQuizFeedback('');
        const feedback = root.querySelector<HTMLElement>(
          '[data-quiz-feedback]'
        );
        if (feedback) feedback.hidden = true;
      })
    );
  root.querySelector('[data-retry-answer]')?.addEventListener('click', () => {
    store.update(mission.id, progress => {
      progress.prediction.choiceId = undefined;
      progress.prediction.solved = false;
      markActivity(progress);
    });
    setQuizFeedback('');
    render();
    root.querySelector<HTMLInputElement>('[data-prediction-choice]')?.focus();
  });
  root.querySelector('[data-show-answer]')?.addEventListener('click', () => {
    store.update(mission.id, progress => {
      progress.prediction.revealed = true;
      markActivity(progress);
    });
    answer.open = true;
    render();
    answer.querySelector('summary')?.focus();
  });

  slider?.addEventListener('input', renderDirection);
  root
    .querySelectorAll<HTMLInputElement>('[data-observation-step]')
    .forEach(input =>
      input.addEventListener('change', () => {
        const checked = [
          ...root.querySelectorAll<HTMLInputElement>(
            '[data-observation-step]:checked'
          ),
        ].map(item => item.dataset.observationStep ?? '');
        store.update(mission.id, progress => {
          progress.observationStepIds = checked;
          markActivity(progress);
        });
        render();
      })
    );
  root
    .querySelectorAll<HTMLInputElement>('[data-reflection-check]')
    .forEach(input =>
      input.addEventListener('change', () => {
        const checked = [
          ...root.querySelectorAll<HTMLInputElement>(
            '[data-reflection-check]:checked'
          ),
        ].map(item => item.dataset.reflectionCheck ?? '');
        store.update(mission.id, progress => {
          progress.reflectionCheckIds = checked;
          markActivity(progress);
        });
        render();
      })
    );

  root
    .querySelector('[data-complete-mission]')
    ?.addEventListener('click', () => {
      completionFeedback = null;
      store.update(mission.id, progress => {
        progress.status = 'completed';
      });
      render();
    });
  root.querySelector('[data-reset-mission]')?.addEventListener('click', () => {
    if (!window.confirm(ui.confirmReset)) return;
    store.resetMission(mission.id);
    form.reset();
    if (slider) slider.value = '0';
    answer.open = false;
    setQuizFeedback('');
    completionFeedback = ui.resetDone;
    renderDirection();
    render();
    root.querySelector<HTMLElement>('[data-prediction-heading]')?.focus();
  });

  renderDirection();
  render();
  revealInteractive(root);
}

function initializeIndex(root: HTMLElement): void {
  const locale = localeOf(root);
  const copy = practiceCopy[locale];
  const ui = practiceUiCopy[locale];
  const store = createPracticeStore();
  const render = () => {
    root.querySelectorAll<HTMLElement>('[data-practice-card]').forEach(card => {
      const id = card.dataset.practiceCard ?? '';
      const progress = store.getState().missions[id];
      const status = card.querySelector('[data-card-status]');
      if (status)
        status.textContent =
          progress?.status === 'completed'
            ? copy.completed
            : progress?.status === 'in-progress'
              ? copy.inProgress
              : copy.notStarted;
    });
    const storage = root.querySelector('[data-storage-notice]');
    if (storage)
      storage.textContent =
        store.getNotice() === 'memory'
          ? ui.storageMemory
          : store.getNotice() === 'recovered'
            ? ui.storageRecovered
            : ui.storagePersistent;
  };
  root.querySelector('[data-clear-all]')?.addEventListener('click', () => {
    if (!window.confirm(copy.confirmClear)) return;
    store.clearAll();
    render();
    const feedback = root.querySelector('[data-clear-feedback]');
    if (feedback) feedback.textContent = copy.cleared;
  });
  render();
  revealInteractive(root);
}

function mount(
  selector: string,
  initialize: (root: HTMLElement) => void
): void {
  const run = () =>
    document.querySelectorAll<HTMLElement>(selector).forEach(root => {
      if (root.dataset.initialized === 'true') return;
      initialize(root);
      root.dataset.initialized = 'true';
    });
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  document.addEventListener('astro:page-load', run);
}

export function initializePracticeMissions(): void {
  mount('[data-practice-mission]', initializeMission);
}

export function initializePracticeIndex(): void {
  mount('[data-practice-index]', initializeIndex);
}
