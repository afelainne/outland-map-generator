import { createNoise2D } from 'simplex-noise';

/**
 * Generate smooth topographic contour lines using marching squares + cubic spline smoothing.
 */
export function generateContourLines(
  width: number,
  height: number,
  seed: number,
  levels: number = 14,
  scale: number = 0.003
): string[] {
  const noise2D = createNoise2D(() => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  });

  const resolution = 4;
  const cols = Math.floor(width / resolution);
  const rows = Math.floor(height / resolution);

  // Generate noise field with multiple octaves for organic terrain
  const field: number[][] = [];
  for (let y = 0; y < rows; y++) {
    field[y] = [];
    for (let x = 0; x < cols; x++) {
      const nx = x * resolution * scale;
      const ny = y * resolution * scale;
      field[y][x] =
        noise2D(nx, ny) * 0.6 +
        noise2D(nx * 2.0, ny * 2.0) * 0.25 +
        noise2D(nx * 4.0, ny * 4.0) * 0.15;
    }
  }

  const paths: string[] = [];

  for (let level = 0; level < levels; level++) {
    const threshold = -0.8 + (1.6 * level) / levels;
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

        const px = x * resolution;
        const py = y * resolution;
        const r = resolution;

        const lerp = (a: number, b: number) => {
          const d = b - a;
          if (Math.abs(d) < 0.0001) return 0.5;
          return (threshold - a) / d;
        };

        const top: [number, number] = [px + r * lerp(tl, tr), py];
        const right: [number, number] = [px + r, py + r * lerp(tr, br)];
        const bottom: [number, number] = [px + r * lerp(bl, br), py + r];
        const left: [number, number] = [px, py + r * lerp(tl, bl)];

        const addSeg = (a: [number, number], b: [number, number]) => {
          segments.push([a, b]);
        };

        switch (config) {
          case 1: addSeg(left, bottom); break;
          case 2: addSeg(bottom, right); break;
          case 3: addSeg(left, right); break;
          case 4: addSeg(top, right); break;
          case 5: addSeg(left, top); addSeg(bottom, right); break;
          case 6: addSeg(top, bottom); break;
          case 7: addSeg(left, top); break;
          case 8: addSeg(top, left); break;
          case 9: addSeg(top, bottom); break;
          case 10: addSeg(top, right); addSeg(left, bottom); break;
          case 11: addSeg(top, right); break;
          case 12: addSeg(left, right); break;
          case 13: addSeg(bottom, right); break;
          case 14: addSeg(left, bottom); break;
        }
      }
    }

    // Chain segments into paths
    const used = new Set<number>();
    for (let i = 0; i < segments.length; i++) {
      if (used.has(i)) continue;
      used.add(i);
      const chain = [...segments[i]];

      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < segments.length; j++) {
          if (used.has(j)) continue;
          const seg = segments[j];
          const last = chain[chain.length - 1];
          const first = chain[0];

          if (ptDist(last, seg[0]) < resolution * 1.5) {
            chain.push(seg[1]);
            used.add(j);
            changed = true;
          } else if (ptDist(last, seg[1]) < resolution * 1.5) {
            chain.push(seg[0]);
            used.add(j);
            changed = true;
          } else if (ptDist(first, seg[1]) < resolution * 1.5) {
            chain.unshift(seg[0]);
            used.add(j);
            changed = true;
          } else if (ptDist(first, seg[0]) < resolution * 1.5) {
            chain.unshift(seg[1]);
            used.add(j);
            changed = true;
          }
        }
      }

      if (chain.length > 4) {
        const simplified = simplify(chain, 2);
        const d = smoothCubicPath(simplified);
        if (d) paths.push(d);
      }
    }
  }

  return paths;
}

function ptDist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function simplify(points: [number, number][], tolerance: number): [number, number][] {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  let maxDist = 0;
  let maxIdx = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = pointLineDistance(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplify(points.slice(0, maxIdx + 1), tolerance);
    const right = simplify(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function pointLineDistance(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return ptDist(p, a);
  return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len;
}

/**
 * Generate smooth cubic bezier path from points using Catmull-Rom to Bezier conversion.
 */
function smoothCubicPath(points: [number, number][]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} L ${points[1][0].toFixed(1)} ${points[1][1].toFixed(1)}`;
  }

  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[Math.min(points.length - 1, i + 1)];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to cubic bezier control points
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }

  return d;
}

export interface ScatterDot {
  x: number;
  y: number;
  r: number;
}

export function generateScatterDots(
  width: number,
  height: number,
  seed: number,
  count: number = 80
): ScatterDot[] {
  const rng = seedRng(seed + 999);
  const dots: ScatterDot[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      x: rng() * width * 0.9 + width * 0.05,
      y: rng() * height * 0.9 + height * 0.05,
      r: rng() * 14 + 1.5,
    });
  }
  return dots;
}

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
  count: number = 20
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
