'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { generateSql } from '@/lib/export/sqlExport';
import type { RemlSchema } from '@/lib/schema/types';

const DIALECTS = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'mariadb', label: 'MariaDB' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
] as const;

const SQL_KEYWORDS = new Set([
  'CREATE', 'TABLE', 'VIEW', 'INDEX', 'TYPE', 'IF', 'NOT', 'EXISTS',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK',
  'CONSTRAINT', 'DEFAULT', 'NULL', 'ON', 'DELETE', 'UPDATE',
  'CASCADE', 'SET', 'RESTRICT', 'ACTION', 'NO', 'AS', 'ENUM',
  'ALTER', 'COMMENT', 'IS', 'USING', 'WHERE', 'MATERIALIZED',
  'GENERATED', 'ALWAYS', 'IDENTITY', 'AUTO_INCREMENT', 'AUTOINCREMENT',
  'SERIAL', 'BIGSERIAL',
]);

const SQL_TYPES = new Set([
  'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
  'FLOAT', 'DOUBLE', 'REAL', 'CHAR', 'VARCHAR', 'VARCHAR2', 'TEXT',
  'NCHAR', 'NVARCHAR', 'NVARCHAR2', 'DATE', 'TIME', 'DATETIME',
  'DATETIME2', 'TIMESTAMP', 'TIMESTAMPTZ', 'BOOLEAN', 'BIT', 'UUID',
  'JSON', 'JSONB', 'BLOB', 'CLOB', 'NCLOB', 'BINARY', 'VARBINARY',
  'PRECISION', 'DATETIMEOFFSET', 'UNIQUEIDENTIFIER', 'NUMBER',
  'BINARY_DOUBLE', 'BINARY_FLOAT', 'LONGBLOB', 'LONGTEXT',
]);

interface SqlViewProps {
  schema: RemlSchema;
}

export function SqlView({ schema }: SqlViewProps) {
  const { t } = useLanguage();
  const [dialect, setDialect] = useState(schema.database || 'postgresql');
  const [copied, setCopied] = useState(false);

  const sql = useMemo(() => generateSql(schema, dialect), [schema, dialect]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = sql;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = sql.split('\n');

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t('Database', 'データベース')}
          </label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="px-2 py-1 text-xs font-medium bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('Copied!', 'コピー済み!')}
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('Copy', 'コピー')}
            </>
          )}
        </button>
      </div>

      {/* SQL Code */}
      <div className="overflow-auto max-h-[600px] bg-zinc-900 dark:bg-zinc-950">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-zinc-800/50">
                <td className="px-3 py-0 text-right text-xs text-zinc-600 select-none w-12 align-top font-mono leading-6">
                  {i + 1}
                </td>
                <td className="px-3 py-0 text-sm font-mono leading-6 whitespace-pre">
                  <HighlightedLine line={line} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400">
        {lines.length} {t('lines', '行')}
      </div>
    </div>
  );
}

function HighlightedLine({ line }: { line: string }) {
  if (!line.trim()) return <span>{'\n'}</span>;

  // Comment line
  if (line.trimStart().startsWith('--')) {
    return <span className="text-zinc-500 italic">{line}</span>;
  }

  // Tokenize and highlight
  const tokens = tokenize(line);
  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} className={token.className}>
          {token.text}
        </span>
      ))}
    </span>
  );
}

interface Token {
  text: string;
  className: string;
}

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const regex = /('(?:[^'\\]|\\.)*')|(\b\d+\b)|(--.*$)|(\b[A-Z_]+\b)|(\S+)|(\s+)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const text = match[0];

    if (match[1]) {
      // String literal
      tokens.push({ text, className: 'text-green-400' });
    } else if (match[2]) {
      // Number
      tokens.push({ text, className: 'text-amber-400' });
    } else if (match[3]) {
      // Comment
      tokens.push({ text, className: 'text-zinc-500 italic' });
    } else if (match[4]) {
      // Uppercase word — check if keyword or type
      const upper = text.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ text, className: 'text-blue-400 font-semibold' });
      } else if (SQL_TYPES.has(upper)) {
        tokens.push({ text, className: 'text-purple-400' });
      } else {
        tokens.push({ text, className: 'text-zinc-300' });
      }
    } else {
      // Other (identifiers, punctuation, whitespace)
      tokens.push({ text, className: 'text-zinc-300' });
    }
  }

  return tokens;
}
