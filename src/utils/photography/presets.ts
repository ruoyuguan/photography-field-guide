import type { SensorDimensions } from './crop-factor.ts';

export const SENSOR_PRESETS = {
  fullFrame: { widthMm: 36, heightMm: 24 },
  fujifilmApsC: { widthMm: 23.5, heightMm: 15.6 },
} as const satisfies Record<string, SensorDimensions>;

export type SensorPresetId = keyof typeof SENSOR_PRESETS;
