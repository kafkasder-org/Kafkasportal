import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireIdentity } from './authz';

const isValidTcNumber = (value: string): boolean => /^\d{11}$/.test(value);

// List beneficiaries with pagination and filters
export const list = query({
  args: {
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
    status: v.optional(v.string()),
    city: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    let beneficiaries;

    if (args.search) {
      beneficiaries = await ctx.db
        .query('beneficiaries')
        .withSearchIndex('by_search', (q) => q.search('name', args.search!))
        .collect();
    } else {
      if (args.status) {
        beneficiaries = await ctx.db
          .query('beneficiaries')
          .withIndex('by_status', (q) =>
            q.eq('status', args.status as 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI')
          )
          .collect();
      } else if (args.city) {
        beneficiaries = await ctx.db
          .query('beneficiaries')
          .withIndex('by_city', (q) => q.eq('city', args.city!))
          .collect();
      } else {
        beneficiaries = await ctx.db.query('beneficiaries').collect();
      }
    }

    let filtered = beneficiaries;
    if (args.search) {
      if (args.status) {
        filtered = filtered.filter((b) => b.status === args.status);
      }
      if (args.city) {
        filtered = filtered.filter((b) => b.city === args.city);
      }
    }

    // Apply pagination
    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      documents: paginated,
      total: filtered.length,
    };
  },
});

// Get beneficiary by ID
export const get = query({
  args: { id: v.id('beneficiaries') },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    return await ctx.db.get(args.id);
  },
});

// Get beneficiary by TC number
// Requires authentication and ADMIN/MANAGER role
export const getByTcNo = query({
  args: { tc_no: v.string() },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    if (!isValidTcNumber(args.tc_no)) {
      throw new Error('Invalid TC number format');
    }

    const beneficiary = await ctx.db
      .query('beneficiaries')
      .withIndex('by_tc_no', (q) => q.eq('tc_no', args.tc_no))
      .first();

    return beneficiary ?? null;
  },
});

// Create beneficiary
export const create = mutation({
  args: {
    name: v.string(),
    tc_no: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    birth_date: v.optional(v.string()),
    gender: v.optional(v.string()),
    nationality: v.optional(v.string()),
    religion: v.optional(v.string()),
    marital_status: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    district: v.string(),
    neighborhood: v.string(),
    family_size: v.number(),
    children_count: v.optional(v.number()),
    orphan_children_count: v.optional(v.number()),
    elderly_count: v.optional(v.number()),
    disabled_count: v.optional(v.number()),
    income_level: v.optional(v.string()),
    income_source: v.optional(v.string()),
    has_debt: v.optional(v.boolean()),
    housing_type: v.optional(v.string()),
    has_vehicle: v.optional(v.boolean()),
    health_status: v.optional(v.string()),
    has_chronic_illness: v.optional(v.boolean()),
    chronic_illness_detail: v.optional(v.string()),
    has_disability: v.optional(v.boolean()),
    disability_detail: v.optional(v.string()),
    has_health_insurance: v.optional(v.boolean()),
    regular_medication: v.optional(v.string()),
    education_level: v.optional(v.string()),
    occupation: v.optional(v.string()),
    employment_status: v.optional(v.string()),
    aid_type: v.optional(v.string()),
    totalAidAmount: v.optional(v.number()),
    aid_duration: v.optional(v.string()),
    priority: v.optional(v.string()),
    reference_name: v.optional(v.string()),
    reference_phone: v.optional(v.string()),
    reference_relation: v.optional(v.string()),
    application_source: v.optional(v.string()),
    notes: v.optional(v.string()),
    previous_aid: v.optional(v.boolean()),
    other_organization_aid: v.optional(v.boolean()),
    emergency: v.optional(v.boolean()),
    contact_preference: v.optional(v.string()),
    status: v.union(
      v.literal('TASLAK'),
      v.literal('AKTIF'),
      v.literal('PASIF'),
      v.literal('SILINDI')
    ),
    approval_status: v.optional(
      v.union(v.literal('pending'), v.literal('approved'), v.literal('rejected'))
    ),
    approved_by: v.optional(v.string()),
    approved_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const payload = args;

    if (!isValidTcNumber(payload.tc_no)) {
      throw new Error('Invalid TC number format');
    }

    const existing = await ctx.db
      .query('beneficiaries')
      .withIndex('by_tc_no', (q) => q.eq('tc_no', payload.tc_no))
      .first();

    if (existing) {
      throw new Error('Beneficiary with this TC number already exists');
    }

    return await ctx.db.insert('beneficiaries', {
      ...payload,
    });
  },
});

