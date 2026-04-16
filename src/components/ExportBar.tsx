import { Download, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface CanvasPreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: 'default', label: 'Default', width: 1080, height: 1580 },
  { id: 'poster-700', label: 'Poster 700×1025', width: 700, height: 1025 },
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
  const mult = resolution === '1x' ? 1 : resolution === '2x' ? 2 : 4;
  const finalW = preset.width * mult;
  const finalH = preset.height * mult;

  return (
    <div className="flex items-center gap-1.5 font-sans">
      {/* Canvas size preset */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Select value={canvasPresetId} onValueChange={onCanvasPresetChange}>
              <SelectTrigger className="w-36 h-8 text-xs font-mono [&>span]:truncate [&>span]:block [&>span]:overflow-hidden [&>span]:whitespace-nowrap [&>span]:text-left [&>span]:min-w-0">
                <Monitor size={12} className="mr-1 shrink-0 opacity-60" />
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
          </div>
        </TooltipTrigger>
        <TooltipContent>Canvas size · {preset.width}×{preset.height}px</TooltipContent>
      </Tooltip>

      {/* Quality */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Select value={resolution} onValueChange={onResolutionChange}>
              <SelectTrigger className="w-16 h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x">1x ({preset.width}px)</SelectItem>
                <SelectItem value="2x">2x ({preset.width * 2}px)</SelectItem>
                <SelectItem value="4x">4x ({preset.width * 4}px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TooltipTrigger>
        <TooltipContent>Export quality (PNG/JPG) · final {finalW}×{finalH}px</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" onClick={() => onExport('svg')}>
            <Download size={12} /> SVG
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export as vector SVG (resolution-independent)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" onClick={() => onExport('png')}>
            <Download size={12} /> PNG
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export PNG · {finalW}×{finalH}px</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 text-xs font-mono gap-1.5" onClick={() => onExport('jpg')}>
            <Download size={12} /> JPG
          </Button>
        </TooltipTrigger>
        <TooltipContent>Export JPG · {finalW}×{finalH}px</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ExportBar;
