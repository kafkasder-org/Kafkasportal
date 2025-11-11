'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  useForm,
  useWatch,
  type ControllerRenderProps,
  type Control,
  type Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { KumbaraCreateInput } from '@/lib/validations/kumbara';
import { kumbaraCreateSchema } from '@/lib/validations/kumbara';
import { FileUpload } from '@/components/ui/file-upload';

interface KumbaraFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function KumbaraForm({ onSuccess, onCancel }: KumbaraFormProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<KumbaraCreateInput>({
    resolver: zodResolver(kumbaraCreateSchema) as Resolver<KumbaraCreateInput>,
    defaultValues: {
      donor_name: '',
      donor_phone: '',
      amount: 0,
      currency: 'TRY',
      donation_type: 'Kumbara',
      donation_purpose: 'Kumbara Bağışı',
      payment_method: 'Nakit',
      receipt_number: '',
      kumbara_location: '',
      kumbara_institution: '',
      collection_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      is_kumbara: true,
      notes: '',
    },
    mode: 'onChange',
  });

  // Handle file upload - memoized for performance
  const handleFileSelect = useCallback(
    (file: File | null, sanitizedFilename?: string) => {
      setUploadedFile(file);
      if (file) {
        const fileName = sanitizedFilename || file.name;
        setUploadedFileName(fileName);
        form.setValue('receipt_file_id', fileName, { shouldValidate: true });
      } else {
        setUploadedFileName('');
        form.setValue('receipt_file_id', undefined, { shouldValidate: false });
      }
    },
    [form]
  );

  const { mutate: createKumbaraDonation, isPending } = useMutation({
    mutationFn: async (data: KumbaraCreateInput) => {
      const response = await fetch('/api/kumbara', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = error.error || 'Kumbara bağışı oluşturulamadı';
        const errorDetails = error.details
          ? Array.isArray(error.details)
            ? error.details.join(', ')
            : error.details
          : '';
        throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
      }

      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['kumbara-donations'] });

      // Show success message with QR code
      if (response.data?.qr_code) {
        toast.success(
          <div className="space-y-2">
            <p>Kumbara bağışı başarıyla kaydedildi!</p>
            <p className="text-sm">QR Kod oluşturuldu. Kumbara detaylarını görmek için tıklayın.</p>
          </div>,
          {
            duration: 5000,
          }
        );
      } else {
        toast.success('Kumbara bağışı başarıyla kaydedildi');
      }

      // Reset form
      form.reset();
      setUploadedFile(null);
      setUploadedFileName('');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    },
  });

  // Form completion progress - memoized for performance
  // Use useWatch hook instead of form.watch() for React Compiler compatibility
  const watchedFields = useWatch({
    control: form.control,
    name: [
      'donor_name',
      'donor_phone',
      'amount',
      'currency',
      'kumbara_location',
      'kumbara_institution',
      'collection_date',
      'receipt_number',
    ] as const,
  });

  // Watch currency separately for type safety
  const currentCurrency =
    (useWatch({
      control: form.control,
      name: 'currency',
      defaultValue: 'TRY',
    }) as 'TRY' | 'USD' | 'EUR') || 'TRY';

  const requiredFields = useMemo(
    () =>
      [
        'donor_name',
        'donor_phone',
        'amount',
        'currency',
        'kumbara_location',
        'kumbara_institution',
        'collection_date',
        'receipt_number',
      ] as const,
    []
  );

  const progress = useMemo(() => {
    // watchedFields is an array, access by index
    const fieldValues = [
      watchedFields[0], // donor_name
      watchedFields[1], // donor_phone
      watchedFields[2], // amount
      watchedFields[3], // currency
      watchedFields[4], // kumbara_location
      watchedFields[5], // kumbara_institution
      watchedFields[6], // collection_date
      watchedFields[7], // receipt_number
    ];

    const completedFields = fieldValues.filter((value) => {
      return value !== undefined && value !== null && value !== '';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }, [watchedFields, requiredFields]);

  // Currency symbol helper - memoized
  const getCurrencySymbol = useCallback((currency: string) => {
    switch (currency) {
      case 'TRY':
        return '₺';
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return '₺';
    }
  }, []);

  // Handle coordinate updates - memoized
  const handleCoordinateChange = useCallback(
    (
      field: ControllerRenderProps<KumbaraCreateInput, 'location_coordinates'>,
      type: 'lat' | 'lng',
      value: string
    ) => {
      const currentValue = field.value;
      const currentLat = currentValue?.lat;
      const currentLng = currentValue?.lng;
      const numValue = value.trim() === '' ? undefined : parseFloat(value);

      if (value.trim() === '') {
        field.onChange(undefined);
        return;
      }

      if (numValue === undefined || isNaN(numValue)) {
        return;
      }

      const newLat = type === 'lat' ? numValue : currentLat;
      const newLng = type === 'lng' ? numValue : currentLng;

      if (newLat !== undefined && newLng !== undefined && !isNaN(newLat) && !isNaN(newLng)) {
        field.onChange({ lat: newLat, lng: newLng });
      }
    },
    []
  );

  const onSubmit = useCallback(
    async (data: KumbaraCreateInput) => {
      try {
        const finalData = { ...data };

        // Upload file if present
        if (uploadedFile) {
          try {
            // Get CSRF token
            const csrfResponse = await fetch('/api/csrf');
            const { token } = await csrfResponse.json();

            const formData = new FormData();
            formData.append('file', uploadedFile);
            formData.append('bucket', 'receipts');

            const uploadResponse = await fetch('/api/storage/upload', {
              method: 'POST',
              headers: {
                'X-CSRF-Token': token,
              },
              body: formData,
            });

            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              if (uploadResult.success && uploadResult.data?.fileId) {
                finalData.receipt_file_id = uploadResult.data.fileId;
              }
            } else {
              const error = await uploadResponse.json().catch(() => ({}));
              toast.error(`Dosya yükleme hatası: ${error.error || 'Bilinmeyen hata'}`);
              return;
            }
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            toast.error('Dosya yükleme işlemi başarısız');
            return;
          }
        }

        // Clean up location coordinates - only send if both lat and lng are valid
        if (finalData.location_coordinates) {
          const { lat, lng } = finalData.location_coordinates;
          if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
            finalData.location_coordinates = undefined;
          }
        }

        createKumbaraDonation(finalData);
      } catch (_error) {
        console.error('Error creating kumbara donation:', _error);
        toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    },
    [uploadedFile, createKumbaraDonation]
  );

  return (
    <div className="w-full">
      <div className="mb-2 pb-2 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <span className="text-lg">🐷</span>
              Yeni Kumbara Bağışı
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Formu doldurunuz. <span className="text-red-500 font-semibold">*</span> zorunlu
            </p>
          </div>
          {/* Progress Indicator */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs font-medium text-muted-foreground">%{progress}</div>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
          {/* Bağışçı Bilgileri */}
          <div className="space-y-2 p-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-md border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">👤</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Bağışçı Bilgileri
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="donor_name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Bağışçı Adı <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ahmet Yılmaz"
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="donor_phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Telefon <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="5XX XXX XX XX"
                        className="h-8 text-sm"
                        maxLength={11}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="donor_email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">E-posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="ornek@email.com"
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="receipt_number"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Makbuz No <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="KB-2024-001"
                        className="h-8 text-sm font-mono"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Bağış Detayları */}
          <div className="space-y-2 p-2 bg-green-50/50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-900/30">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💰</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Bağış Detayları
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Tutar <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            field.onChange(value);
                          }}
                          placeholder="0.00"
                          className="h-8 pr-12 text-sm font-semibold"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                          {getCurrencySymbol(currentCurrency)}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="currency"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Para Birimi <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm" data-testid="currencySelect">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRY">🇹🇷 TRY (₺)</SelectItem>
                        <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                        <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="payment_method"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Ödeme <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm" data-testid="paymentMethodSelect">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nakit">💵 Nakit</SelectItem>
                        <SelectItem value="Banka Kartı">💳 Banka Kartı</SelectItem>
                        <SelectItem value="Kredi Kartı">💳 Kredi Kartı</SelectItem>
                        <SelectItem value="Havale/EFT">🏦 Havale/EFT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Kumbara Bilgileri */}
          <div className="space-y-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-md border border-blue-200 dark:border-blue-900/30">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🏦</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Kumbara Bilgileri
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="kumbara_location"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Lokasyon <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ofis Giriş, Market" className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="kumbara_institution"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Kurum/Adres <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABC A.Ş. - Merkez Mah."
                        className="h-8 text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="collection_date"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Tarih <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full h-8 pl-2 text-xs text-left font-normal justify-start',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-1.5 h-3 w-3" />
                            {field.value ? (
                              format(new Date(field.value), 'dd.MM.yyyy', { locale: tr })
                            ) : (
                              <span>Tarih seçiniz</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : new Date()}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, 'yyyy-MM-dd'));
                            }
                          }}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">
                      Durum <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm" data-testid="statusSelect">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Beklemede</SelectItem>
                        <SelectItem value="completed">✅ Tamamlandı</SelectItem>
                        <SelectItem value="cancelled">❌ İptal Edildi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Konum Bilgileri - Harita olmadan */}
          <div className="space-y-2 p-2 bg-green-50/50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-900/30">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📍</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Konum (Opsiyonel)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="location_address"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">Adres</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Merkez Mah. No:123" className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="location_coordinates"
                render={({ field }) => {
                  const currentLat = field.value?.lat;
                  const currentLng = field.value?.lng;

                  return (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Koordinatlar</FormLabel>
                      <div className="flex gap-1.5">
                        <Input
                          placeholder="Lat"
                          className="h-8 text-xs"
                          type="number"
                          step="any"
                          value={currentLat !== undefined && currentLat !== null ? currentLat : ''}
                          onChange={(e) => handleCoordinateChange(field, 'lat', e.target.value)}
                        />
                        <Input
                          placeholder="Lng"
                          className="h-8 text-xs"
                          type="number"
                          step="any"
                          value={currentLng !== undefined && currentLng !== null ? currentLng : ''}
                          onChange={(e) => handleCoordinateChange(field, 'lng', e.target.value)}
                        />
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          {/* Alt Bölüm: Notlar ve Belgeler */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Notlar */}
            <div className="space-y-1 p-1.5 bg-amber-50/50 dark:bg-amber-900/10 rounded border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center gap-1">
                <span className="text-xs">📝</span>
                <h3 className="text-[10px] font-medium text-gray-900 dark:text-gray-100">Notlar</h3>
              </div>
              <FormField
                control={form.control as unknown as Control<KumbaraCreateInput>}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mb-0">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="..."
                        rows={1}
                        className="resize-none text-xs h-8 py-1"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Dosya Yükleme */}
            <div className="space-y-1 p-1.5 bg-purple-50/50 dark:bg-purple-900/10 rounded border border-purple-200 dark:border-purple-900/30">
              <div className="flex items-center gap-1">
                <span className="text-xs">📎</span>
                <h3 className="text-[10px] font-medium text-gray-900 dark:text-gray-100">Belge</h3>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="image/*,.pdf"
                maxSize={10}
                placeholder="Seç"
                disabled={isPending}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'application/pdf']}
                allowedExtensions={['jpg', 'jpeg', 'png', 'webp', 'pdf']}
                className="space-y-1"
                compact={true}
              />
              {uploadedFileName && (
                <div className="text-[10px] text-green-600 dark:text-green-400 flex items-center gap-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span className="truncate">{uploadedFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
              className="flex-1 h-8 text-xs font-semibold"
              data-testid="saveButton"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <span className="mr-1.5">💾</span>
                  Kaydet
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="h-8 px-4 text-xs"
              data-testid="cancelButton"
            >
              <span className="mr-1.5">✖️</span>
              İptal
            </Button>
          </div>

          {/* Form Validation Summary */}
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-0.5">
                    Hataları düzeltin
                  </p>
                  <ul className="text-xs text-red-700 dark:text-red-300 space-y-0.5">
                    {Object.entries(form.formState.errors)
                      .slice(0, 2)
                      .map(([field, error]) => (
                        <li key={field}>
                          •{' '}
                          {typeof error === 'object' && error !== null && 'message' in error
                            ? (error as { message?: string }).message || `${field} hatalı`
                            : `${field} hatalı`}
                        </li>
                      ))}
                    {Object.keys(form.formState.errors).length > 2 && (
                      <li>• +{Object.keys(form.formState.errors).length - 2} hata daha</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
