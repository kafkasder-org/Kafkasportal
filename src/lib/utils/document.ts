/**
 * Document Utility Functions
 * Helper functions for working with documents that support both Convex and Appwrite
 */

import type { Document } from '@/types/database';

/**
 * Get document ID (supports both Convex _id and Appwrite $id)
 */
export function getDocumentId(doc: Document | null | undefined): string {
  if (!doc) return '';
  return doc.$id || doc._id || doc.id || '';
}

/**
 * Get document creation time (supports both Convex and Appwrite)
 */
export function getDocumentCreatedAt(doc: Document | null | undefined): Date | null {
  if (!doc) return null;
  if (doc.$createdAt) {
    return new Date(doc.$createdAt);
  }
  if (doc._creationTime) {
    return new Date(doc._creationTime);
  }
  return null;
}

/**
 * Get document updated time (supports both Convex and Appwrite)
 */
export function getDocumentUpdatedAt(doc: Document | null | undefined): Date | null {
  if (!doc) return null;
  if (doc.$updatedAt) {
    return new Date(doc.$updatedAt);
  }
  if (doc._updatedAt) {
    return new Date(doc._updatedAt);
  }
  return null;
}

/**
 * Check if document is from Appwrite
 */
export function isAppwriteDocument(doc: Document | null | undefined): boolean {
  if (!doc) return false;
  return !!doc.$id;
}

/**
 * Check if document is from Convex
 */
export function isConvexDocument(doc: Document | null | undefined): boolean {
  if (!doc) return false;
  return !!doc._id && !doc.$id;
}

