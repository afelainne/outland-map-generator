import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { generateContourLines, generateScatterDots, generateMarkers, LOCATION_NAMES, TERRAIN_PRESETS, DEFAULT_CONTOUR_PARAMS } from '@/lib/noise';
import type { MapMarker, ContourParams } from '@/lib/noise';
import type { CustomShape } from '@/lib/customShape';
import { MAP_THEMES } from '@/lib/themes';
import MapCanvas from '@/components/MapCanvas';
import MapToolbar from '@/components/MapToolbar';
import MarkerPanel from '@/components/MarkerPanel';
import ExportBar, { CANVAS_PRESETS } from '@/components/ExportBar';
import TemplateManager from '@/components/TemplateManager';
import type { SavedTemplate } from '@/lib/templateIO';
import OutlandLogo from '@/components/OutlandLogo';
import ContourControls from '@/components/ContourControls';
import LabelControls, { DEFAULT_LABEL_STYLE } from '@/components/LabelControls';
import type { LabelStyleParams } from '@/components/LabelControls';
import { useMapExport } from '@/hooks/useMapExport';
import { MAP_PRESETS, getRandomPreset, buildRandomConfig } from '@/lib/presets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Maximize2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { MapPreset } from '@/lib/presets';

const Index = () => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [themeId, setThemeId] = useState('monorail');
  const [terrainId, setTerrainId] = useState('mountain');
  const [activeTool, setActiveTool] = useState<'select' | 'circle' | 'square' | 'triangle' | 'diamond'>('select');
  const [customMarkers, setCustomMarkers] = useState<MapMarker[]>([]);
  const [renamedMarkers, setRenamedMarkers] = useState<Record<string, string>>({});
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('2x');
  const [canvasPresetId, setCanvasPresetId] = useState('default');
  const [fitToScreen, setFitToScreen] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [customShape, setCustomShape] = useState<CustomShape | null>(null);

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

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  const fitPreviewScale = useMemo(() => {
    if (!fitToScreen || viewportSize.width === 0 || viewportSize.height === 0) return 1;

    const headerHeight = 56;
    const toolbarAllowance = 88;
    const framePadding = 24;
    const availableWidth = Math.max(0, viewportSize.width - toolbarAllowance - framePadding * 2);
    const availableHeight = Math.max(0, viewportSize.height - headerHeight - framePadding * 2);

    return Math.min(1, availableWidth / MAP_W, availableHeight / MAP_H) * 0.94;
  }, [MAP_H, MAP_W, fitToScreen, viewportSize.height, viewportSize.width]);

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

  const applyPreset = useCallback((preset: MapPreset) => {
    setSeed(preset.seed);
    setThemeId(preset.themeId);
    setTerrainId(preset.terrainId);
    setContourParams(preset.contourParams);
    setLabelMode(preset.labelMode);
    setLabelStyle(prev => ({ ...prev, ...preset.labelStyle }));
    setCustomMarkers([]);
    setSelectedMarkerId(null);
  }, []);

  const handleRegenerate = useCallback(() => {
    const preset = getRandomPreset();
    applyPreset(preset);
  }, [applyPreset]);

  const getCurrentTemplate = useCallback((name: string): SavedTemplate => ({
    version: 1,
    name,
    createdAt: new Date().toISOString(),
    seed,
    themeId,
    terrainId,
    contourParams,
    labelMode,
    labelStyle,
    canvasPresetId,
  }), [seed, themeId, terrainId, contourParams, labelMode, labelStyle, canvasPresetId]);

  const loadTemplate = useCallback((t: SavedTemplate) => {
    setSeed(t.seed);
    setThemeId(t.themeId);
    setTerrainId(t.terrainId);
    setContourParams(t.contourParams);
    setLabelMode(t.labelMode);
    setLabelStyle(t.labelStyle);
    if (t.canvasPresetId) setCanvasPresetId(t.canvasPresetId);
    setCustomMarkers([]);
    setSelectedMarkerId(null);
  }, []);

  const handleRandomizeAll = useCallback(() => {
    const config = buildRandomConfig();
    setSeed(config.seed);
    setThemeId(config.themeId);
    setTerrainId(config.terrainId);
    setContourParams(config.contourParams);
    setLabelMode(config.labelMode);
    setLabelStyle(prev => ({ ...prev, ...config.labelStyle }));
    setCustomMarkers([]);
    setSelectedMarkerId(null);
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
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-3 shrink-0">
          <OutlandLogo color="currentColor" height={24} />
        </div>

        <div className="flex items-center gap-2">
          {/* GROUP 1 — Content / scene */}
          <div className="flex items-center gap-1.5">
            <Select onValueChange={(id) => {
              const preset = MAP_PRESETS.find(p => p.id === id);
              if (preset) applyPreset(preset);
            }}>
              <SelectTrigger className="w-36 h-8 text-xs font-mono [&>span]:truncate [&>span]:block [&>span]:overflow-hidden [&>span]:whitespace-nowrap [&>span]:text-left">
                <SelectValue placeholder="Templates" />
              </SelectTrigger>
              <SelectContent>
                {MAP_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground">{p.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={terrainId} onValueChange={setTerrainId}>
              <SelectTrigger className="w-36 h-8 text-xs font-mono [&>span]:truncate [&>span]:block [&>span]:overflow-hidden [&>span]:whitespace-nowrap [&>span]:text-left">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERRAIN_PRESETS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="text-xs font-medium">{t.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={themeId} onValueChange={setThemeId}>
              <SelectTrigger className="w-36 h-8 text-xs font-mono [&>span]:truncate [&>span]:block [&>span]:overflow-hidden [&>span]:whitespace-nowrap [&>span]:text-left [&>span]:min-w-0">
                <SelectValue>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: theme.bg }} />
                    <span className="text-xs truncate">{theme.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MAP_THEMES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-border shrink-0" style={{ backgroundColor: t.bg }} />
                      <span className="text-xs">{t.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-1" />

          {/* GROUP 2 — File */}
          <TemplateManager getCurrentTemplate={getCurrentTemplate} onLoadTemplate={loadTemplate} />

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-1" />

          {/* GROUP 3 — Export */}
          <ExportBar
            resolution={resolution}
            onResolutionChange={setResolution}
            onExport={handleExport}
            canvasPresetId={canvasPresetId}
            onCanvasPresetChange={setCanvasPresetId}
          />

          {/* Divider */}
          <div className="h-6 w-px bg-border mx-1" />

          {/* GROUP 4 — View */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                pressed={fitToScreen}
                onPressedChange={setFitToScreen}
                size="sm"
                className="h-8 w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label="Fit map to screen"
              >
                <Maximize2 size={14} />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Fit map to screen (overview mode)</TooltipContent>
          </Tooltip>
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 relative flex min-h-0 min-w-0 overflow-hidden">
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
            customShape={customShape}
            onCustomShapeChange={setCustomShape}
          />
          {!fitToScreen && (
            <div className="bg-card/90 backdrop-blur border border-border rounded-lg p-4 w-56 space-y-4">
              <ContourControls params={contourParams} onChange={setContourParams} />
              <div className="border-t border-border pt-3">
                <LabelControls params={labelStyle} onChange={setLabelStyle} />
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className={`flex-1 flex items-center justify-center min-h-0 min-w-0 overflow-hidden ${fitToScreen ? 'p-2' : 'p-8'}`}>
          <div className="flex h-full w-full items-center justify-center min-h-0 min-w-0 overflow-hidden">
            <div
              className={fitToScreen ? 'shrink-0' : 'h-full w-full'}
              style={fitToScreen ? {
                width: `${MAP_W}px`,
                height: `${MAP_H}px`,
                transform: `scale(${fitPreviewScale})`,
                transformOrigin: 'center center',
              } : undefined}
            >
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
                customShape={customShape}
              />
            </div>
          </div>
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
