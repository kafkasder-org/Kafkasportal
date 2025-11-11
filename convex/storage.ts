import { mutation, query, action } from './_generated/server';
import { v } from 'convex/values';

/**
 * Generate upload URL for Convex fileStorage
 * This action generates a signed URL that can be used to upload files directly
 */
export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    // Generate upload URL using Convex fileStorage
    // Note: This requires Convex fileStorage to be enabled
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Store file metadata after successful upload
 * This mutation stores metadata about the uploaded file
 */
export const storeFileMetadata = mutation({
  args: {
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
    bucket: v.string(),
    storageId: v.id('_storage'), // Convex fileStorage ID
    uploadedBy: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('files', {
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      bucket: args.bucket,
      storageId: args.storageId,
      uploadedBy: args.uploadedBy,
      uploadedAt: new Date().toISOString(),
    });
  },
});

/**
 * Get file download URL from Convex fileStorage
 */
export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    // Get file URL from Convex fileStorage
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete file from Convex fileStorage
 */
export const deleteFile = action({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    // Delete file from Convex fileStorage
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});

/**
 * Get file metadata
 */
export const getFileMetadata = query({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

/**
 * Get file metadata by storage ID
 */
export const getFileMetadataByStorageId = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('files')
      .withIndex('by_storage_id', (q) => q.eq('storageId', args.storageId))
      .first();
  },
});

/**
 * Delete file metadata
 */
export const deleteFileMetadata = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error('File not found');
    }
    await ctx.db.delete(args.fileId);
    return { success: true };
  },
});

/**
 * List files by bucket
 */
export const listFilesByBucket = query({
  args: {
    bucket: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query('files')
      .withIndex('by_bucket', (q) => q.eq('bucket', args.bucket))
      .order('desc')
      .take(limit);
  },
});

/**
 * List files by user
 */
export const listFilesByUser = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query('files')
      .withIndex('by_uploaded_by', (q) => q.eq('uploadedBy', args.userId))
      .order('desc')
      .take(limit);
  },
});

/**
 * Search files by name
 */
export const searchFiles = query({
  args: {
    searchTerm: v.string(),
    bucket: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get files from specific bucket or all files
    const files = args.bucket
      ? await ctx.db
          .query('files')
          .withIndex('by_bucket', (q) => q.eq('bucket', args.bucket!))
          .collect()
      : await ctx.db.query('files').collect();

    // Filter by file name (case-insensitive)
    const filtered = files.filter((file) =>
      file.fileName.toLowerCase().includes(args.searchTerm.toLowerCase())
    );

    return filtered.slice(0, limit);
  },
});

/**
 * Get file statistics
 */
export const getFileStats = query({
  args: {},
  handler: async (ctx) => {
    const allFiles = await ctx.db.query('files').collect();

    const totalSize = allFiles.reduce((sum, file) => sum + file.fileSize, 0);
    const totalCount = allFiles.length;

    // Group by bucket
    const byBucket: Record<string, { count: number; size: number }> = {};
    for (const file of allFiles) {
      if (!byBucket[file.bucket]) {
        byBucket[file.bucket] = { count: 0, size: 0 };
      }
      byBucket[file.bucket].count++;
      byBucket[file.bucket].size += file.fileSize;
    }

    // Group by file type
    const byType: Record<string, number> = {};
    for (const file of allFiles) {
      byType[file.fileType] = (byType[file.fileType] || 0) + 1;
    }

    return {
      totalCount,
      totalSize,
      byBucket,
      byType,
    };
  },
});

/**
 * Bulk delete files
 */
export const bulkDeleteFiles = action({
  args: {
    storageIds: v.array(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const results: Array<{
      storageId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const storageId of args.storageIds) {
      try {
        await ctx.storage.delete(storageId);
        results.push({ storageId: storageId.toString(), success: true });
      } catch (error) {
        results.push({
          storageId: storageId.toString(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { results };
  },
});
