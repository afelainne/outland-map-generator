import { Download, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface CanvasPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: 'square', label: 'Square 1:1', width: 800, height: 800 },
  { id: 'instagram', label: 'Instagram Post', width: 1080, height: 1080 },
  { id: 'instagram-story', label: 'IG Story 9:16', width: 1080, height: 1920 },
  { id: 'twitter', label: 'Twitter/X Post', width: 1200, height: 675 },
  { id: 'facebook', label: 'Facebook Post', width: 1200, height: 630 },
  { id: 'pinterest', label: 'Pinterest Pin', width: 1000, height: 1500 },
  { id: 'desktop-hd', label: 'Desktop HD', width: 1920, height: 1080 },
  { id: 'desktop-4k', label: 'Desktop 4K', width: 3840, height: 2160 },
  { id: 'iphone', label: 'iPhone 15', width: 1179, height: 2556 },
  { id: 'ipad', label: 'iPad Pro', width: 2048, height: 2732 },
  { id: 'a4-portrait', label: 'A4 Portrait', width: 794, height: 1123 },
  { id: 'a4-landscape', label: 'A4 Landscape', width: 1123, height: 794 },
  { id: 'poster-18x24', label: 'Poster 18×24"', width: 1296, height: 1728 },
  { id: 'wide-16x9', label: 'Wide 16:9', width: 1600, height: 900 },
  { id: 'ultra-wide', label: 'Ultra Wide 21:9', width: 2520, height: 1080 },
];

interface ExportBarProps {
  resolution: string;
  onResolutionChange: (val: string) => void;
  onExport: (format: 'svg' | 'png' | 'jpg') => void;
  canvasPresetId: string;
  onCanvasPresetChange: (id: string) => void;
}

const ExportBar = ({ resolution, onResolutionChange, onExport, canvasPresetId, onCanvasPresetChange }: ExportBarProps) => {
  const preset = CANVAS_PRESETS.find(p => p.id === canvasPresetId) || CANVAS_PRESETS[0];

  return (
    <div className="flex items-center gap-2 p-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Canvas size preset */}
      <Select value={canvasPresetId} onValueChange={onCanvasPresetChange}>
        <SelectTrigger className="w-40 h-8 text-xs font-mono">
          <Monitor size={12} className="mr-1 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CANVAS_PRESETS.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="text-xs">{p.label}</span>
              <span className="text-[10px] ml-1 opacity-50">{p.width}×{p.height}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={resolution} onValueChange={onResolutionChange}>
        <SelectTrigger className="w-28 h-8 text-xs font-mono">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1x">1x ({preset.width}px)</SelectItem>
          <SelectItem value="2x">2x ({preset.width * 2}px)</SelectItem>
          <SelectItem value="4x">4x ({preset.width * 4}px)</SelectItem>
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
