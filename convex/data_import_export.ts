import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { Doc } from './_generated/dataModel';

type ExportableCollection =
  | 'users'
  | 'beneficiaries'
  | 'donations'
  | 'finance_records'
  | 'tasks'
  | 'meetings';
type ExportableDoc = Doc<ExportableCollection>;

// Export data from any collection
export const exportCollectionData = query({
  args: {
    collectionName: v.union(
      v.literal('users'),
      v.literal('beneficiaries'),
      v.literal('donations'),
      v.literal('finance_records'),
      v.literal('tasks'),
      v.literal('meetings')
    ),
    filters: v.optional(
      v.object({
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        status: v.optional(v.string()),
      })
    ),
    format: v.optional(v.union(v.literal('json'), v.literal('csv'))),
  },
  handler: async (ctx, args) => {
    const { collectionName, filters, format = 'json' } = args;

    // Fetch data based on collection
    let data: ExportableDoc[] = [];

    switch (collectionName) {
      case 'users':
        data = await ctx.db.query('users').collect();
        break;
      case 'beneficiaries':
        data = await ctx.db.query('beneficiaries').collect();
        break;
      case 'donations':
        data = await ctx.db.query('donations').collect();
        break;
      case 'finance_records':
        data = await ctx.db.query('finance_records').collect();
        break;
      case 'tasks':
        data = await ctx.db.query('tasks').collect();
        break;
      case 'meetings':
        data = await ctx.db.query('meetings').collect();
        break;
    }

    // Apply filters if provided
    if (filters) {
      if (filters.startDate) {
        data = data.filter((item: ExportableDoc) => {
          const itemDate = new Date(
            (item as { created_at?: string; transaction_date?: string; donation_date?: string })
              .created_at ||
              (item as { transaction_date?: string }).transaction_date ||
              (item as { donation_date?: string }).donation_date ||
              0
          );
          return itemDate >= new Date(filters.startDate!);
        });
      }
      if (filters.endDate) {
        data = data.filter((item: ExportableDoc) => {
          const itemDate = new Date(
            (item as { created_at?: string; transaction_date?: string; donation_date?: string })
              .created_at ||
              (item as { transaction_date?: string }).transaction_date ||
              (item as { donation_date?: string }).donation_date ||
              0
          );
          return itemDate <= new Date(filters.endDate!);
        });
      }
      if (filters.status) {
        data = data.filter(
          (item: ExportableDoc) => (item as { status?: string }).status === filters.status
        );
      }
    }

    return {
      collection: collectionName,
      count: data.length,
      data,
      exportedAt: new Date().toISOString(),
      format,
    };
  },
});

// Batch import data validation
export const validateImportData = query({
  args: {
    collectionName: v.string(),
    data: v.array(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const { collectionName, data } = args;
    const errors: Array<{ row: number; field: string; message: string }> = [];
    const warnings: Array<{ row: number; field: string; message: string }> = [];

    // Validation rules per collection
    data.forEach((item, index: number) => {
      const rowNum = index + 1;

      // Common validations
      if (collectionName === 'beneficiaries') {
        if (!item.name) {
          errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
        }
        if (
          !item.tc_number ||
          (typeof item.tc_number === 'string' && item.tc_number.length !== 11)
        ) {
          errors.push({ row: rowNum, field: 'tc_number', message: 'TC number must be 11 digits' });
        }
        if (item.phone && typeof item.phone === 'string' && !item.phone.match(/^\+90\d{10}$/)) {
          warnings.push({
            row: rowNum,
            field: 'phone',
            message: 'Phone format should be +90XXXXXXXXXX',
          });
        }
      }

      if (collectionName === 'donations') {
        if (!item.donor_name) {
          errors.push({ row: rowNum, field: 'donor_name', message: 'Donor name is required' });
        }
        if (!item.amount || (typeof item.amount === 'number' && item.amount <= 0)) {
          errors.push({ row: rowNum, field: 'amount', message: 'Amount must be positive' });
        }
      }

      if (collectionName === 'finance_records') {
        if (
          !item.record_type ||
          (typeof item.record_type === 'string' &&
            !['income', 'expense'].includes(item.record_type))
        ) {
          errors.push({
            row: rowNum,
            field: 'record_type',
            message: 'Record type must be income or expense',
          });
        }
        if (!item.amount || (typeof item.amount === 'number' && item.amount <= 0)) {
          errors.push({ row: rowNum, field: 'amount', message: 'Amount must be positive' });
        }
      }
    });

    return {
      valid: errors.length === 0,
      totalRows: data.length,
      errors,
      warnings,
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
      },
    };
  },
});

