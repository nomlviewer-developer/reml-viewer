import { inlineStyles } from './styleMap';

/**
 * Serialize an SVG element to a standalone SVG file and trigger download.
 */
export function exportSvg(
  svgElement: SVGSVGElement,
  filename: string = 'er-diagram.svg',
): void {
  const clone = inlineStyles(svgElement);

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Add white background as the first child
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', '#ffffff');
  clone.insertBefore(bgRect, clone.firstChild);

  // Set explicit width/height from viewBox
  const viewBox = clone.getAttribute('viewBox');
  if (viewBox) {
    const [, , w, h] = viewBox.split(/\s+/).map(Number);
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const svgBlob = new Blob(
    ['<?xml version="1.0" encoding="UTF-8"?>\n', svgString],
    { type: 'image/svg+xml;charset=utf-8' },
  );

  triggerDownload(svgBlob, filename);
}

/** Trigger a browser file download from a Blob. */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
