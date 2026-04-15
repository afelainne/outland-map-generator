import { useRef, useCallback, useMemo } from 'react';
import type { MapTheme } from '@/lib/themes';
import type { MapMarker, ScatterDot } from '@/lib/noise';
import type { LabelStyleParams } from '@/components/LabelControls';

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
  labelStyle?: LabelStyleParams;
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
  labelStyle = { uppercase: false, opacity: 0.15, outline: true, rounded: true, bgColor: '', outlineColor: '', scale: 1, markerType: 'dot' as const, markerSize: 1, shapeScale: 1 },
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
    const size = 6 * labelStyle.shapeScale;
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
          const rawText = dot.name || '';
          const labelText = labelStyle.uppercase ? rawText.toUpperCase() : rawText;
          const s = labelStyle.scale;
          const fontSize = 7 * s;
          const charWidth = (labelStyle.uppercase ? 4.2 : 3.8) * s;
          const textW = labelText.length * charWidth + 12 * s;
          const textH = 14 * s;
          const radius = labelStyle.rounded ? 3 * s : 0;
          const bgFill = labelStyle.bgColor || theme.bg;
          const strokeColor = labelStyle.outlineColor || theme.bg;
          const isFullOpacity = labelStyle.opacity >= 1;
          const dotR = dot.r * s * labelStyle.markerSize;
          const mType = labelStyle.markerType;
          const shapes = ['circle', 'square', 'triangle', 'diamond'] as const;
          const shapeType = shapes[i % shapes.length];
          const shapeSize = dotR * 1.2;
          const logoScale = (dotR * 2) / 110;

          const renderDotMarker = () => {
            if (mType === 'logo') {
              return (
                <g transform={`translate(${dot.x - dotR}, ${dot.y - dotR}) scale(${logoScale})`} opacity="0.9">
                  <path d="M13.4186 62.3094H6.49537V55.3861H13.4186V62.3094Z" fill={theme.dot} />
                  <path d="M27.2652 62.3094H20.3419V55.3861H27.2652V62.3094Z" fill={theme.dot} />
                  <path d="M41.1117 62.3094H34.1884V55.3861H41.1117V62.3094Z" fill={theme.dot} />
                  <path d="M109.915 62.3094H103.203C102.895 64.7566 102.26 67.157 101.312 69.4454C99.9206 72.8053 97.8807 75.8581 95.3092 78.4297C92.7376 81.0012 89.6848 83.0411 86.3249 84.4328C82.965 85.8245 79.3639 86.5408 75.7272 86.5408C72.0905 86.5408 68.4894 85.8245 65.1295 84.4328C61.7697 83.0411 58.7168 81.0012 56.1453 78.4297C53.5737 75.8581 51.5339 72.8053 50.1422 69.4454C49.1943 67.157 48.5597 64.7566 48.2513 62.3094H41.1117V69.2326H34.1884V62.3094H27.2652V69.2326H20.3419V62.3094H13.4186V69.2326H6.49537V62.3094H-0.00021023C3.40671 89.6307 26.7131 110.772 54.9574 110.772C83.2017 110.772 106.508 89.6307 109.915 62.3094Z" fill={theme.dot} />
                  <path d="M-0.000211441 48.4628H6.71176C7.02008 46.0156 7.65466 43.6152 8.60256 41.3268C9.99426 37.9669 12.0341 34.9141 14.6057 32.3425C17.1772 29.771 20.2301 27.7311 23.5899 26.3394C26.9498 24.9477 30.5509 24.2314 34.1876 24.2314C37.8243 24.2314 41.4254 24.9477 44.7853 26.3394C48.1452 27.7311 51.198 29.771 53.7696 32.3425C56.3411 34.9141 58.381 37.9669 59.7727 41.3268C60.7206 43.6152 61.3551 46.0156 61.6635 48.4628H68.8048V41.5396H75.728V48.4628H82.6513V41.5396H89.5746V48.4628H96.4978V41.5396H103.421V48.4628H109.915C106.508 21.1415 83.2017 0 54.9574 0C26.7131 0 3.40671 21.1415 -0.000211441 48.4628Z" fill={theme.dot} />
                  <path d="M75.728 55.3861H68.8048V48.4628H75.728V55.3861Z" fill={theme.dot} />
                  <path d="M89.5746 55.3861H82.6513V48.4628H89.5746V55.3861Z" fill={theme.dot} />
                  <path d="M103.421 55.3861H96.4978V48.4628H103.421V55.3861Z" fill={theme.dot} />
                </g>
              );
            }
            if (mType === 'shapes') {
              const sw = 1.2;
              switch (shapeType) {
                case 'circle':
                  return <circle cx={dot.x} cy={dot.y} r={shapeSize} fill="none" stroke={theme.dot} strokeWidth={sw} />;
                case 'square':
                  return <rect x={dot.x - shapeSize} y={dot.y - shapeSize} width={shapeSize * 2} height={shapeSize * 2} fill="none" stroke={theme.dot} strokeWidth={sw} />;
                case 'triangle':
                  return <polygon points={`${dot.x},${dot.y - shapeSize} ${dot.x - shapeSize},${dot.y + shapeSize} ${dot.x + shapeSize},${dot.y + shapeSize}`} fill="none" stroke={theme.dot} strokeWidth={sw} />;
                case 'diamond':
                  return <polygon points={`${dot.x},${dot.y - shapeSize} ${dot.x + shapeSize},${dot.y} ${dot.x},${dot.y + shapeSize} ${dot.x - shapeSize},${dot.y}`} fill="none" stroke={theme.dot} strokeWidth={sw} />;
              }
            }
            // default: filled dot
            return <circle cx={dot.x} cy={dot.y} r={dotR} fill={theme.dot} opacity="0.9" />;
          };

          return (
            <g key={`dot-${i}`}>
              {renderDotMarker()}
              <rect
                x={dot.x + dotR + 4}
                y={dot.y - textH / 2}
                width={textW}
                height={textH}
                rx={radius}
                ry={radius}
                fill={bgFill}
                opacity={isFullOpacity ? 1 : labelStyle.opacity}
                stroke={labelStyle.outline ? strokeColor : 'none'}
                strokeWidth={labelStyle.outline ? 0.7 : 0}
                strokeOpacity={isFullOpacity ? 1 : 0.6}
              />
              <text
                x={dot.x + dotR + 6 * s + 4}
                y={dot.y + fontSize * 0.35}
                fill={theme.text}
                fontSize={fontSize}
                opacity="0.9"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {labelText}
              </text>
            </g>
          );
        })}

        {/* Outland Logo */}
        <g transform={`translate(20, ${height - blockH - 20}) scale(${blockW / 110})`} opacity="0.85">
          <path d="M13.4186 62.3094H6.49537V55.3861H13.4186V62.3094Z" fill={theme.text} />
          <path d="M27.2652 62.3094H20.3419V55.3861H27.2652V62.3094Z" fill={theme.text} />
          <path d="M41.1117 62.3094H34.1884V55.3861H41.1117V62.3094Z" fill={theme.text} />
          <path d="M109.915 62.3094H103.203C102.895 64.7566 102.26 67.157 101.312 69.4454C99.9206 72.8053 97.8807 75.8581 95.3092 78.4297C92.7376 81.0012 89.6848 83.0411 86.3249 84.4328C82.965 85.8245 79.3639 86.5408 75.7272 86.5408C72.0905 86.5408 68.4894 85.8245 65.1295 84.4328C61.7697 83.0411 58.7168 81.0012 56.1453 78.4297C53.5737 75.8581 51.5339 72.8053 50.1422 69.4454C49.1943 67.157 48.5597 64.7566 48.2513 62.3094H41.1117V69.2326H34.1884V62.3094H27.2652V69.2326H20.3419V62.3094H13.4186V69.2326H6.49537V62.3094H-0.00021023C3.40671 89.6307 26.7131 110.772 54.9574 110.772C83.2017 110.772 106.508 89.6307 109.915 62.3094Z" fill={theme.text} />
          <path d="M-0.000211441 48.4628H6.71176C7.02008 46.0156 7.65466 43.6152 8.60256 41.3268C9.99426 37.9669 12.0341 34.9141 14.6057 32.3425C17.1772 29.771 20.2301 27.7311 23.5899 26.3394C26.9498 24.9477 30.5509 24.2314 34.1876 24.2314C37.8243 24.2314 41.4254 24.9477 44.7853 26.3394C48.1452 27.7311 51.198 29.771 53.7696 32.3425C56.3411 34.9141 58.381 37.9669 59.7727 41.3268C60.7206 43.6152 61.3551 46.0156 61.6635 48.4628H68.8048V41.5396H75.728V48.4628H82.6513V41.5396H89.5746V48.4628H96.4978V41.5396H103.421V48.4628H109.915C106.508 21.1415 83.2017 0 54.9574 0C26.7131 0 3.40671 21.1415 -0.000211441 48.4628Z" fill={theme.text} />
          <path d="M75.728 55.3861H68.8048V48.4628H75.728V55.3861Z" fill={theme.text} />
          <path d="M89.5746 55.3861H82.6513V48.4628H89.5746V55.3861Z" fill={theme.text} />
          <path d="M103.421 55.3861H96.4978V48.4628H103.421V55.3861Z" fill={theme.text} />
        </g>

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

        {/* Markers (shapes only, no labels) */}
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
