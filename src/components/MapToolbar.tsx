import { Circle, Square, Triangle, Diamond, MousePointer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Tool = 'select' | 'circle' | 'square' | 'triangle' | 'diamond';

interface MapToolbarProps {
  activeTool: Tool | null;
  onToolChange: (tool: Tool) => void;
  onRegenerate: () => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer size={18} />, label: 'Select' },
  { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
  { id: 'square', icon: <Square size={18} />, label: 'Square' },
  { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle' },
  { id: 'diamond', icon: <Diamond size={18} />, label: 'Diamond' },
];

const MapToolbar = ({ activeTool, onToolChange, onRegenerate }: MapToolbarProps) => {
  return (
    <div className="flex flex-col gap-1 p-2 bg-card/80 backdrop-blur border border-border rounded-lg">
      {tools.map((tool) => (
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
      <Button variant="ghost" size="icon" onClick={onRegenerate} title="Generate New Map" className="w-9 h-9">
        <RefreshCw size={18} />
      </Button>
    </div>
  );
};

export default MapToolbar;
