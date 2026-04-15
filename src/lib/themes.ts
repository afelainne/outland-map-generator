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
    id: 'monorail',
    name: 'Monorail White',
    bg: '#fcfcf5',
    line: '#1d1c1a',
    dot: '#1d1c1a',
    text: '#1d1c1a',
    accent: '#1d1c1a',
    accentBlock: '#2d2d1f',
    grid: '#e8e8e0',
  },
  {
    id: 'industrial',
    name: 'Industrial Paper',
    bg: '#e0e0e4',
    line: '#b0604f',
    dot: '#b0604f',
    text: '#b0604f',
    accent: '#b0604f',
    accentBlock: '#8a4a3a',
    grid: '#ccccd0',
  },
  {
    id: 'imagineer',
    name: 'Imagineer Clay',
    bg: '#d9d7cd',
    line: '#a09368',
    dot: '#a09368',
    text: '#a09368',
    accent: '#a09368',
    accentBlock: '#7a7050',
    grid: '#c9c7bd',
  },
  {
    id: 'neutral',
    name: 'Neutral Brown',
    bg: '#837a76',
    line: '#48382e',
    dot: '#48382e',
    text: '#48382e',
    accent: '#48382e',
    accentBlock: '#352820',
    grid: '#736a66',
  },
  {
    id: 'wanderer',
    name: 'Wanderer Lilac',
    bg: '#d3d1e1',
    line: '#3f2c58',
    dot: '#3f2c58',
    text: '#3f2c58',
    accent: '#3f2c58',
    accentBlock: '#2a1d40',
    grid: '#c3c1d1',
  },
  {
    id: 'earth',
    name: 'New Earth Green',
    bg: '#d8e0d9',
    line: '#3a5a42',
    dot: '#3a5a42',
    text: '#3a5a42',
    accent: '#3a5a42',
    accentBlock: '#2a4a32',
    grid: '#c8d0c9',
  },
  {
    id: 'skyway',
    name: 'Skyway Blue',
    bg: '#c6dbc6',
    line: '#429773',
    dot: '#429773',
    text: '#429773',
    accent: '#429773',
    accentBlock: '#327763',
    grid: '#b6cbb6',
  },
  {
    id: 'foundation',
    name: 'Foundation Black',
    bg: '#1d1c1a',
    line: '#fcfcf5',
    dot: '#fcfcf5',
    text: '#fcfcf5',
    accent: '#fcfcf5',
    accentBlock: '#2d2d1f',
    grid: '#2d2d28',
  },
  {
    id: 'outpost',
    name: 'Outpost Grey',
    bg: '#919191',
    line: '#2d2d1f',
    dot: '#2d2d1f',
    text: '#2d2d1f',
    accent: '#2d2d1f',
    accentBlock: '#1d1c1a',
    grid: '#818181',
  },
  {
    id: 'observatory',
    name: 'Observatory Blue',
    bg: '#2d3362',
    line: '#c6dbc6',
    dot: '#c6dbc6',
    text: '#c6dbc6',
    accent: '#c6dbc6',
    accentBlock: '#429773',
    grid: '#3d4372',
  },
];
