/**
 * Navigation structure shared by every locale: stable ids, unlocalised paths
 * and social URLs. The label for each id lives in the copy tables
 * (`copy.nav.labels`, `copy.nav.footer.sections`), so translators never touch
 * a path and code never keys on a translated label.
 */
export type NavLinkId =
  | 'home'
  | 'learn'
  | 'practice'
  | 'glossary'
  | 'tools'
  | 'gear'
  | 'galleries'
  | 'resources'
  | 'about';

export const navLinks: { id: NavLinkId; path: string }[] = [
  { id: 'learn', path: '/learn/' },
  { id: 'practice', path: '/practice/' },
  { id: 'tools', path: '/tools/' },
];

export const exploreLinks: { id: NavLinkId; path: string }[] = [
  { id: 'glossary', path: '/glossary/' },
  { id: 'gear', path: '/gear/' },
  { id: 'galleries', path: '/galleries/' },
  { id: 'resources', path: '/resources/' },
  { id: 'about', path: '/about/' },
];

export type FooterSectionId = 'learn' | 'project';
export type FooterLinkId =
  | 'orientation'
  | 'practice'
  | 'sensorFormats'
  | 'equivalentFocalLength'
  | 'exposureTriangle'
  | 'cropFactorTool'
  | 'exposureStopsTool'
  | 'glossary'
  | 'gear'
  | 'galleries'
  | 'resources'
  | 'about'
  | 'repository';

export const footerSections: {
  id: FooterSectionId;
  links: { id: FooterLinkId; path: string; badge?: 'hiring' }[];
}[] = [
  {
    id: 'learn',
    links: [
      { id: 'orientation', path: '/learn/' },
      { id: 'practice', path: '/practice/' },
      { id: 'sensorFormats', path: '/learn/sensor-lens/sensor-formats/' },
      {
        id: 'equivalentFocalLength',
        path: '/learn/sensor-lens/equivalent-focal-length/',
      },
      {
        id: 'exposureTriangle',
        path: '/learn/exposure/exposure-triangle/',
      },
      { id: 'cropFactorTool', path: '/tools/crop-factor/' },
      { id: 'exposureStopsTool', path: '/tools/exposure-stops/' },
    ],
  },
  {
    id: 'project',
    links: [
      { id: 'glossary', path: '/glossary/' },
      { id: 'gear', path: '/gear/' },
      { id: 'galleries', path: '/galleries/' },
      { id: 'resources', path: '/resources/' },
      { id: 'about', path: '/about/' },
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
