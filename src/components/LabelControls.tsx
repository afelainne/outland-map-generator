import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export type MarkerType = 'dot' | 'shapes' | 'logo';

export interface LabelStyleParams {
  uppercase: boolean;
  opacity: number;
  outline: boolean;
  rounded: boolean;
  bgColor: string;
  outlineColor: string;
  scale: number;
  markerType: MarkerType;
  markerSize: number;
  shapeScale: number;
}

export const DEFAULT_LABEL_STYLE: LabelStyleParams = {
  uppercase: false,
  opacity: 0.15,
  outline: true,
  rounded: true,
  bgColor: '',
  outlineColor: '',
  scale: 1,
  markerType: 'dot',
  markerSize: 1,
  shapeScale: 1,
};

interface LabelControlsProps {
  params: LabelStyleParams;
  onChange: (params: LabelStyleParams) => void;
}

const COLOR_PRESETS = [
  { label: 'Theme BG', value: '' },
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#000000' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Orange', value: '#f97316' },
];

const ColorPicker = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <div className="space-y-1.5">
    <span className="text-[10px] font-mono text-foreground/70">{label}</span>
    <div className="flex gap-1 flex-wrap">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className={`w-4 h-4 rounded-sm border transition-all ${value === c.value ? 'border-foreground scale-110' : 'border-border/50'}`}
          style={{ backgroundColor: c.value || 'transparent' }}
          title={c.label}
        >
          {c.value === '' && <span className="text-[6px] text-muted-foreground leading-none block text-center">T</span>}
        </button>
      ))}
    </div>
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-5 h-5 rounded-sm border border-border cursor-pointer p-0 bg-transparent"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Theme BG"
        className="h-5 text-[9px] font-mono px-1.5 flex-1"
      />
    </div>
  </div>
);

const LabelControls = ({ params, onChange }: LabelControlsProps) => {
  const update = <K extends keyof LabelStyleParams>(key: K, value: LabelStyleParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Label Style</div>




      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Uppercase</span>
        <Switch checked={params.uppercase} onCheckedChange={(v) => update('uppercase', v)} className="scale-75" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Outline</span>
        <Switch checked={params.outline} onCheckedChange={(v) => update('outline', v)} className="scale-75" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Rounded</span>
        <Switch checked={params.rounded} onCheckedChange={(v) => update('rounded', v)} className="scale-75" />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>BG Opacity</span>
          <span>{Math.round(params.opacity * 100)}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[Math.round(params.opacity * 100)]}
          onValueChange={([v]) => update('opacity', v / 100)}
          className="w-full"
        />
      </div>

      <ColorPicker label="BG Color" value={params.bgColor} onChange={(v) => update('bgColor', v)} />

      {params.outline && (
        <ColorPicker label="Outline Color" value={params.outlineColor} onChange={(v) => update('outlineColor', v)} />
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Size</span>
          <span>{Math.round(params.scale * 100)}%</span>
        </div>
        <Slider
          min={50}
          max={200}
          step={10}
          value={[Math.round(params.scale * 100)]}
          onValueChange={([v]) => update('scale', v / 100)}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Name Icon Size</span>
          <span>{Math.round(params.markerSize * 100)}%</span>
        </div>
        <Slider
          min={30}
          max={300}
          step={10}
          value={[Math.round(params.markerSize * 100)]}
          onValueChange={([v]) => update('markerSize', v / 100)}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Shape Size</span>
          <span>{Math.round(params.shapeScale * 100)}%</span>
        </div>
        <Slider
          min={30}
          max={300}
          step={10}
          value={[Math.round(params.shapeScale * 100)]}
          onValueChange={([v]) => update('shapeScale', v / 100)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default LabelControls;
