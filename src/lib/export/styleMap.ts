/**
 * Maps Tailwind CSS class names used in the ER diagram SVG
 * to their corresponding inline style properties.
 *
 * Export always uses light-mode styles.
 */
export const SVG_STYLE_MAP: Record<string, Record<string, string>> = {
  // Fill colors
  'fill-white': { fill: '#ffffff' },
  'fill-emerald-500': { fill: '#10b981' },
  'fill-emerald-600': { fill: '#059669' },
  'fill-emerald-100': { fill: '#d1fae5' },
  'fill-cyan-500': { fill: '#06b6d4' },
  'fill-cyan-400': { fill: '#22d3ee' },
  'fill-cyan-600': { fill: '#0891b2' },
  'fill-yellow-600': { fill: '#ca8a04' },
  'fill-yellow-100': { fill: '#fef9c3' },
  'fill-yellow-400': { fill: '#facc15' },
  'fill-zinc-700': { fill: '#3f3f46' },
  'fill-zinc-300': { fill: '#d4d4d8' },
  'fill-zinc-400': { fill: '#a1a1aa' },
  'fill-zinc-500': { fill: '#71717a' },
  'fill-zinc-800': { fill: '#27272a' },

  // Stroke colors
  'stroke-emerald-500': { stroke: '#10b981' },
  'stroke-emerald-400': { stroke: '#34d399' },
  'stroke-cyan-500': { stroke: '#06b6d4' },
  'stroke-cyan-400': { stroke: '#22d3ee' },
  'stroke-zinc-200': { stroke: '#e4e4e7' },
  'stroke-zinc-800': { stroke: '#27272a' },

  // Row highlight backgrounds
  'fill-yellow-900/50': { fill: 'rgba(113, 63, 18, 0.5)' },
  'fill-cyan-100': { fill: '#cffafe' },
  'fill-cyan-900/50': { fill: 'rgba(22, 78, 99, 0.5)' },

  // Font styles
  'text-sm': { 'font-size': '14px' },
  'text-xs': { 'font-size': '12px' },
  'font-semibold': { 'font-weight': '600' },
  'font-bold': { 'font-weight': '700' },
};

/**
 * Clone an SVG element and convert all Tailwind classes to inline styles.
 * Dark-mode classes are stripped (export uses light mode).
 */
export function inlineStyles(svgElement: SVGSVGElement): SVGSVGElement {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const allElements = clone.querySelectorAll('*');

  allElements.forEach((el) => {
    const classList = el.getAttribute('class');
    if (!classList) return;

    const classes = classList.split(/\s+/);
    const styleObj: Record<string, string> = {};

    for (const cls of classes) {
      if (cls.startsWith('dark:')) continue;

      const mapping = SVG_STYLE_MAP[cls];
      if (mapping) {
        Object.assign(styleObj, mapping);
      }
    }

    const existingStyle = el.getAttribute('style') || '';
    const newStyle = Object.entries(styleObj)
      .map(([prop, val]) => `${prop}: ${val}`)
      .join('; ');

    if (newStyle) {
      el.setAttribute(
        'style',
        existingStyle ? `${existingStyle}; ${newStyle}` : newStyle,
      );
    }

    el.removeAttribute('class');
  });

  return clone;
}
