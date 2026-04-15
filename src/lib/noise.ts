import { createNoise2D } from 'simplex-noise';

/* ── Terrain presets ── */
export interface TerrainPreset {
  id: string;
  name: string;
  description: string;
  levels: number;
  scale: number;
  octaves: { freq: number; amp: number }[];
  /** Shape function applied to the raw noise to sculpt terrain */
  shape: (x: number, y: number, w: number, h: number) => number;
}

export const TERRAIN_PRESETS: TerrainPreset[] = [
  {
    id: 'mountain',
    name: 'Mountain Range',
    description: 'Peaks and ridges',
    levels: 18,
    scale: 0.004,
    octaves: [
      { freq: 1, amp: 0.55 },
      { freq: 2, amp: 0.25 },
      { freq: 4, amp: 0.12 },
      { freq: 8, amp: 0.08 },
    ],
    shape: (x, y, w, h) => {
      // Central peak with falloff
      const cx = (x - w / 2) / (w / 2);
      const cy = (y - h / 2) / (h / 2);
      const dist = Math.sqrt(cx * cx + cy * cy);
      return Math.max(0, 1 - dist * 0.9);
    },
  },
  {
    id: 'island',
    name: 'Island Archipelago',
    description: 'Islands surrounded by water',
    levels: 16,
    scale: 0.005,
    octaves: [
      { freq: 1, amp: 0.5 },
      { freq: 2, amp: 0.3 },
      { freq: 4, amp: 0.15 },
      { freq: 8, amp: 0.05 },
    ],
    shape: (x, y, w, h) => {
      const cx = (x - w / 2) / (w / 2);
      const cy = (y - h / 2) / (h / 2);
      const dist = Math.sqrt(cx * cx + cy * cy);
      // Strong circular falloff — creates island shapes
      return Math.max(0, 1 - dist * 1.4) ** 1.5;
    },
  },
  {
    id: 'valley',
    name: 'River Valley',
    description: 'Deep valleys and rivers',
    levels: 20,
    scale: 0.003,
    octaves: [
      { freq: 1, amp: 0.4 },
      { freq: 2, amp: 0.3 },
      { freq: 4, amp: 0.2 },
      { freq: 8, amp: 0.1 },
    ],
    shape: (x, y, w, h) => {
      // Ridge along diagonal
      const nx = x / w;
      const ny = y / h;
      const ridge = Math.sin(nx * Math.PI * 2 + ny * Math.PI) * 0.5 + 0.5;
      const edge = Math.min(nx, ny, 1 - nx, 1 - ny) * 3;
      return ridge * Math.min(1, edge);
    },
  },
  {
    id: 'plateau',
    name: 'Plateau Mesa',
    description: 'Flat-topped elevations',
    levels: 14,
    scale: 0.006,
    octaves: [
      { freq: 1, amp: 0.6 },
      { freq: 2, amp: 0.2 },
      { freq: 4, amp: 0.1 },
      { freq: 8, amp: 0.1 },
    ],
    shape: (x, y, w, h) => {
      const cx = (x - w * 0.4) / (w * 0.4);
      const cy = (y - h * 0.45) / (h * 0.4);
      const d = Math.max(Math.abs(cx), Math.abs(cy));
      // Flat top plateau
      const plateau = d < 0.5 ? 1 : Math.max(0, 1 - (d - 0.5) * 2);
      return plateau;
    },
  },
  {
    id: 'coastal',
    name: 'Coastal Terrain',
    description: 'Shoreline with elevation',
    levels: 16,
    scale: 0.004,
    octaves: [
      { freq: 1, amp: 0.5 },
      { freq: 2, amp: 0.25 },
      { freq: 4, amp: 0.15 },
      { freq: 8, amp: 0.1 },
    ],
    shape: (x, y, w, h) => {
      // Gradient from left (water) to right (land)
      const nx = x / w;
      const gradient = Math.max(0, (nx - 0.25) * 1.6);
      const edge = Math.min(y / h, 1 - y / h) * 4;
      return gradient * Math.min(1, edge);
    },
  },
  {
    id: 'caldera',
    name: 'Volcanic Caldera',
    description: 'Ring-shaped crater',
    levels: 20,
    scale: 0.005,
    octaves: [
      { freq: 1, amp: 0.45 },
      { freq: 2, amp: 0.3 },
      { freq: 4, amp: 0.15 },
      { freq: 8, amp: 0.1 },
    ],
    shape: (x, y, w, h) => {
      const cx = (x - w / 2) / (w / 2);
      const cy = (y - h / 2) / (h / 2);
      const dist = Math.sqrt(cx * cx + cy * cy);
      // Ring shape — high at radius ~0.4, drops off at center and edges
      const ring = Math.exp(-((dist - 0.45) ** 2) / 0.04);
      const falloff = Math.max(0, 1 - dist * 1.1);
      return ring * 0.7 + falloff * 0.3;
    },
  },
];

