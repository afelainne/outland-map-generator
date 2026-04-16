export interface CustomShape {
  /** Inner SVG markup (everything inside <svg>) */
  innerSvg: string;
  /** viewBox from the source SVG, used for scaling */
  viewBox: { x: number; y: number; w: number; h: number };
  /** Original filename (for UI display) */
  name: string;
}

/**
 * Parse an SVG file string and extract its inner contents + viewBox.
 * Strips <script> tags for safety. Returns null if invalid.
 */
export function parseSvgFile(svgText: string, name: string): CustomShape | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) return null;

    const svgEl = doc.querySelector('svg');
    if (!svgEl) return null;

    // Strip script tags
    svgEl.querySelectorAll('script').forEach((n) => n.remove());

    // Determine viewBox
    let vb = svgEl.getAttribute('viewBox');
    let x = 0, y = 0, w = 0, h = 0;
    if (vb) {
      const parts = vb.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        [x, y, w, h] = parts;
      }
    }
    if (!w || !h) {
      const wAttr = parseFloat(svgEl.getAttribute('width') || '0');
      const hAttr = parseFloat(svgEl.getAttribute('height') || '0');
      if (wAttr && hAttr) {
        w = wAttr;
        h = hAttr;
      } else {
        // Fallback
        w = 100;
        h = 100;
      }
    }

    return {
      innerSvg: svgEl.innerHTML,
      viewBox: { x, y, w, h },
      name,
    };
  } catch {
    return null;
  }
}
