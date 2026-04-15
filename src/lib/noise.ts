import { createNoise2D } from 'simplex-noise';

/* ── Terrain presets ── */
export interface TerrainPreset {
  id: string;
  name: string;
  description: string;
  /** Default contour levels */
  levels: number;
  scale: number;
  octaves: { freq: number; amp: number }[];
  shape: (x: number, y: number, w: number, h: number) => number;
}

export const TERRAIN_PRESETS: TerrainPreset[] = [
  {
    id: 'mountain',
    name: 'Mountain Range',
    description: 'Peaks and ridges',
    levels: 20,
    scale: 0.003,
    octaves: [
      { freq: 1, amp: 0.55 },
      { freq: 2, amp: 0.25 },
      { freq: 4, amp: 0.12 },
      { freq: 8, amp: 0.08 },
    ],
    shape: (x, y, w, h) => {
      const cx = (x - w * 0.45) / (w * 0.45);
      const cy = (y - h * 0.5) / (h * 0.45);
      return Math.max(0, 1 - Math.sqrt(cx * cx + cy * cy) * 0.85);
    },
  },
  {
    id: 'island',
    name: 'Island Archipelago',
    description: 'Islands surrounded by water',
    levels: 18,
    scale: 0.004,
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
      return Math.max(0, 1 - dist * 1.3) ** 1.5;
    },
  },
  {
    id: 'valley',
    name: 'River Valley',
    description: 'Deep valleys and rivers',
    levels: 22,
    scale: 0.0025,
    octaves: [
      { freq: 1, amp: 0.4 },
      { freq: 2, amp: 0.3 },
      { freq: 4, amp: 0.2 },
      { freq: 8, amp: 0.1 },
    ],
    shape: (x, y, w, h) => {
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
    levels: 16,
    scale: 0.005,
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
      return d < 0.5 ? 1 : Math.max(0, 1 - (d - 0.5) * 2);
    },
  },
  {
    id: 'coastal',
    name: 'Coastal Terrain',
    description: 'Shoreline with elevation',
    levels: 18,
    scale: 0.003,
    octaves: [
      { freq: 1, amp: 0.5 },
      { freq: 2, amp: 0.25 },
      { freq: 4, amp: 0.15 },
      { freq: 8, amp: 0.1 },
    ],
    shape: (x, y, w, h) => {
      const nx = x / w;
      const gradient = Math.max(0, (nx - 0.2) * 1.5);
      const edge = Math.min(y / h, 1 - y / h) * 4;
      return gradient * Math.min(1, edge);
    },
  },
  {
    id: 'caldera',
    name: 'Volcanic Caldera',
    description: 'Ring-shaped crater',
    levels: 22,
    scale: 0.004,
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
      const ring = Math.exp(-((dist - 0.45) ** 2) / 0.04);
      const falloff = Math.max(0, 1 - dist * 1.1);
      return ring * 0.7 + falloff * 0.3;
    },
  },
];

/* ── Contour params (controlled by sliders) ── */
export interface ContourParams {
  levels: number;       // number of contour lines (5-40)
  smoothing: number;    // smoothing factor (0-1)
  detail: number;       // grid resolution in px (1=max detail, 8=low)
  lineWidth: number;    // stroke width (0.3-3)
}

export const DEFAULT_CONTOUR_PARAMS: ContourParams = {
  levels: 20,
  smoothing: 0.8,
  detail: 2,
  lineWidth: 1,
};

/* ── Contour generation ── */

export function generateContourLines(
  width: number,
  height: number,
  seed: number,
  preset: TerrainPreset,
  params: ContourParams = DEFAULT_CONTOUR_PARAMS
): string[] {
  const { scale, octaves, shape } = preset;
  const { levels, detail } = params;

  const noise2D = createNoise2D(() => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  });

  const resolution = Math.max(1, Math.round(detail));
  const cols = Math.floor(width / resolution) + 1;
  const rows = Math.floor(height / resolution) + 1;

  // Build height field
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

      const mask = shape(wx, wy, width, height);
      field[y][x] = noise * 0.5 + mask * 0.6;
    }
  }

  const paths: string[] = [];

  for (let level = 0; level < levels; level++) {
    const threshold = -0.15 + (0.95 * level) / levels;
    const segments = marchingSquares(field, cols, rows, resolution, threshold);
    const chains = chainSegments(segments, resolution * 1.2);

    for (const chain of chains) {
      if (chain.length < 4) continue;
      // Apply Gaussian-like smoothing passes based on smoothing param
      let smoothed = chain;
      const passes = Math.round(params.smoothing * 5);
      for (let p = 0; p < passes; p++) {
        smoothed = smoothChain(smoothed);
      }
      const path = buildCubicBezierPath(smoothed);
      if (path) paths.push(path);
    }
  }

  return paths;
}

