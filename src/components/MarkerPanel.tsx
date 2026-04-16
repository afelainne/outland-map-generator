import { useState, useEffect } from 'react';
import { X, Trash2, Check } from 'lucide-react';
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
  const [localName, setLocalName] = useState('');

  useEffect(() => {
    if (marker) setLocalName(marker.name);
  }, [marker?.id]);

  if (!marker) return null;

  const handleSave = () => {
    onRename(marker.id, localName);
    onClose();
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur border border-border rounded-lg p-4 flex items-center gap-3 shadow-lg z-20"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span className="text-xs text-muted-foreground font-bold">#{marker.number}</span>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome para legenda</span>
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          placeholder="Digite o nome do local..."
          className="w-64 h-8 text-xs font-mono"
          autoFocus
        />
      </div>
      <Button variant="default" size="sm" className="h-8 gap-1 text-xs" onClick={handleSave}>
        <Check size={14} />
        Salvar
      </Button>
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
