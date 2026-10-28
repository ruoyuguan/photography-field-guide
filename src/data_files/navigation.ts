/**
 * Navigation structure shared by every locale: stable ids, unlocalised paths
 * and social URLs. The label for each id lives in the copy tables
 * (`copy.nav.labels`, `copy.nav.footer.sections`), so translators never touch
 * a path and code never keys on a translated label.
 */
export type NavLinkId = 'home' | 'learn';

export const navLinks: { id: NavLinkId; path: string }[] = [
  { id: 'home', path: '/' },
  { id: 'learn', path: '/learn/' },
];

export type FooterSectionId = 'learn' | 'project';
export type FooterLinkId =
  | 'orientation'
  | 'sensorFormats'
  | 'equivalentFocalLength'
  | 'exposureTriangle'
  | 'repository';

export const footerSections: {
  id: FooterSectionId;
  links: { id: FooterLinkId; path: string; badge?: 'hiring' }[];
}[] = [
  {
    id: 'learn',
    links: [
      { id: 'orientation', path: '/learn/' },
      { id: 'sensorFormats', path: '/learn/sensor-lens/sensor-formats/' },
      {
        id: 'equivalentFocalLength',
        path: '/learn/sensor-lens/equivalent-focal-length/',
      },
      {
        id: 'exposureTriangle',
        path: '/learn/exposure/exposure-triangle/',
      },
    ],
  },
  {
    id: 'project',
    links: [
      {
        id: 'repository',
        path: 'https://github.com/ruoyuguan/photography-field-guide',
      },
    ],
  },
];

export const socialLinks = {
  github: 'https://github.com/ruoyuguan/photography-field-guide',
};
