import yaml from 'js-yaml';
import type { RemlSchema, ValidationResult, ValidationError } from '../schema/types';

/**
 * REML Parser
 *
 * DESIGN PRINCIPLE: Lenient Parsing
 * - Unknown/undefined parameters are silently ignored (not rendered, no errors)
 * - This allows forward compatibility and custom extensions
 * - Only minimum required fields cause errors: reml, database, tables, columns.type
 */

/**
 * Parse YAML string to REML Schema
 */
export function parseReml(yamlString: string): {
  schema: RemlSchema | null;
  error: string | null;
} {
  try {
    const parsed = yaml.load(yamlString) as RemlSchema;
    return { schema: parsed, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown parsing error';
    return { schema: null, error };
  }
}

/**
 * Validate REML Schema structure
 *
 * Validation is minimal and lenient:
 * - Required: reml, database, tables (with at least one), columns.type
 * - Unknown fields are ignored (no errors)
 * - Unsupported database types show warning, not error
 */
export function validateReml(schema: RemlSchema): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check REML version
  if (!schema.reml) {
    errors.push({ path: 'reml', message: 'REML version is required', severity: 'error' });
  }

  // Check database type
  const supportedDatabases = ['postgresql', 'mysql', 'mariadb', 'sqlite', 'sqlserver', 'oracle'];
  if (!schema.database) {
    errors.push({ path: 'database', message: 'Database type is required', severity: 'error' });
  } else if (!supportedDatabases.includes(schema.database)) {
    warnings.push({
      path: 'database',
      message: `Database "${schema.database}" may not be fully supported. Some features may not render correctly.`,
      severity: 'warning',
    });
  }

  // Check tables
  if (!schema.tables || Object.keys(schema.tables).length === 0) {
    errors.push({
      path: 'tables',
      message: 'At least one table is required',
      severity: 'error',
    });
  } else {
    // Validate each table
    for (const [tableName, table] of Object.entries(schema.tables)) {
      if (!table.columns || Object.keys(table.columns).length === 0) {
        errors.push({
          path: `tables.${tableName}.columns`,
          message: `Table "${tableName}" must have at least one column`,
          severity: 'error',
        });
      }

      // Validate columns - only require type
      if (table.columns) {
        for (const [columnName, column] of Object.entries(table.columns)) {
          if (!column.type) {
            errors.push({
              path: `tables.${tableName}.columns.${columnName}.type`,
              message: `Column "${columnName}" must have a type`,
              severity: 'error',
            });
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parse and validate REML in one step
 */
export function parseAndValidateReml(yamlString: string): {
  schema: RemlSchema | null;
  validation: ValidationResult;
  parseError: string | null;
} {
  const { schema, error: parseError } = parseReml(yamlString);

  if (!schema) {
    return {
      schema: null,
      validation: { valid: false, errors: [], warnings: [] },
      parseError,
    };
  }

  const validation = validateReml(schema);

  return {
    schema,
    validation,
    parseError: null,
  };
}
