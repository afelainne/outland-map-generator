import { Circle, Square, Triangle, Diamond, MousePointer, RefreshCw, Shuffle, Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { MarkerType } from '@/components/LabelControls';
import { parseSvgFile, type CustomShape } from '@/lib/customShape';
import { toast } from 'sonner';

type Tool = 'select' | 'circle' | 'square' | 'triangle' | 'diamond';
type LabelMode = 'number' | 'abbrev' | 'full';

interface MapToolbarProps {
  activeTool: Tool | null;
  onToolChange: (tool: Tool) => void;
  onRegenerate: () => void;
  onRandomizeAll: () => void;
  labelMode: LabelMode;
  onCycleLabelMode: () => void;
  markerType: MarkerType;
  onMarkerTypeChange: (type: MarkerType) => void;
  customShape: CustomShape | null;
  onCustomShapeChange: (shape: CustomShape | null) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer size={18} />, label: 'Select' },
  { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
  { id: 'square', icon: <Square size={18} />, label: 'Square' },
  { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle' },
  { id: 'diamond', icon: <Diamond size={18} />, label: 'Diamond' },
];

const labelModeLabels: Record<LabelMode, string> = {
  number: '01',
  abbrev: 'AB',
  full: 'Aa',
};

const labelModeTitles: Record<LabelMode, string> = {
  number: 'Labels: Numbers',
  abbrev: 'Labels: Abbreviations',
  full: 'Labels: Full Names',
};

const markerTypeIcons: { id: MarkerType; icon: string; label: string }[] = [
  { id: 'dot', icon: '●', label: 'Filled Dot' },
  { id: 'shapes', icon: '△◇', label: 'Geometric Shapes' },
  { id: 'logo', icon: '◎', label: 'Logo Icon' },
];

const MapToolbar = ({ activeTool, onToolChange, onRegenerate, onRandomizeAll, labelMode, onCycleLabelMode, markerType, onMarkerTypeChange }: MapToolbarProps) => {
  const shapesActive = activeTool !== 'select';

  return (
    <div className="flex flex-col gap-1 p-2 bg-card/80 backdrop-blur border border-border rounded-lg">
      {/* Select tool - always available */}
      <Button
        variant={activeTool === 'select' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onToolChange('select')}
        title="Select"
        className="w-9 h-9"
      >
        <MousePointer size={18} />
      </Button>
      <div className="h-px bg-border my-1" />
      {/* Shape tools for placing markers */}
      {tools.filter(t => t.id !== 'select').map((tool) => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          className="w-9 h-9"
        >
          {tool.icon}
        </Button>
      ))}
      <div className="h-px bg-border my-1" />
      {/* Marker type icons - for changing how name dots look */}
      {markerTypeIcons.map((mt) => (
        <Button
          key={mt.id}
          variant={markerType === mt.id ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onMarkerTypeChange(mt.id)}
          title={mt.label}
          className="w-9 h-9 text-[10px] font-mono"
        >
          {mt.icon}
        </Button>
      ))}
      <div className="h-px bg-border my-1" />
      <Button
        variant="default"
        size="icon"
        onClick={onCycleLabelMode}
        title={labelModeTitles[labelMode]}
        className="w-9 h-9 text-[10px] font-mono font-bold"
      >
        {labelModeLabels[labelMode]}
      </Button>
      <div className="h-px bg-border my-1" />
      <Button variant="ghost" size="icon" onClick={onRegenerate} title="Regenerate Map" className="w-9 h-9">
        <RefreshCw size={18} />
      </Button>
      <Button variant="ghost" size="icon" onClick={onRandomizeAll} title="Randomize Everything" className="w-9 h-9">
        <Shuffle size={18} />
      </Button>
    </div>
  );
};

export default MapToolbar;
