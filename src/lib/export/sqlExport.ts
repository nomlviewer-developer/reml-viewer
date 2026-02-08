import type {
  RemlSchema,
  TableDef,
  ColumnDef,
  ForeignKeyDef,
  IndexDef,
  IndexColumnDef,
  EnumDef,
  EnumValueDef,
  ViewDef,
} from '@/lib/schema/types';
import { triggerDownload } from './svgExport';

// ============================================================
// Dialect Configuration
// ============================================================

type DatabaseDialect =
  | 'postgresql'
  | 'mysql'
  | 'mariadb'
  | 'sqlite'
  | 'sqlserver'
  | 'oracle';

interface DialectConfig {
  quoteId: (name: string) => string;
  autoIncrement: (colType: string) => { type?: string; suffix?: string };
  enumStrategy: 'create_type' | 'inline_enum' | 'check_constraint';
  typeMap: Record<string, string>;
  defaultFunctionMap: Record<string, string>;
  supportsIfNotExists: boolean;
  commentStrategy: 'comment_on' | 'alter_comment' | 'sql_comment';
}

const BASE_TYPE_MAP: Record<string, string> = {
  integer: 'INTEGER',
  bigint: 'BIGINT',
  smallint: 'SMALLINT',
  tinyint: 'TINYINT',
  decimal: 'DECIMAL',
  numeric: 'NUMERIC',
  float: 'FLOAT',
  double: 'DOUBLE PRECISION',
  real: 'REAL',
  char: 'CHAR',
  varchar: 'VARCHAR',
  text: 'TEXT',
  nchar: 'NCHAR',
  nvarchar: 'NVARCHAR',
  ntext: 'NTEXT',
  date: 'DATE',
  time: 'TIME',
  datetime: 'DATETIME',
  timestamp: 'TIMESTAMP',
  timestamptz: 'TIMESTAMPTZ',
  binary: 'BINARY',
  varbinary: 'VARBINARY',
  blob: 'BLOB',
  boolean: 'BOOLEAN',
  bit: 'BIT',
  uuid: 'UUID',
  json: 'JSON',
  jsonb: 'JSONB',
  array: 'TEXT',
};

