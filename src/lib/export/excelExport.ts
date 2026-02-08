import ExcelJS from 'exceljs';
import type {
  RemlSchema,
  TableDef,
  ColumnDef,
  EnumDef,
  EnumValueDef,
  IndexColumnDef,
} from '@/lib/schema/types';
import { triggerDownload } from './svgExport';

const COLORS = {
  headerFill: '10B981',
  headerFont: 'FFFFFF',
  pkBg: 'FEF9C3',
  fkBg: 'CFFAFE',
  borderColor: 'E4E4E7',
  subtleText: '71717A',
  bodyText: '3F3F46',
};

export async function exportExcel(
  schema: RemlSchema,
  filename: string = 'schema.xlsx',
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'REMLViewer';
  workbook.created = new Date();

  addOverviewSheet(workbook, schema);

  for (const [tableName, table] of Object.entries(schema.tables)) {
    addTableSheet(workbook, tableName, table);
  }

  addRelationshipsSheet(workbook, schema);
  addIndexesSheet(workbook, schema);

  if (schema.enums && Object.keys(schema.enums).length > 0) {
    addEnumsSheet(workbook, schema.enums);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  triggerDownload(blob, filename);
}

function addOverviewSheet(workbook: ExcelJS.Workbook, schema: RemlSchema): void {
  const sheet = workbook.addWorksheet('Overview');

  const titleRow = sheet.addRow(['Schema Overview']);
  titleRow.font = { bold: true, size: 16 };
  sheet.addRow([]);

  if (schema.metadata?.name) {
    sheet.addRow(['Name', schema.metadata.name]);
  }
  if (schema.metadata?.description || schema.description) {
    sheet.addRow([
      'Description',
      schema.metadata?.description || schema.description,
    ]);
  }
  sheet.addRow(['REML Version', schema.reml]);
  sheet.addRow(['Database', schema.database]);
  if (schema.metadata?.author) {
    sheet.addRow(['Author', schema.metadata.author]);
  }
  if (schema.updatedAt) {
    sheet.addRow(['Updated At', schema.updatedAt]);
  }
  sheet.addRow([]);
  sheet.addRow([]);

  const headerRow = sheet.addRow([
    'Table Name',
    'Label',
    'Description',
    'Columns',
    'Foreign Keys',
    'Indexes',
  ]);
  styleHeaderRow(headerRow);

  for (const [tableName, table] of Object.entries(schema.tables)) {
    sheet.addRow([
      tableName,
      table.label || '',
      table.description || '',
      Object.keys(table.columns).length,
      table.foreignKeys?.length || 0,
      table.indexes?.length || 0,
    ]);
  }

  sheet.getColumn(1).width = 25;
  sheet.getColumn(2).width = 20;
  sheet.getColumn(3).width = 40;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 14;
  sheet.getColumn(6).width = 12;
}

function addTableSheet(
  workbook: ExcelJS.Workbook,
  tableName: string,
  table: TableDef,
): void {
  const safeSheetName = sanitizeSheetName(tableName);
  const sheet = workbook.addWorksheet(safeSheetName);

  const titleRow = sheet.addRow([
    `${tableName}${table.label ? ` (${table.label})` : ''}`,
  ]);
  titleRow.font = { bold: true, size: 14, color: { argb: COLORS.bodyText } };

  if (table.description) {
    const descRow = sheet.addRow([table.description]);
    descRow.font = { italic: true, color: { argb: COLORS.subtleText } };
  }
  sheet.addRow([]);

  // Determine PK columns
  const pkColumns = table.primaryKey
    ? Array.isArray(table.primaryKey)
      ? table.primaryKey
      : [table.primaryKey]
    : Object.entries(table.columns)
        .filter(([, col]) => col.primaryKey)
        .map(([name]) => name);

  // Determine FK columns
  const fkColumns = (table.foreignKeys || []).flatMap((fk) =>
    Array.isArray(fk.columns) ? fk.columns : [fk.columns],
  );

  const headerRow = sheet.addRow([
    'Column Name',
    'Label',
    'Type',
    'Nullable',
    'Default',
    'PK',
    'FK',
    'Unique',
    'Auto Increment',
    'Enum Ref',
    'Description',
  ]);
  styleHeaderRow(headerRow);

  for (const [columnName, column] of Object.entries(table.columns)) {
    const typeDisplay = formatColumnType(column);
    const isPK = pkColumns.includes(columnName);
    const isFK = fkColumns.includes(columnName);

    const row = sheet.addRow([
      columnName,
      column.label || '',
      typeDisplay,
      column.nullable === false || isPK ? 'NOT NULL' : 'NULL',
      column.default !== undefined ? String(column.default) : '',
      isPK ? 'YES' : '',
      isFK ? 'YES' : '',
      column.unique ? 'YES' : '',
      column.autoIncrement ? 'YES' : '',
      column.enumRef || '',
      column.description || '',
    ]);

    if (isPK) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.pkBg },
        };
      });
    } else if (isFK) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.fkBg },
        };
      });
    }
  }

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 18;
  sheet.getColumn(3).width = 16;
  sheet.getColumn(4).width = 10;
  sheet.getColumn(5).width = 18;
  sheet.getColumn(6).width = 6;
  sheet.getColumn(7).width = 6;
  sheet.getColumn(8).width = 8;
  sheet.getColumn(9).width = 14;
  sheet.getColumn(10).width = 14;
  sheet.getColumn(11).width = 40;
}

