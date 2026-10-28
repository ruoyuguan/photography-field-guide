import type { APIRoute, ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import icon from '@images/icon.png';
import maskableIcon from '@images/icon-maskable.png';
import { withBase } from '@utils/deployment';

interface Favicon {
  purpose: 'any' | 'maskable' | 'monochrome';
  src: ImageMetadata;
  sizes: number[];
}

const sizes = [192, 512];
const favicons: Favicon[] = [
  {
    purpose: 'any',
    src: icon,
    sizes,
  },
  {
    purpose: 'maskable',
    src: maskableIcon,
    sizes,
  },
];

export const GET: APIRoute = async () => {
  const icons = await Promise.all(
    favicons.flatMap(favicon =>
      favicon.sizes.map(async size => {
        const image = await getImage({
          src: favicon.src,
          width: size,
          height: size,
          format: 'png',
        });
        return {
          src: withBase(image.src),
          sizes: `${image.options.width}x${image.options.height}`,
          type: `image/${image.options.format}`,
          purpose: favicon.purpose,
        };
      })
    )
  );

  const manifest = {
    short_name: 'Photo Field Guide',
    name: 'Photography Field Guide',
    icons,
    display: 'minimal-ui',
    id: withBase('/'),
    start_url: withBase('/'),
    scope: withBase('/'),
    theme_color: '#fbbf24',
    background_color: '#171717',
  };

  return new Response(JSON.stringify(manifest));
};
