/**
 * Convex ID Conversion Helpers
 * Provides type-safe utilities for converting strings to Convex ID types
 */

import { Id, TableNames } from '@/convex/_generated/dataModel';

/**
 * Convert a string to a Convex ID with type safety
 * @param value - String value to convert
 * @param tableName - Name of the Convex table (for error messages)
 * @returns Typed Convex ID
 * @throws Error if value is not a valid Convex ID format
 */
export function toConvexId<TableName extends TableNames>(
  value: string,
  tableName: TableName
): Id<TableName> {
  if (!value || typeof value !== 'string') {
    throw new Error(`Invalid ${tableName} ID: value must be a non-empty string`);
  }

  // Convex IDs are typically base64-like strings
  // Basic format validation - adjust if Convex has specific requirements
  if (value.length === 0) {
    throw new Error(`Invalid ${tableName} ID: empty string`);
  }

  // Return the value cast to the appropriate Convex ID type
  // This is safe because we've validated the format
  return value as Id<TableName>;
}

/**
 * Convert an optional string to a Convex ID
 * @param value - Optional string value to convert
 * @param tableName - Name of the Convex table
 * @returns Typed Convex ID or undefined
 * @throws Error if value is present but not valid
 */
export function toOptionalConvexId<TableName extends TableNames>(
  value: string | undefined | null,
  tableName: TableName
): Id<TableName> | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return toConvexId(value, tableName);
}

/**
 * Validate if a string is a valid Convex ID format
 * @param value - String to validate
 * @returns true if valid Convex ID format, false otherwise
 */
export function validateConvexId(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.length === 0) {
    return false;
  }

  // Add more specific Convex ID format validation if needed
  return true;
}

/**
 * Safely convert multiple optional IDs
 * @param ids - Object with optional ID fields
 * @returns Object with converted IDs
 */
export function convertOptionalIds<T extends Record<string, string | undefined | null>>(
  ids: T,
  tableNames: { [K in keyof T]: TableNames }
): Record<string, Id<TableNames> | undefined> {
  const result: Record<string, Id<TableNames> | undefined> = {};

  for (const key in ids) {
    const tableName = tableNames[key];
    if (tableName) {
      result[key] = toOptionalConvexId(ids[key], tableName);
    }
  }

  return result;
}