// Import data with validation
export const importData = mutation({
  args: {
    collectionName: v.union(
      v.literal('beneficiaries'),
      v.literal('donations'),
      v.literal('finance_records')
    ),
    data: v.array(v.record(v.string(), v.any())),
    mode: v.union(v.literal('insert'), v.literal('update'), v.literal('upsert')),
    importedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { collectionName, data, mode, importedBy } = args;
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i] as Record<string, unknown> & { _id?: string; tc_number?: string };
        // const rowNum = i + 1;

        if (mode === 'insert') {
          // Insert new record
          // Remove _id and other metadata fields before inserting
          const {
            _id,
            created_at: _created_at,
            updated_at: _updated_at,
            imported_by: _imported_by,
            updated_by: _updated_by,
            ...cleanItem
          } = item as Record<string, unknown>;
          // Type assertion needed for dynamic collection insertion
          await ctx.db.insert(collectionName, cleanItem as never);
          results.inserted++;
        } else if (mode === 'update' && item._id) {
          // Update existing record
          const {
            _id,
            created_at: _created_at,
            imported_by: _imported_by,
            ...updateItem
          } = item as Record<string, unknown>;
          await ctx.db.patch(_id as never, updateItem);
          results.updated++;
        } else if (mode === 'upsert') {
          // Check if record exists (by unique field)
          let existing: Doc<'beneficiaries'> | null = null;

          if (collectionName === 'beneficiaries' && item.tc_number) {
            const beneficiaries = await ctx.db.query('beneficiaries').collect();
            existing =
              beneficiaries.find(
                (b: Doc<'beneficiaries'>) =>
                  (b as unknown as { tc_number?: string }).tc_number === item.tc_number
              ) ?? null;
          }

          if (existing) {
            const {
              _id,
              created_at: _created_at,
              imported_by: _imported_by,
              ...updateItem
            } = item as Record<string, unknown>;
            await ctx.db.patch(existing._id, updateItem as never);
            results.updated++;
          } else {
            const {
              _id,
              created_at: _created_at,
              updated_at: _updated_at,
              imported_by: _imported_by,
              updated_by: _updated_by,
              ...cleanItem
            } = item as Record<string, unknown>;
            // Type assertion needed for dynamic collection insertion
            await ctx.db.insert(collectionName, cleanItem as never);
            results.inserted++;
          }
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log import activity using CREATE action
    await ctx.db.insert('audit_logs', {
      userId: importedBy,
      userName: 'System', // Could be fetched from user record if needed
      action: 'CREATE' as const,
      resource: `import_${collectionName}`,
      resourceId: `import_${Date.now()}`,
      metadata: {
        mode,
        total_rows: data.length,
        inserted: results.inserted,
        updated: results.updated,
        failed: results.failed,
      },
      timestamp: new Date().toISOString(),
    });

    return results;
  },
});

// Get import history from audit logs
export const getImportHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const logs = await ctx.db.query('audit_logs').order('desc').take(limit);

    return logs.filter((log) => log.resource.startsWith('import_'));
  },
});

// Create backup snapshot
export const createBackupSnapshot = mutation({
  args: {
    collections: v.array(v.string()),
    createdBy: v.id('users'),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { collections, createdBy, description } = args;
    const snapshotData: Record<string, Record<string, unknown>[]> = {};

    // Collect data from each collection
    for (const collectionName of collections) {
      try {
        const data = await ctx.db.query(collectionName as ExportableCollection).collect();
        snapshotData[collectionName] = data;
      } catch (error) {
        console.error(`Error backing up ${collectionName}:`, error);
      }
    }

    // Save snapshot metadata using audit logs
    await ctx.db.insert('audit_logs', {
      userId: createdBy,
      userName: 'System', // Could be fetched from user record if needed
      action: 'CREATE' as const,
      resource: 'backup_snapshot',
      resourceId: `snapshot_${Date.now()}`,
      metadata: {
        collections,
        description: description || `Backup created on ${new Date().toISOString()}`,
        record_count: Object.values(snapshotData).reduce((sum, arr) => sum + arr.length, 0),
        size_bytes: JSON.stringify(snapshotData).length,
      },
      timestamp: new Date().toISOString(),
    });

    return {
      snapshotCreated: true,
      collections: collections.length,
      totalRecords: Object.values(snapshotData).reduce((sum, arr) => sum + arr.length, 0),
    };
  },
});

// List backup snapshots from audit logs
export const listBackupSnapshots = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const logs = await ctx.db.query('audit_logs').order('desc').take(limit);

    return logs.filter((log) => log.resource === 'backup_snapshot');
  },
});
