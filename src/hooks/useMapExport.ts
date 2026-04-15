import { useCallback } from 'react';

export function useMapExport(svgRef: React.RefObject<SVGSVGElement | null>) {
  const exportSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    download(blob, 'outland-map.svg');
  }, [svgRef]);

  const exportRaster = useCallback(
    (format: 'png' | 'jpg', multiplier: number) => {
      const svg = svgRef.current;
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const vb = svg.viewBox.baseVal;
        canvas.width = vb.width * multiplier;
        canvas.height = vb.height * multiplier;
        const ctx = canvas.getContext('2d')!;

        if (format === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) download(blob, `outland-map.${format}`);
            URL.revokeObjectURL(url);
          },
          format === 'png' ? 'image/png' : 'image/jpeg',
          0.95
        );
      };
      img.src = url;
    },
    [svgRef]
  );

  return { exportSVG, exportRaster };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