function addRelationshipsSheet(
  workbook: ExcelJS.Workbook,
  schema: RemlSchema,
): void {
  const sheet = workbook.addWorksheet('Relationships');

  const headerRow = sheet.addRow([
    'Source Table',
    'Source Columns',
    'Target Table',
    'Target Columns',
    'ON DELETE',
    'ON UPDATE',
    'Description',
  ]);
  styleHeaderRow(headerRow);

  for (const [tableName, table] of Object.entries(schema.tables)) {
    for (const fk of table.foreignKeys || []) {
      const srcCols = Array.isArray(fk.columns)
        ? fk.columns.join(', ')
        : fk.columns;
      const tgtCols = Array.isArray(fk.references.columns)
        ? fk.references.columns.join(', ')
        : fk.references.columns;

      sheet.addRow([
        tableName,
        srcCols,
        fk.references.table,
        tgtCols,
        fk.onDelete || '',
        fk.onUpdate || '',
        fk.description || '',
      ]);
    }
  }

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 22;
  sheet.getColumn(3).width = 22;
  sheet.getColumn(4).width = 22;
  sheet.getColumn(5).width = 14;
  sheet.getColumn(6).width = 14;
  sheet.getColumn(7).width = 35;
}

function addIndexesSheet(
  workbook: ExcelJS.Workbook,
  schema: RemlSchema,
): void {
  const sheet = workbook.addWorksheet('Indexes');

  const headerRow = sheet.addRow([
    'Table',
    'Index Name',
    'Columns',
    'Unique',
    'Type',
    'Where',
    'Description',
  ]);
  styleHeaderRow(headerRow);

  for (const [tableName, table] of Object.entries(schema.tables)) {
    for (const index of table.indexes || []) {
      const columns = index.columns
        .map((col) => {
          if (typeof col === 'string') return col;
          const indexCol = col as IndexColumnDef;
          let display = indexCol.column;
          if (indexCol.order) display += ` ${indexCol.order}`;
          if (indexCol.nulls) display += ` NULLS ${indexCol.nulls}`;
          return display;
        })
        .join(', ');

      sheet.addRow([
        tableName,
        index.name || '',
        columns,
        index.unique ? 'YES' : '',
        index.type || '',
        index.where || '',
        index.description || '',
      ]);
    }
  }

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 30;
  sheet.getColumn(3).width = 30;
  sheet.getColumn(4).width = 8;
  sheet.getColumn(5).width = 10;
  sheet.getColumn(6).width = 25;
  sheet.getColumn(7).width = 35;
}

function addEnumsSheet(
  workbook: ExcelJS.Workbook,
  enums: Record<string, EnumDef>,
): void {
  const sheet = workbook.addWorksheet('Enums');

  const headerRow = sheet.addRow([
    'Enum Name',
    'Label',
    'Type',
    'Value',
    'Value Label',
    'Value Description',
    'Enum Description',
  ]);
  styleHeaderRow(headerRow);

  for (const [enumName, enumDef] of Object.entries(enums)) {
    for (let i = 0; i < enumDef.values.length; i++) {
      const item = enumDef.values[i];
      const isObj =
        typeof item === 'object' && item !== null && 'value' in item;
      const value = isObj ? String((item as EnumValueDef).value) : String(item);
      const label = isObj ? (item as EnumValueDef).label || '' : '';
      const desc = isObj ? (item as EnumValueDef).description || '' : '';

      sheet.addRow([
        i === 0 ? enumName : '',
        i === 0 ? enumDef.label || '' : '',
        i === 0 ? enumDef.type || '' : '',
        value,
        label,
        desc,
        i === 0 ? enumDef.description || '' : '',
      ]);
    }
  }

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 20;
  sheet.getColumn(3).width = 10;
  sheet.getColumn(4).width = 14;
  sheet.getColumn(5).width = 18;
  sheet.getColumn(6).width = 35;
  sheet.getColumn(7).width = 35;
}

// ---- Helpers ----

function styleHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true, color: { argb: COLORS.headerFont } };
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.headerFill },
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
    };
  });
}

function formatColumnType(column: ColumnDef): string {
  let type = column.type;
  if (column.length) {
    type += `(${column.length})`;
  } else if (column.precision !== undefined) {
    type +=
      column.scale !== undefined
        ? `(${column.precision},${column.scale})`
        : `(${column.precision})`;
  }
  if (column.arrayOf) {
    type = `${column.arrayOf}[]`;
  }
  return type;
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[[\]:*?/\\]/g, '_').slice(0, 31);
}
