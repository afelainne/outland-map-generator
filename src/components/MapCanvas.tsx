import { useRef, useCallback, useMemo } from 'react';
import type { MapTheme } from '@/lib/themes';
import type { MapMarker, ScatterDot } from '@/lib/noise';

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
    const spacing = 40;
    for (let x = spacing; x < width; x += spacing) {
      lines.push(
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke={theme.grid} strokeWidth="0.5" opacity="0.6" />
      );
    }
    for (let y = spacing; y < height; y += spacing) {
      lines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={theme.grid} strokeWidth="0.5" opacity="0.6" />
      );
    }
    return lines;
  }, [width, height, theme.grid]);

  const renderMarkerShape = (m: MapMarker) => {
    const isSelected = m.id === selectedMarkerId;
    const size = 8;
    const strokeW = isSelected ? 2.5 : 1.5;

    switch (m.shape) {
      case 'circle':
        return (
          <circle cx={m.x} cy={m.y} r={size} fill="none" stroke={theme.accent} strokeWidth={strokeW} />
        );
      case 'square':
        return (
          <rect
            x={m.x - size}
            y={m.y - size}
            width={size * 2}
            height={size * 2}
            fill="none"
            stroke={theme.accent}
            strokeWidth={strokeW}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={`${m.x},${m.y - size} ${m.x - size},${m.y + size} ${m.x + size},${m.y + size}`}
            fill="none"
            stroke={theme.accent}
            strokeWidth={strokeW}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${m.x},${m.y - size} ${m.x + size},${m.y} ${m.x},${m.y + size} ${m.x - size},${m.y}`}
            fill="none"
            stroke={theme.accent}
            strokeWidth={strokeW}
          />
        );
    }
  };

  // Accent block position (bottom-left like reference)
  const blockW = width * 0.15;
  const blockH = height * 0.15;

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full max-h-full"
        style={{ fontFamily: "'Space Mono', monospace", cursor: activeTool && activeTool !== 'select' ? 'crosshair' : 'default' }}
        onClick={handleClick}
      >
        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill={theme.bg} />

        {/* Grid */}
        {gridLines}

        {/* Contour lines */}
        {contourPaths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={theme.line} strokeWidth="1" opacity="0.7" />
        ))}

        {/* Scatter dots */}
        {dots.map((dot, i) => (
          <circle key={`dot-${i}`} cx={dot.x} cy={dot.y} r={dot.r} fill={theme.dot} opacity="0.6" />
        ))}

        {/* Accent block */}
        <rect x={20} y={height - blockH - 20} width={blockW} height={blockH} fill={theme.accentBlock} opacity="0.85" />

        {/* Large map number */}
        <text
          x={width - 40}
          y={120}
          textAnchor="end"
          fill={theme.text}
          fontSize="80"
          fontWeight="bold"
          opacity="0.15"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {mapNumber}
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
              x={m.x + 12}
              y={m.y - 4}
              fill={theme.text}
              fontSize="8"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {m.number}
            </text>
          </g>
        ))}

        {/* Title */}
        <text
          x={20}
          y={height - blockH - 30}
          fill={theme.text}
          fontSize="10"
          letterSpacing="2"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          OUTLAND MAP
        </text>
      </svg>
    </div>
  );
};

export default MapCanvas;
