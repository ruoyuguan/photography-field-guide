import {
  createPracticeIndexStore,
  PRACTICE_PROGRESS_KEYS,
} from '@utils/practice/index-progress';
import { predictionFeedback } from '@utils/practice/feedback';
import { selectPracticeSuggestion } from '@utils/practice/suggestion';
import { practiceCatalog } from '@data/practice-catalog';
import { practicePathCopy } from '@copy/practice-paths';
import {
  missionById,
  practiceCopy,
  practiceUiCopy,
  type PracticeLocale,
} from '@data/practice';
import {
  createPracticeStore,
  emptyMissionProgress,
  PRACTICE_STORAGE_KEY,
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
  let draftChoiceId = current().prediction.choiceId;
  let hasDraftChoice = false;
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
    const derivedFeedback = predictionFeedback(
      mission,
      locale,
      progress.prediction.choiceId
    );
    const feedbackText = quizFeedback ?? derivedFeedback;
    if (feedback) {
      feedback.hidden = !feedbackText;
      feedback.textContent = feedbackText ?? '';
      feedback.dataset.choiceId = progress.prediction.choiceId ?? '';
      feedback.className =
        'mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100';
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
    const response = predictionFeedback(mission, locale, selected.value);
    if (response === null) {
      setQuizFeedback(ui.chooseFirst);
      render();
      return;
    }
    store.update(mission.id, progress => {
      progress.prediction.choiceId = selected.value;
      markActivity(progress);
    });
    draftChoiceId = selected.value;
    hasDraftChoice = false;
    setQuizFeedback(response);
    render();
  });
  root
    .querySelectorAll<HTMLInputElement>('[data-prediction-choice]')
    .forEach(input =>
      input.addEventListener('change', () => {
        draftChoiceId = input.value;
        hasDraftChoice = true;
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
    draftChoiceId = undefined;
    hasDraftChoice = false;
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
  answer.open = current().prediction.revealed;
  answer.addEventListener('toggle', () => {
    if (!answer.open || current().prediction.revealed) return;
    store.update(mission.id, progress => {
      progress.prediction.revealed = true;
      markActivity(progress);
    });
    render();
  });

  slider?.addEventListener('input', renderDirection);
  root
    .querySelectorAll<HTMLInputElement>('[data-observation-step]')
    .forEach(input =>
      input.addEventListener('change', () => {
        const id = input.dataset.observationStep ?? '';
        const checked = input.checked;
        store.update(mission.id, progress => {
          progress.observationStepIds = checked
            ? [...new Set([...progress.observationStepIds, id])]
            : progress.observationStepIds.filter(stepId => stepId !== id);
          markActivity(progress);
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
        store.update(mission.id, progress => {
          progress.reflectionCheckIds = checked
            ? [...new Set([...progress.reflectionCheckIds, id])]
            : progress.reflectionCheckIds.filter(checkId => checkId !== id);
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
    draftChoiceId = undefined;
    hasDraftChoice = false;
    if (slider) slider.value = '0';
    answer.open = false;
    setQuizFeedback('');
    completionFeedback =
      store.getNotice() === 'memory' ? ui.resetMemory : ui.resetDone;
    renderDirection();
    render();
    root.querySelector<HTMLElement>('[data-prediction-heading]')?.focus();
  });

  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== PRACTICE_STORAGE_KEY) return;
    if (!root.isConnected) return;
    const progress = current();
    if (!hasDraftChoice) draftChoiceId = progress.prediction.choiceId;
    if (!progress.prediction.revealed) answer.open = false;
    setQuizFeedback(hasDraftChoice ? '' : null);
    completionFeedback = null;
    render();
  });

  renderDirection();
  render();
  revealInteractive(root);
}

function initializeIndex(root: HTMLElement): void {
  const locale = localeOf(root);
  const copy = practiceCopy[locale];
  const ui = practiceUiCopy[locale];
  const store = createPracticeIndexStore();
  const render = () => {
    root.querySelectorAll<HTMLElement>('[data-practice-card]').forEach(card => {
      const id = card.dataset.practiceCard ?? '';
      const progress = store.getStatus(id);
      const status = card.querySelector('[data-card-status]');
      if (status)
        status.textContent =
          progress === 'completed'
            ? copy.completed
            : progress === 'in-progress'
              ? copy.inProgress
              : copy.notStarted;
    });
    const pathCopy = practicePathCopy[locale];
    const statuses = Object.fromEntries(
      practiceCatalog.map(entry => [entry.id, store.getStatus(entry.id)])
    );
    const suggestion = selectPracticeSuggestion(statuses);
    const target = practiceCatalog.find(
      entry => entry.id === suggestion.missionId
    )!;
    const panel = root.querySelector<HTMLElement>('[data-practice-suggestion]');
    if (panel) {
      panel.dataset.suggestionKind = suggestion.kind;
      panel.dataset.missionId = suggestion.missionId;
      const mode = pathCopy.suggestion[suggestion.kind];
      const title = panel.querySelector('[data-suggestion-title]');
      const reason = panel.querySelector('[data-suggestion-reason]');
      const link = panel.querySelector<HTMLAnchorElement>(
        '[data-suggestion-link]'
      );
      const summary = panel.querySelector('[data-practice-summary]');
      const card = [
        ...root.querySelectorAll<HTMLElement>('[data-practice-card]'),
      ].find(card => card.dataset.practiceCard === suggestion.missionId);
      const href = card
        ?.querySelector<HTMLAnchorElement>('[data-practice-open]')
        ?.getAttribute('href');
      if (title) title.textContent = mode.title;
      if (reason) reason.textContent = mode.reason;
      if (link && href) {
        link.setAttribute('href', href);
        link.textContent = `${mode.action}: ${target.copy[locale].title} →`;
      }
      if (summary)
        summary.textContent = pathCopy.summary(
          suggestion.completedCount,
          suggestion.totalCount
        );
    }
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
    if (feedback)
      feedback.textContent =
        store.getNotice() === 'memory' ? copy.clearedMemory : copy.cleared;
  });
  window.addEventListener('storage', event => {
    if (
      event.key !== null &&
      !PRACTICE_PROGRESS_KEYS.some(key => key === event.key)
    )
      return;
    if (!root.isConnected) return;
    render();
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