const DIALECT_CONFIGS: Record<DatabaseDialect, DialectConfig> = {
  postgresql: {
    quoteId: (n) => `"${n}"`,
    autoIncrement: (t) => ({
      type: t === 'BIGINT' ? 'BIGSERIAL' : 'SERIAL',
    }),
    enumStrategy: 'create_type',
    typeMap: { ...BASE_TYPE_MAP },
    defaultFunctionMap: {
      'now()': 'NOW()',
      'current_timestamp': 'CURRENT_TIMESTAMP',
      'gen_random_uuid()': 'gen_random_uuid()',
      'uuid()': 'gen_random_uuid()',
    },
    supportsIfNotExists: true,
    commentStrategy: 'comment_on',
  },
  mysql: {
    quoteId: (n) => `\`${n}\``,
    autoIncrement: () => ({ suffix: 'AUTO_INCREMENT' }),
    enumStrategy: 'inline_enum',
    typeMap: {
      ...BASE_TYPE_MAP,
      boolean: 'TINYINT(1)',
      double: 'DOUBLE',
      timestamptz: 'TIMESTAMP',
      uuid: 'CHAR(36)',
      jsonb: 'JSON',
      blob: 'LONGBLOB',
      ntext: 'LONGTEXT',
    },
    defaultFunctionMap: {
      'now()': 'CURRENT_TIMESTAMP',
      'current_timestamp': 'CURRENT_TIMESTAMP',
      'gen_random_uuid()': '(UUID())',
      'uuid()': '(UUID())',
    },
    supportsIfNotExists: true,
    commentStrategy: 'alter_comment',
  },
  mariadb: {
    quoteId: (n) => `\`${n}\``,
    autoIncrement: () => ({ suffix: 'AUTO_INCREMENT' }),
    enumStrategy: 'inline_enum',
    typeMap: {
      ...BASE_TYPE_MAP,
      boolean: 'TINYINT(1)',
      double: 'DOUBLE',
      timestamptz: 'TIMESTAMP',
      uuid: 'CHAR(36)',
      jsonb: 'JSON',
      blob: 'LONGBLOB',
      ntext: 'LONGTEXT',
    },
    defaultFunctionMap: {
      'now()': 'CURRENT_TIMESTAMP',
      'current_timestamp': 'CURRENT_TIMESTAMP',
      'gen_random_uuid()': '(UUID())',
      'uuid()': '(UUID())',
    },
    supportsIfNotExists: true,
    commentStrategy: 'alter_comment',
  },
  sqlite: {
    quoteId: (n) => `"${n}"`,
    autoIncrement: () => ({ suffix: 'AUTOINCREMENT' }),
    enumStrategy: 'check_constraint',
    typeMap: {
      ...BASE_TYPE_MAP,
      boolean: 'INTEGER',
      uuid: 'TEXT',
      json: 'TEXT',
      jsonb: 'TEXT',
      timestamptz: 'TEXT',
      timestamp: 'TEXT',
      datetime: 'TEXT',
      decimal: 'REAL',
      numeric: 'REAL',
      double: 'REAL',
      float: 'REAL',
    },
    defaultFunctionMap: {
      'now()': "datetime('now')",
      'current_timestamp': 'CURRENT_TIMESTAMP',
      'gen_random_uuid()': "hex(randomblob(16))",
      'uuid()': "hex(randomblob(16))",
    },
    supportsIfNotExists: true,
    commentStrategy: 'sql_comment',
  },
  sqlserver: {
    quoteId: (n) => `[${n}]`,
    autoIncrement: () => ({ suffix: 'IDENTITY(1,1)' }),
    enumStrategy: 'check_constraint',
    typeMap: {
      ...BASE_TYPE_MAP,
      boolean: 'BIT',
      double: 'FLOAT',
      text: 'NVARCHAR(MAX)',
      timestamptz: 'DATETIMEOFFSET',
      timestamp: 'DATETIME2',
      datetime: 'DATETIME2',
      uuid: 'UNIQUEIDENTIFIER',
      json: 'NVARCHAR(MAX)',
      jsonb: 'NVARCHAR(MAX)',
      blob: 'VARBINARY(MAX)',
      ntext: 'NVARCHAR(MAX)',
    },
    defaultFunctionMap: {
      'now()': 'GETDATE()',
      'current_timestamp': 'GETDATE()',
      'gen_random_uuid()': 'NEWID()',
      'uuid()': 'NEWID()',
    },
    supportsIfNotExists: false,
    commentStrategy: 'sql_comment',
  },
  oracle: {
    quoteId: (n) => `"${n}"`,
    autoIncrement: () => ({ suffix: 'GENERATED ALWAYS AS IDENTITY' }),
    enumStrategy: 'check_constraint',
    typeMap: {
      ...BASE_TYPE_MAP,
      integer: 'NUMBER(10)',
      bigint: 'NUMBER(19)',
      smallint: 'NUMBER(5)',
      tinyint: 'NUMBER(3)',
      boolean: 'NUMBER(1)',
      double: 'BINARY_DOUBLE',
      float: 'BINARY_FLOAT',
      real: 'BINARY_FLOAT',
      text: 'CLOB',
      varchar: 'VARCHAR2',
      nvarchar: 'NVARCHAR2',
      ntext: 'NCLOB',
      timestamp: 'TIMESTAMP',
      timestamptz: 'TIMESTAMP WITH TIME ZONE',
      datetime: 'TIMESTAMP',
      uuid: 'RAW(16)',
      json: 'CLOB',
      jsonb: 'CLOB',
    },
    defaultFunctionMap: {
      'now()': 'SYSDATE',
      'current_timestamp': 'CURRENT_TIMESTAMP',
      'gen_random_uuid()': 'SYS_GUID()',
      'uuid()': 'SYS_GUID()',
    },
    supportsIfNotExists: false,
    commentStrategy: 'comment_on',
  },
};

// ============================================================
// Public API
// ============================================================

