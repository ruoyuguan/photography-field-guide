import { toolsCopy } from '@copy/tools';
import {
  calculateAngleOfView,
  calculateCropFactor,
  calculateEquivalentFocalLength,
  estimateDistantFieldWidth,
} from '@utils/photography/crop-factor';
import {
  SENSOR_PRESETS,
  type SensorPresetId,
} from '@utils/photography/presets';
import {
  PHOTOGRAPHY_LIMITS as limits,
  parsePositiveInput,
} from '@utils/photography/validation';
import {
  applyRange,
  clearErrors,
  field,
  mountTool,
  numberFormatter,
  setText,
  showError,
  showErrorSummary,
  syncRange,
  type ToolError,
} from './tool-dom';

const inputDefinitions = [
  { name: 'referenceWidth', range: limits.sensorDimensionMm },
  { name: 'referenceHeight', range: limits.sensorDimensionMm },
  { name: 'targetWidth', range: limits.sensorDimensionMm },
  { name: 'targetHeight', range: limits.sensorDimensionMm },
  { name: 'focalLength', range: limits.focalLengthMm },
  { name: 'distance', range: limits.distanceM },
] as const;

function initialize(root: HTMLElement): void {
  const locale = root.dataset.locale === 'zh-cn' ? 'zh-cn' : 'en';
  const copy = toolsCopy[locale];
  const t = copy.crop;
  const form = root.querySelector<HTMLFormElement>('[data-tool-form]');
  const interactive = root.querySelector<HTMLElement>('[data-interactive]');
  const results = root.querySelectorAll<HTMLElement>(
    '[data-results], [data-results-visual]'
  );
  if (!form || !interactive) return;
  const format = numberFormatter(locale, 2);
  const formatCrop = numberFormatter(locale, 3);

  const showResults = (visible: boolean) =>
    results.forEach(element => {
      element.hidden = !visible;
    });
  const fail = (error: ToolError) => {
    showResults(false);
    showError(root, error, copy.common);
    showErrorSummary(root, copy.common);
  };

  const render = () => {
    clearErrors(root);
    const values: Record<(typeof inputDefinitions)[number]['name'], number> = {
      referenceWidth: 0,
      referenceHeight: 0,
      targetWidth: 0,
      targetHeight: 0,
      focalLength: 0,
      distance: 0,
    };
    let valid = true;
    for (const definition of inputDefinitions) {
      const input = field(root, definition.name);
      const parsed = parsePositiveInput(
        input.value,
        definition.name,
        definition.range
      );
      if (!parsed.ok) {
        showError(root, parsed, copy.common);
        valid = false;
      } else {
        values[definition.name] = parsed.value;
        syncRange(root, definition.name, parsed.value);
      }
    }
    if (!valid) {
      showResults(false);
      showErrorSummary(root, copy.common);
      return;
    }

    const reference = {
      widthMm: values.referenceWidth,
      heightMm: values.referenceHeight,
    };
    const target = {
      widthMm: values.targetWidth,
      heightMm: values.targetHeight,
    };
    const crop = calculateCropFactor(reference, target);
    if (!crop.ok) return fail(crop);
    const equivalent = calculateEquivalentFocalLength(
      values.focalLength,
      crop.value.diagonalFactor
    );
    if (!equivalent.ok) return fail(equivalent);
    const horizontal = calculateAngleOfView(target.widthMm, values.focalLength);
    if (!horizontal.ok) return fail(horizontal);
    const vertical = calculateAngleOfView(target.heightMm, values.focalLength);
    if (!vertical.ok) return fail(vertical);
    const diagonal = calculateAngleOfView(
      Math.hypot(target.widthMm, target.heightMm),
      values.focalLength
    );
    if (!diagonal.ok) return fail(diagonal);
    const fieldWidth = estimateDistantFieldWidth(
      values.distance * 1000,
      target.widthMm,
      values.focalLength
    );
    if (!fieldWidth.ok) return fail(fieldWidth);

    setText(root, 'crop-factor', formatCrop.format(crop.value.diagonalFactor));
    setText(root, 'equivalent', format.format(equivalent.value.equivalentMm));
    setText(
      root,
      'nominal-equivalent',
      format.format(values.focalLength * 1.5)
    );
    setText(root, 'horizontal-angle', format.format(horizontal.value.degrees));
    setText(root, 'vertical-angle', format.format(vertical.value.degrees));
    setText(root, 'diagonal-angle', format.format(diagonal.value.degrees));
    setText(
      root,
      'field-width',
      format.format(fieldWidth.value.widthMm / 1000)
    );

    const scale = Math.min(
      300 / Math.max(reference.widthMm, target.widthMm),
      200 / Math.max(reference.heightMm, target.heightMm)
    );
    for (const [name, dimensions] of [
      ['reference', reference],
      ['target', target],
    ] as const) {
      const rectangle = root.querySelector(`[data-${name}-sensor]`);
      const width = dimensions.widthMm * scale;
      const height = dimensions.heightMm * scale;
      rectangle?.setAttribute('x', String(180 - width / 2));
      rectangle?.setAttribute('y', String(145 - height / 2));
      rectangle?.setAttribute('width', String(width));
      rectangle?.setAttribute('height', String(height));
      const label = root.querySelector(`[data-${name}-label]`);
      if (label)
        label.textContent = `${name === 'reference' ? t.referenceLegend : t.targetLegend}: ${format.format(dimensions.widthMm)} × ${format.format(dimensions.heightMm)} ${copy.common.millimeters}`;
    }

    const axis =
      root.querySelector<HTMLSelectElement>('[data-axis]')?.value ??
      'horizontal';
    const selectedAngle =
      axis === 'vertical'
        ? vertical.value.degrees
        : axis === 'diagonal'
          ? diagonal.value.degrees
          : horizontal.value.degrees;
    const axisLabel =
      axis === 'vertical'
        ? t.axes.vertical
        : axis === 'diagonal'
          ? t.axes.diagonal
          : t.axes.horizontal;
    const angleValue = root.querySelector('[data-angle-value]');
    if (angleValue)
      angleValue.textContent = `${axisLabel}: ${format.format(selectedAngle)}${copy.common.degrees}`;
    const halfAngle = (selectedAngle * Math.PI) / 360;
    const length = Math.min(340, 110 / Math.tan(halfAngle));
    const halfHeight = length * Math.tan(halfAngle);
    const endX = 30 + length;
    root
      .querySelector('[data-angle-wedge]')
      ?.setAttribute(
        'd',
        `M30 145 L${endX} ${145 - halfHeight} L${endX} ${145 + halfHeight} Z`
      );
    showResults(true);
  };

  form.addEventListener('submit', event => event.preventDefault());
  root.querySelectorAll<HTMLInputElement>('[data-field]').forEach(input => {
    input.addEventListener('input', () => {
      const group = input.dataset.customPreset;
      if (group) {
        const preset = root.querySelector<HTMLSelectElement>(
          `[data-preset-for="${group}"]`
        );
        if (preset) preset.value = 'custom';
      }
      render();
    });
  });
  root
    .querySelectorAll<HTMLInputElement>('[data-range-for]')
    .forEach(slider => {
      slider.addEventListener('input', () => {
        const name = slider.dataset.rangeFor;
        if (!name) return;
        applyRange(root, name);
        const group = field(root, name).dataset.customPreset;
        if (group) {
          const preset = root.querySelector<HTMLSelectElement>(
            `[data-preset-for="${group}"]`
          );
          if (preset) preset.value = 'custom';
        }
        render();
      });
    });
  root
    .querySelectorAll<HTMLSelectElement>('[data-preset-for]')
    .forEach(select => {
      select.addEventListener('change', () => {
        if (select.value === 'custom') return render();
        const group = select.dataset.presetFor;
        const preset = SENSOR_PRESETS[select.value as SensorPresetId];
        if (!group || !preset) return;
        field(root, `${group}Width`).value = String(preset.widthMm);
        field(root, `${group}Height`).value = String(preset.heightMm);
        render();
      });
    });
  root.querySelector('[data-axis]')?.addEventListener('change', render);
  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    form.reset();
    render();
  });
  render();
  interactive.hidden = false;
}

export function initializeCropFactorTools(): void {
  mountTool('[data-crop-tool]', initialize);
}
