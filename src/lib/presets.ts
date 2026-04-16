import type { ContourParams } from '@/lib/noise';
import type { LabelStyleParams } from '@/components/LabelControls';
import { DEFAULT_CONTOUR_PARAMS } from '@/lib/noise';
import { DEFAULT_LABEL_STYLE } from '@/components/LabelControls';

export interface MapPreset {
  id: string;
  name: string;
  description: string;
  seed: number;
  themeId: string;
  terrainId: string;
  contourParams: ContourParams;
  labelMode: 'number' | 'abbrev' | 'full';
  labelStyle: Partial<LabelStyleParams>;
}

export const MAP_PRESETS: MapPreset[] = [
  {
    id: 'classic-topo',
    name: 'Classic Topo',
    description: 'Clean topographic style with numbered markers',
    seed: 42,
    themeId: 'monorail',
    terrainId: 'mountain',
    contourParams: {
      levels: 20,
      smoothing: 0.8,
      detail: 2,
      lineWidth: 0.3,
      noiseScale: 1,
      contourOpacity: 0.75,
      octaves: 4,
    },
    labelMode: 'number',
    labelStyle: {
      uppercase: false,
      showArrows: false,
      showLineElements: false,
      markerType: 'dot',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
  {
    id: 'military-survey',
    name: 'Military Survey',
    description: 'Dense contours with uppercase labels and tick marks',
    seed: 7734,
    themeId: 'darkfield',
    terrainId: 'valley',
    contourParams: {
      levels: 30,
      smoothing: 0.6,
      detail: 2,
      lineWidth: 0.4,
      noiseScale: 1.2,
      contourOpacity: 0.85,
      octaves: 5,
    },
    labelMode: 'abbrev',
    labelStyle: {
      uppercase: true,
      showArrows: true,
      arrowShape: 'tick',
      arrowSpacing: 60,
      arrowSize: 0.8,
      showLineElements: false,
      markerType: 'shapes',
      nameIconShape: 'diamond',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
  {
    id: 'island-explorer',
    name: 'Island Explorer',
    description: 'Archipelago with line elements and full names',
    seed: 2048,
    themeId: 'industrial',
    terrainId: 'island',
    contourParams: {
      levels: 18,
      smoothing: 0.9,
      detail: 3,
      lineWidth: 0.5,
      noiseScale: 0.8,
      contourOpacity: 0.7,
      octaves: 4,
    },
    labelMode: 'full',
    labelStyle: {
      uppercase: false,
      showArrows: false,
      showLineElements: true,
      lineElementSpacing: 50,
      lineElementSize: 1,
      markerType: 'dot',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
  {
    id: 'plateau-blueprint',
    name: 'Plateau Blueprint',
    description: 'Flat mesas with geometric markers and contour marks',
    seed: 5555,
    themeId: 'blueprint',
    terrainId: 'plateau',
    contourParams: {
      levels: 16,
      smoothing: 0.7,
      detail: 2,
      lineWidth: 0.3,
      noiseScale: 1.5,
      contourOpacity: 0.65,
      octaves: 3,
    },
    labelMode: 'number',
    labelStyle: {
      uppercase: true,
      showArrows: true,
      arrowShape: 'cross',
      arrowSpacing: 80,
      arrowSize: 1,
      showLineElements: true,
      lineElementSpacing: 40,
      lineElementSize: 0.8,
      markerType: 'shapes',
      nameIconShape: 'square',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
  {
    id: 'coastal-minimal',
    name: 'Coastal Minimal',
    description: 'Soft coastal terrain with minimal marks',
    seed: 1234,
    themeId: 'monorail',
    terrainId: 'coastal',
    contourParams: {
      levels: 12,
      smoothing: 0.95,
      detail: 3,
      lineWidth: 0.2,
      noiseScale: 0.7,
      contourOpacity: 0.5,
      octaves: 3,
    },
    labelMode: 'abbrev',
    labelStyle: {
      uppercase: false,
      showArrows: false,
      showLineElements: false,
      markerType: 'dot',
      showShapes: true,
      showLegend: true,
      showBranding: true,
      gridOpacity: 0.3,
    },
  },
  {
    id: 'volcanic-dense',
    name: 'Volcanic Dense',
    description: 'High-detail volcanic terrain with all elements',
    seed: 9999,
    themeId: 'infrared',
    terrainId: 'volcanic',
    contourParams: {
      levels: 35,
      smoothing: 0.5,
      detail: 1,
      lineWidth: 0.4,
      noiseScale: 2.0,
      contourOpacity: 0.9,
      octaves: 6,
    },
    labelMode: 'full',
    labelStyle: {
      uppercase: true,
      showArrows: true,
      arrowShape: 'triangle',
      arrowSpacing: 40,
      arrowSize: 1.2,
      showLineElements: true,
      lineElementSpacing: 30,
      lineElementSize: 1.2,
      markerType: 'shapes',
      nameIconShape: 'triangle',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
  {
    id: 'canyon-warm',
    name: 'Canyon Warm',
    description: 'Warm-toned canyon with chevron contour marks',
    seed: 3141,
    themeId: 'warmearth',
    terrainId: 'canyon',
    contourParams: {
      levels: 24,
      smoothing: 0.75,
      detail: 2,
      lineWidth: 0.5,
      noiseScale: 1.3,
      contourOpacity: 0.8,
      octaves: 4,
    },
    labelMode: 'number',
    labelStyle: {
      uppercase: false,
      showArrows: true,
      arrowShape: 'chevron',
      arrowSpacing: 70,
      arrowSize: 1,
      showLineElements: false,
      markerType: 'logo',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
  {
    id: 'dunes-abstract',
    name: 'Dunes Abstract',
    description: 'Soft dunes with dot contour marks, uppercase labels',
    seed: 6789,
    themeId: 'paper',
    terrainId: 'dunes',
    contourParams: {
      levels: 14,
      smoothing: 0.85,
      detail: 4,
      lineWidth: 0.3,
      noiseScale: 0.9,
      contourOpacity: 0.6,
      octaves: 3,
    },
    labelMode: 'abbrev',
    labelStyle: {
      uppercase: true,
      showArrows: true,
      arrowShape: 'dot',
      arrowSpacing: 90,
      arrowSize: 0.7,
      showLineElements: false,
      markerType: 'dot',
      showShapes: true,
      showLegend: true,
      showBranding: true,
    },
  },
];

/** Get a random preset */
export function getRandomPreset(): MapPreset {
  return MAP_PRESETS[Math.floor(Math.random() * MAP_PRESETS.length)];
}

/** Build a fully randomized config (not from presets) */
export function buildRandomConfig() {
  const THEME_IDS = ['monorail', 'industrial', 'darkfield', 'blueprint', 'infrared', 'warmearth', 'paper'];
  const TERRAIN_IDS = ['mountain', 'island', 'valley', 'plateau', 'coastal', 'volcanic', 'canyon', 'dunes'];
  const LABEL_MODES: ('number' | 'abbrev' | 'full')[] = ['number', 'abbrev', 'full'];
  const ARROW_SHAPES = ['chevron', 'arrow', 'triangle', 'circle', 'square', 'diamond', 'dot', 'tick', 'cross'] as const;
  const NAME_SHAPES = [null, 'circle', 'square', 'triangle', 'diamond'] as const;
  const MARKER_TYPES = ['dot', 'shapes', 'logo'] as const;

  const pick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  return {
    seed: Math.floor(Math.random() * 100000),
    themeId: pick(THEME_IDS),
    terrainId: pick(TERRAIN_IDS),
    labelMode: pick(LABEL_MODES),
    contourParams: {
      levels: Math.floor(rand(8, 35)),
      smoothing: Math.round(rand(0.4, 1) * 100) / 100,
      detail: Math.floor(rand(1, 5)),
      lineWidth: Math.round(rand(0.2, 0.8) * 10) / 10,
      noiseScale: Math.round(rand(0.5, 2.5) * 10) / 10,
      contourOpacity: Math.round(rand(0.4, 1) * 100) / 100,
      octaves: Math.floor(rand(2, 6)),
    },
    labelStyle: {
      uppercase: Math.random() > 0.5,
      showArrows: Math.random() > 0.4,
      arrowShape: pick(ARROW_SHAPES),
      arrowSpacing: Math.floor(rand(30, 120)),
      arrowSize: Math.round(rand(0.5, 1.5) * 100) / 100,
      showLineElements: Math.random() > 0.5,
      lineElementSpacing: Math.floor(rand(20, 80)),
      lineElementSize: Math.round(rand(0.5, 1.5) * 100) / 100,
      markerType: pick(MARKER_TYPES),
      nameIconShape: pick(NAME_SHAPES),
      showShapes: true,
      showLegend: true,
      showBranding: true,
    } as Partial<LabelStyleParams>,
  };
}