/* ── Contour generation ── */

export function generateContourLines(
  width: number,
  height: number,
  seed: number,
  preset: TerrainPreset
): string[] {
  const { levels, scale, octaves, shape } = preset;

  const noise2D = createNoise2D(() => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  });

  const resolution = 3; // finer grid for smoother contours
  const cols = Math.floor(width / resolution) + 1;
  const rows = Math.floor(height / resolution) + 1;

  // Build noise field shaped by preset
  const field: number[][] = [];
  for (let y = 0; y < rows; y++) {
    field[y] = [];
    for (let x = 0; x < cols; x++) {
      const wx = x * resolution;
      const wy = y * resolution;
      const nx = wx * scale;
      const ny = wy * scale;

      let noise = 0;
      for (const oct of octaves) {
        noise += noise2D(nx * oct.freq, ny * oct.freq) * oct.amp;
      }

      // Apply terrain shape mask
      const mask = shape(wx, wy, width, height);
      field[y][x] = noise * 0.5 + mask * 0.6;
    }
  }

  const paths: string[] = [];

  // Extract contour lines via marching squares
  for (let level = 0; level < levels; level++) {
    const threshold = -0.2 + (1.0 * level) / levels;
    const segments = marchingSquares(field, cols, rows, resolution, threshold);
    const chains = chainSegments(segments, resolution);

    for (const chain of chains) {
      if (chain.length < 5) continue;
      const smoothed = smoothCubicPath(chain);
      if (smoothed) paths.push(smoothed);
    }
  }

  return paths;
}

function marchingSquares(
  field: number[][],
  cols: number,
  rows: number,
  res: number,
  threshold: number
): [number, number][][] {
  const segments: [number, number][][] = [];

  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < cols - 1; x++) {
      const tl = field[y][x];
      const tr = field[y][x + 1];
      const br = field[y + 1][x + 1];
      const bl = field[y + 1][x];

      const config =
        (tl > threshold ? 8 : 0) |
        (tr > threshold ? 4 : 0) |
        (br > threshold ? 2 : 0) |
        (bl > threshold ? 1 : 0);

      if (config === 0 || config === 15) continue;

      const px = x * res;
      const py = y * res;

      const lerp = (a: number, b: number) => {
        const d = b - a;
        if (Math.abs(d) < 0.0001) return 0.5;
        return Math.min(1, Math.max(0, (threshold - a) / d));
      };

      const top: [number, number] = [px + res * lerp(tl, tr), py];
      const right: [number, number] = [px + res, py + res * lerp(tr, br)];
      const bottom: [number, number] = [px + res * lerp(bl, br), py + res];
      const left: [number, number] = [px, py + res * lerp(tl, bl)];

      const add = (a: [number, number], b: [number, number]) => segments.push([a, b]);

      switch (config) {
        case 1: add(left, bottom); break;
        case 2: add(bottom, right); break;
        case 3: add(left, right); break;
        case 4: add(top, right); break;
        case 5: add(left, top); add(bottom, right); break;
        case 6: add(top, bottom); break;
        case 7: add(left, top); break;
        case 8: add(top, left); break;
        case 9: add(top, bottom); break;
        case 10: add(top, right); add(left, bottom); break;
        case 11: add(top, right); break;
        case 12: add(left, right); break;
        case 13: add(bottom, right); break;
        case 14: add(left, bottom); break;
      }
    }
  }

  return segments;
}

