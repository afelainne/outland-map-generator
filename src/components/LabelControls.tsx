import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export type MarkerType = 'dot' | 'shapes' | 'logo';

export interface LabelStyleParams {
  uppercase: boolean;
  scale: number;
  markerType: MarkerType;
  markerSize: number;
  shapeScale: number;
  legendScale: number;
  showShapes: boolean;
  showArrows: boolean;
  arrowSpacing: number;
  arrowSize: number;
  showLegend: boolean;
  showBranding: boolean;
}

export const DEFAULT_LABEL_STYLE: LabelStyleParams = {
  uppercase: false,
  scale: 1,
  markerType: 'dot',
  markerSize: 1,
  shapeScale: 1,
  legendScale: 0.7,
  showShapes: true,
  showArrows: false,
  arrowSpacing: 80,
  arrowSize: 1,
  showLegend: true,
  showBranding: true,
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
        <span className="text-[10px] font-mono text-foreground/70">Legend</span>
        <Switch checked={params.showLegend} onCheckedChange={(v) => update('showLegend', v)} className="scale-75" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Logo & Title</span>
        <Switch checked={params.showBranding} onCheckedChange={(v) => update('showBranding', v)} className="scale-75" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Show Shapes</span>
        <Switch checked={params.showShapes} onCheckedChange={(v) => update('showShapes', v)} className="scale-75" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Contour Arrows</span>
        <Switch checked={params.showArrows} onCheckedChange={(v) => update('showArrows', v)} className="scale-75" />
      </div>

      {params.showArrows && (
        <>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-foreground/70">
              <span>Arrow Spacing</span>
              <span>{params.arrowSpacing}px</span>
            </div>
            <Slider
              min={3}
              max={200}
              step={10}
              value={[params.arrowSpacing]}
              onValueChange={([v]) => update('arrowSpacing', v)}
              className="w-full"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-foreground/70">
              <span>Arrow Size</span>
              <span>{Math.round(params.arrowSize * 100)}%</span>
            </div>
            <Slider
              min={30}
              max={300}
              step={10}
              value={[Math.round(params.arrowSize * 100)]}
              onValueChange={([v]) => update('arrowSize', v / 100)}
              className="w-full"
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-foreground/70">Uppercase</span>
        <Switch checked={params.uppercase} onCheckedChange={(v) => update('uppercase', v)} className="scale-75" />
      </div>

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

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-foreground/70">
          <span>Legend Size</span>
          <span>{Math.round(params.legendScale * 100)}%</span>
        </div>
        <Slider
          min={30}
          max={150}
          step={5}
          value={[Math.round(params.legendScale * 100)]}
          onValueChange={([v]) => update('legendScale', v / 100)}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default LabelControls;
