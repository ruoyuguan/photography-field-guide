import type { CollectionEntry } from 'astro:content';
import type { MarketingLocale } from './locale';

type CameraData = CollectionEntry<'cameras'>['data'];
type CameraLensSystem = CameraData['lensSystem'];

export function cameraAreaLabel(camera: CameraData) {
  const area = camera.medium === 'film' ? camera.filmFrame : camera.sensor;
  return `${area.widthMm} × ${area.heightMm} mm`;
}

export function cameraLensLabel(
  lens: CameraLensSystem,
  locale: MarketingLocale
) {
  if (lens.type === 'interchangeable') return lens.mountName[locale];

  const { min, max } = lens.focalLengthMm;
  const { wide, tele } = lens.maximumAperture;
  const focalLength = min === max ? min : `${min}–${max}`;
  const aperture = wide === tele ? `f/${wide}` : `f/${wide}–f/${tele}`;
  return `${focalLength} mm · ${aperture}`;
}
