import { useRef, useCallback, useMemo } from 'react';
import type { MapTheme } from '@/lib/themes';
import type { MapMarker, ScatterDot } from '@/lib/noise';
import type { LabelStyleParams } from '@/components/LabelControls';
import type { CustomShape } from '@/lib/customShape';
import { IBM_PLEX_400 } from '@/lib/ibmPlexMono400';
import { IBM_PLEX_700 } from '@/lib/ibmPlexMono700';

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
  contourOpacity?: number;
  labelMode?: 'number' | 'abbrev' | 'full';
  labelStyle?: LabelStyleParams;
  customShape?: CustomShape | null;
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
  contourOpacity = 0.75,
  labelMode = 'number',
  labelStyle = { ...{ uppercase: false, scale: 1, markerType: 'dot' as const, nameIconShape: null, markerSize: 1, shapeScale: 1, legendScale: 0.7, showShapes: true, showArrows: false, arrowSpacing: 80, arrowSize: 1, arrowShape: 'chevron' as const, showLineElements: false, lineElementSpacing: 40, lineElementSize: 1, showLegend: true, showBranding: true, gridOpacity: 0.5, gridLineWidth: 1, nameIconOpacity: 0.9, nameTextOpacity: 0.9, boardNumberOpacity: 0.12, logoOpacity: 0.85, legendOpacity: 0.8, shapeOpacity: 1 } },
  customShape = null,
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
    const gridVisibility = Math.max(0, Math.min(1, labelStyle.gridOpacity));
    const gridStrokeWidth = Math.max(0.5, labelStyle.gridLineWidth);
    for (let x = spacing; x < width; x += spacing) {
      lines.push(
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke={theme.line} strokeWidth={gridStrokeWidth} strokeOpacity={gridVisibility} />
      );
    }
    for (let y = spacing; y < height; y += spacing) {
      lines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={theme.line} strokeWidth={gridStrokeWidth} strokeOpacity={gridVisibility} />
      );
    }
    return lines;
  }, [width, height, theme.line, labelStyle.gridOpacity, labelStyle.gridLineWidth]);

  // Generate paper texture noise pattern
  const textureId = `texture-${seed}`;
  const filterId = `paper-${seed}`;

  const renderMarkerShape = (m: MapMarker) => {
    const isSelected = m.id === selectedMarkerId;
    const size = 6 * labelStyle.shapeScale;
    const strokeW = isSelected ? 2 : 1.2;

    // Custom uploaded SVG overrides all built-in shapes
    if (customShape) {
      const targetSize = size * 2; // diameter equivalent
      const scale = targetSize / Math.max(customShape.viewBox.w, customShape.viewBox.h);
      const tx = m.x - (customShape.viewBox.x + customShape.viewBox.w / 2) * scale;
      const ty = m.y - (customShape.viewBox.y + customShape.viewBox.h / 2) * scale;
      return (
        <g
          transform={`translate(${tx} ${ty}) scale(${scale})`}
          stroke={theme.line}
          strokeWidth={(isSelected ? 2 : 1.2) / scale}
          fill="none"
          dangerouslySetInnerHTML={{ __html: customShape.innerSvg }}
        />
      );
    }

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
        style={{ fontFamily: "'IBM Plex Mono', monospace", cursor: activeTool && activeTool !== 'select' ? 'crosshair' : 'default' }}
        onClick={handleClick}
      >
        <defs>
          {/* Embed font as base64 for SVG export / Figma */}
          <style>{`
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; src: url('data:font/truetype;base64,${IBM_PLEX_400}') format('truetype'); }
@font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 700; src: url('data:font/truetype;base64,${IBM_PLEX_700}') format('truetype'); }
text, tspan { font-family: 'IBM Plex Mono', monospace !important; }
          `}</style>
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
          <path
            key={i}
            d={d}
            fill="none"
            stroke={theme.line}
            strokeWidth={lineWidth}
            opacity={contourOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Direction marks on contour lines */}
        {labelStyle.showArrows && contourPaths.map((d, i) => {
          const points: { x: number; y: number }[] = [];
          const regex = /[ML]\s*([\d.e+-]+)[,\s]+([\d.e+-]+)|C\s*([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)/g;
          let match;
          while ((match = regex.exec(d)) !== null) {
            if (match[1] !== undefined) {
              points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
            } else if (match[7] !== undefined) {
              points.push({ x: parseFloat(match[7]), y: parseFloat(match[8]) });
            }
          }
          if (points.length < 3) return null;
          const spacing = labelStyle.arrowSpacing;
          const sz = labelStyle.arrowSize;
          const shape = labelStyle.arrowShape;
          const arrows: JSX.Element[] = [];
          let dist = 0;
          let nextAt = spacing * 0.5;
          for (let j = 1; j < points.length; j++) {
            const dx = points[j].x - points[j - 1].x;
            const dy = points[j].y - points[j - 1].y;
            const segLen = Math.sqrt(dx * dx + dy * dy);
            dist += segLen;
            if (dist >= nextAt && segLen > 0.5) {
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              const mx = (points[j].x + points[j - 1].x) / 2;
              const my = (points[j].y + points[j - 1].y) / 2;
              const r = 2.5 * sz;
              let el: JSX.Element;
              switch (shape) {
                case 'chevron':
                  el = <path d={`M${-3 * sz},${-2.5 * sz} L${1 * sz},0 L${-3 * sz},${2.5 * sz}`} fill="none" stroke={theme.line} strokeWidth={0.8 * sz} />;
                  break;
                case 'arrow':
                  el = <><line x1={-3 * sz} y1={0} x2={2 * sz} y2={0} stroke={theme.line} strokeWidth={0.8 * sz} /><path d={`M${0},${-2 * sz} L${3 * sz},0 L${0},${2 * sz}`} fill="none" stroke={theme.line} strokeWidth={0.8 * sz} /></>;
                  break;
                case 'triangle':
                  el = <polygon points={`${-r},${r * 0.8} ${r},0 ${-r},${-r * 0.8}`} fill={theme.line} opacity="0.6" />;
                  break;
                case 'circle':
                  el = <circle cx={0} cy={0} r={r} fill="none" stroke={theme.line} strokeWidth={0.7 * sz} />;
                  break;
                case 'square':
                  el = <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="none" stroke={theme.line} strokeWidth={0.7 * sz} />;
                  break;
                case 'diamond':
                  el = <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`} fill="none" stroke={theme.line} strokeWidth={0.7 * sz} />;
                  break;
                case 'dot':
                  el = <circle cx={0} cy={0} r={r * 0.6} fill={theme.line} />;
                  break;
                case 'tick':
                  el = <line x1={0} y1={-r} x2={0} y2={r} stroke={theme.line} strokeWidth={0.8 * sz} />;
                  break;
                case 'cross':
                  el = <><line x1={-r} y1={0} x2={r} y2={0} stroke={theme.line} strokeWidth={0.7 * sz} /><line x1={0} y1={-r} x2={0} y2={r} stroke={theme.line} strokeWidth={0.7 * sz} /></>;
                  break;
                default:
                  el = <path d={`M${-3 * sz},${-2.5 * sz} L${1 * sz},0 L${-3 * sz},${2.5 * sz}`} fill="none" stroke={theme.line} strokeWidth={0.8 * sz} />;
              }
              arrows.push(
                <g key={`${i}-${j}`} transform={`translate(${mx}, ${my}) rotate(${angle})`} opacity="0.6">
                  {el}
                </g>
              );
              nextAt = dist + spacing;
            }
          }
          return <g key={`arrows-${i}`}>{arrows}</g>;
        })}

        {/* Line elements - perpendicular ticks emanating from contour lines */}
        {labelStyle.showLineElements && contourPaths.map((d, i) => {
          const points: { x: number; y: number }[] = [];
          const regex = /[ML]\s*([\d.e+-]+)[,\s]+([\d.e+-]+)|C\s*([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)[,\s]+([\d.e+-]+)/g;
          let match;
          while ((match = regex.exec(d)) !== null) {
            if (match[1] !== undefined) {
              points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
            } else if (match[7] !== undefined) {
              points.push({ x: parseFloat(match[7]), y: parseFloat(match[8]) });
            }
          }
          if (points.length < 3) return null;
          const spacing = labelStyle.lineElementSpacing;
          const sz = labelStyle.lineElementSize;
          const tickLen = 4 * sz;
          const ticks: JSX.Element[] = [];
          let dist = 0;
          let nextAt = spacing * 0.3;
          for (let j = 1; j < points.length; j++) {
            const dx = points[j].x - points[j - 1].x;
            const dy = points[j].y - points[j - 1].y;
            const segLen = Math.sqrt(dx * dx + dy * dy);
            dist += segLen;
            if (dist >= nextAt && segLen > 0.5) {
              const mx = (points[j].x + points[j - 1].x) / 2;
              const my = (points[j].y + points[j - 1].y) / 2;
              // Perpendicular direction (rotated 90°)
              const nx = -dy / segLen;
              const ny = dx / segLen;
              ticks.push(
                <line
                  key={`${i}-${j}`}
                  x1={mx}
                  y1={my}
                  x2={mx + nx * tickLen}
                  y2={my + ny * tickLen}
                  stroke={theme.line}
                  strokeWidth={0.5 * sz}
                  opacity="0.4"
                />
              );
              nextAt = dist + spacing;
            }
          }
          return <g key={`elems-${i}`}>{ticks}</g>;
        })}

        {/* Location name labels with dot containers */}
        {dots.map((dot, i) => {
          const rawText = dot.name || '';
          const labelText = labelStyle.uppercase ? rawText.toUpperCase() : rawText;
          const s = labelStyle.scale;
          const fontSize = 7 * s;
          const charWidth = (labelStyle.uppercase ? 4.2 : 3.8) * s;
          const dotR = dot.r * s * labelStyle.markerSize;
          const mType = labelStyle.markerType;
          const shapes = ['circle', 'square', 'triangle', 'diamond'] as const;
          const shapeType = labelStyle.nameIconShape || shapes[i % shapes.length];
          const shapeSize = dotR * 1.2;
          const logoScale = (dotR * 2) / 110;

          const renderDotMarker = () => {
            const iconOp = labelStyle.nameIconOpacity ?? 0.9;
            if (mType === 'logo') {
              return (
                <g transform={`translate(${dot.x - dotR}, ${dot.y - dotR}) scale(${logoScale})`} opacity={iconOp}>
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
                  return <circle cx={dot.x} cy={dot.y} r={shapeSize} fill="none" stroke={theme.dot} strokeWidth={sw} opacity={iconOp} />;
                case 'square':
                  return <rect x={dot.x - shapeSize} y={dot.y - shapeSize} width={shapeSize * 2} height={shapeSize * 2} fill="none" stroke={theme.dot} strokeWidth={sw} opacity={iconOp} />;
                case 'triangle':
                  return <polygon points={`${dot.x},${dot.y - shapeSize} ${dot.x - shapeSize},${dot.y + shapeSize} ${dot.x + shapeSize},${dot.y + shapeSize}`} fill="none" stroke={theme.dot} strokeWidth={sw} opacity={iconOp} />;
                case 'diamond':
                  return <polygon points={`${dot.x},${dot.y - shapeSize} ${dot.x + shapeSize},${dot.y} ${dot.x},${dot.y + shapeSize} ${dot.x - shapeSize},${dot.y}`} fill="none" stroke={theme.dot} strokeWidth={sw} opacity={iconOp} />;
              }
            }
            // default: filled dot
            return <circle cx={dot.x} cy={dot.y} r={dotR} fill={theme.dot} opacity={iconOp} />;
          };

          return (
            <g key={`dot-${i}`}>
              {renderDotMarker()}
              <text
                x={dot.x + dotR + 4 * s + 2}
                y={dot.y + fontSize * 0.35}
                fill={theme.text}
                fontSize={fontSize}
                opacity={labelStyle.nameTextOpacity ?? 0.9}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {labelText}
              </text>
            </g>
          );
        })}

        {/* Outland Logo */}
        {labelStyle.showBranding && (
          <g transform={`translate(20, ${height - 12 - 252 * ((blockW * 1.8) / 1184)}) scale(${(blockW * 1.8) / 1184})`} opacity={labelStyle.logoOpacity ?? 0.85}>
            <path d="M14.7676 157.397H30.5068V141.657H46.2471V157.397H61.9863V141.657H77.7266V157.397H93.4658V141.657H109.697C110.398 147.221 111.841 152.678 113.996 157.881C117.16 165.519 121.797 172.459 127.644 178.306C133.49 184.152 140.431 188.79 148.069 191.954C155.708 195.118 163.894 196.746 172.162 196.746C180.43 196.746 188.617 195.118 196.256 191.954C203.894 188.79 210.835 184.152 216.682 178.306C222.528 172.459 227.165 165.519 230.329 157.881C232.484 152.678 233.927 147.221 234.628 141.657H249.887C242.141 203.771 189.155 251.835 124.943 251.835C60.7314 251.835 7.74547 203.771 0 141.657H14.7676V157.397Z" fill={theme.text}/>
            <path d="M30.5068 141.657H14.7676V125.918H30.5068V141.657Z" fill={theme.text}/>
            <path d="M61.9863 141.657H46.2471V125.918H61.9863V141.657Z" fill={theme.text}/>
            <path d="M93.4658 141.657H77.7266V125.918H93.4658V141.657Z" fill={theme.text}/>
            <path d="M172.164 125.918H156.425V110.178H172.164V125.918Z" fill={theme.text}/>
            <path d="M203.644 125.918H187.904V110.178H203.644V125.918Z" fill={theme.text}/>
            <path d="M235.123 125.918H219.384V110.178H235.123V125.918Z" fill={theme.text}/>
            <path d="M124.943 0C189.155 0 242.141 48.0641 249.887 110.178H235.123V94.4385H219.384V110.178H203.644V94.4385H187.904V110.178H172.164V94.4385H156.425V110.178H140.189C139.488 104.614 138.046 99.1567 135.891 93.9541C132.727 86.3158 128.089 79.3754 122.243 73.5293C116.397 67.683 109.456 63.0458 101.817 59.8818C94.179 56.7179 85.9924 55.0889 77.7246 55.0889C69.4567 55.0889 61.2694 56.7179 53.6309 59.8818C45.9925 63.0458 39.0522 67.6832 33.2061 73.5293C27.3598 79.3755 22.7216 86.3157 19.5576 93.9541C17.4026 99.1567 15.9608 104.614 15.2598 110.178H0C7.74556 48.0641 60.7315 5.33142e-05 124.943 0Z" fill={theme.text}/>
            <path fillRule="evenodd" clipRule="evenodd" d="M807.152 64.8838C835.404 64.884 854.981 80.7444 854.981 106.27V160.388C855.476 173.134 859.513 177.89 868.31 177.891C876.735 177.891 881.444 170.208 881.444 155.834V137.991H894.083V156.826C894.083 180.121 882.188 193.752 861.619 193.752C847.118 193.752 836.002 188.016 831.783 172.271H829.041V172.274C821.87 185.573 807.954 193.751 787.822 193.751C764.527 193.751 750.401 182.846 750.401 164.012C750.402 139.23 774.688 129.565 827.722 120.644V100.074C827.722 85.2052 816.817 76.5324 800.957 76.5322C787.575 76.5322 777.661 81.4878 772.457 89.418C773.448 89.1702 774.192 89.1709 774.936 89.1709C784.848 89.171 791.292 95.1176 791.292 104.534C791.292 113.951 784.353 120.147 774.936 120.147C764.527 120.147 757.34 112.713 757.34 101.313C757.34 81.2401 778.405 64.8839 807.152 64.8838ZM827.722 131.548C788.814 138.982 777.661 144.186 777.661 160.79C777.661 173.181 784.601 180.12 796.992 180.12C815.578 180.12 827.722 165.995 827.722 144.435V131.548Z" fill={theme.text}/>
            <path fillRule="evenodd" clipRule="evenodd" d="M381.787 64.8838C415.986 64.8841 442.999 93.1355 442.999 129.069C442.999 165.251 415.986 193.751 381.787 193.751C347.34 193.751 320.574 165.251 320.574 129.069C320.574 93.1353 347.34 64.8838 381.787 64.8838ZM381.787 77.0264C361.218 77.0264 350.562 93.1353 350.562 129.069C350.562 165.499 361.218 181.607 381.787 181.607C402.356 181.607 413.012 165.499 413.012 129.069C413.012 93.1357 402.356 77.0267 381.787 77.0264Z" fill={theme.text}/>
            <path d="M489.915 154.347C489.915 170.455 497.598 178.633 511.228 178.633C528.823 178.633 541.958 161.533 541.958 137.742V79.5049H519.406V67.3613H569.218V179.129H591.77V191.272H541.958V168.721H539.231C530.558 183.094 518.662 193.751 500.571 193.751C477.524 193.751 462.903 178.385 462.903 154.347V79.5049H440.352V67.3613H489.915V154.347Z" fill={theme.text}/>
            <path d="M632.642 67.3613H669.814V79.5049H632.642V157.569C632.642 172.438 636.607 177.891 646.023 177.891C654.449 177.89 659.158 170.207 659.158 155.834V137.99H671.797V156.825C671.797 180.12 659.901 193.751 639.332 193.751C616.285 193.751 605.381 181.855 605.381 160.295V79.5049H586.051V67.3613H593.981C615.046 67.3612 618.764 59.1832 618.764 35.6406V28.4541H632.642V67.3613Z" fill={theme.text}/>
            <path fillRule="evenodd" clipRule="evenodd" d="M1161.32 179.129H1183.87V191.272H1134.06V165.004H1131.34C1122.42 183.342 1108.04 193.751 1089.7 193.751C1059.72 193.751 1040.39 167.234 1040.39 129.565C1040.39 91.649 1059.47 64.8841 1089.21 64.8838C1107.79 64.8838 1122.42 75.2923 1131.34 93.6309H1134.06V40.5986H1111.51V28.4541H1161.32V179.129ZM1100.36 79.0088C1081.28 79.0088 1070.62 97.844 1070.62 129.069C1070.62 160.79 1081.28 179.625 1100.36 179.625C1120.19 179.625 1133.82 160.79 1133.82 129.069C1133.82 97.5961 1120.19 79.0088 1100.36 79.0088Z" fill={theme.text}/>
            <path d="M723.683 179.129H744.5V191.272H675.357V179.129H696.422V40.5986H675.357V28.4541H723.683V179.129Z" fill={theme.text}/>
            <path d="M982.88 64.8838C1006.67 64.8838 1020.8 80.2488 1020.8 104.287V179.129H1041.37V191.272H976.685V179.129H993.536V104.287C993.536 88.1792 985.854 80.0011 972.472 80.001C954.876 80.001 941.494 97.1001 941.494 120.891V179.129H958.347V191.272H893.417V179.129H914.233V79.5049H893.417V67.3613H941.494V89.9131H944.716C951.159 74.5485 964.789 64.8839 982.88 64.8838Z" fill={theme.text}/>
          </g>
        )}

        {/* Large map number - faint background */}
        <text
          x={width - 30}
          y={100}
          textAnchor="end"
          fill={theme.text}
          fontSize="72"
          fontWeight="bold"
          opacity={labelStyle.boardNumberOpacity ?? 0.12}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {String(mapNumber).padStart(2, '0')}
        </text>

        {/* Markers (shapes only, no labels) */}
        {labelStyle.showShapes && markers.map((m) => (
          <g
            key={m.id}
            opacity={labelStyle.shapeOpacity ?? 1}
            onClick={(e) => {
              e.stopPropagation();
              onSelectMarker(m.id);
            }}
            style={{ cursor: 'pointer' }}
          >
            {renderMarkerShape(m)}
          </g>
        ))}

        {/* Legend inside SVG */}
        {labelStyle.showLegend && (() => {
          const ls = labelStyle.legendScale;
          const legendItemH = 10 * ls;
          const legendPadding = 5 * ls;
          const headerH = 9 * ls;
          const totalH = headerH + dots.length * legendItemH + legendPadding * 2;
          const fontSize = 4.5 * ls;
          const charW = labelStyle.uppercase ? fontSize * 0.65 : fontSize * 0.55;
          const maxNameLen = Math.max(...dots.map(d => (d.name || '').length), 5);
          const legendW = legendPadding * 2 + 12 * ls + maxNameLen * charW + 4 * ls;
          const legendX = width - 12;
          const legendY = height - totalH - 12;
          const shapes = ['circle', 'square', 'triangle', 'diamond'] as const;
          const mType = labelStyle.markerType;
          const radius = 3 * ls;

          return (
            <g>
              <rect
                x={legendX - legendW}
                y={legendY}
                width={legendW}
                height={totalH}
                rx={radius}
                ry={radius}
                fill={theme.bg}
                fillOpacity="0.93"
                stroke={theme.grid}
                strokeWidth="0.5"
              />
              <text
                x={legendX - legendW + legendPadding}
                y={legendY + legendPadding + 4 * ls}
                fill={theme.text}
                fontSize={4 * ls}
                letterSpacing={1.5 * ls}
                opacity="0.5"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                WORLDS
              </text>
              {dots.map((dot, i) => {
                const itemY = legendY + legendPadding + headerH + i * legendItemH + legendItemH / 2;
                const iconX = legendX - legendW + legendPadding + 3 * ls;
                const textX = iconX + 8 * ls;
                const displayName = labelStyle.uppercase ? (dot.name || '').toUpperCase() : dot.name || '';
                const shapeType = labelStyle.nameIconShape || shapes[i % shapes.length];
                const sz = 2.5 * ls;
                const c = theme.dot;

                const renderIcon = () => {
                  if (mType === 'logo') {
                    const logoS = (5 * ls) / 110;
                    return (
                      <g transform={`translate(${iconX - 2.5 * ls}, ${itemY - 2.5 * ls}) scale(${logoS})`} fill={c}>
                        <path d="M13.4186 62.3094H6.49537V55.3861H13.4186V62.3094Z" />
                        <path d="M27.2652 62.3094H20.3419V55.3861H27.2652V62.3094Z" />
                        <path d="M41.1117 62.3094H34.1884V55.3861H41.1117V62.3094Z" />
                        <path d="M109.915 62.3094H103.203C102.895 64.7566 102.26 67.157 101.312 69.4454C99.9206 72.8053 97.8807 75.8581 95.3092 78.4297C92.7376 81.0012 89.6848 83.0411 86.3249 84.4328C82.965 85.8245 79.3639 86.5408 75.7272 86.5408C72.0905 86.5408 68.4894 85.8245 65.1295 84.4328C61.7697 83.0411 58.7168 81.0012 56.1453 78.4297C53.5737 75.8581 51.5339 72.8053 50.1422 69.4454C49.1943 67.157 48.5597 64.7566 48.2513 62.3094H41.1117V69.2326H34.1884V62.3094H27.2652V69.2326H20.3419V62.3094H13.4186V69.2326H6.49537V62.3094H-0.00021023C3.40671 89.6307 26.7131 110.772 54.9574 110.772C83.2017 110.772 106.508 89.6307 109.915 62.3094Z" />
                        <path d="M-0.000211441 48.4628H6.71176C7.02008 46.0156 7.65466 43.6152 8.60256 41.3268C9.99426 37.9669 12.0341 34.9141 14.6057 32.3425C17.1772 29.771 20.2301 27.7311 23.5899 26.3394C26.9498 24.9477 30.5509 24.2314 34.1876 24.2314C37.8243 24.2314 41.4254 24.9477 44.7853 26.3394C48.1452 27.7311 51.198 29.771 53.7696 32.3425C56.3411 34.9141 58.381 37.9669 59.7727 41.3268C60.7206 43.6152 61.3551 46.0156 61.6635 48.4628H68.8048V41.5396H75.728V48.4628H82.6513V41.5396H89.5746V48.4628H96.4978V41.5396H103.421V48.4628H109.915C106.508 21.1415 83.2017 0 54.9574 0C26.7131 0 3.40671 21.1415 -0.000211441 48.4628Z" />
                        <path d="M75.728 55.3861H68.8048V48.4628H75.728V55.3861Z" />
                        <path d="M89.5746 55.3861H82.6513V48.4628H89.5746V55.3861Z" />
                        <path d="M103.421 55.3861H96.4978V48.4628H103.421V55.3861Z" />
                      </g>
                    );
                  }
                  if (mType === 'shapes') {
                    switch (shapeType) {
                      case 'circle':
                        return <circle cx={iconX} cy={itemY} r={sz} fill="none" stroke={c} strokeWidth={0.6 * ls} />;
                      case 'square':
                        return <rect x={iconX - sz} y={itemY - sz} width={sz * 2} height={sz * 2} fill="none" stroke={c} strokeWidth={0.6 * ls} />;
                      case 'triangle':
                        return <polygon points={`${iconX},${itemY - sz} ${iconX - sz},${itemY + sz} ${iconX + sz},${itemY + sz}`} fill="none" stroke={c} strokeWidth={0.6 * ls} />;
                      case 'diamond':
                        return <polygon points={`${iconX},${itemY - sz} ${iconX + sz},${itemY} ${iconX},${itemY + sz} ${iconX - sz},${itemY}`} fill="none" stroke={c} strokeWidth={0.6 * ls} />;
                    }
                  }
                  return <circle cx={iconX} cy={itemY} r={1.5 * ls} fill={c} opacity="0.9" />;
                };

                return (
                  <g key={`legend-${i}`} opacity={labelStyle.legendOpacity ?? 0.8}>
                    {renderIcon()}
                    <text
                      x={textX}
                      y={itemY + 2 * ls}
                      fill={theme.text}
                      fontSize={4.5 * ls}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {displayName}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}
      </svg>
    </div>
  );
};

export default MapCanvas;
