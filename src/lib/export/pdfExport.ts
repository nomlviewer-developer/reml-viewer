import { jsPDF } from 'jspdf';
import { svgToCanvas } from './pngExport';

interface PdfExportOptions {
  title?: string;
  subtitle?: string;
  filename?: string;
}

/**
 * Export an SVG element as a PDF document.
 * Includes optional title/subtitle header, then the rasterized diagram.
 */
export async function exportPdf(
  svgElement: SVGSVGElement,
  options: PdfExportOptions = {},
): Promise<void> {
  const {
    title = 'ER Diagram',
    subtitle,
    filename = 'er-diagram.pdf',
  } = options;

  const canvas = await svgToCanvas(svgElement, 2);

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const orientation = imgWidth >= imgHeight ? 'landscape' : 'portrait';

  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Header
  let yOffset = 15;
  pdf.setFontSize(18);
  pdf.setTextColor(39, 39, 42); // zinc-800
  pdf.text(title, 15, yOffset);
  yOffset += 8;

  if (subtitle) {
    pdf.setFontSize(11);
    pdf.setTextColor(113, 113, 122); // zinc-500
    pdf.text(subtitle, 15, yOffset);
    yOffset += 6;
  }

  pdf.setFontSize(9);
  pdf.setTextColor(161, 161, 170); // zinc-400
  pdf.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 15, yOffset);
  yOffset += 10;

  // Fit image to remaining page area
  const margin = 15;
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - yOffset - margin;
  const imgAspect = imgWidth / imgHeight;
  const areaAspect = availableWidth / availableHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imgAspect > areaAspect) {
    drawWidth = availableWidth;
    drawHeight = availableWidth / imgAspect;
  } else {
    drawHeight = availableHeight;
    drawWidth = availableHeight * imgAspect;
  }

  const imgDataUrl = canvas.toDataURL('image/png');
  pdf.addImage(imgDataUrl, 'PNG', margin, yOffset, drawWidth, drawHeight);

  pdf.save(filename);
}
