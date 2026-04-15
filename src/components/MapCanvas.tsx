import { useRef, useCallback, useMemo } from 'react';
import type { MapTheme } from '@/lib/themes';
import type { MapMarker, ScatterDot } from '@/lib/noise';

/** Create abbreviation from name: "Department of Imagination" → "D.O.I." */
function abbreviate(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join('.') + '.';
}

interface MapCanvasProps {
  width: number;
  height: number;
  contourPaths: string[];
  dots: ScatterDot[];
  markers: MapMarker[];
  theme: MapTheme;
  activeTool: 'select' | 'circle' | 'square' | 'triangle' | 'diamond' | null;
  onAddMarker: (x: number, y: number) => void;
  onSelectMarker: (id: string | null) => void;
  selectedMarkerId: string | null;
  mapNumber: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
  seed: number;
  lineWidth?: number;
  labelMode?: 'number' | 'abbrev' | 'full';
}

const MapCanvas = ({
  width,
  height,
  contourPaths,
  dots,
  markers,
  theme,
  activeTool,
  onAddMarker,
  onSelectMarker,
  selectedMarkerId,
  mapNumber,
  svgRef,
  seed,
  lineWidth = 1,
  labelMode = 'number',
}: MapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!activeTool || activeTool === 'select') return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      onAddMarker(x, y);
    },
    [activeTool, onAddMarker, width, height, svgRef]
  );

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = [];
    const spacing = 50;
    for (let x = spacing; x < width; x += spacing) {
      lines.push(
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke={theme.grid} strokeWidth="0.5" opacity="0.5" />
      );
    }
    for (let y = spacing; y < height; y += spacing) {
      lines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={theme.grid} strokeWidth="0.5" opacity="0.5" />
      );
    }
    return lines;
  }, [width, height, theme.grid]);

  // Generate paper texture noise pattern
  const textureId = `texture-${seed}`;
  const filterId = `paper-${seed}`;

  const renderMarkerShape = (m: MapMarker) => {
    const isSelected = m.id === selectedMarkerId;
    const size = 6;
    const strokeW = isSelected ? 2 : 1.2;

    switch (m.shape) {
      case 'circle':
        return <circle cx={m.x} cy={m.y} r={size} fill="none" stroke={theme.line} strokeWidth={strokeW} />;
      case 'square':
        return <rect x={m.x - size} y={m.y - size} width={size * 2} height={size * 2} fill="none" stroke={theme.line} strokeWidth={strokeW} />;
      case 'triangle':
        return (
          <polygon
            points={`${m.x},${m.y - size} ${m.x - size},${m.y + size} ${m.x + size},${m.y + size}`}
            fill="none" stroke={theme.line} strokeWidth={strokeW}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${m.x},${m.y - size} ${m.x + size},${m.y} ${m.x},${m.y + size} ${m.x - size},${m.y}`}
            fill="none" stroke={theme.line} strokeWidth={strokeW}
          />
        );
    }
  };

  const blockW = width * 0.12;
  const blockH = height * 0.12;

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full max-h-full"
        style={{ fontFamily: "'Space Mono', monospace", cursor: activeTool && activeTool !== 'select' ? 'crosshair' : 'default' }}
        onClick={handleClick}
      >
        <defs>
          {/* Paper texture filter */}
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="multiply" />
          </filter>
        </defs>

        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill={theme.bg} />

        {/* Paper texture overlay */}
        <rect x={0} y={0} width={width} height={height} fill={theme.bg} filter={`url(#${filterId})`} opacity="0.15" />

        {/* Grid */}
        {gridLines}

        {/* Contour lines - smooth flowing curves */}
        {contourPaths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={theme.line} strokeWidth={lineWidth} opacity="0.75" strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Location name labels with dot containers */}
        {dots.map((dot, i) => {
          const labelText = dot.name;
          const charWidth = 3.8;
          const textW = labelText.length * charWidth + 12;
          const textH = 14;
          return (
            <g key={`dot-${i}`} opacity="0.85">
              {/* Dot marker */}
              <circle cx={dot.x} cy={dot.y} r={dot.r} fill={theme.dot} opacity="0.9" />
              {/* Label container */}
              <rect
                x={dot.x + dot.r + 4}
                y={dot.y - textH / 2}
                width={textW}
                height={textH}
                rx={3}
                ry={3}
                fill={theme.dot}
                opacity="0.15"
                stroke={theme.dot}
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              {/* Label text */}
              <text
                x={dot.x + dot.r + 10}
                y={dot.y + 3.5}
                fill={theme.text}
                fontSize="7"
                opacity="0.75"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {labelText}
              </text>
            </g>
          );
        })}

        {/* Accent block */}
        <rect x={20} y={height - blockH - 20} width={blockW} height={blockH} fill={theme.accentBlock} opacity="0.85" />

        {/* Large map number - faint background */}
        <text
          x={width - 30}
          y={100}
          textAnchor="end"
          fill={theme.text}
          fontSize="72"
          fontWeight="bold"
          opacity="0.12"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {String(mapNumber).padStart(2, '0')}
        </text>

        {/* Markers */}
        {markers.map((m) => (
          <g
            key={m.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectMarker(m.id);
            }}
            style={{ cursor: 'pointer' }}
          >
            {renderMarkerShape(m)}
            <text
              x={m.x + 10}
              y={m.y - 2}
              fill={theme.text}
              fontSize={labelMode === 'full' ? "5" : labelMode === 'abbrev' ? "6" : "7"}
              opacity="0.9"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {labelMode === 'full' ? m.name : labelMode === 'abbrev' ? abbreviate(m.name) : m.number}
            </text>
          </g>
        ))}

        {/* Title */}
        <text
          x={20}
          y={height - blockH - 30}
          fill={theme.text}
          fontSize="9"
          letterSpacing="3"
          opacity="0.8"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          OUTLAND MAP
        </text>
      </svg>
    </div>
  );
};

export default MapCanvas;
