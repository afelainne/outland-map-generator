import { Slider } from '@/components/ui/slider';
import type { ContourParams } from '@/lib/noise';

interface ContourControlsProps {
  params: ContourParams;
  onChange: (params: ContourParams) => void;
}

const ContourControls = ({ params, onChange }: ContourControlsProps) => {
  const update = (key: keyof ContourParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur border border-border rounded-lg p-4 w-56 space-y-3">
      <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2">Contour Controls</div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Lines</span>
          <span>{params.levels}</span>
        </div>
        <Slider
          min={5}
          max={40}
          step={1}
          value={[params.levels]}
          onValueChange={([v]) => update('levels', v)}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Smoothing</span>
          <span>{Math.round(params.smoothing * 100)}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[Math.round(params.smoothing * 100)]}
          onValueChange={([v]) => update('smoothing', v / 100)}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Detail</span>
          <span>{params.detail}px</span>
        </div>
        <Slider
          min={1}
          max={8}
          step={1}
          value={[params.detail]}
          onValueChange={([v]) => update('detail', v)}
          className="w-full"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Line Width</span>
          <span>{params.lineWidth.toFixed(1)}</span>
        </div>
        <Slider
          min={3}
          max={30}
          step={1}
          value={[Math.round(params.lineWidth * 10)]}
          onValueChange={([v]) => update('lineWidth', v / 10)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ContourControls;
