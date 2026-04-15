import { useState, useRef, useMemo, useCallback } from 'react';
import { generateContourLines, generateScatterDots, generateMarkers, LOCATION_NAMES, TERRAIN_PRESETS, DEFAULT_CONTOUR_PARAMS } from '@/lib/noise';
import type { MapMarker, ContourParams } from '@/lib/noise';
import { MAP_THEMES } from '@/lib/themes';
import MapCanvas from '@/components/MapCanvas';
import MapToolbar from '@/components/MapToolbar';
import MarkerPanel from '@/components/MarkerPanel';
import ExportBar, { CANVAS_PRESETS } from '@/components/ExportBar';
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

const Index = () => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [themeId, setThemeId] = useState('monorail');
  const [terrainId, setTerrainId] = useState('mountain');
  const [activeTool, setActiveTool] = useState<'select' | 'circle' | 'square' | 'triangle' | 'diamond'>('select');
  const [customMarkers, setCustomMarkers] = useState<MapMarker[]>([]);
  const [renamedMarkers, setRenamedMarkers] = useState<Record<string, string>>({});
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('2x');
  const [canvasPresetId, setCanvasPresetId] = useState('square');

  const canvasPreset = CANVAS_PRESETS.find(p => p.id === canvasPresetId) || CANVAS_PRESETS[0];
  const MAP_W = canvasPreset.width;
  const MAP_H = canvasPreset.height;
  const [contourParams, setContourParams] = useState<ContourParams>(DEFAULT_CONTOUR_PARAMS);
  const [labelMode, setLabelMode] = useState<'number' | 'abbrev' | 'full'>('number');
  const [labelStyle, setLabelStyle] = useState<LabelStyleParams>(DEFAULT_LABEL_STYLE);
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = MAP_THEMES.find((t) => t.id === themeId) || MAP_THEMES[0];
  const terrain = TERRAIN_PRESETS.find((t) => t.id === terrainId) || TERRAIN_PRESETS[0];
  const mapNumber = useMemo(() => (seed % 99) + 1, [seed]);

  const contourPaths = useMemo(() => generateContourLines(MAP_W, MAP_H, seed, terrain, contourParams), [MAP_W, MAP_H, seed, terrain, contourParams]);
  const dots = useMemo(() => generateScatterDots(MAP_W, MAP_H, seed, 50), [MAP_W, MAP_H, seed]);
  const generatedMarkers = useMemo(() => generateMarkers(MAP_W, MAP_H, seed, 15), [MAP_W, MAP_H, seed]);
  const allMarkers = useMemo(() => {
    const combined = [...generatedMarkers, ...customMarkers];
    return combined.map(m => ({
      ...m,
      name: renamedMarkers[m.id] ?? m.name,
    }));
  }, [generatedMarkers, customMarkers, renamedMarkers]);

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
    // Randomize theme from palette combinations
    const rndTheme = MAP_THEMES[Math.floor(Math.random() * MAP_THEMES.length)];
    setThemeId(rndTheme.id);
    // Randomize terrain
    const rndTerrain = TERRAIN_PRESETS[Math.floor(Math.random() * TERRAIN_PRESETS.length)];
    setTerrainId(rndTerrain.id);
  }, []);

  const handleAddMarker = useCallback(
    (x: number, y: number) => {
      const nextNum = allMarkers.length + 1;
      const markerId = `custom-${Date.now()}`;
      const newMarker: MapMarker = {
        id: markerId,
        x,
        y,
        number: nextNum,
        name: 'New Location',
        shape: activeTool as MapMarker['shape'],
      };
      setCustomMarkers((prev) => [...prev, newMarker]);
      // Auto-select so the rename panel appears
      setSelectedMarkerId(markerId);
    },
    [allMarkers.length, activeTool]
  );

  const handleDeleteMarker = useCallback((id: string) => {
    setCustomMarkers((prev) => prev.filter((m) => m.id !== id));
    setSelectedMarkerId(null);
  }, []);

  const handleRenameMarker = useCallback((id: string, name: string) => {
    setRenamedMarkers(prev => ({ ...prev, [id]: name }));
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
    <div className="flex flex-col h-screen bg-background" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
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
          <ExportBar resolution={resolution} onResolutionChange={setResolution} onExport={handleExport} canvasPresetId={canvasPresetId} onCanvasPresetChange={setCanvasPresetId} />
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 relative flex">
        {/* Toolbar + Controls side panel */}
        <div className="absolute top-4 left-4 z-10 flex gap-3">
          <MapToolbar
            activeTool={activeTool}
            onToolChange={(tool) => {
              setActiveTool(tool);
              if (tool !== 'select') {
                // Set nameIconShape and switch to shapes mode
                setLabelStyle(prev => ({
                  ...prev,
                  markerType: 'shapes' as const,
                  nameIconShape: tool as 'circle' | 'square' | 'triangle' | 'diamond',
                }));
              }
            }}
            onRegenerate={handleRegenerate}
            onRandomizeAll={handleRandomizeAll}
            labelMode={labelMode}
            onCycleLabelMode={() => setLabelMode((v) => v === 'number' ? 'abbrev' : v === 'abbrev' ? 'full' : 'number')}
            markerType={labelStyle.markerType}
            onMarkerTypeChange={(type) => setLabelStyle((prev) => ({ ...prev, markerType: type }))}
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
            contourOpacity={contourParams.contourOpacity}
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

      </div>
    </div>
  );
};

export default Index;
