/**
 * REML Schema Type Definitions
 * Version: 1.0.0
 *
 * REML = Relational Entity Modeling Language
 * A specification for describing relational database schemas.
 *
 * NOTE: This schema is lenient by design.
 * - Unknown/undefined parameters will be silently ignored (not rendered, no errors)
 * - This allows forward compatibility and custom extensions
 */

// SQL Data Types (common across databases)
export type SqlDataType =
  // Numeric types
  | 'integer'
  | 'bigint'
  | 'smallint'
  | 'tinyint'
  | 'decimal'
  | 'numeric'
  | 'float'
  | 'double'
  | 'real'
  // String types
  | 'char'
  | 'varchar'
  | 'text'
  | 'nchar'
  | 'nvarchar'
  | 'ntext'
  // Date/Time types
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamp'
  | 'timestamptz'
  // Binary types
  | 'binary'
  | 'varbinary'
  | 'blob'
  // Boolean
  | 'boolean'
  | 'bit'
  // UUID
  | 'uuid'
  // JSON
  | 'json'
  | 'jsonb'
  // Array (PostgreSQL)
  | 'array'
  // Custom/Other
  | string;

// ===========================================
// Enum Definitions
// ===========================================

export interface EnumValueDef {
  value: string | number;
  label?: string;
  description?: string;
}

export interface EnumDef {
  label?: string; // Logical name (論理名) - commonly used in Japanese DB design
  type?: 'string' | 'integer'; // Value type: string or integer
  description?: string;
  values: (string | number | EnumValueDef)[];
}

// ===========================================
// Column Definitions
// ===========================================

export interface ColumnValidation {
  // Numeric constraints
  min?: number;
  max?: number;
  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: 'email' | 'url' | 'uuid' | 'phone' | string;
  // Check constraint expression
  check?: string;
}

export interface ColumnDef {
  type: SqlDataType | string;
  label?: string; // Logical name (論理名) - commonly used in Japanese DB design
  description?: string;
  nullable?: boolean;
  default?: unknown;
  example?: unknown;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  unique?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  validation?: ColumnValidation;
  // For enum types
  enumRef?: string;
  // For array types
  arrayOf?: string;
}

// ===========================================
// Key Definitions
// ===========================================

export interface ForeignKeyDef {
  columns: string | string[];
  references: {
    table: string;
    columns: string | string[];
  };
  onDelete?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT' | 'NO ACTION';
  description?: string;
}

export interface UniqueConstraintDef {
  columns: string[];
  name?: string;
  description?: string;
}

export interface CheckConstraintDef {
  expression: string;
  name?: string;
  description?: string;
}

// ===========================================
// Index Definitions
// ===========================================

export interface IndexColumnDef {
  column: string;
  order?: 'ASC' | 'DESC';
  nulls?: 'FIRST' | 'LAST';
}

export interface IndexDef {
  name?: string;
  columns: (string | IndexColumnDef)[];
  unique?: boolean;
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST' | 'BRIN' | string;
  where?: string;
  description?: string;
}

// ===========================================
// Table Definitions
// ===========================================

export interface TableDef {
  label?: string; // Logical name (論理名) - commonly used in Japanese DB design
  description?: string;
  schema?: string;
  columns: Record<string, ColumnDef>;
  primaryKey?: string | string[];
  foreignKeys?: ForeignKeyDef[];
  uniqueConstraints?: UniqueConstraintDef[];
  checkConstraints?: CheckConstraintDef[];
  indexes?: IndexDef[];
}

// ===========================================
// View Definitions
// ===========================================

export interface ViewDef {
  description?: string;
  schema?: string;
  query: string;
  columns?: Record<string, { type?: string; description?: string }>;
  materialized?: boolean;
}

// ===========================================
// Root Schema
// ===========================================

export interface RemlMetadata {
  name: string;
  description?: string;
  author?: string;
  version?: string;
}

export interface RemlSchema {
  reml: string; // REML version
  database: 'postgresql' | 'mysql' | 'mariadb' | 'sqlite' | 'sqlserver' | 'oracle' | string;
  description?: string;
  updatedAt?: string;
  metadata?: RemlMetadata;
  enums?: Record<string, EnumDef>;
  tables: Record<string, TableDef>;
  views?: Record<string, ViewDef>;
}

// ===========================================
// Validation Result
// ===========================================

export interface ValidationError {
  path: string;
  message: string;
  severity?: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}
