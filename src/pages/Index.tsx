import { useState, useRef, useMemo, useCallback } from 'react';
import { generateContourLines, generateScatterDots, generateMarkers, LOCATION_NAMES, TERRAIN_PRESETS, DEFAULT_CONTOUR_PARAMS } from '@/lib/noise';
import type { MapMarker, ContourParams } from '@/lib/noise';
import { MAP_THEMES } from '@/lib/themes';
import MapCanvas from '@/components/MapCanvas';
import MapToolbar from '@/components/MapToolbar';
import MarkerPanel from '@/components/MarkerPanel';
import ExportBar from '@/components/ExportBar';
import OutlandLogo from '@/components/OutlandLogo';
import ContourControls from '@/components/ContourControls';
import LabelControls, { DEFAULT_LABEL_STYLE } from '@/components/LabelControls';
import type { LabelStyleParams } from '@/components/LabelControls';
import { useMapExport } from '@/hooks/useMapExport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MAP_W = 800;
const MAP_H = 800;

const Index = () => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [themeId, setThemeId] = useState('green');
  const [terrainId, setTerrainId] = useState('mountain');
  const [activeTool, setActiveTool] = useState<'select' | 'circle' | 'square' | 'triangle' | 'diamond'>('select');
  const [customMarkers, setCustomMarkers] = useState<MapMarker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('2x');
  const [contourParams, setContourParams] = useState<ContourParams>(DEFAULT_CONTOUR_PARAMS);
  const [labelMode, setLabelMode] = useState<'number' | 'abbrev' | 'full'>('number');
  const [labelStyle, setLabelStyle] = useState<LabelStyleParams>(DEFAULT_LABEL_STYLE);
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = MAP_THEMES.find((t) => t.id === themeId) || MAP_THEMES[0];
  const terrain = TERRAIN_PRESETS.find((t) => t.id === terrainId) || TERRAIN_PRESETS[0];
  const mapNumber = useMemo(() => (seed % 99) + 1, [seed]);

  const contourPaths = useMemo(() => generateContourLines(MAP_W, MAP_H, seed, terrain, contourParams), [seed, terrain, contourParams]);
  const dots = useMemo(() => generateScatterDots(MAP_W, MAP_H, seed, 50), [seed]);
  const generatedMarkers = useMemo(() => generateMarkers(MAP_W, MAP_H, seed, 15), [seed]);

  const allMarkers = useMemo(() => [...generatedMarkers, ...customMarkers], [generatedMarkers, customMarkers]);

  const { exportSVG, exportRaster } = useMapExport(svgRef);

  const handleRegenerate = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
    setCustomMarkers([]);
    setSelectedMarkerId(null);
  }, []);

  const handleRandomizeAll = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
    setCustomMarkers([]);
    setSelectedMarkerId(null);
    // Randomize theme
    const rndTheme = MAP_THEMES[Math.floor(Math.random() * MAP_THEMES.length)];
    setThemeId(rndTheme.id);
    // Randomize terrain
    const rndTerrain = TERRAIN_PRESETS[Math.floor(Math.random() * TERRAIN_PRESETS.length)];
    setTerrainId(rndTerrain.id);
  }, []);

  const handleAddMarker = useCallback(
    (x: number, y: number) => {
      const nextNum = allMarkers.length + 1;
      const rndName = LOCATION_NAMES[Math.floor(Math.random() * LOCATION_NAMES.length)];
      const newMarker: MapMarker = {
        id: `custom-${Date.now()}`,
        x,
        y,
        number: nextNum,
        name: rndName,
        shape: activeTool as MapMarker['shape'],
      };
      setCustomMarkers((prev) => [...prev, newMarker]);
    },
    [allMarkers.length, activeTool]
  );

  const handleDeleteMarker = useCallback((id: string) => {
    setCustomMarkers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMarkerId(null);
  }, []);

  const handleRenameMarker = useCallback((id: string, name: string) => {
    setCustomMarkers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  }, []);

  const handleExport = useCallback(
    (format: 'svg' | 'png' | 'jpg') => {
      if (format === 'svg') {
        exportSVG();
      } else {
        const mult = resolution === '1x' ? 1 : resolution === '2x' ? 2 : 4;
        exportRaster(format, mult);
      }
    },
    [exportSVG, exportRaster, resolution]
  );

  const selectedMarker = allMarkers.find((m) => m.id === selectedMarkerId) || null;

  return (
    <div className="flex flex-col h-screen bg-background" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <OutlandLogo color="currentColor" size={28} />
          <span className="text-sm font-bold tracking-[0.2em] uppercase">Outland Map</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Terrain type selector */}
          <Select value={terrainId} onValueChange={setTerrainId}>
            <SelectTrigger className="w-44 h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TERRAIN_PRESETS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{t.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Theme selector */}
          <Select value={themeId} onValueChange={setThemeId}>
            <SelectTrigger className="w-36 h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAP_THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg }} />
                    {t.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportBar resolution={resolution} onResolutionChange={setResolution} onExport={handleExport} />
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 relative flex">
        {/* Toolbar + Controls side panel */}
        <div className="absolute top-4 left-4 z-10 flex gap-3">
          <MapToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onRegenerate={handleRegenerate}
            onRandomizeAll={handleRandomizeAll}
            labelMode={labelMode}
            onCycleLabelMode={() => setLabelMode((v) => v === 'number' ? 'abbrev' : v === 'abbrev' ? 'full' : 'number')}
          />
          <div className="bg-card/90 backdrop-blur border border-border rounded-lg p-4 w-56 space-y-4 max-h-[80vh] overflow-y-auto">
            <ContourControls params={contourParams} onChange={setContourParams} />
            <div className="border-t border-border pt-3">
              <LabelControls params={labelStyle} onChange={setLabelStyle} />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 flex items-center justify-center p-8">
          <MapCanvas
            width={MAP_W}
            height={MAP_H}
            contourPaths={contourPaths}
            dots={dots}
            markers={allMarkers}
            theme={theme}
            activeTool={activeTool}
            onAddMarker={handleAddMarker}
            onSelectMarker={setSelectedMarkerId}
            selectedMarkerId={selectedMarkerId}
            mapNumber={mapNumber}
            svgRef={svgRef}
            seed={seed}
            lineWidth={contourParams.lineWidth}
            labelMode={labelMode}
            labelStyle={labelStyle}
          />
        </div>

        {/* Marker panel */}
        <MarkerPanel
          marker={selectedMarker}
          onClose={() => setSelectedMarkerId(null)}
          onDelete={handleDeleteMarker}
          onRename={handleRenameMarker}
        />

        {/* Legend */}
        {selectedMarkerId === null && (
          <div
            className="absolute bottom-4 right-4 border p-3 z-10"
            style={{
              fontFamily: "'Space Mono', monospace",
              backgroundColor: `${theme.bg}ee`,
              borderColor: theme.grid,
              borderRadius: labelStyle.rounded ? 6 : 0,
            }}
          >
            <div
              className="text-[10px] tracking-widest uppercase mb-2"
              style={{ color: theme.text, opacity: 0.5 }}
            >
              Locations
            </div>
            <div className="space-y-1">
              {dots.map((dot, i) => {
                const shapes = ['circle', 'square', 'triangle', 'diamond'] as const;
                const shapeType = shapes[i % shapes.length];
                const displayName = labelStyle.uppercase ? (dot.name || '').toUpperCase() : dot.name || '';
                const mType = labelStyle.markerType;

                const renderLegendIcon = () => {
                  const sz = 5;
                  const c = theme.dot;
                  if (mType === 'logo') {
                    return (
                      <svg width="12" height="12" viewBox="0 0 110 111" className="flex-shrink-0">
                        <g fill={c}>
                          <path d="M13.4186 62.3094H6.49537V55.3861H13.4186V62.3094Z" />
                          <path d="M27.2652 62.3094H20.3419V55.3861H27.2652V62.3094Z" />
                          <path d="M41.1117 62.3094H34.1884V55.3861H41.1117V62.3094Z" />
                          <path d="M109.915 62.3094H103.203C102.895 64.7566 102.26 67.157 101.312 69.4454C99.9206 72.8053 97.8807 75.8581 95.3092 78.4297C92.7376 81.0012 89.6848 83.0411 86.3249 84.4328C82.965 85.8245 79.3639 86.5408 75.7272 86.5408C72.0905 86.5408 68.4894 85.8245 65.1295 84.4328C61.7697 83.0411 58.7168 81.0012 56.1453 78.4297C53.5737 75.8581 51.5339 72.8053 50.1422 69.4454C49.1943 67.157 48.5597 64.7566 48.2513 62.3094H41.1117V69.2326H34.1884V62.3094H27.2652V69.2326H20.3419V62.3094H13.4186V69.2326H6.49537V62.3094H-0.00021023C3.40671 89.6307 26.7131 110.772 54.9574 110.772C83.2017 110.772 106.508 89.6307 109.915 62.3094Z" />
                          <path d="M-0.000211441 48.4628H6.71176C7.02008 46.0156 7.65466 43.6152 8.60256 41.3268C9.99426 37.9669 12.0341 34.9141 14.6057 32.3425C17.1772 29.771 20.2301 27.7311 23.5899 26.3394C26.9498 24.9477 30.5509 24.2314 34.1876 24.2314C37.8243 24.2314 41.4254 24.9477 44.7853 26.3394C48.1452 27.7311 51.198 29.771 53.7696 32.3425C56.3411 34.9141 58.381 37.9669 59.7727 41.3268C60.7206 43.6152 61.3551 46.0156 61.6635 48.4628H68.8048V41.5396H75.728V48.4628H82.6513V41.5396H89.5746V48.4628H96.4978V41.5396H103.421V48.4628H109.915C106.508 21.1415 83.2017 0 54.9574 0C26.7131 0 3.40671 21.1415 -0.000211441 48.4628Z" />
                          <path d="M75.728 55.3861H68.8048V48.4628H75.728V55.3861Z" />
                          <path d="M89.5746 55.3861H82.6513V48.4628H89.5746V55.3861Z" />
                          <path d="M103.421 55.3861H96.4978V48.4628H103.421V55.3861Z" />
                        </g>
                      </svg>
                    );
                  }
                  if (mType === 'shapes') {
                    return (
                      <svg width="12" height="12" viewBox="0 0 12 12" className="flex-shrink-0">
                        {shapeType === 'circle' && <circle cx="6" cy="6" r={sz} fill="none" stroke={c} strokeWidth="1" />}
                        {shapeType === 'square' && <rect x={6 - sz} y={6 - sz} width={sz * 2} height={sz * 2} fill="none" stroke={c} strokeWidth="1" />}
                        {shapeType === 'triangle' && <polygon points={`6,${6 - sz} ${6 - sz},${6 + sz} ${6 + sz},${6 + sz}`} fill="none" stroke={c} strokeWidth="1" />}
                        {shapeType === 'diamond' && <polygon points={`6,${6 - sz} ${6 + sz},6 6,${6 + sz} ${6 - sz},6`} fill="none" stroke={c} strokeWidth="1" />}
                      </svg>
                    );
                  }
                  return (
                    <svg width="12" height="12" viewBox="0 0 12 12" className="flex-shrink-0">
                      <circle cx="6" cy="6" r="3" fill={c} opacity="0.9" />
                    </svg>
                  );
                };

                return (
                  <div
                    key={`legend-${i}`}
                    className="flex items-center gap-1.5"
                    style={{ color: theme.text, opacity: 0.8 }}
                  >
                    {renderLegendIcon()}
                    <span className="text-[10px]" style={{ fontFamily: "'Space Mono', monospace" }}>
                      {displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
