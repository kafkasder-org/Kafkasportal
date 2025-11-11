'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Table component not used in this view - using custom card layout instead
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  FileText,
  Download,
  Eye,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';

interface FinanceRecord {
  _id: string;
  record_type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description: string;
  transaction_date: string;
  payment_method?: string;
  receipt_number?: string;
  receipt_file_id?: string;
  related_to?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by: string;
  approved_by?: string;
  _creationTime: string;
}

// Category options and payment methods moved to form component (currently not used here)

const STATUS_LABELS = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' }
};

export default function IncomeExpensePage() {
  const [search, setSearch] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [dateError, setDateError] = useState('');
  const limit = 50;

  // Handle date filter change - clear custom dates when switching away from custom
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    if (value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
      setDateError('');
    }
  };

  // Handle custom date changes with validation
  const handleCustomStartDateChange = (value: string) => {
    setCustomStartDate(value);
    if (value && customEndDate) {
      const start = new Date(value);
      const end = new Date(customEndDate);
      if (start > end) {
        setDateError('Başlangıç tarihi bitiş tarihinden sonra olamaz');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleCustomEndDateChange = (value: string) => {
    setCustomEndDate(value);
    if (customStartDate && value) {
      const start = new Date(customStartDate);
      const end = new Date(value);
      if (start > end) {
        setDateError('Başlangıç tarihi bitiş tarihinden sonra olamaz');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  // Mock data for demonstration
  const { data: recordsData, isLoading } = useQuery({
    queryKey: ['finance-records', page, search, recordTypeFilter, categoryFilter, statusFilter, dateFilter, customStartDate, customEndDate],
    queryFn: () => {
      const mockRecords: FinanceRecord[] = [
        {
          _id: '1',
          record_type: 'income',
          category: 'Bağış Gelirleri',
          amount: 50000,
          currency: 'TRY',
          description: 'Yıllık bağış kampanyası geliri',
          transaction_date: '2024-12-01T00:00:00Z',
          payment_method: 'Banka Transferi',
          receipt_number: 'RCP-2024-001',
          status: 'approved',
          created_by: 'user_1',
          approved_by: 'user_2',
          _creationTime: '2024-12-01T10:00:00Z'
        },
        {
          _id: '2',
          record_type: 'expense',
          category: 'Burs Ödemeleri',
          amount: 25000,
          currency: 'TRY',
          description: 'Aralık ayı burs ödemeleri',
          transaction_date: '2024-12-05T00:00:00Z',
          payment_method: 'Banka Transferi',
          receipt_number: 'RCP-2024-002',
          status: 'approved',
          created_by: 'user_1',
          approved_by: 'user_2',
          _creationTime: '2024-12-05T09:00:00Z'
        },
        {
          _id: '3',
          record_type: 'expense',
          category: 'Ofis Giderleri',
          amount: 3000,
          currency: 'TRY',
          description: 'Aralık ayı kiralar ve faturalar',
          transaction_date: '2024-12-10T00:00:00Z',
          payment_method: 'Otomatik Ödeme',
          receipt_number: 'RCP-2024-003',
          status: 'pending',
          created_by: 'user_1',
          _creationTime: '2024-12-10T08:00:00Z'
        },
        {
          _id: '4',
          record_type: 'income',
          category: 'Kurs Gelirleri',
          amount: 12000,
          currency: 'TRY',
          description: 'Bilgisayar kursu gelirleri',
          transaction_date: '2024-11-28T00:00:00Z',
          payment_method: 'Nakit',
          status: 'approved',
          created_by: 'user_1',
          approved_by: 'user_2',
          _creationTime: '2024-11-28T15:00:00Z'
        }
      ];

      return Promise.resolve({
        data: mockRecords.filter(record => {
          const matchesSearch = !search ||
            record.description.toLowerCase().includes(search.toLowerCase()) ||
            record.category.toLowerCase().includes(search.toLowerCase()) ||
            record.receipt_number?.toLowerCase().includes(search.toLowerCase());
          const matchesType = recordTypeFilter === 'all' || record.record_type === recordTypeFilter;
          const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
          const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
          
          let matchesDate = true;
          if (dateFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            matchesDate = record.transaction_date.startsWith(today);
          } else if (dateFilter === 'thisMonth') {
            const thisMonth = new Date().toISOString().slice(0, 7);
            matchesDate = record.transaction_date.startsWith(thisMonth);
          } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
            // Validate dates before filtering
            const start = new Date(customStartDate);
            const end = new Date(customEndDate);
            if (start <= end) {
              const recordDate = new Date(record.transaction_date);
              const startDate = new Date(`${customStartDate}T00:00:00`);
              const endDate = new Date(`${customEndDate}T23:59:59`);
              matchesDate = recordDate >= startDate && recordDate <= endDate;
            } else {
              matchesDate = false; // Don't show any records if dates are invalid
            }
          }
          
          return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesDate;
        }),
        total: mockRecords.length,
      });
    },
  });

  const records: FinanceRecord[] = (recordsData?.data as FinanceRecord[]) || [];
  const total = recordsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Calculate financial statistics
  const stats = useMemo(() => {
    const totalIncome = records
      .filter(r => r.record_type === 'income' && r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const totalExpense = records
      .filter(r => r.record_type === 'expense' && r.status === 'approved')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const netIncome = totalIncome - totalExpense;
    
    const pendingIncome = records
      .filter(r => r.record_type === 'income' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);
    
    const pendingExpense = records
      .filter(r => r.record_type === 'expense' && r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalIncome,
      totalExpense,
      netIncome,
      pendingIncome,
      pendingExpense,
      totalRecords: total,
      approvedRecords: records.filter(r => r.status === 'approved').length,
    };
  }, [records, total]);

  const handleExportExcel = () => {
    const csvContent = [
      ['Rapor Türü', 'Gelir Gider Listesi'],
      ['Tarih', new Date().toLocaleDateString('tr-TR')],
      [''],
      ['KAYIT LİSTESİ'],
      ['Tarih', 'Tip', 'Kategori', 'Açıklama', 'Tutar', 'Para Birimi', 'Ödeme Yöntemi', 'Makbuz No', 'Durum'],
      ...records.map(record => [
        new Date(record.transaction_date).toLocaleDateString('tr-TR'),
        record.record_type === 'income' ? 'Gelir' : 'Gider',
        record.category,
        record.description,
        record.amount.toLocaleString('tr-TR'),
        record.currency,
        record.payment_method || '-',
        record.receipt_number || '-',
        STATUS_LABELS[record.status]?.label || record.status,
      ]),
      [''],
      ['ÖZET'],
      ['Toplam Gelir', `${stats.totalIncome.toLocaleString('tr-TR')  } ₺`],
      ['Toplam Gider', `${stats.totalExpense.toLocaleString('tr-TR')  } ₺`],
      ['Net Gelir', `${stats.netIncome.toLocaleString('tr-TR')  } ₺`],
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gelir-gider-listesi-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Gelir gider listesi Excel formatında indirildi');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gelir Gider</h1>
          <p className="text-muted-foreground mt-2">Gelir ve gider kayıtlarını yönetin</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gelir Gider</h1>
          <p className="text-muted-foreground mt-2">Gelir ve gider kayıtlarını yönetin</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Yeni Kayıt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Gelir/Gider Kaydı</DialogTitle>
                <DialogDescription>
                  Yeni bir gelir veya gider kaydı oluşturun
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground py-8">
                  Yeni kayıt formu geliştirilme aşamasındadır.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalIncome.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingIncome > 0 && `${stats.pendingIncome.toLocaleString('tr-TR')} ₺ beklemede`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.totalExpense.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingExpense > 0 && `${stats.pendingExpense.toLocaleString('tr-TR')} ₺ beklemede`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Gelir</CardTitle>
            <DollarSign className={`h-4 w-4 ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netIncome.toLocaleString('tr-TR')} ₺
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.approvedRecords} onaylı kayıt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kayıt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Toplam işlem
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Arama ve Filtreleme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Açıklama, kategori veya makbuz no"
                  className="pl-10"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="income">Gelir</SelectItem>
                  <SelectItem value="expense">Gider</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="Bağış Gelirleri">Bağış Gelirleri</SelectItem>
                  <SelectItem value="Kurs Gelirleri">Kurs Gelirleri</SelectItem>
                  <SelectItem value="Etkinlik Gelirleri">Etkinlik Gelirleri</SelectItem>
                  <SelectItem value="Burs Ödemeleri">Burs Ödemeleri</SelectItem>
                  <SelectItem value="İhtiyaç Sahibi Yardımları">İhtiyaç Sahibi Yardımları</SelectItem>
                  <SelectItem value="Ofis Giderleri">Ofis Giderleri</SelectItem>
                  <SelectItem value="Personel Giderleri">Personel Giderleri</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tarih Filtresi
              </Label>
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarih aralığı seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tarihler</SelectItem>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="thisMonth">Bu Ay</SelectItem>
                  <SelectItem value="custom">Özel Tarih Aralığı</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Inputs */}
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="customStartDate">
                      Başlangıç Tarihi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customStartDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        handleCustomStartDateChange(e.target.value);
                        setPage(1);
                      }}
                      max={customEndDate || undefined}
                      disabled={dateFilter !== 'custom'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customEndDate">
                      Bitiş Tarihi <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customEndDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        handleCustomEndDateChange(e.target.value);
                        setPage(1);
                      }}
                      min={customStartDate || undefined}
                      disabled={dateFilter !== 'custom'}
                    />
                  </div>
                </div>
              )}

              {/* Date Validation Error */}
              {dateError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {dateError}
                </p>
              )}

              {/* Apply Filter Button for Custom Dates */}
              {dateFilter === 'custom' && (
                <Button
                  onClick={() => {
                    if (!customStartDate || !customEndDate) {
                      setDateError('Başlangıç ve bitiş tarihleri gereklidir');
                      toast.error('Lütfen başlangıç ve bitiş tarihlerini seçin');
                      return;
                    }
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    if (start > end) {
                      setDateError('Başlangıç tarihi bitiş tarihinden sonra olamaz');
                      toast.error('Başlangıç tarihi bitiş tarihinden sonra olamaz');
                      return;
                    }
                    setDateError('');
                    setPage(1);
                    toast.success('Tarih filtresi uygulandı');
                  }}
                  className="w-full md:w-auto"
                  disabled={!customStartDate || !customEndDate || !!dateError}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gelir Gider Listesi</CardTitle>
          <CardDescription>Toplam {total} kayıt bulundu</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Kayıt bulunamadı</p>
              <p className="text-sm mt-2">
                {search ? 'Arama kriterlerinize uygun kayıt yok' : 'Henüz kayıt eklenmemiş'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {record.record_type === 'income' ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Badge className={STATUS_LABELS[record.status]?.color}>
                            {STATUS_LABELS[record.status]?.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{record.description}</h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(record.transaction_date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tür:</span>
                          <p className="font-medium">
                            {record.record_type === 'income' ? 'Gelir' : 'Gider'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Kategori:</span>
                          <p className="font-medium">{record.category}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tutar:</span>
                          <p className={`font-bold ${record.record_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.amount.toLocaleString('tr-TR')} ₺
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ödeme Yöntemi:</span>
                          <p className="font-medium">{record.payment_method || '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Makbuz No:</span>
                          <p className="font-medium">{record.receipt_number || '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">İlgili:</span>
                          <p className="font-medium">{record.related_to || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Görüntüle
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Edit className="h-4 w-4" />
                        Düzenle
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Sayfa {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kayıt Detayı</DialogTitle>
            <DialogDescription>
              {selectedRecord?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tür</Label>
                  <p className="font-medium">
                    {selectedRecord.record_type === 'income' ? 'Gelir' : 'Gider'}
                  </p>
                </div>
                <div>
                  <Label>Kategori</Label>
                  <p className="font-medium">{selectedRecord.category}</p>
                </div>
                <div>
                  <Label>Tutar</Label>
                  <p className="font-bold text-lg">
                    {selectedRecord.amount.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
                <div>
                  <Label>Durum</Label>
                  <Badge className={STATUS_LABELS[selectedRecord.status]?.color}>
                    {STATUS_LABELS[selectedRecord.status]?.label}
                  </Badge>
                </div>
                <div>
                  <Label>Tarih</Label>
                  <p className="font-medium">
                    {new Date(selectedRecord.transaction_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div>
                  <Label>Ödeme Yöntemi</Label>
                  <p className="font-medium">{selectedRecord.payment_method || '-'}</p>
                </div>
                <div>
                  <Label>Makbuz Numarası</Label>
                  <p className="font-medium">{selectedRecord.receipt_number || '-'}</p>
                </div>
                <div>
                  <Label>Para Birimi</Label>
                  <p className="font-medium">{selectedRecord.currency}</p>
                </div>
              </div>
              <div>
                <Label>Açıklama</Label>
                <p className="font-medium">{selectedRecord.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
