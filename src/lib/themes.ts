export interface MapTheme {
  id: string;
  name: string;
  bg: string;
  line: string;
  dot: string;
  text: string;
  accent: string;
  accentBlock: string;
  grid: string;
}

export const MAP_THEMES: MapTheme[] = [
  {
    id: 'green',
    name: 'Terrain Green',
    bg: '#5A9A4A',
    line: '#2D4A25',
    dot: '#2D4A25',
    text: '#2D4A25',
    accent: '#2D4A25',
    accentBlock: '#3A5A30',
    grid: '#4A8A3A',
  },
  {
    id: 'purple',
    name: 'Violet Field',
    bg: '#9B7BB8',
    line: '#3A2A4A',
    dot: '#3A2A4A',
    text: '#3A2A4A',
    accent: '#E87D2A',
    accentBlock: '#E87D2A',
    grid: '#8A6AA8',
  },
  {
    id: 'blue',
    name: 'Deep Ocean',
    bg: '#1A4FBF',
    line: '#D4C9A8',
    dot: '#D4C9A8',
    text: '#D4C9A8',
    accent: '#D4C9A8',
    accentBlock: '#E8DC6A',
    grid: '#2A5FCF',
  },
  {
    id: 'dark',
    name: 'Midnight',
    bg: '#1A1A1A',
    line: '#4AE080',
    dot: '#4AE080',
    text: '#4AE080',
    accent: '#4AE080',
    accentBlock: '#2A6A40',
    grid: '#2A2A2A',
  },
  {
    id: 'sand',
    name: 'Desert Sand',
    bg: '#D4C9A8',
    line: '#5A4A2A',
    dot: '#5A4A2A',
    text: '#5A4A2A',
    accent: '#C44A2A',
    accentBlock: '#C44A2A',
    grid: '#C4B998',
  },
];
