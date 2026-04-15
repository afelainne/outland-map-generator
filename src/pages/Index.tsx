import { useState, useRef, useMemo, useCallback } from 'react';
import { generateContourLines, generateScatterDots, generateMarkers, LOCATION_NAMES } from '@/lib/noise';
import type { MapMarker } from '@/lib/noise';
import { MAP_THEMES } from '@/lib/themes';
import MapCanvas from '@/components/MapCanvas';
import MapToolbar from '@/components/MapToolbar';
import MarkerPanel from '@/components/MarkerPanel';
import ExportBar from '@/components/ExportBar';
import OutlandLogo from '@/components/OutlandLogo';
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
  const [activeTool, setActiveTool] = useState<'select' | 'circle' | 'square' | 'triangle' | 'diamond'>('select');
  const [customMarkers, setCustomMarkers] = useState<MapMarker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('2x');
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = MAP_THEMES.find((t) => t.id === themeId) || MAP_THEMES[0];
  const mapNumber = useMemo(() => (seed % 99) + 1, [seed]);

  const contourPaths = useMemo(() => generateContourLines(MAP_W, MAP_H, seed, 10, 0.005), [seed]);
  const dots = useMemo(() => generateScatterDots(MAP_W, MAP_H, seed, 50), [seed]);
  const generatedMarkers = useMemo(() => generateMarkers(MAP_W, MAP_H, seed, 15), [seed]);

  const allMarkers = useMemo(() => [...generatedMarkers, ...customMarkers], [generatedMarkers, customMarkers]);

  const { exportSVG, exportRaster } = useMapExport(svgRef);

  const handleRegenerate = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
    setCustomMarkers([]);
    setSelectedMarkerId(null);
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
        {/* Toolbar */}
        <div className="absolute top-4 left-4 z-10">
          <MapToolbar activeTool={activeTool} onToolChange={setActiveTool} onRegenerate={handleRegenerate} />
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
          <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur border border-border rounded-lg p-3 max-h-48 overflow-y-auto z-10">
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Locations</div>
            <div className="space-y-0.5">
              {allMarkers.slice(0, 20).map((m) => (
                <div
                  key={m.id}
                  className="text-[10px] font-mono text-foreground/80 cursor-pointer hover:text-foreground"
                  onClick={() => setSelectedMarkerId(m.id)}
                >
                  <span className="text-muted-foreground mr-1">{String(m.number).padStart(2, '0')}</span>
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
