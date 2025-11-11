import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

// Get all documents for a beneficiary
export const getBeneficiaryDocuments = query({
  args: {
    beneficiaryId: v.id('beneficiaries'),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('files')
      .withIndex('by_beneficiary', (q) => q.eq('beneficiary_id', args.beneficiaryId))
      .collect();

    // Get file URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return documentsWithUrls;
  },
});

// Get file by storage ID
export const getFileByStorageId = query({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query('files')
      .withIndex('by_storage_id', (q) => q.eq('storageId', args.storageId))
      .first();

    if (!file) {
      return null;
    }

    const url = await ctx.storage.getUrl(args.storageId);

    return {
      ...file,
      url,
    };
  },
});

// Create document metadata
export const createDocument = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    bucket: v.string(),
    storageId: v.id('_storage'),
    beneficiaryId: v.id('beneficiaries'),
    documentType: v.optional(v.string()),
    uploadedBy: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert('files', {
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      bucket: args.bucket,
      storageId: args.storageId,
      beneficiary_id: args.beneficiaryId,
      document_type: args.documentType || 'other',
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
    });

    return documentId;
  },
});

// Delete document
export const deleteDocument = mutation({
  args: {
    documentId: v.id('files'),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete from storage
    await ctx.storage.delete(document.storageId);

    // Delete metadata
    await ctx.db.delete(args.documentId);

    return { success: true };
  },
});

// Get upload URL
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create new document version
export const createDocumentVersion = mutation({
  args: {
    originalDocumentId: v.id('files'),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    storageId: v.id('_storage'),
    versionNotes: v.optional(v.string()),
    uploadedBy: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const originalDoc = await ctx.db.get(args.originalDocumentId);
    if (!originalDoc) {
      throw new Error('Original document not found');
    }

    // Determine version number
    const currentVersion = (originalDoc as typeof originalDoc & { version?: number }).version ?? 1;
    const newVersion = currentVersion + 1;

    // Update original document to point to new version
    await ctx.db.patch(args.originalDocumentId, {
      version: newVersion,
      storageId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
    });

    // Create version history entry
    const versionId = await ctx.db.insert('document_versions', {
      document_id: args.originalDocumentId,
      version_number: currentVersion,
      storage_id: originalDoc.storageId,
      file_name: originalDoc.fileName,
      file_size: originalDoc.fileSize,
      file_type: originalDoc.fileType,
      version_notes: args.versionNotes,
      created_by: originalDoc.uploadedBy,
      created_at: originalDoc.uploadedAt || new Date().toISOString(),
    });

    return {
      documentId: args.originalDocumentId,
      versionId,
      newVersion,
    };
  },
});

// Get document version history
export const getDocumentVersions = query({
  args: {
    documentId: v.id('files'),
  },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query('document_versions')
      .withIndex('by_document', (q) => q.eq('document_id', args.documentId))
      .collect();

    // Get URLs for each version
    const versionsWithUrls = await Promise.all(
      versions.map(async (version) => ({
        ...version,
        url: await ctx.storage.getUrl(version.storage_id),
      }))
    );

    return versionsWithUrls.sort((a, b) => b.version_number - a.version_number);
  },
});

// Rollback to previous version
export const rollbackToVersion = mutation({
  args: {
    documentId: v.id('files'),
    versionId: v.id('document_versions'),
    uploadedBy: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    const version = await ctx.db.get(args.versionId);

    if (!document || !version) {
      throw new Error('Document or version not found');
    }

    // Create new version entry for current state before rollback
    const currentVersion = document.version || 1;
    await ctx.db.insert('document_versions', {
      document_id: args.documentId,
      version_number: currentVersion,
      storage_id: document.storageId,
      file_name: document.fileName,
      file_size: document.fileSize,
      file_type: document.fileType,
      version_notes: 'Auto-saved before rollback',
      created_by: document.uploadedBy,
      created_at: document.uploadedAt || new Date().toISOString(),
    });

    // Update document to rollback version
    await ctx.db.patch(args.documentId, {
      storageId: version.storage_id,
      fileName: version.file_name,
      fileSize: version.file_size,
      fileType: version.file_type,
      version: currentVersion + 1,
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
    });

    return { success: true, newVersion: currentVersion + 1 };
  },
});

// Update document metadata (tags, category, access control)
export const updateDocumentMetadata = mutation({
  args: {
    documentId: v.id('files'),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    accessLevel: v.optional(
      v.union(v.literal('public'), v.literal('private'), v.literal('restricted'))
    ),
    sharedWith: v.optional(v.array(v.id('users'))),
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    const document = await ctx.db.get(documentId);

    if (!document) {
      throw new Error('Document not found');
    }

    await ctx.db.patch(documentId, updates);
    return { success: true };
  },
});

// Search documents with filters
export const searchDocuments = query({
  args: {
    searchTerm: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    uploadedBy: v.optional(v.id('users')),
    beneficiaryId: v.optional(v.id('beneficiaries')),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let documents = await ctx.db.query('files').collect();

    // Apply filters
    if (args.beneficiaryId) {
      documents = documents.filter((doc) => doc.beneficiary_id === args.beneficiaryId);
    }

    if (args.uploadedBy) {
      documents = documents.filter((doc) => doc.uploadedBy === args.uploadedBy);
    }

    if (args.category) {
      documents = documents.filter((doc) => doc.category === args.category);
    }

    if (args.tags && args.tags.length > 0) {
      documents = documents.filter(
        (doc) => doc.tags && args.tags!.some((tag) => doc.tags!.includes(tag))
      );
    }

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(term) ||
          (doc.description && doc.description.toLowerCase().includes(term))
      );
    }

    if (args.startDate) {
      const start = new Date(args.startDate);
      documents = documents.filter((doc) => new Date(doc.uploadedAt || 0) >= start);
    }

    if (args.endDate) {
      const end = new Date(args.endDate);
      documents = documents.filter((doc) => new Date(doc.uploadedAt || 0) <= end);
    }

    // Apply limit
    const limit = args.limit || 50;
    const limited = documents.slice(0, limit);

    // Get URLs for documents
    const documentsWithUrls = await Promise.all(
      limited.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return documentsWithUrls;
  },
});

// Get documents by category
export const getDocumentsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('files')
      .filter((q) => q.eq(q.field('category'), args.category))
      .take(args.limit || 50);

    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return documentsWithUrls;
  },
});

// Get shared documents for a user
export const getSharedDocuments = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('files')
      .filter((q) =>
        q.or(
          q.eq(q.field('uploadedBy'), args.userId),
          q.and(
            q.neq(q.field('uploadedBy'), args.userId),
            // Check if user is in sharedWith array
            q.eq(q.field('accessLevel'), 'restricted')
          )
        )
      )
      .collect();

    // Filter to only include documents where user is in sharedWith
    const sharedDocs = documents.filter(
      (doc) => doc.sharedWith && doc.sharedWith.includes(args.userId)
    );

    const documentsWithUrls = await Promise.all(
      sharedDocs.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );

    return documentsWithUrls;
  },
});

// Get document statistics by category
export const getDocumentStatsByCategory = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query('files').collect();

    const stats: Record<string, { count: number; totalSize: number }> = {};

    documents.forEach((doc) => {
      const category = doc.category || 'Uncategorized';
      if (!stats[category]) {
        stats[category] = { count: 0, totalSize: 0 };
      }
      stats[category].count++;
      stats[category].totalSize += doc.fileSize;
    });

    return Object.entries(stats)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.count - a.count);
  },
});
