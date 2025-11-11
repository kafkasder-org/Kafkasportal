'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  X,
  Trash2,
  User,
  XCircle,
  CreditCard,
  FileText,
  Image,
  HandHeart,
  MapPin,
  Users,
  DollarSign,
  Heart,
  GraduationCap,
  AlertCircle,
  UserCheck,
  FileCheck,
  FileSignature,
  Package,
  Eye,
  TrendingUp,
  Calendar,
  Utensils,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

import { convexApiClient as api } from '@/lib/api/convex-api-client';
import type { AidApplicationDocument } from '@/types/database';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Lazy load managers for faster dialog opening
const DocumentsManager = dynamic(
  () => import('@/components/documents/DocumentsManager').then((mod) => ({ default: mod.DocumentsManager })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Yükleniyor...</span>
      </div>
    ),
    ssr: false,
  }
);

const ConsentsManager = dynamic(
  () => import('@/components/consents/ConsentsManager').then((mod) => ({ default: mod.ConsentsManager })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

const BankAccountsManager = dynamic(
  () => import('@/components/bank-accounts/BankAccountsManager').then((mod) => ({ default: mod.BankAccountsManager })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

const DependentsManager = dynamic(
  () => import('@/components/dependents/DependentsManager').then((mod) => ({ default: mod.DependentsManager })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

// Stub function for Mernis TC Kimlik validation
const checkMernis = async (tcNo: string) => {
  // Basic TC Kimlik validation
  if (!tcNo || tcNo.length !== 11) {
    return {
      success: false,
      error: 'TC Kimlik numarası 11 haneli olmalıdır',
      data: { isValid: false, message: 'TC Kimlik numarası 11 haneli olmalıdır' }
    };
  }

  // Validate format
  if (!/^\d{11}$/.test(tcNo)) {
    return {
      success: false,
      error: 'TC Kimlik numarası sadece rakam içermelidir',
      data: { isValid: false, message: 'TC Kimlik numarası sadece rakam içermelidir' }
    };
  }

  return {
    success: true,
    error: null,
    data: { isValid: true, message: 'TC Kimlik numarası geçerli' }
  };
};

// Analytics Components
import { AidHistoryChart } from '@/components/beneficiary-analytics/AidHistoryChart';
import type { BeneficiaryDocument } from '@/types/database';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Extended Form validation schema for comprehensive social assistance form
const docSchema = z.object({
  // Temel Bilgiler
  name: z.string().min(2, 'İsim zorunludur'),
  firstName: z.string().min(2, 'Ad zorunludur').optional(),
  lastName: z.string().min(2, 'Soyad zorunludur').optional(),
  tc_no: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{11}$/.test(val), { message: 'TC Kimlik No 11 haneli olmalıdır' }),
  ikamet_no: z.string().optional(),
  pasaport_no: z.string().optional(),
  phone: z.string().optional(),

  nationality: z.string().optional(),
  religion: z.string().optional(),
  marital_status: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  family_size: z.coerce.number().min(1).max(20).optional(),
  status: z.enum(['TASLAK', 'AKTIF', 'PASIF', 'SILINDI']),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),

  // Kimlik Bilgileri
  birth_date: z.string().optional(),
  birth_place: z.string().optional(),
  gender: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),

  // Aile Bilgileri
  children_count: z.coerce.number().min(0).max(20).optional(),
  orphan_children_count: z.coerce.number().min(0).max(20).optional(),
  elderly_count: z.coerce.number().min(0).max(20).optional(),
  disabled_count: z.coerce.number().min(0).max(20).optional(),

  // Ekonomik Durum
  income_level: z.string().optional(),
  income_source: z.string().optional(),
  monthly_income: z.coerce.number().min(0).optional(),
  monthly_expense: z.coerce.number().min(0).optional(),
  has_debt: z.boolean().optional(),
  debt_amount: z.coerce.number().min(0).optional(),
  has_vehicle: z.boolean().optional(),
  housing_type: z.string().optional(),
  social_security: z.string().optional(),
  work_status: z.string().optional(),
  occupation: z.string().optional(),

  // Sağlık Bilgileri
  blood_type: z.string().optional(),
  has_chronic_illness: z.boolean().optional(),
  chronic_illness_detail: z.string().optional(),
  has_disability: z.boolean().optional(),
  disability_detail: z.string().optional(),
  has_health_insurance: z.boolean().optional(),
  regular_medication: z.string().optional(),
  health_status: z.string().optional(),

  // Eğitim Bilgileri
  education_level: z.string().optional(),
  school_name: z.string().optional(),
  student_status: z.string().optional(),

  // Acil Durum İletişim
  emergency_contact_name: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  emergency_contact_phone: z.string().optional(),

  // Referans Bilgileri
  reference_name: z.string().optional(),
  reference_phone: z.string().optional(),
  reference_relation: z.string().optional(),
  application_source: z.string().optional(),

  // Yardım Talebi
  aid_type: z.string().optional(),
  aid_duration: z.string().optional(),
  priority: z.string().optional(),
  emergency: z.boolean().optional(),
  previous_aid: z.boolean().optional(),
  other_organization_aid: z.boolean().optional(),
  totalAidAmount: z.coerce.number().min(0).optional(),

  // Ek Bilgiler
  notes: z.string().optional(),
  contact_preference: z.string().optional(),
});

type FormValues = z.infer<typeof docSchema>;

export default function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState<string>('');
  const [identityDocType, setIdentityDocType] = useState<'tc' | 'ikamet' | 'pasaport'>('tc');

  // Sample data for cascading dropdowns
  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];
  const districts: Record<string, string[]> = {
    'İstanbul': ['Kadıköy', 'Beşiktaş', 'Şişli', 'Beyoğlu', 'Üsküdar', 'Bakırköy'],
    'Ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Sincan'],
    'İzmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Alsancak'],
    'Bursa': ['Nilüfer', 'Osmangazi', 'Yıldırım'],
    'Antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı'],
    'Adana': ['Seyhan', 'Çukurova', 'Yüreğir'],
    'Konya': ['Selçuklu', 'Meram', 'Karatay'],
    'Gaziantep': ['Şahinbey', 'Şehitkamil'],
  };
  const neighborhoods: Record<string, string[]> = {
    'Kadıköy': ['Moda', 'Bahariye', 'Acıbadem', 'Fenerbahçe'],
    'Beşiktaş': ['Ortaköy', 'Bebek', 'Etiler', 'Levent'],
    'Şişli': ['Mecidiyeköy', 'Gayrettepe', 'Harbiye'],
    'Çankaya': ['Kızılay', 'Çankaya', 'Bahçelievler', 'Yenimahalle'],
  };
  const streets: Record<string, string[]> = {
    'Moda': ['Moda Caddesi', 'Bağdat Caddesi', 'Acıbadem Caddesi'],
    'Ortaköy': ['Ortaköy Caddesi', 'Bebek Caddesi'],
    'Kızılay': ['Atatürk Bulvarı', 'Kızılay Caddesi'],
  };

  const diseaseCategories = ['Kalp ve Damar', 'Solunum', 'Sindirim', 'Sinir Sistemi', 'Kanser', 'Endokrin', 'Kas-İskelet', 'Diğer'];
  const diseases: Record<string, string[]> = {
    'Kalp ve Damar': ['Hipertansiyon', 'Koroner Arter Hastalığı', 'Kalp Yetmezliği', 'Ritim Bozukluğu'],
    'Solunum': ['Astım', 'KOAH', 'Bronşit', 'Pnömoni'],
    'Sindirim': ['Gastrit', 'Ülser', 'Karaciğer Hastalığı', 'Kolon Hastalığı'],
    'Sinir Sistemi': ['Epilepsi', 'Parkinson', 'Alzheimer', 'Migren'],
    'Kanser': ['Akciğer Kanseri', 'Meme Kanseri', 'Prostat Kanseri', 'Kolorektal Kanser'],
    'Endokrin': ['Diyabet', 'Tiroid Hastalığı', 'Obezite'],
    'Kas-İskelet': ['Romatoid Artrit', 'Osteoporoz', 'Fibromiyalji'],
    'Diğer': ['Kronik Böbrek Hastalığı', 'Anemi', 'Depresyon'],
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => api.beneficiaries.getBeneficiary(id),
  });

  const beneficiary = data?.data as BeneficiaryDocument | undefined;

  // Fetch aid applications for this beneficiary - MUST be before early returns
  const { data: aidApplicationsData } = useQuery({
    queryKey: ['aid-applications', id],
    queryFn: async () => {
      const response = await fetch(`/api/aid-applications?beneficiary_id=${id}`);
      const result = await response.json();
      return result;
    },
    enabled: !!id,
  });

  const aidApplications: AidApplicationDocument[] = (aidApplicationsData?.data as AidApplicationDocument[]) || [];
  const aidApplicationsCount = aidApplications.length;

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<BeneficiaryDocument>) =>
      api.beneficiaries.updateBeneficiary(id, payload),
    onSuccess: (res) => {
      if (!res.error) {
        toast.success('✅ İhtiyaç sahibi bilgileri başarıyla güncellendi', {
          description: `${beneficiary?.name} için yapılan değişiklikler kaydedildi.`,
          duration: 3000,
        });
        refetch();
      } else {
        toast.error('❌ Güncelleme başarısız', {
          description: res.error || 'Bir hata oluştu. Lütfen tekrar deneyin.',
          duration: 5000,
        });
      }
    },
    onError: () => toast.error('❌ Bağlantı hatası', {
      description: 'Güncelleme sırasında bir hata oluştu. İnternet bağlantınızı kontrol edin.',
      duration: 5000,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.beneficiaries.deleteBeneficiary(id),
    onSuccess: (res) => {
      if (!res.error) {
        toast.success('🗑️ İhtiyaç sahibi kaydı başarıyla silindi', {
          description: `${beneficiary?.name} için tüm bilgiler sistemden kaldırıldı.`,
          duration: 4000,
        });
        router.push('/yardim/ihtiyac-sahipleri');
      } else {
        toast.error('❌ Silme işlemi başarısız', {
          description: res.error || 'Kayıt silinirken bir hata oluştu.',
          duration: 5000,
        });
      }
    },
    onError: () => toast.error('❌ Bağlantı hatası', {
      description: 'Silme sırasında bir hata oluştu. İnternet bağlantınızı kontrol edin.',
      duration: 5000,
    }),
  });

  const mernisMutation = useMutation({
    mutationFn: (identity: string) => checkMernis(identity),
    onSuccess: (res) => {
      if (res.success && res.data) {
        if (res.data.isValid) {
          toast.success('✅ Mernis Doğrulama Başarılı', {
            description: res.data.message || 'TC Kimlik numarası geçerli.',
            duration: 3000,
          });
        } else {
          toast.error('❌ Mernis Doğrulama Başarısız', {
            description: res.data.message || 'TC Kimlik numarası geçersiz.',
            duration: 5000,
          });
        }
      } else {
        toast.error('⚠️ Mernis Kontrolü Başarısız', {
          description: res.error || 'Mernis servisi şu anda kullanılamıyor.',
          duration: 5000,
        });
      }
    },
    onError: () => toast.error('❌ Bağlantı Hatası', {
      description: 'Mernis servisi ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.',
      duration: 5000,
    }),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
    setValue,
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(docSchema) as any,
    defaultValues: beneficiary
      ? {
          name: beneficiary.name || '',
          firstName: beneficiary.name?.split(' ')[0] || '',
          lastName: beneficiary.name?.split(' ').slice(1).join(' ') || '',
          tc_no: beneficiary.tc_no || '',
          phone: beneficiary.phone || '',

          nationality: beneficiary.nationality || '',
          religion: beneficiary.religion || '',
          marital_status: beneficiary.marital_status || '',
          address: beneficiary.address || '',
          city: beneficiary.city || '',
          district: beneficiary.district || '',
          neighborhood: beneficiary.neighborhood || '',
          family_size: beneficiary.family_size ?? 1,
          status: beneficiary.status,
          approval_status: beneficiary.approval_status || 'pending',
          birth_date: beneficiary.birth_date || '',
          gender: beneficiary.gender || '',
          children_count: beneficiary.children_count ?? 0,
          orphan_children_count: beneficiary.orphan_children_count ?? 0,
          elderly_count: beneficiary.elderly_count ?? 0,
          disabled_count: beneficiary.disabled_count ?? 0,
          income_level: beneficiary.income_level || '',
          income_source: beneficiary.income_source || '',
          has_debt: beneficiary.has_debt || false,
          has_vehicle: beneficiary.has_vehicle || false,
          housing_type: beneficiary.housing_type || '',
          work_status: beneficiary.employment_status || '',
          occupation: beneficiary.occupation || '',
          has_chronic_illness: beneficiary.has_chronic_illness || false,
          chronic_illness_detail: beneficiary.chronic_illness_detail || '',
          has_disability: beneficiary.has_disability || false,
          disability_detail: beneficiary.disability_detail || '',
          has_health_insurance: beneficiary.has_health_insurance || false,
          regular_medication: beneficiary.regular_medication || '',
          health_status: beneficiary.health_status || '',
          education_level: beneficiary.education_level || '',
          reference_name: beneficiary.reference_name || '',
          reference_phone: beneficiary.reference_phone || '',
          reference_relation: beneficiary.reference_relation || '',
          application_source: beneficiary.application_source || '',
          aid_type: beneficiary.aid_type || '',
          aid_duration: beneficiary.aid_duration || '',
          priority: beneficiary.priority || '',
          emergency: beneficiary.emergency || false,
          previous_aid: beneficiary.previous_aid || false,
          other_organization_aid: beneficiary.other_organization_aid || false,
          notes: beneficiary.notes || '',
          contact_preference: beneficiary.contact_preference || '',
        }
      : undefined,
  });

  const onSubmit = (values: FormValues) => {
    // Combine firstName and lastName into name for BeneficiaryDocument
    const { firstName, lastName, ...rest } = values;
    const payload: Partial<BeneficiaryDocument> = {
      ...rest,
      name: firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : values.name || beneficiary?.name || '',
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !beneficiary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="outline" onClick={() => router.back()} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <Card className="border-red-200/60 bg-red-50/50">
            <CardContent className="pt-4">
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  İhtiyaç Sahibi Bulunamadı
                </h3>
                <p className="text-red-700">Aradığınız kayıt sistemde mevcut değil.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const STAGE_LABELS = {
    draft: { label: 'Taslak', color: 'bg-muted text-muted-foreground' },
    under_review: { label: 'İnceleme', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
    ongoing: { label: 'Devam Ediyor', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
    completed: { label: 'Tamamlandı', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  };

  const modalCards = [
    {
      id: 'documents',
      title: 'Dokümanlar',
      icon: FileText,
      count: 0, // TODO: Get actual document count
      description: 'Kimlik, belgeler ve diğer dokümanları görüntüle ve yönet',
    },
    {
      id: 'photos',
      title: 'Fotoğraflar',
      icon: Image,
      count: 0,
      description: 'Kişi ve aile fotoğraflarını görüntüle',
    },
    {
      id: 'aid-requests',
      title: 'Yapılan Yardımlar',
      icon: Package,
      count: 0,
      description: 'Yapılan yardımları görüntüle ve takip et',
    },
    {
      id: 'aid-applications',
      title: 'Yardım Başvuruları',
      icon: HandHeart,
      count: aidApplicationsCount,
      description: 'Bu kişiye ait yardım başvurularını görüntüle',
    },
    {
      id: 'bank',
      title: 'Banka Hesapları',
      icon: CreditCard,
      count: 0,
      description: 'Bağlı banka hesaplarını görüntüle ve yönet',
    },
    {
      id: 'consent',
      title: 'Rıza Beyanları',
      icon: FileSignature,
      count: 0,
      description: 'Rıza beyanlarını görüntüle ve yönet',
    },
    {
      id: 'dependent-people',
      title: 'Baktığı Kişiler',
      icon: Eye,
      count: 0,
      description: 'Bakmakla yükümlü olduğu kişileri görüntüle',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      {/* Premium Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <div className="flex items-center gap-3 min-w-0">
      <Button variant="ghost" onClick={() => router.back()} size="sm" className="gap-2 hover:bg-slate-100/80 shrink-0">
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Geri</span>
      </Button>
      <Separator orientation="vertical" className="h-6 hidden sm:block" />
      <div className="min-w-0">
      <h1 className="text-base sm:text-lg font-semibold text-slate-800 tracking-tight truncate">
      İhtiyaç Sahibi Detay - {beneficiary.name}
      </h1>
      </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
              <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:bg-red-50/80 border-red-200/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              >
              {deleteMutation.isPending ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Kaldır
                  </>
                )}
              </Button>
              <Button
              type="submit"
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={isSubmitting || updateMutation.isPending}
              >
              {isSubmitting || updateMutation.isPending ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Kaydet
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 hover:bg-slate-100/80" onClick={() => router.back()}>
                <X className="h-4 w-4" />
                Kapat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 xl:gap-6">
      {/* Left Column - Main Form */}
      <div className="col-span-1 xl:col-span-9 space-y-4 xl:space-y-6">
            {/* Temel Bilgiler */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Temel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-2">
                    <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg border border-slate-200/60 flex items-center justify-center">
                      <User className="h-12 w-12 text-slate-400" />
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">Fotoğraf</p>
                  </div>

                  <div className="col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Ad *</Label>
                    <Input
                      {...register('firstName')}
                        className={`h-10 border-slate-200/60 focus:border-blue-500/50 transition-colors ${
                          errors.firstName ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Soyad *</Label>
                      <Input
                        {...register('lastName')}
                        className={`h-10 border-slate-200/60 focus:border-blue-500/50 transition-colors ${
                          errors.lastName ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                      />
                      {errors.lastName && (
                        <p className="text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Uyruk</Label>
                      <Controller
                        control={control}
                        name="nationality"
                        render={({ field }) => (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TÜRK">Türk</SelectItem>
                              <SelectItem value="ÇEÇEN">Çeçen</SelectItem>
                              <SelectItem value="DAĞISTAN">Dağıstan</SelectItem>
                              <SelectItem value="KABARDEY">Kabardey</SelectItem>
                              <SelectItem value="ABAZA">Abaza</SelectItem>
                              <SelectItem value="KARAÇAY">Karaçay</SelectItem>
                              <SelectItem value="İNGUŞ">İnguş</SelectItem>
                              <SelectItem value="DİĞER">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Kimlik Belgesi</Label>
                      <Select
                        value={identityDocType}
                        onValueChange={(value: 'tc' | 'ikamet' | 'pasaport') => {
                          setIdentityDocType(value);
                          setValue('tc_no', '');
                          setValue('ikamet_no', '');
                          setValue('pasaport_no', '');
                        }}
                      >
                        <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tc">TC Kimlik No</SelectItem>
                          <SelectItem value="ikamet">İkamet No</SelectItem>
                          <SelectItem value="pasaport">Pasaport No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        {identityDocType === 'tc' ? 'TC Kimlik No' : identityDocType === 'ikamet' ? 'İkamet No' : 'Pasaport No'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          {...register(identityDocType === 'tc' ? 'tc_no' : identityDocType === 'ikamet' ? 'ikamet_no' : 'pasaport_no')}
                          className="h-10 border-slate-200/60 focus:border-blue-500/50"
                          placeholder={identityDocType === 'tc' ? '11 haneli TC Kimlik No' : identityDocType === 'ikamet' ? 'İkamet No' : 'Pasaport No'}
                        />
                        {identityDocType === 'tc' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1 border-slate-200/60 hover:bg-slate-100/80"
                            onClick={() => {
                              const tc = getValues('tc_no') || '';
                              if (!tc) {
                                toast.error('TC Kimlik No giriniz');
                                return;
                              }
                              mernisMutation.mutate(tc);
                            }}
                            disabled={mernisMutation.isPending}
                          >
                            {mernisMutation.isPending ? '...' : 'Mernis'}
                          </Button>
                        )}
                      </div>
                      {errors.tc_no && identityDocType === 'tc' && <p className="text-xs text-red-600">{errors.tc_no.message}</p>}
                      {errors.ikamet_no && identityDocType === 'ikamet' && <p className="text-xs text-red-600">{errors.ikamet_no.message}</p>}
                      {errors.pasaport_no && identityDocType === 'pasaport' && <p className="text-xs text-red-600">{errors.pasaport_no.message}</p>}
                    </div>

                    <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Telefon</Label>
                    <Input
                        {...register('phone')}
                        className={`h-10 border-slate-200/60 focus:border-blue-500/50 transition-colors ${
                          errors.phone ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                        placeholder="+90 5XX XXX XX XX"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 animate-in slide-in-from-top-1 duration-200 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kimlik Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Kimlik Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Doğum Tarihi</Label>
                    <Input type="date" {...register('birth_date')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Doğum Yeri</Label>
                    <Input {...register('birth_place')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Cinsiyet</Label>
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ERKEK">Erkek</SelectItem>
                            <SelectItem value="KADIN">Kadın</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Din</Label>
                    <Input {...register('religion')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Baba Adı</Label>
                    <Input {...register('father_name')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Anne Adı</Label>
                    <Input {...register('mother_name')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Medeni Durum</Label>
                    <Controller
                      control={control}
                      name="marital_status"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BEKAR">Bekar</SelectItem>
                            <SelectItem value="EVLI">Evli</SelectItem>
                            <SelectItem value="BOŞANMIŞ">Boşanmış</SelectItem>
                            <SelectItem value="DUL">Dul</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* İletişim ve Adres Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  İletişim ve Adres Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Şehir</Label>
                    <Controller
                      control={control}
                      name="city"
                      render={({ field }) => (
                        <Select
                          value={field.value || selectedCity || ''}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCity(value);
                            setSelectedDistrict('');
                            setSelectedNeighborhood('');
                            setValue('district', '');
                            setValue('neighborhood', '');
                            setValue('street', '');
                          }}
                        >
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Şehir seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">İlçe</Label>
                    <Controller
                      control={control}
                      name="district"
                      render={({ field }) => (
                        <Select
                          value={field.value || selectedDistrict || ''}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedDistrict(value);
                            setSelectedNeighborhood('');
                            setValue('neighborhood', '');
                            setValue('street', '');
                          }}
                          disabled={!selectedCity && !getValues('city')}
                        >
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="İlçe seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {(districts[selectedCity || getValues('city') || ''] || []).map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Mahalle/Köy</Label>
                    <Controller
                      control={control}
                      name="neighborhood"
                      render={({ field }) => (
                        <Select
                          value={field.value || selectedNeighborhood || ''}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedNeighborhood(value);
                            setValue('street', '');
                          }}
                          disabled={!selectedDistrict && !getValues('district')}
                        >
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Mahalle seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {(neighborhoods[selectedDistrict || getValues('district') || ''] || []).map((neighborhood) => (
                              <SelectItem key={neighborhood} value={neighborhood}>
                                {neighborhood}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Sokak</Label>
                    <Controller
                      control={control}
                      name="street"
                      render={({ field }) => (
                        <Select
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          disabled={!selectedNeighborhood && !getValues('neighborhood')}
                        >
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Sokak seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {(streets[selectedNeighborhood || getValues('neighborhood') || ''] || []).map((street) => (
                              <SelectItem key={street} value={street}>
                                {street}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Ailedeki Kişi Sayısı</Label>
                    <Controller
                      control={control}
                      name="family_size"
                      render={({ field }) => (
                        <Select
                          value={(field.value ?? 1).toString()}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Açık Adres (Bina No, Daire No vb.)</Label>
                  <Textarea {...register('address')} rows={3} className="resize-none text-sm border-slate-200/60 focus:border-blue-500/50" />
                </div>
              </CardContent>
            </Card>

            {/* Aile Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Aile Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Çocuk Sayısı</Label>
                    <Input type="number" {...register('children_count')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" max="20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Yetim Çocuk Sayısı</Label>
                    <Input type="number" {...register('orphan_children_count')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" max="20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Yaşlı Sayısı (65+)</Label>
                    <Input type="number" {...register('elderly_count')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" max="20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Engelli Sayısı</Label>
                    <Input type="number" {...register('disabled_count')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" max="20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ekonomik Durum */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Ekonomik Durum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Gelir Durumu</Label>
                    <Controller
                      control={control}
                      name="income_level"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-3000">0 - 3.000 TL</SelectItem>
                            <SelectItem value="3000-5000">3.000 - 5.000 TL</SelectItem>
                            <SelectItem value="5000-8000">5.000 - 8.000 TL</SelectItem>
                            <SelectItem value="8000+">8.000+ TL</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Gelir Kaynağı</Label>
                    <Input {...register('income_source')} className="h-10 border-slate-200/60 focus:border-blue-500/50" placeholder="İş, sosyal yardım, vb." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Aylık Gelir (TL)</Label>
                    <Input type="number" {...register('monthly_income')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Aylık Gider (TL)</Label>
                    <Input type="number" {...register('monthly_expense')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">İş Durumu</Label>
                    <Controller
                      control={control}
                      name="work_status"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CALISMIYOR">Çalışmıyor</SelectItem>
                            <SelectItem value="CALISIYOR">Çalışıyor</SelectItem>
                            <SelectItem value="EMEKLI">Emekli</SelectItem>
                            <SelectItem value="OGRENCI">Öğrenci</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Meslek</Label>
                    <Input {...register('occupation')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Sosyal Güvenlik</Label>
                    <Controller
                      control={control}
                      name="social_security"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VAR">Var</SelectItem>
                            <SelectItem value="YOK">Yok</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Konut Durumu</Label>
                    <Controller
                      control={control}
                      name="housing_type"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EV">Ev Sahibi</SelectItem>
                            <SelectItem value="KIRALIK">Kiralık</SelectItem>
                            <SelectItem value="BARINMA_MERKEZI">Barınma Merkezi</SelectItem>
                            <SelectItem value="DIGER">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2 pt-2">
                    <Controller
                      control={control}
                      name="has_debt"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Borç Var</Label>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Controller
                      control={control}
                      name="has_vehicle"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Araç Var</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sağlık Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Sağlık Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Kan Grubu</Label>
                    <Controller
                      control={control}
                      name="blood_type"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A_POZITIF">A+</SelectItem>
                            <SelectItem value="A_NEGATIF">A-</SelectItem>
                            <SelectItem value="B_POZITIF">B+</SelectItem>
                            <SelectItem value="B_NEGATIF">B-</SelectItem>
                            <SelectItem value="AB_POZITIF">AB+</SelectItem>
                            <SelectItem value="AB_NEGATIF">AB-</SelectItem>
                            <SelectItem value="O_POZITIF">O+</SelectItem>
                            <SelectItem value="O_NEGATIF">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Sağlık Durumu</Label>
                    <Controller
                      control={control}
                      name="health_status"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IYI">İyi</SelectItem>
                            <SelectItem value="ORTA">Orta</SelectItem>
                            <SelectItem value="KOTU">Kötü</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="has_chronic_illness"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Kronik Hastalık Var</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="has_disability"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Engellilik Durumu Var</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="has_health_insurance"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Sağlık Sigortası Var</Label>
                  </div>
                </div>
                {getValues('has_chronic_illness') && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Hastalık Kategorisi</Label>
                        <Select
                          value={selectedDiseaseCategory}
                          onValueChange={(value) => {
                            setSelectedDiseaseCategory(value);
                            setValue('chronic_illness_detail', '');
                          }}
                        >
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Kategori seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            {diseaseCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">Hastalık</Label>
                        <Controller
                          control={control}
                          name="chronic_illness_detail"
                          render={({ field }) => (
                            <Select
                              value={field.value || ''}
                              onValueChange={field.onChange}
                              disabled={!selectedDiseaseCategory}
                            >
                              <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                                <SelectValue placeholder="Hastalık seçiniz" />
                              </SelectTrigger>
                              <SelectContent>
                                {(diseases[selectedDiseaseCategory] || []).map((disease) => (
                                  <SelectItem key={disease} value={disease}>
                                    {disease}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {getValues('has_disability') && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Engellilik Detayı</Label>
                    <Textarea {...register('disability_detail')} rows={2} className="resize-none text-sm border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Düzenli Kullanılan İlaçlar</Label>
                  <Textarea {...register('regular_medication')} rows={2} className="resize-none text-sm border-slate-200/60 focus:border-blue-500/50" placeholder="İlaç adları ve dozları" />
                </div>
              </CardContent>
            </Card>

            {/* Eğitim Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Eğitim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Eğitim Durumu</Label>
                    <Controller
                      control={control}
                      name="education_level"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OKUMA_YAZMA_BILMIYOR">Okuma Yazma Bilmiyor</SelectItem>
                            <SelectItem value="OKUMA_YAZMA_BILIYOR">Okuma Yazma Biliyor</SelectItem>
                            <SelectItem value="ILKOKUL">İlkokul</SelectItem>
                            <SelectItem value="ORTAOKUL">Ortaokul</SelectItem>
                            <SelectItem value="LISE">Lise</SelectItem>
                            <SelectItem value="UNIVERSITE">Üniversite</SelectItem>
                            <SelectItem value="YUKSEK_LISANS">Yüksek Lisans</SelectItem>
                            <SelectItem value="DOKTORA">Doktora</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium text-slate-700">Okul Adı (Öğrenci ise)</Label>
                    <Input {...register('school_name')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acil Durum İletişim */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Acil Durum İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Acil Durum İletişim Adı</Label>
                    <Input {...register('emergency_contact_name')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Yakınlık Derecesi</Label>
                    <Input {...register('emergency_contact_relation')} className="h-10 border-slate-200/60 focus:border-blue-500/50" placeholder="Eş, kardeş, vb." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Telefon</Label>
                    <Input {...register('emergency_contact_phone')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referans Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Referans Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Referans Adı</Label>
                    <Input {...register('reference_name')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Referans Telefon</Label>
                    <Input {...register('reference_phone')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Yakınlık</Label>
                    <Input {...register('reference_relation')} className="h-10 border-slate-200/60 focus:border-blue-500/50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Başvuru Kaynağı</Label>
                    <Input {...register('application_source')} className="h-10 border-slate-200/60 focus:border-blue-500/50" placeholder="Nasıl öğrendi?" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yardım Talebi */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <HandHeart className="h-5 w-5" />
                  Yardım Talebi Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Yardım Türü</Label>
                    <Input {...register('aid_type')} className="h-10 border-slate-200/60 focus:border-blue-500/50" placeholder="Nakit, gıda, giyim, vb." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Yardım Süresi</Label>
                    <Input {...register('aid_duration')} className="h-10 border-slate-200/60 focus:border-blue-500/50" placeholder="3 ay, 6 ay, vb." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Öncelik</Label>
                    <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <Select value={field.value || ''} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DUSUK">Düşük</SelectItem>
                            <SelectItem value="ORTA">Orta</SelectItem>
                            <SelectItem value="YUKSEK">Yüksek</SelectItem>
                            <SelectItem value="ACIL">Acil</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Toplam Yardım Tutarı (TL)</Label>
                    <Input type="number" {...register('totalAidAmount')} className="h-10 border-slate-200/60 focus:border-blue-500/50" min="0" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="emergency"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Acil Durum</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="previous_aid"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Daha Önce Yardım Aldı</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      control={control}
                      name="other_organization_aid"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label className="text-sm font-medium text-slate-700 cursor-pointer">Başka Kurumdan Yardım Alıyor</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Durum ve Onay */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">Durum ve Onay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium text-slate-700">Kayıt Durumu:</Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="TASLAK" id="taslak" />
                            <Label htmlFor="taslak" className="text-sm font-normal text-slate-700 cursor-pointer">
                              Taslak
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="AKTIF" id="aktif" />
                            <Label htmlFor="aktif" className="text-sm font-normal text-slate-700 cursor-pointer">
                              Aktif
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PASIF" id="pasif" />
                            <Label htmlFor="pasif" className="text-sm font-normal text-slate-700 cursor-pointer">
                              Pasif
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SILINDI" id="silindi" />
                            <Label htmlFor="silindi" className="text-sm font-normal text-slate-700 cursor-pointer">
                              Silindi
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Onay Durumu</Label>
                    <Controller
                      control={control}
                      name="approval_status"
                      render={({ field }) => (
                        <Select value={field.value || 'pending'} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 w-40 border-slate-200/60 focus:border-blue-500/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="approved">Onaylandı</SelectItem>
                            <SelectItem value="rejected">Reddedildi</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ek Notlar */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">Ek Notlar</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Genel Notlar</Label>
                  <Textarea {...register('notes')} rows={4} className="resize-none text-sm border-slate-200/60 focus:border-blue-500/50" placeholder="Ek bilgiler, gözlemler, özel durumlar..." />
                </div>
              </CardContent>
            </Card>

            {/* Analytics Summary */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Genel İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {beneficiary.family_size || 1}
                    </div>
                    <div className="text-sm text-muted-foreground">Aile Büyüklüğü</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {beneficiary.children_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Çocuk Sayısı</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {beneficiary.totalAidAmount ? `${beneficiary.totalAidAmount.toLocaleString('tr-TR')} ₺` : '0 ₺'}
                    </div>
                    <div className="text-sm text-muted-foreground">Toplam Yardım</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {beneficiary.priority === 'ACIL' ? 'Acil' :
                       beneficiary.priority === 'YUKSEK' ? 'Yüksek' :
                       beneficiary.priority === 'ORTA' ? 'Orta' : 'Düşük'}
                    </div>
                    <div className="text-sm text-muted-foreground">Öncelik</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kayıt Bilgileri */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-semibold text-slate-800">Kayıt Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kayıt Tarihi:</span>
                    <span className="ml-2 font-medium text-slate-700">
                      {new Date(beneficiary._creationTime).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Son Güncelleme:</span>
                    <span className="ml-2 font-medium text-slate-700">
                      {new Date(beneficiary._updatedAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 6 Square Modal Cards */}
          <div className="col-span-1 xl:col-span-3 order-first xl:order-last">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-3 xl:gap-4">
              {modalCards.map((card) => (
                <Dialog key={card.id} open={openModal === card.id} onOpenChange={(open) => setOpenModal(open ? card.id : null)}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 aspect-square">
                      <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
                          <card.icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-sm">{card.title}</h3>
                          {card.count > 0 && (
                            <Badge variant="secondary" className="mt-2">
                              {card.count}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  {card.id === 'documents' ? (
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{card.title}</DialogTitle>
                        <DialogDescription>{card.description}</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 min-h-[200px]">
                        <DocumentsManager beneficiaryId={id} />
                      </div>
                    </DialogContent>
                  ) : card.id === 'consent' ? (
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{card.title}</DialogTitle>
                        <DialogDescription>{card.description}</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 min-h-[200px]">
                        <ConsentsManager beneficiaryId={id} />
                      </div>
                    </DialogContent>
                  ) : card.id === 'bank' ? (
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{card.title}</DialogTitle>
                        <DialogDescription>{card.description}</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 min-h-[200px]">
                        <BankAccountsManager beneficiaryId={id} />
                      </div>
                    </DialogContent>
                  ) : card.id === 'dependent-people' ? (
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{card.title}</DialogTitle>
                        <DialogDescription>{card.description}</DialogDescription>
                      </DialogHeader>
                      <div className="py-4 min-h-[200px]">
                        <DependentsManager beneficiaryId={id} />
                      </div>
                    </DialogContent>
                  ) : (
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{card.title}</DialogTitle>
                        <DialogDescription>{card.description}</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground">Bu bölüm yakında aktif olacaktır.</p>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Modal Components */}
      {openModal === 'aid-requests' ? (
        <Dialog open={true} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yapılan Yardımlar</DialogTitle>
              <DialogDescription>
                Yapılan yardımları görüntüle ve takip et
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <AidHistoryChart beneficiaryId={id} />
            </div>
          </DialogContent>
        </Dialog>
      ) : openModal === 'aid-applications' ? (
        <Dialog open={true} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yardım Başvuruları</DialogTitle>
              <DialogDescription>
                Bu kişiye ait yardım başvurularını görüntüle ve yönet
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {aidApplications.length === 0 ? (
                <div className="text-center py-8">
                  <HandHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Henüz başvuru bulunmuyor</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Bu kişi için henüz yardım başvurusu oluşturulmamış.
                  </p>
                  <Link href={`/yardim/basvurular?beneficiary_id=${id}`}>
                    <Button className="mt-4" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      Yeni Başvuru Oluştur
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {aidApplications.map((app) => (
                    <Card key={app._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{app.applicant_name}</h3>
                              <Badge variant="outline">
                                {app.applicant_type === 'person'
                                  ? 'Kişi'
                                  : app.applicant_type === 'organization'
                                    ? 'Kurum'
                                    : 'Partner'}
                              </Badge>
                              <Badge className={STAGE_LABELS[app.stage].color}>
                                {STAGE_LABELS[app.stage].label}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(app.application_date).toLocaleDateString('tr-TR')}</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              {app.one_time_aid && app.one_time_aid > 0 && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Tek Seferlik</p>
                                    <p className="font-semibold">{app.one_time_aid.toLocaleString('tr-TR')} ₺</p>
                                  </div>
                                </div>
                              )}
                              {app.regular_financial_aid && app.regular_financial_aid > 0 && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Düzenli Mali</p>
                                    <p className="font-semibold">{app.regular_financial_aid.toLocaleString('tr-TR')} ₺</p>
                                  </div>
                                </div>
                              )}
                              {app.regular_food_aid && app.regular_food_aid > 0 && (
                                <div className="flex items-center gap-2">
                                  <Utensils className="h-4 w-4 text-orange-600" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Düzenli Gıda</p>
                                    <p className="font-semibold">{app.regular_food_aid.toLocaleString('tr-TR')} ₺</p>
                                  </div>
                                </div>
                              )}
                              {app.in_kind_aid && app.in_kind_aid > 0 && (
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-purple-600" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Ayni Yardım</p>
                                    <p className="font-semibold">{app.in_kind_aid.toLocaleString('tr-TR')} ₺</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {app.description && (
                              <p className="text-sm text-muted-foreground mb-2">{app.description}</p>
                            )}
                          </div>
                          <Link href={`/yardim/basvurular/${app._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Detay
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex justify-center mt-4">
                    <Link href={`/yardim/basvurular?beneficiary_id=${id}`}>
                      <Button variant="outline">
                        <Package className="mr-2 h-4 w-4" />
                        Tüm Başvuruları Görüntüle
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      ) : openModal ? (
        <Dialog open={true} onOpenChange={() => setOpenModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {openModal === 'photos' && 'Fotoğraflar'}
                {openModal === 'bank' && 'Banka Hesapları'}
                {openModal === 'consent' && 'Rıza Beyanları'}
                {openModal === 'dependent-people' && 'Baktığı Kişiler'}
              </DialogTitle>
              <DialogDescription>
                {openModal === 'photos' && 'Kişi ve aile fotoğraflarını görüntüle'}
                {openModal === 'bank' && 'Bağlı banka hesaplarını görüntüle ve yönet'}
                {openModal === 'consent' && 'Rıza beyanlarını görüntüle ve yönet'}
                {openModal === 'dependent-people' && 'Bakmakla yükümlü olduğu kişileri görüntüle'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Bu bölüm yakında aktif olacaktır. İlgili bilgiler burada görüntülenecek.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </form>
  );
}
