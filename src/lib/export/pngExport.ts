import { inlineStyles } from './styleMap';
import { triggerDownload } from './svgExport';

/**
 * Export an SVG element as a PNG image.
 * Uses Canvas API for rasterization at the given scale (default 2x for retina).
 */
export async function exportPng(
  svgElement: SVGSVGElement,
  filename: string = 'er-diagram.png',
  scale: number = 2,
): Promise<void> {
  const canvas = await svgToCanvas(svgElement, scale);

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob from canvas'));
          return;
        }
        triggerDownload(blob, filename);
        resolve();
      },
      'image/png',
    );
  });
}

/**
 * Convert an SVG element to an HTMLCanvasElement.
 * Exported so pdfExport can reuse it.
 */
export async function svgToCanvas(
  svgElement: SVGSVGElement,
  scale: number = 2,
): Promise<HTMLCanvasElement> {
  const clone = inlineStyles(svgElement);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Get dimensions from viewBox
  const viewBox = clone.getAttribute('viewBox');
  let width = 1200;
  let height = 800;
  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    width = parts[2];
    height = parts[3];
  }

  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // Add white background
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', '#ffffff');
  clone.insertBefore(bgRect, clone.firstChild);

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const svgDataUrl =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };
    img.onerror = () =>
      reject(new Error('Failed to load SVG as image for PNG conversion'));
    img.src = svgDataUrl;
  });
}
