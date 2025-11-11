/**
 * Demo Data Creator for Convex Backend
 * Creates sample beneficiaries and donations for testing
 */

import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';

async function createDemoData() {
  console.log('🎯 Starting demo data creation...\n');

  const convex = getConvexHttp();

  try {
    // 1. Create Demo Beneficiary (İhtiyaç Sahibi)
    console.log('📝 Creating demo beneficiary...');
    const beneficiaryData = {
      name: 'Ayşe Demir',
      tc_no: '98765432109',
      phone: '+90 532 987 65 43',
      email: 'ayse.demir@example.com',
      birth_date: '1990-03-22',
      gender: 'KADIN',
      nationality: 'TC',
      religion: 'MUSLUMAN',
      marital_status: 'BEKAR',
      address: 'Gazi Osman Paşa Caddesi No:45 Daire:12',
      city: 'ISTANBUL',
      district: 'Fatih',
      neighborhood: 'Aksaray',
      family_size: 3,
      children_count: 1,
      orphan_children_count: 0,
      elderly_count: 0,
      disabled_count: 0,
      income_level: 'ORTA',
      income_source: 'IS',
      has_debt: false,
      housing_type: 'EV',
      has_vehicle: true,
      health_status: 'İYİ',
      has_chronic_illness: false,
      has_disability: false,
      has_health_insurance: true,
      education_level: 'UNIVERSITE',
      occupation: 'Öğretmen',
      employment_status: 'CALISIYOR',
      status: 'AKTIF',
      notes: 'Tek başına çocuk büyüten anne, düzenli yardıma ihtiyaç duyuyor',
    };

    try {
      const beneficiaryId = await convex.mutation(api.beneficiaries.create, beneficiaryData);
      console.log(`✅ Created beneficiary: ${beneficiaryId}\n`);
    } catch (_e: any) {
      if (_e.message.includes('already exists')) {
        console.log('⚠️ Beneficiary already exists, skipping...\n');
      } else {
        throw _e;
      }
    }

    // 2. Create Demo Donation (Regular)
    console.log('💰 Creating demo donation...');
    const donationData = {
      donor_name: 'Fatma Kaya',
      donor_phone: '+90 534 111 22 33',
      donor_email: 'fatma.kaya@example.com',
      amount: 250.00,
      currency: 'TRY',
      donation_type: 'BANKA_HAVALESI',
      payment_method: 'BANKA_HAVALESI',
      donation_purpose: 'EĞİTİM_YARDIMI',
      notes: 'Ayşe Hanımın çocuğunun eğitim masrafları için',
      receipt_number: 'REC-2024-002',
      receipt_file_id: undefined,
      status: 'completed',
    };

    try {
      const donationId = await convex.mutation(api.donations.create, donationData);
      console.log(`✅ Created donation: ${donationId}\n`);
    } catch (_e: any) {
      if (_e.message.includes('already exists') || _e.message.includes('duplicate')) {
        console.log('⚠️ Donation already exists, skipping...\n');
      } else {
        throw _e;
      }
    }

    // 3. Create Demo Task
    console.log('📋 Creating demo task...');
    try {
      const taskId = await convex.mutation(api.tasks.create, {
        title: 'Ahmet Yılmaz Ailesine Gıda Yardımı',
        description: 'Aileye 3 aylık gıda paketi hazırla ve teslim et',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigned_to: 'volunteer1',
        created_by: 'admin',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['gıda', 'acil', 'aile'],
      });
      console.log(`✅ Created task: ${taskId}\n`);
    } catch (_e) {
      console.log('⚠️ Tasks create mutation not available or failed\n');
    }

    // 4. Create Demo Message
    console.log('💬 Creating demo message...');
    try {
      const messageId = await convex.mutation(api.messages.create, {
        subject: 'Kumbara Bağışı Hakkında Bilgilendirme',
        content: 'Sayın Mehmet Özkan, bağışınız için teşekkür ederiz. Kumbara bağışınız Ahmet Yılmaz ailesine ulaştırılmıştır.',
        sender_id: 'admin',
        recipient_ids: ['user123'],
        message_type: 'INFO',
        status: 'SENT',
        priority: 'NORMAL',
      });
      console.log(`✅ Created message: ${messageId}\n`);
    } catch (_e) {
      console.log('⚠️ Messages create mutation not available or failed\n');
    }

    console.log('🎉 Demo data creation completed successfully!');
    console.log('\n📊 Created:');
    console.log('  - 1 Beneficiary (İhtiyaç Sahibi): Ayşe Demir');
    console.log('  - 1 Donation (Bağış): Fatma Kaya\'dan 250 TL');
    console.log('  - 1 Task (Görev) - skipped');
    console.log('  - 1 Message (Mesaj) - skipped');
    console.log('\n🔍 You can now check the data in the Convex dashboard or via the UI');

  } catch (error: any) {
    console.error('❌ Error creating demo data:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  createDemoData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { createDemoData };
