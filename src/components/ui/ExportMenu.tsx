'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { RemlSchema } from '@/lib/schema/types';

type ExportFormat = 'svg' | 'png' | 'pdf' | 'excel' | 'sql';

interface ExportMenuProps {
  schema: RemlSchema;
  svgRef: React.RefObject<SVGSVGElement | null>;
  isErView: boolean;
}

export function ExportMenu({ schema, svgRef, isErView }: ExportMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setError(null);
    setExporting(format);
    setIsOpen(false);

    try {
      const schemaName = schema.metadata?.name || 'schema';
      const safeFilename = schemaName.replace(/[^a-zA-Z0-9\-_]/g, '_');

      switch (format) {
        case 'svg': {
          if (!svgRef.current)
            throw new Error(t('SVG element not found', 'SVG要素が見つかりません'));
          const { exportSvg } = await import('@/lib/export/svgExport');
          exportSvg(svgRef.current, `${safeFilename}-er.svg`);
          break;
        }
        case 'png': {
          if (!svgRef.current)
            throw new Error(t('SVG element not found', 'SVG要素が見つかりません'));
          const { exportPng } = await import('@/lib/export/pngExport');
          await exportPng(svgRef.current, `${safeFilename}-er.png`);
          break;
        }
        case 'pdf': {
          if (!svgRef.current)
            throw new Error(t('SVG element not found', 'SVG要素が見つかりません'));
          const { exportPdf } = await import('@/lib/export/pdfExport');
          await exportPdf(svgRef.current, {
            title: schema.metadata?.name || 'ER Diagram',
            subtitle: schema.metadata?.description || schema.description,
            filename: `${safeFilename}-er.pdf`,
          });
          break;
        }
        case 'excel': {
          const { exportExcel } = await import('@/lib/export/excelExport');
          await exportExcel(schema, `${safeFilename}.xlsx`);
          break;
        }
        case 'sql': {
          const { exportSql } = await import('@/lib/export/sqlExport');
          exportSql(schema, `${safeFilename}.sql`);
          break;
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t('Export failed', 'エクスポートに失敗しました');
      setError(message);
      console.error('Export error:', err);
    } finally {
      setExporting(null);
    }
  };

  const diagramExports: { format: ExportFormat; label: string }[] = [
    { format: 'svg', label: t('SVG (Vector)', 'SVG（ベクター）') },
    { format: 'png', label: t('PNG (Image)', 'PNG（画像）') },
    { format: 'pdf', label: t('PDF (Document)', 'PDF（ドキュメント）') },
  ];

  const dataExports: { format: ExportFormat; label: string }[] = [
    {
      format: 'excel',
      label: t('Excel (Spreadsheet)', 'Excel（スプレッドシート）'),
    },
    {
      format: 'sql',
      label: t('SQL DDL', 'SQL DDL'),
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {exporting ? (
          <svg
            className="w-4 h-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            />
            <path
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              fill="currentColor"
              className="opacity-75"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        )}
        {t('Export', 'エクスポート')}
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-lg z-50 overflow-hidden">
          {isErView && (
            <>
              <div className="px-3 py-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-700">
                {t('ER Diagram', 'ER図')}
              </div>
              {diagramExports.map(({ format, label }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {label}
                </button>
              ))}
            </>
          )}
          <div
            className={`px-3 py-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-700 ${isErView ? 'border-t' : ''}`}
          >
            {t('Schema Data', 'スキーマデータ')}
          </div>
          {dataExports.map(({ format, label }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-64 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 z-50">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