/* ── Marching squares ── */

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

/* ── Chain segments into continuous polylines ── */

function chainSegments(segments: [number, number][][], tolerance: number): [number, number][][] {
  const chains: [number, number][][] = [];
  const used = new Set<number>();

  // Index endpoints for faster lookup
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
          chain.push(seg[1]); used.add(j); changed = true;
        } else if (ptDist(last, seg[1]) < tolerance) {
          chain.push(seg[0]); used.add(j); changed = true;
        } else if (ptDist(first, seg[1]) < tolerance) {
          chain.unshift(seg[0]); used.add(j); changed = true;
        } else if (ptDist(first, seg[0]) < tolerance) {
          chain.unshift(seg[1]); used.add(j); changed = true;
        }
      }
    }

    chains.push(chain);
  }

  return chains;
}

/* ── Smoothing ── */

function smoothChain(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;
  const isClosed = ptDist(points[0], points[points.length - 1]) < 10;
  const result: [number, number][] = [];

  for (let i = 0; i < points.length; i++) {
    if (!isClosed && (i === 0 || i === points.length - 1)) {
      result.push(points[i]);
      continue;
    }
    const prev = points[(i - 1 + points.length) % points.length];
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    result.push([
      curr[0] * 0.5 + (prev[0] + next[0]) * 0.25,
      curr[1] * 0.5 + (prev[1] + next[1]) * 0.25,
    ]);
  }

  return result;
}

/* ── Build smooth cubic bezier SVG path from points ── */

function buildCubicBezierPath(points: [number, number][]): string {
  if (points.length < 2) return '';

  const isClosed = ptDist(points[0], points[points.length - 1]) < 10;

  if (points.length === 2) {
    return `M${f(points[0][0])},${f(points[0][1])} L${f(points[1][0])},${f(points[1][1])}`;
  }

  // Use Catmull-Rom to Cubic Bezier conversion for perfectly smooth curves
  let d = `M${f(points[0][0])},${f(points[0][1])}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? (isClosed ? points.length - 2 : 0) : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];

    if (isClosed) {
      const p3i = (i + 2) % points.length;
      const p3c = points[p3i];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3c[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3c[1] - p1[1]) / 6;
      d += ` C${f(cp1x)},${f(cp1y)} ${f(cp2x)},${f(cp2y)} ${f(p2[0])},${f(p2[1])}`;
    } else {
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${f(cp1x)},${f(cp1y)} ${f(cp2x)},${f(cp2y)} ${f(p2[0])},${f(p2[1])}`;
    }
  }

  if (isClosed) d += 'Z';

  return d;
}

function f(n: number): string {
  return n.toFixed(1);
}

function ptDist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

/* ── Scatter dots ── */

export interface ScatterDot {
  x: number;
  y: number;
  r: number;
  name: string;
}

export function generateScatterDots(
  width: number,
  height: number,
  seed: number,
  count: number = 30
): ScatterDot[] {
  const rng = seedRng(seed + 999);
  const names = [...LOCATION_NAMES];
  // Shuffle names
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  // Anti-overlap: each label occupies a bounding box (dot + text container)
  // We estimate label width ~ name.length * 4.5 + 20, height ~ 18
  const placed: { x: number; y: number; w: number; h: number }[] = [];

  const overlaps = (x: number, y: number, w: number, h: number) => {
    for (const p of placed) {
      // Check AABB overlap with padding
      const pad = 6;
      if (
        x < p.x + p.w + pad &&
        x + w + pad > p.x &&
        y - h / 2 < p.y + p.h / 2 + pad &&
        y + h / 2 + pad > p.y - p.h / 2
      ) {
        return true;
      }
    }
    return false;
  };

  const dots: ScatterDot[] = [];
  const maxAttempts = 80;

  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const r = rng() * 4 + 2;
    const labelW = name.length * 4.5 + 20 + r;
    const labelH = 18;
    let bestX = 0, bestY = 0, found = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = rng() * width * 0.8 + width * 0.05;
      const y = rng() * height * 0.8 + height * 0.1;

      if (!overlaps(x, y, labelW, labelH)) {
        bestX = x;
        bestY = y;
        found = true;
        break;
      }
      // Keep last attempt as fallback
      bestX = x;
      bestY = y;
    }

    placed.push({ x: bestX, y: bestY, w: labelW, h: labelH });
    dots.push({ x: bestX, y: bestY, r, name });
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