export function generateSql(
  schema: RemlSchema,
  targetDialect?: string,
): string {
  const dialect = (targetDialect || schema.database || 'postgresql') as DatabaseDialect;
  const config = DIALECT_CONFIGS[dialect] || DIALECT_CONFIGS.postgresql;
  const lines: string[] = [];

  lines.push('-- ============================================================');
  lines.push(`-- ${schema.metadata?.name || 'Schema'} DDL`);
  lines.push(`-- Database: ${dialect}`);
  if (schema.metadata?.description || schema.description) {
    lines.push(`-- ${schema.metadata?.description || schema.description}`);
  }
  lines.push('-- Generated by REMLViewer');
  lines.push('-- ============================================================');
  lines.push('');

  // Enums (PostgreSQL CREATE TYPE)
  if (schema.enums) {
    for (const [name, def] of Object.entries(schema.enums)) {
      const ddl = generateEnumDdl(name, def, config);
      if (ddl) lines.push(ddl);
    }
  }

  // Tables in FK dependency order
  const orderedTables = topologicalSortTables(schema);
  for (const tableName of orderedTables) {
    const table = schema.tables[tableName];
    if (!table) continue;
    lines.push(generateTableDdl(tableName, table, schema, config, dialect));
  }

  // Indexes
  for (const tableName of orderedTables) {
    const table = schema.tables[tableName];
    if (!table?.indexes) continue;
    for (const index of table.indexes) {
      lines.push(generateIndexDdl(tableName, index, config));
    }
  }

  // Views
  if (schema.views) {
    for (const [name, view] of Object.entries(schema.views)) {
      lines.push(generateViewDdl(name, view, config));
    }
  }

  // COMMENT ON statements (PostgreSQL / Oracle)
  if (config.commentStrategy === 'comment_on') {
    const comments = generateCommentOnStatements(schema, config);
    if (comments) lines.push(comments);
  }

  return lines.join('\n');
}

export function exportSql(
  schema: RemlSchema,
  filename?: string,
  targetDialect?: string,
): void {
  const sql = generateSql(schema, targetDialect);
  const blob = new Blob([sql], { type: 'text/sql;charset=utf-8' });
  const name =
    filename ||
    `${(schema.metadata?.name || 'schema').replace(/[^a-zA-Z0-9\-_]/g, '_')}.sql`;
  triggerDownload(blob, name);
}

// ============================================================
// Topological Sort
// ============================================================

function topologicalSortTables(schema: RemlSchema): string[] {
  const tableNames = Object.keys(schema.tables);
  const deps = new Map<string, Set<string>>();

  for (const [name, table] of Object.entries(schema.tables)) {
    const tableDeps = new Set<string>();
    for (const fk of table.foreignKeys || []) {
      if (fk.references.table !== name && tableNames.includes(fk.references.table)) {
        tableDeps.add(fk.references.table);
      }
    }
    deps.set(name, tableDeps);
  }

  const sorted: string[] = [];
  const visited = new Set<string>();
  const inProgress = new Set<string>();

  function visit(name: string) {
    if (visited.has(name)) return;
    if (inProgress.has(name)) return;
    inProgress.add(name);
    for (const dep of deps.get(name) || []) {
      visit(dep);
    }
    inProgress.delete(name);
    visited.add(name);
    sorted.push(name);
  }

  for (const name of tableNames) visit(name);
  return sorted;
}

// ============================================================
// DDL Generators
// ============================================================

function generateEnumDdl(
  name: string,
  def: EnumDef,
  config: DialectConfig,
): string {
  if (config.enumStrategy !== 'create_type') return '';

  const values = def.values.map((v) => {
    const val =
      typeof v === 'object' && v !== null && 'value' in v
        ? (v as EnumValueDef).value
        : v;
    return typeof val === 'string' ? `'${val}'` : String(val);
  });

  const desc = def.label ? `-- ${name}: ${def.label}` : `-- Enum: ${name}`;
  return `${desc}\nCREATE TYPE ${config.quoteId(name)} AS ENUM (${values.join(', ')});\n`;
}

