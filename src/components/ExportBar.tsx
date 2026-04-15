import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExportBarProps {
  resolution: string;
  onResolutionChange: (val: string) => void;
  onExport: (format: 'svg' | 'png' | 'jpg') => void;
}

const ExportBar = ({ resolution, onResolutionChange, onExport }: ExportBarProps) => {
  return (
    <div className="flex items-center gap-2 p-2" style={{ fontFamily: "'Space Mono', monospace" }}>
      <Select value={resolution} onValueChange={onResolutionChange}>
        <SelectTrigger className="w-28 h-8 text-xs font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1x">1x (800px)</SelectItem>
          <SelectItem value="2x">2x (1600px)</SelectItem>
          <SelectItem value="4x">4x (3200px)</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" onClick={() => onExport('svg')}>
        <Download size={12} /> SVG
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" onClick={() => onExport('png')}>
        <Download size={12} /> PNG
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" onClick={() => onExport('jpg')}>
        <Download size={12} /> JPG
      </Button>
    </div>
  );
};

export default ExportBar;