function chainSegments(segments: [number, number][][], res: number): [number, number][][] {
  const chains: [number, number][][] = [];
  const used = new Set<number>();
  const tolerance = res * 1.5;

  for (let i = 0; i < segments.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const chain = [segments[i][0], segments[i][1]];

    let changed = true;
    while (changed) {
      changed = false;
      for (let j = 0; j < segments.length; j++) {
        if (used.has(j)) continue;
        const seg = segments[j];
        const last = chain[chain.length - 1];
        const first = chain[0];

        if (ptDist(last, seg[0]) < tolerance) {
          chain.push(seg[1]);
          used.add(j);
          changed = true;
        } else if (ptDist(last, seg[1]) < tolerance) {
          chain.push(seg[0]);
          used.add(j);
          changed = true;
        } else if (ptDist(first, seg[1]) < tolerance) {
          chain.unshift(seg[0]);
          used.add(j);
          changed = true;
        } else if (ptDist(first, seg[0]) < tolerance) {
          chain.unshift(seg[1]);
          used.add(j);
          changed = true;
        }
      }
    }

    chains.push(chain);
  }

  return chains;
}

function ptDist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function smoothCubicPath(points: [number, number][]): string {
  if (points.length < 2) return '';

  // Check if closed contour
  const isClosed = ptDist(points[0], points[points.length - 1]) < 10;

  if (points.length === 2) {
    return `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} L ${points[1][0].toFixed(1)} ${points[1][1].toFixed(1)}`;
  }

  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? (isClosed ? points.length - 2 : 0) : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3idx = i + 2 < points.length ? i + 2 : (isClosed ? (i + 2) % points.length : points.length - 1);
    const p3 = points[p3idx];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }

  if (isClosed) d += ' Z';

  return d;
}

/* ── Scatter dots ── */

export interface ScatterDot {
  x: number;
  y: number;
  r: number;
}

export function generateScatterDots(
  width: number,
  height: number,
  seed: number,
  count: number = 60
): ScatterDot[] {
  const rng = seedRng(seed + 999);
  const dots: ScatterDot[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      x: rng() * width * 0.9 + width * 0.05,
      y: rng() * height * 0.9 + height * 0.05,
      r: rng() * 10 + 1,
    });
  }
  return dots;
}

/* ── Markers ── */

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  number: number;
  name: string;
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
}

export function generateMarkers(
  width: number,
  height: number,
  seed: number,
  count: number = 15
): MapMarker[] {
  const rng = seedRng(seed + 777);
  const names = [...LOCATION_NAMES];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  const shapes: MapMarker['shape'][] = ['circle', 'square', 'triangle', 'diamond'];
  const markers: MapMarker[] = [];
  for (let i = 0; i < count; i++) {
    markers.push({
      id: `m-${i}`,
      x: rng() * width * 0.85 + width * 0.075,
      y: rng() * height * 0.85 + height * 0.075,
      number: i + 1,
      name: names[i % names.length],
      shape: shapes[Math.floor(rng() * shapes.length)],
    });
  }
  return markers;
}

function seedRng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export const LOCATION_NAMES = [
  "Department of Imagination",
  "The Experimental Lab",
  "Visual Intelligence Division",
  "Generative Systems Co",
  "The Field Office",
  "The Story Department",
  "The Agentic World",
  "World of Motion",
  "Creative Research Program",
  "Spatial Computing Services",
  "The Earth Pod",
  "Creative Space Oddity",
  "Curiosity Frontier & Co",
  "Dream Corp",
  "Expedition Exploration",
  "Product Vision Productions",
  "Lands of Process",
  "Public Building Society",
  "The Future Environments Pavilion",
  "Brand Systems Observatory",
  "Land of Possibility",
  "Discovery Cove",
  "Toolmaking Repository",
  "The Explorer's Supply",
  "Outland Archive Dept",
  "Visioneer Corp",
  "Outland Communication Program",
  "Independent Publishing Resource Center",
  "The Gallery of Thoughts",
  "Pavilion of Minds",
  "The Progress Report",
];