function generateTableDdl(
  tableName: string,
  table: TableDef,
  schema: RemlSchema,
  config: DialectConfig,
  dialect: string,
): string {
  const lines: string[] = [];

  if (table.label) lines.push(`-- ${tableName}: ${table.label}`);
  if (table.description && config.commentStrategy === 'sql_comment') {
    lines.push(`-- ${table.description}`);
  }

  const ifne = config.supportsIfNotExists ? 'IF NOT EXISTS ' : '';
  const qName = table.schema
    ? `${config.quoteId(table.schema)}.${config.quoteId(tableName)}`
    : config.quoteId(tableName);

  lines.push(`CREATE TABLE ${ifne}${qName} (`);

  const pkCols = table.primaryKey
    ? Array.isArray(table.primaryKey)
      ? table.primaryKey
      : [table.primaryKey]
    : Object.entries(table.columns)
        .filter(([, c]) => c.primaryKey)
        .map(([n]) => n);
  const isSinglePk = pkCols.length === 1;

  const colDefs: string[] = [];
  for (const [colName, col] of Object.entries(table.columns)) {
    const isPk = pkCols.includes(colName);
    colDefs.push(
      generateColumnDef(colName, col, config, isPk && isSinglePk, schema.enums || {}, dialect),
    );
  }

  if (pkCols.length > 1) {
    colDefs.push(`  PRIMARY KEY (${pkCols.map((c) => config.quoteId(c)).join(', ')})`);
  }

  for (const uc of table.uniqueConstraints || []) {
    const ucName = uc.name ? `CONSTRAINT ${config.quoteId(uc.name)} ` : '';
    colDefs.push(`  ${ucName}UNIQUE (${uc.columns.map((c) => config.quoteId(c)).join(', ')})`);
  }

  for (const cc of table.checkConstraints || []) {
    const ccName = cc.name ? `CONSTRAINT ${config.quoteId(cc.name)} ` : '';
    colDefs.push(`  ${ccName}CHECK (${cc.expression})`);
  }

  for (const fk of table.foreignKeys || []) {
    colDefs.push(generateForeignKeyClause(fk, config));
  }

  lines.push(colDefs.join(',\n'));
  lines.push(');\n');

  if (config.commentStrategy === 'alter_comment' && table.description) {
    lines.push(`ALTER TABLE ${qName} COMMENT = '${esc(table.description)}';\n`);
  }

  return lines.join('\n');
}

function generateColumnDef(
  colName: string,
  col: ColumnDef,
  config: DialectConfig,
  inlinePk: boolean,
  enums: Record<string, EnumDef>,
  dialect: string,
): string {
  const parts: string[] = [`  ${config.quoteId(colName)}`];

  let sqlType = mapType(col, config, enums, dialect);

  if (col.autoIncrement) {
    const ai = config.autoIncrement(sqlType);
    if (ai.type) sqlType = ai.type;
  }

  parts.push(sqlType);

  if (col.autoIncrement) {
    const ai = config.autoIncrement(sqlType);
    if (ai.suffix) parts.push(ai.suffix);
  }

  if (col.nullable === false || inlinePk) parts.push('NOT NULL');
  if (col.default !== undefined) parts.push(`DEFAULT ${formatDefault(col.default, config)}`);
  if (inlinePk) parts.push('PRIMARY KEY');
  if (col.unique && !inlinePk) parts.push('UNIQUE');

  return parts.join(' ');
}

function generateForeignKeyClause(fk: ForeignKeyDef, config: DialectConfig): string {
  const src = (Array.isArray(fk.columns) ? fk.columns : [fk.columns])
    .map((c) => config.quoteId(c))
    .join(', ');
  const tgt = (Array.isArray(fk.references.columns) ? fk.references.columns : [fk.references.columns])
    .map((c) => config.quoteId(c))
    .join(', ');

  let clause = `  FOREIGN KEY (${src}) REFERENCES ${config.quoteId(fk.references.table)} (${tgt})`;
  if (fk.onDelete) clause += ` ON DELETE ${fk.onDelete}`;
  if (fk.onUpdate) clause += ` ON UPDATE ${fk.onUpdate}`;
  return clause;
}

