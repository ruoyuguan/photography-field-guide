import type { ToolsCopy } from '@copy/tools';
import type { CalculationResult } from '@utils/photography/validation';

export type ToolError = Extract<CalculationResult<unknown>, { ok: false }>;
type CommonCopy = ToolsCopy['common'];

export function field(root: HTMLElement, name: string): HTMLInputElement {
  const input = root.querySelector<HTMLInputElement>(`[data-field="${name}"]`);
  if (!input) throw new Error(`Missing tool input: ${name}`);
  return input;
}

export function range(root: HTMLElement, name: string): HTMLInputElement {
  const input = root.querySelector<HTMLInputElement>(
    `[data-range-for="${name}"]`
  );
  if (!input) throw new Error(`Missing tool range: ${name}`);
  return input;
}

export function setText(root: HTMLElement, key: string, value: string): void {
  const element = root.querySelector(`[data-result="${key}"]`);
  if (element) element.textContent = value;
}

export function numberFormatter(locale: string, maximumFractionDigits = 2) {
  return new Intl.NumberFormat(locale === 'zh-cn' ? 'zh-CN' : 'en-US', {
    maximumFractionDigits,
  });
}

export function signed(value: number, digits = 2): string {
  const normalized = Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value;
  return `${normalized > 0 ? '+' : ''}${normalized.toFixed(digits)}`;
}

export function compactInputNumber(value: number): string {
  return String(Number(value.toPrecision(8)));
}

export function formatShutter(seconds: number): string {
  if (seconds < 1) return `1/${Math.round(1 / seconds)}`;
  return compactInputNumber(seconds);
}

export function syncRange(
  root: HTMLElement,
  name: string,
  value: number
): void {
  const slider = range(root, name);
  slider.value = String(
    slider.dataset.scale === 'log2' ? Math.log2(value) : value
  );
}

export function applyRange(root: HTMLElement, name: string): void {
  const slider = range(root, name);
  const numeric = Number(slider.value);
  const value = slider.dataset.scale === 'log2' ? 2 ** numeric : numeric;
  const input = field(root, name);
  input.value =
    input.dataset.format === 'shutter'
      ? formatShutter(value)
      : compactInputNumber(value);
}

export function clearErrors(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-error-for]').forEach(element => {
    element.hidden = true;
    element.textContent = '';
  });
  root
    .querySelectorAll('[aria-invalid]')
    .forEach(element => element.removeAttribute('aria-invalid'));
  const summary = root.querySelector<HTMLElement>('[data-error-summary]');
  if (summary) summary.hidden = true;
}

export function showError(
  root: HTMLElement,
  error: ToolError,
  copy: CommonCopy
): void {
  const element = root.querySelector<HTMLElement>(
    `[data-error-for="${error.field}"]`
  );
  const input = root.querySelector<HTMLInputElement>(
    `[data-field="${error.field}"]`
  );
  const message =
    error.code === 'range'
      ? copy.errors.range(error.min ?? 0, error.max ?? 0)
      : error.code === 'non-finite'
        ? copy.errors.nonFinite
        : copy.errors[error.code];
  if (element) {
    element.textContent = message;
    element.hidden = false;
  }
  input?.setAttribute('aria-invalid', 'true');
}

export function showErrorSummary(root: HTMLElement, copy: CommonCopy): void {
  const summary = root.querySelector<HTMLElement>('[data-error-summary]');
  if (!summary) return;
  summary.textContent = copy.errors.calculation;
  summary.hidden = false;
}

export function mountTool(
  selector: string,
  initialize: (root: HTMLElement) => void
): void {
  const mount = () => {
    document.querySelectorAll<HTMLElement>(selector).forEach(root => {
      if (root.dataset.initialized === 'true') return;
      root.dataset.initialized = 'true';
      initialize(root);
    });
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
  document.addEventListener('astro:page-load', mount);
}