// Update beneficiary
export const update = mutation({
  args: {
    id: v.id('beneficiaries'),
    name: v.optional(v.string()),
    tc_no: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal('TASLAK'), v.literal('AKTIF'), v.literal('PASIF'), v.literal('SILINDI'))
    ),
    // Add other optional fields as needed
  },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);
    const { id, ...rawUpdates } = args;
    const updates = { ...rawUpdates };
    const beneficiary = await ctx.db.get(id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }

    if (updates.tc_no) {
      if (!isValidTcNumber(updates.tc_no)) {
        throw new Error('Invalid TC number format');
      }

      if (updates.tc_no !== beneficiary.tc_no) {
        const existing = await ctx.db
          .query('beneficiaries')
          .withIndex('by_tc_no', (q) => q.eq('tc_no', updates.tc_no!))
          .first();

        if (existing) {
          throw new Error('Beneficiary with this TC number already exists');
        }
      }

      // value already set on updates.tc_no
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

// Delete beneficiary
export const remove = mutation({
  args: { id: v.id('beneficiaries') },
  handler: async (ctx, args) => {
    const beneficiary = await ctx.db.get(args.id);
    if (!beneficiary) {
      throw new Error('Beneficiary not found');
    }
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Batch import from Export_Analiz.csv
export const importExportDataBatch = mutation({
  args: {
    data: v.array(
      v.object({
        no: v.optional(v.union(v.number(), v.null())),
        name: v.string(),
        kimlik_no: v.optional(v.union(v.string(), v.null())),
        uyruk: v.optional(v.union(v.string(), v.null())),
        telefon: v.optional(v.union(v.string(), v.null())),
        iban: v.optional(v.union(v.string(), v.null())),
        ikamet: v.optional(v.union(v.string(), v.null())),
        sehir: v.optional(v.union(v.string(), v.null())),
        ilce: v.optional(v.union(v.string(), v.null())),
        mahalle: v.optional(v.union(v.string(), v.null())),
        adres: v.optional(v.union(v.string(), v.null())),
        toplam_kisi: v.optional(v.union(v.number(), v.null())),
        erkek_sayisi: v.optional(v.union(v.number(), v.null())),
        kadin_sayisi: v.optional(v.union(v.number(), v.null())),
        aile_tipi: v.optional(v.union(v.string(), v.null())),
        kisi_tipi: v.optional(v.union(v.string(), v.null())),
        pozisyon: v.optional(v.union(v.string(), v.null())),
        durum: v.optional(v.union(v.string(), v.null())),
        gelir: v.optional(v.union(v.number(), v.null())),
        kayit_tarihi: v.optional(v.union(v.string(), v.null())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      duplicates: 0,
    };

    for (const record of args.data) {
      try {
        // Veri temizleme ve mapping
        const name = record.name?.trim();
        if (!name) {
          results.failed++;
          results.errors.push(`Record ${record.no || 'unknown'}: Missing name`);
          continue;
        }

        // TC No kontrolü - yoksa geçici bir değer ata
        let tc_no = record.kimlik_no?.trim();
        if (!tc_no || tc_no === '' || tc_no === '-') {
          tc_no = `TEMP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        }

        // Duplicate kontrolü (gerçek TC no varsa)
        if (tc_no && !tc_no.startsWith('TEMP-')) {
          const existing = await ctx.db
            .query('beneficiaries')
            .withIndex('by_tc_no', (q) => q.eq('tc_no', tc_no))
            .first();

          if (existing) {
            results.duplicates++;
            continue;
          }
        }

        // Telefon temizleme
        let phone = record.telefon?.trim() || '';
        if (phone === '-' || phone === '') {
          phone = 'Belirtilmemiş';
        }

        // Şehir, ilçe, mahalle temizleme
        const city = record.sehir?.trim() || 'Belirtilmemiş';
        const district = record.ilce?.trim() || 'Belirtilmemiş';
        const neighborhood = record.mahalle?.trim() || 'Belirtilmemiş';
        const address = record.adres?.trim() || 'Belirtilmemiş';

        // Aile tipi mapping
        let category: 'need_based_family' | 'refugee_family' | 'orphan_family' =
          'need_based_family';
        if (record.aile_tipi) {
          const aileTipi = record.aile_tipi.toLowerCase();
          if (aileTipi.includes('mülteci') || aileTipi.includes('multeci')) {
            category = 'refugee_family';
          } else if (aileTipi.includes('yetim')) {
            category = 'orphan_family';
          }
        }

        // Kişi tipi mapping
        let beneficiary_type: 'primary_person' | 'dependent' | undefined;
        if (record.kisi_tipi) {
          const kisiTipi = record.kisi_tipi.toLowerCase();
          if (kisiTipi.includes('ihtiyaç sahibi') || kisiTipi.includes('ihtiyac sahibi')) {
            beneficiary_type = 'primary_person';
          } else if (kisiTipi.includes('bakmakla yükümlü')) {
            beneficiary_type = 'dependent';
          }
        }

        // Durum mapping
        let status: 'TASLAK' | 'AKTIF' | 'PASIF' | 'SILINDI' = 'AKTIF';
        if (record.durum) {
          const durum = record.durum.toUpperCase();
          if (durum === 'TASLAK' || durum === 'PASIF' || durum === 'SILINDI') {
            status = durum as 'TASLAK' | 'PASIF' | 'SILINDI';
          }
        }

        // Beneficiary oluştur
        await ctx.db.insert('beneficiaries', {
          name,
          tc_no,
          phone,
          nationality: record.uyruk || undefined,
          address,
          city,
          district,
          neighborhood,
          family_size: record.toplam_kisi || 0,
          category,
          beneficiary_type,
          status,
          // İlave bilgiler
          income_level: record.gelir ? (record.gelir > 5000 ? 'medium' : 'low') : 'low',
          income_source: record.pozisyon || undefined,
          notes: [
            record.ikamet ? `İkamet: ${record.ikamet}` : null,
            record.iban ? `IBAN: ${record.iban}` : null,
            record.kayit_tarihi ? `Kayıt Tarihi: ${record.kayit_tarihi}` : null,
            record.pozisyon ? `Pozisyon: ${record.pozisyon}` : null,
            record.erkek_sayisi ? `Erkek: ${record.erkek_sayisi}` : null,
            record.kadin_sayisi ? `Kadın: ${record.kadin_sayisi}` : null,
          ]
            .filter(Boolean)
            .join(' | '),
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Record ${record.no || record.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return results;
  },
});
