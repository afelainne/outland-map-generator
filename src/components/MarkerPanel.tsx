import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MapMarker } from '@/lib/noise';

interface MarkerPanelProps {
  marker: MapMarker | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const MarkerPanel = ({ marker, onClose, onDelete, onRename }: MarkerPanelProps) => {
  if (!marker) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur border border-border rounded-lg p-4 flex items-center gap-3 shadow-lg z-20"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span className="text-xs text-muted-foreground">#{marker.number}</span>
      <Input
        value={marker.name}
        onChange={(e) => onRename(marker.id, e.target.value)}
        className="w-64 h-8 text-xs font-mono"
      />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(marker.id)}>
        <Trash2 size={14} />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
        <X size={14} />
      </Button>
    </div>
  );
};

export default MarkerPanel;
