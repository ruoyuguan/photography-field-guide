import { toolsCopy } from '@copy/tools';
import { compareExposureStops } from '@utils/photography/exposure-stops';
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
  signed,
  syncRange,
} from './tool-dom';

const inputDefinitions = [
  { name: 'before.fNumber', range: limits.fNumber },
  { name: 'before.shutterSeconds', range: limits.shutterSeconds },
  { name: 'before.iso', range: limits.iso },
  { name: 'after.fNumber', range: limits.fNumber },
  { name: 'after.shutterSeconds', range: limits.shutterSeconds },
  { name: 'after.iso', range: limits.iso },
] as const;

type InputName = (typeof inputDefinitions)[number]['name'];

function initialize(root: HTMLElement): void {
  const locale = root.dataset.locale === 'zh-cn' ? 'zh-cn' : 'en';
  const copy = toolsCopy[locale];
  const t = copy.exposure;
  const form = root.querySelector<HTMLFormElement>('[data-tool-form]');
  const interactive = root.querySelector<HTMLElement>('[data-interactive]');
  const results = root.querySelector<HTMLElement>('[data-results]');
  if (!form || !interactive || !results) return;
  const format = numberFormatter(locale, 3);
  const formatRatio = (value: number) =>
    value < 0.01 || value >= 10000
      ? value.toExponential(2)
      : format.format(value);

  const render = () => {
    clearErrors(root);
    const values = Object.fromEntries(
      inputDefinitions.map(definition => [definition.name, 0])
    ) as Record<InputName, number>;
    let valid = true;
    for (const definition of inputDefinitions) {
      const input = field(root, definition.name);
      const parsed = parsePositiveInput(
        input.value,
        definition.name,
        definition.range,
        input.dataset.fraction === 'true'
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
      results.hidden = true;
      showErrorSummary(root, copy.common);
      return;
    }
    const comparison = compareExposureStops(
      {
        fNumber: values['before.fNumber'],
        shutterSeconds: values['before.shutterSeconds'],
        iso: values['before.iso'],
      },
      {
        fNumber: values['after.fNumber'],
        shutterSeconds: values['after.shutterSeconds'],
        iso: values['after.iso'],
      }
    );
    if (!comparison.ok) {
      results.hidden = true;
      showError(root, comparison, copy.common);
      showErrorSummary(root, copy.common);
      return;
    }
    const value = comparison.value;
    setText(root, 'sensor-stops', signed(value.sensorExposureStops));
    setText(root, 'sensor-ratio', `${formatRatio(value.sensorExposureRatio)}×`);
    setText(root, 'output-stops', signed(value.nominalOutputStops));
    setText(root, 'output-ratio', `${formatRatio(value.nominalOutputRatio)}×`);
    setText(root, 'aperture-stops', signed(value.apertureStops));
    setText(root, 'shutter-stops', signed(value.shutterStops));
    setText(root, 'iso-stops', signed(value.nominalIsoMappingStops));

    for (const [name, stops, y] of [
      ['sensor', value.sensorExposureStops, 75],
      ['output', value.nominalOutputStops, 150],
    ] as const) {
      const x = 430 + Math.max(-4, Math.min(4, stops)) * 65;
      root
        .querySelector(`[data-${name}-marker]`)
        ?.setAttribute('transform', `translate(${x} ${y})`);
      setText(root, `${name}-marker-text`, signed(stops));
    }
    const description = root.querySelector('[data-exposure-desc]');
    if (description)
      description.textContent = `${t.sensorTrack}: ${signed(value.sensorExposureStops)} ${t.stops}. ${t.outputTrack}: ${signed(value.nominalOutputStops)} ${t.stops}.`;
    results.hidden = false;
  };

  form.addEventListener('submit', event => event.preventDefault());
  root
    .querySelectorAll<HTMLInputElement>('[data-field]')
    .forEach(input => input.addEventListener('input', render));
  root
    .querySelectorAll<HTMLInputElement>('[data-range-for]')
    .forEach(slider => {
      slider.addEventListener('input', () => {
        const name = slider.dataset.rangeFor;
        if (!name) return;
        applyRange(root, name);
        render();
      });
    });
  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    form.reset();
    render();
  });
  render();
  interactive.hidden = false;
}

export function initializeExposureStopsTools(): void {
  mountTool('[data-exposure-tool]', initialize);
}