function generateIndexDdl(tableName: string, index: IndexDef, config: DialectConfig): string {
  const unique = index.unique ? 'UNIQUE ' : '';
  const idxName =
    index.name ||
    `idx_${tableName}_${index.columns.map((c) => (typeof c === 'string' ? c : (c as IndexColumnDef).column)).join('_')}`;

  const cols = index.columns
    .map((c) => {
      if (typeof c === 'string') return config.quoteId(c);
      const ic = c as IndexColumnDef;
      let s = config.quoteId(ic.column);
      if (ic.order) s += ` ${ic.order}`;
      if (ic.nulls) s += ` NULLS ${ic.nulls}`;
      return s;
    })
    .join(', ');

  let ddl = `CREATE ${unique}INDEX ${config.quoteId(idxName)} ON ${config.quoteId(tableName)} (${cols})`;
  if (index.type && config !== DIALECT_CONFIGS.sqlite) ddl += ` USING ${index.type}`;
  if (index.where) ddl += ` WHERE ${index.where}`;
  return ddl + ';\n';
}

function generateViewDdl(viewName: string, view: ViewDef, config: DialectConfig): string {
  const mat = view.materialized ? 'MATERIALIZED ' : '';
  const qName = view.schema
    ? `${config.quoteId(view.schema)}.${config.quoteId(viewName)}`
    : config.quoteId(viewName);
  return `CREATE ${mat}VIEW ${qName} AS\n${view.query};\n`;
}

function generateCommentOnStatements(schema: RemlSchema, config: DialectConfig): string {
  const lines: string[] = [];

  for (const [tableName, table] of Object.entries(schema.tables)) {
    const qTable = config.quoteId(tableName);
    const tableComment = table.label
      ? table.label + (table.description ? ' - ' + table.description : '')
      : table.description;

    if (tableComment) {
      lines.push(`COMMENT ON TABLE ${qTable} IS '${esc(tableComment)}';`);
    }

    for (const [colName, col] of Object.entries(table.columns)) {
      const colComment = col.label
        ? col.label + (col.description ? ' - ' + col.description : '')
        : col.description;
      if (colComment) {
        lines.push(`COMMENT ON COLUMN ${qTable}.${config.quoteId(colName)} IS '${esc(colComment)}';`);
      }
    }
  }

  if (lines.length === 0) return '';
  return '\n-- Comments\n' + lines.join('\n') + '\n';
}

// ============================================================
// Helpers
// ============================================================

function mapType(
  col: ColumnDef,
  config: DialectConfig,
  enums: Record<string, EnumDef>,
  dialect: string,
): string {
  if (col.enumRef && enums[col.enumRef]) {
    const enumDef = enums[col.enumRef];
    const values = enumDef.values.map((v) => {
      const val = typeof v === 'object' && v !== null && 'value' in v
        ? (v as EnumValueDef).value : v;
      return typeof val === 'string' ? `'${val}'` : String(val);
    });

    if (config.enumStrategy === 'create_type') return config.quoteId(col.enumRef);
    if (config.enumStrategy === 'inline_enum') return `ENUM(${values.join(', ')})`;
    return enumDef.type === 'integer'
      ? (config.typeMap['integer'] || 'INTEGER')
      : `${config.typeMap['varchar'] || 'VARCHAR'}(50)`;
  }

  if (col.arrayOf) {
    const base = config.typeMap[col.arrayOf.toLowerCase()] || col.arrayOf.toUpperCase();
    return dialect === 'postgresql' ? `${base}[]` : (config.typeMap['json'] || 'TEXT');
  }

  const base = config.typeMap[col.type.toLowerCase()] || col.type.toUpperCase();
  if (col.length) return `${base}(${col.length})`;
  if (col.precision !== undefined) {
    return col.scale !== undefined
      ? `${base}(${col.precision},${col.scale})`
      : `${base}(${col.precision})`;
  }
  return base;
}

function formatDefault(value: unknown, config: DialectConfig): string {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);

  const str = String(value);
  const mapped = config.defaultFunctionMap[str.toLowerCase()];
  if (mapped) return mapped;
  if (str.includes('(') && str.includes(')')) return str;
  return `'${esc(str)}'`;
}

function esc(s: string): string {
  return s.replace(/'/g, "''");
}
