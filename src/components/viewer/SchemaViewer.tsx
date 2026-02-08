'use client';

import { useState, useRef } from 'react';
import type {
  RemlSchema,
  TableDef,
  ColumnDef,
  EnumDef,
  EnumValueDef,
  IndexDef,
  IndexColumnDef,
  ColumnValidation,
  ForeignKeyDef,
} from '@/lib/schema/types';
import { ERDiagram } from './ERDiagram';
import { SqlView } from './SqlView';
import { ExportMenu } from '@/components/ui/ExportMenu';

type ViewMode = 'list' | 'er' | 'sql';

interface SchemaViewerProps {
  schema: RemlSchema;
}

export function SchemaViewer({ schema }: SchemaViewerProps) {
  const enums = schema.enums || {};
  const [expandKey, setExpandKey] = useState(0);
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const erSvgRef = useRef<SVGSVGElement | null>(null);

  const handleExpandAll = () => {
    setIsAllExpanded(true);
    setExpandKey((k) => k + 1);
  };

  const handleCollapseAll = () => {
    setIsAllExpanded(false);
    setExpandKey((k) => k + 1);
  };

  return (
    <div className="w-full">
      {/* Header */}
      {(schema.metadata || schema.description) && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
            {schema.metadata?.name || 'Schema'}
          </h2>
          {(schema.metadata?.description || schema.description) && (
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              {schema.metadata?.description || schema.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-500">
            <span>REML: {schema.reml}</span>
            <span>Database: {schema.database}</span>
            {schema.metadata?.author && <span>Author: {schema.metadata.author}</span>}
            {schema.updatedAt && <span>Updated: {schema.updatedAt}</span>}
          </div>
        </div>
      )}

      {/* View Mode Toggle & Controls */}
      <div className="flex justify-between items-center mb-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
          <button
            onClick={() => setViewMode('er')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'er'
                ? 'bg-white dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            ER Diagram
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
              Beta
            </span>
          </button>
          <button
            onClick={() => setViewMode('sql')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'sql'
                ? 'bg-white dark:bg-zinc-600 text-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            SQL
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <ExportMenu
            schema={schema}
            svgRef={erSvgRef}
            isErView={viewMode === 'er'}
          />

        {/* Expand/Collapse Buttons (only for list view) */}
        {viewMode === 'list' && (
          <div className="flex gap-2">
            <button
              onClick={handleExpandAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                />
              </svg>
              Collapse All
            </button>
          </div>
        )}
        </div>
      </div>

      {/* ER Diagram View */}
      {viewMode === 'er' && (
        <ERDiagram
          schema={schema}
          onSvgRef={(ref) => { erSvgRef.current = ref; }}
        />
      )}

      {/* SQL DDL View */}
      {viewMode === 'sql' && <SqlView schema={schema} />}

      {/* List View - Tables */}
      {viewMode === 'list' && (
        <>
      <div className="space-y-4">
        {Object.entries(schema.tables).map(([name, table]) => (
          <TableCard
            key={`${name}-${expandKey}`}
            name={name}
            table={table}
            enums={enums}
            defaultExpanded={isAllExpanded}
          />
        ))}
      </div>

      {/* Enums */}
      {Object.keys(enums).length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Enums</h3>
          <div className="space-y-4">
            {Object.entries(enums).map(([enumName, enumDef]) => (
              <EnumCard
                key={`${enumName}-${expandKey}`}
                name={enumName}
                enumDef={enumDef}
                defaultExpanded={isAllExpanded}
              />
            ))}
          </div>
        </div>
      )}

      {/* Views */}
      {schema.views && Object.keys(schema.views).length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Views</h3>
          <div className="space-y-4">
            {Object.entries(schema.views).map(([viewName, view]) => (
              <div
                key={viewName}
                className="border-l-4 border-purple-500 bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                    {view.materialized ? 'Materialized View' : 'View'}
                  </span>
                  <h4 className="text-md font-semibold text-zinc-800 dark:text-zinc-100">
                    {viewName}
                  </h4>
                </div>
                {view.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{view.description}</p>
                )}
                <pre className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded text-xs font-mono overflow-x-auto">
                  {view.query}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}

// ===========================================
// Enum Card
// ===========================================

interface EnumCardProps {
  name: string;
  enumDef: EnumDef;
  defaultExpanded?: boolean;
}

function getEnumValue(item: string | number | EnumValueDef): string {
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item);
  }
  if (item && typeof item === 'object' && 'value' in item) {
    return String(item.value);
  }
  return JSON.stringify(item);
}

function getEnumLabel(item: string | number | EnumValueDef): string | undefined {
  if (item && typeof item === 'object' && 'label' in item) {
    return item.label;
  }
  return undefined;
}

function getEnumDescription(item: string | number | EnumValueDef): string | undefined {
  if (item && typeof item === 'object' && 'description' in item) {
    return item.description;
  }
  return undefined;
}

function EnumCard({ name, enumDef, defaultExpanded }: EnumCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? true);
  const hasDetailedValues = enumDef.values.some(
    (v) => typeof v === 'object' && v !== null && ('label' in v || 'description' in v)
  );
  const hasDescriptions = enumDef.values.some(
    (v) => typeof v === 'object' && v !== null && 'description' in v
  );

  return (
    <div className="border-l-4 border-orange-500 bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-zinc-50 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-600 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
              Enum
            </span>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{name}</h3>
            {enumDef.label && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                ({enumDef.label})
              </span>
            )}
          </div>
          <span className="text-xs text-zinc-500">{enumDef.values.length} values</span>
        </div>
        {enumDef.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 ml-6">
            {enumDef.description}
          </p>
        )}
      </button>

      {isExpanded && (
        <>
          {/* Type info */}
          {enumDef.type && (
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-700/30">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Type:</span>
                <code className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                  {enumDef.type}
                </code>
              </div>
            </div>
          )}

          {/* Values table */}
          <div className="p-4">
            <div className="text-sm">
              {/* Table header */}
              <div className="flex text-left text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                <div className="w-24 font-medium">Value</div>
                {hasDetailedValues && <div className="w-32 font-medium">Label</div>}
                {hasDescriptions && <div className="flex-1 font-medium">Description</div>}
              </div>
              {/* Table body */}
              <div>
                {enumDef.values.map((item, index) => (
                  <div
                    key={`${index}-${getEnumValue(item)}`}
                    className="flex items-center py-2 border-t border-zinc-100 dark:border-zinc-700"
                  >
                    <div className="w-24">
                      <code className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">
                        {getEnumValue(item)}
                      </code>
                    </div>
                    {hasDetailedValues && (
                      <div className="w-32 font-mono text-zinc-800 dark:text-zinc-200 text-sm">
                        {getEnumLabel(item) || '-'}
                      </div>
                    )}
                    {hasDescriptions && (
                      <div className="flex-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {getEnumDescription(item) || '-'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ===========================================
// Table Card
// ===========================================

interface TableCardProps {
  name: string;
  table: TableDef;
  enums: Record<string, EnumDef>;
  defaultExpanded?: boolean;
}

function TableCard({ name, table, enums, defaultExpanded }: TableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? true);

  const columnCount = Object.keys(table.columns).length;
  const indexCount = table.indexes?.length ?? 0;
  const fkCount = table.foreignKeys?.length ?? 0;

  // Get primary key columns
  const pkColumns = table.primaryKey
    ? Array.isArray(table.primaryKey)
      ? table.primaryKey
      : [table.primaryKey]
    : Object.entries(table.columns)
        .filter(([, col]) => col.primaryKey)
        .map(([name]) => name);

  return (
    <div className="border-l-4 border-emerald-500 bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
      {/* Table Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 bg-zinc-50 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-600 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded">
              Table
            </span>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {table.schema ? `${table.schema}.${name}` : name}
            </h3>
            {table.label && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                ({table.label})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{columnCount} columns</span>
            {indexCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded">
                {indexCount} index{indexCount > 1 ? 'es' : ''}
              </span>
            )}
            {fkCount > 0 && (
              <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 rounded">
                {fkCount} FK{fkCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        {table.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 ml-6">{table.description}</p>
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {/* Primary Key */}
          {pkColumns.length > 0 && (
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-700/30">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 rounded font-medium">
                  PK
                </span>
                <code className="text-zinc-700 dark:text-zinc-300">{pkColumns.join(', ')}</code>
              </div>
            </div>
          )}

          {/* Foreign Keys */}
          {table.foreignKeys && table.foreignKeys.length > 0 && (
            <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-700/30">
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Foreign Keys
              </div>
              <div className="space-y-1">
                {table.foreignKeys.map((fk, i) => (
                  <ForeignKeyRow key={i} fk={fk} />
                ))}
              </div>
            </div>
          )}

          {/* Columns */}
          <div className="p-4">
            <div className="text-sm">
              <div className="flex text-left text-zinc-500 dark:text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                <div className="w-8"></div>
                <div className="flex-1 font-medium">Column</div>
                <div className="w-32 font-medium">Type</div>
                <div className="w-24 font-medium">Nullable</div>
              </div>
              <div>
                {Object.entries(table.columns).map(([columnName, column]) => (
                  <ColumnRow
                    key={columnName}
                    name={columnName}
                    column={column}
                    enums={enums}
                    isPrimaryKey={pkColumns.includes(columnName)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Indexes */}
          {table.indexes && table.indexes.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-600">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Indexes</h4>
              <div className="space-y-2">
                {table.indexes.map((index, i) => (
                  <IndexRow key={i} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Unique Constraints */}
          {table.uniqueConstraints && table.uniqueConstraints.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-600">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Unique Constraints
              </h4>
              <div className="space-y-1">
                {table.uniqueConstraints.map((uc, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded">
                      UQ
                    </span>
                    <code className="text-zinc-700 dark:text-zinc-300">{uc.columns.join(', ')}</code>
                    {uc.name && <span className="text-zinc-500">({uc.name})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check Constraints */}
          {table.checkConstraints && table.checkConstraints.length > 0 && (
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-600">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Check Constraints
              </h4>
              <div className="space-y-1">
                {table.checkConstraints.map((cc, i) => (
                  <div key={i} className="text-xs">
                    {cc.name && (
                      <span className="font-medium text-zinc-600 dark:text-zinc-400">{cc.name}: </span>
                    )}
                    <code className="text-zinc-700 dark:text-zinc-300">{cc.expression}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===========================================
// Foreign Key Row
// ===========================================

interface ForeignKeyRowProps {
  fk: ForeignKeyDef;
}

function ForeignKeyRow({ fk }: ForeignKeyRowProps) {
  const columns = Array.isArray(fk.columns) ? fk.columns.join(', ') : fk.columns;
  const refColumns = Array.isArray(fk.references.columns)
    ? fk.references.columns.join(', ')
    : fk.references.columns;

  return (
    <div className="flex items-center gap-2 text-xs flex-wrap">
      <span className="px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-400 rounded">
        FK
      </span>
      <code className="text-zinc-700 dark:text-zinc-300">{columns}</code>
      <span className="text-zinc-400">→</span>
      <code className="text-emerald-600 dark:text-emerald-400">
        {fk.references.table}({refColumns})
      </code>
      {fk.onDelete && (
        <span className="text-zinc-500">ON DELETE {fk.onDelete}</span>
      )}
      {fk.onUpdate && (
        <span className="text-zinc-500">ON UPDATE {fk.onUpdate}</span>
      )}
    </div>
  );
}

// ===========================================
// Index Row
// ===========================================

interface IndexRowProps {
  index: IndexDef;
}

function IndexRow({ index }: IndexRowProps) {
  const getColumnDisplay = (col: string | IndexColumnDef): string => {
    if (typeof col === 'string') return col;
    let display = col.column;
    if (col.order) display += ` ${col.order}`;
    if (col.nulls) display += ` NULLS ${col.nulls}`;
    return display;
  };

  return (
    <div className="text-sm text-zinc-600 dark:text-zinc-400">
      <div className="flex items-start gap-2 flex-wrap">
        {index.unique && (
          <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 rounded text-xs">
            UNIQUE
          </span>
        )}
        {index.type && (
          <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded text-xs">
            {index.type}
          </span>
        )}
        <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
          {index.columns.map(getColumnDisplay).join(', ')}
        </code>
      </div>
      {index.name && (
        <div className="text-xs text-zinc-500 mt-1">
          <span className="font-medium">Name:</span> {index.name}
        </div>
      )}
      {index.where && (
        <div className="text-xs text-zinc-500 mt-1">
          <span className="font-medium">WHERE:</span> <code>{index.where}</code>
        </div>
      )}
      {index.description && <div className="text-xs text-zinc-500">{index.description}</div>}
    </div>
  );
}

// ===========================================
// Column Row
// ===========================================

interface ColumnRowProps {
  name: string;
  column: ColumnDef;
  enums: Record<string, EnumDef>;
  isPrimaryKey: boolean;
}

function ColumnRow({ name, column, enums, isPrimaryKey }: ColumnRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeDisplay = (): string => {
    let type = column.type;
    if (column.length) {
      type += `(${column.length})`;
    } else if (column.precision !== undefined) {
      type += column.scale !== undefined ? `(${column.precision},${column.scale})` : `(${column.precision})`;
    }
    if (column.arrayOf) {
      type = `${column.arrayOf}[]`;
    }
    return type;
  };

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const isEnumType = column.enumRef ? enums[column.enumRef] !== undefined : false;
  const validation: ColumnValidation | undefined = column.validation;

  const hasDetails =
    column.description ||
    column.example !== undefined ||
    column.default !== undefined ||
    validation;

  return (
    <div className="border-t border-zinc-100 dark:border-zinc-700">
      {/* Main Row */}
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center py-2 text-left ${hasDetails ? 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50 cursor-pointer' : 'cursor-default'}`}
      >
        <div className="w-8 flex justify-center">
          {hasDetails && (
            <svg
              className={`w-3 h-3 text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className="font-mono text-zinc-800 dark:text-zinc-200">{name}</span>
          {column.label && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({column.label})
            </span>
          )}
          {/* Badges */}
          {isPrimaryKey && (
            <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 rounded text-xs">
              PK
            </span>
          )}
          {column.autoIncrement && (
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-xs">
              AUTO
            </span>
          )}
          {column.unique && !isPrimaryKey && (
            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded text-xs">
              UNIQUE
            </span>
          )}
          {isEnumType && (
            <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded text-xs">
              enum:{column.enumRef}
            </span>
          )}
        </div>
        <div className="w-32">
          <code className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs">
            {getTypeDisplay()}
          </code>
        </div>
        <div className="w-24">
          {column.nullable === false || isPrimaryKey ? (
            <span className="text-red-500">NOT NULL</span>
          ) : (
            <span className="text-zinc-400">NULL</span>
          )}
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && hasDetails && (
        <div className="ml-8 pb-3 pr-4 space-y-2">
          {column.description && (
            <div className="flex gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 w-24 shrink-0">
                Description
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">{column.description}</span>
            </div>
          )}
          {column.example !== undefined && (
            <div className="flex gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 w-24 shrink-0">Example</span>
              <code className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs">
                {formatValue(column.example)}
              </code>
            </div>
          )}
          {column.default !== undefined && (
            <div className="flex gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 w-24 shrink-0">Default</span>
              <code className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                {formatValue(column.default)}
              </code>
            </div>
          )}
          {validation && <ValidationDisplay validation={validation} />}
        </div>
      )}
    </div>
  );
}

// ===========================================
// Validation Display
// ===========================================

interface ValidationDisplayProps {
  validation: ColumnValidation;
}

function ValidationDisplay({ validation }: ValidationDisplayProps) {
  const items: { label: string; value: string }[] = [];

  if (validation.min !== undefined) items.push({ label: 'min', value: String(validation.min) });
  if (validation.max !== undefined) items.push({ label: 'max', value: String(validation.max) });
  if (validation.minLength !== undefined)
    items.push({ label: 'minLength', value: String(validation.minLength) });
  if (validation.maxLength !== undefined)
    items.push({ label: 'maxLength', value: String(validation.maxLength) });
  if (validation.format) items.push({ label: 'format', value: validation.format });
  if (validation.pattern) items.push({ label: 'pattern', value: validation.pattern });
  if (validation.check) items.push({ label: 'check', value: validation.check });

  if (items.length === 0) return null;

  return (
    <div className="flex gap-2">
      <span className="text-xs text-zinc-500 dark:text-zinc-400 w-24 shrink-0">Validation</span>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <code
            key={item.label}
            className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
          >
            {item.label}: {item.value}
          </code>
        ))}
      </div>
    </div>
  );
}
