import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export interface LabelStyleParams {
  uppercase: boolean;
  opacity: number;
  outline: boolean;
  rounded: boolean;
}

export const DEFAULT_LABEL_STYLE: LabelStyleParams = {
  uppercase: false,
  opacity: 0.15,
  outline: true,
  rounded: true,
};

interface LabelControlsProps {
  params: LabelStyleParams;
  onChange: (params: LabelStyleParams) => void;
}

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
    </div>
  );
};

export default LabelControls;
