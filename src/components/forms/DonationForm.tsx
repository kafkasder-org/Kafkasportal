'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convexApiClient as api } from '@/lib/api/convex-api-client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { cn } from '@/lib/utils';

// Validation schema
const donationSchema = z.object({
  donor_name: z.string().min(2, 'Donör adı en az 2 karakter olmalıdır'),
  donor_phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  donor_email: z.string().email('Geçerli bir email adresi girin').optional().or(z.literal('')),
  amount: z.number().min(1, "Tutar 0'dan büyük olmalıdır"),
  currency: z.enum(['TRY', 'USD', 'EUR']),
  donation_type: z.string().min(2, 'Bağış türü belirtin'),
  payment_method: z.string().min(2, 'Ödeme yöntemi belirtin'),
  donation_purpose: z.string().min(2, 'Bağış amacı belirtin'),
  receipt_number: z.string().min(1, 'Makbuz numarası zorunludur'),
  notes: z.string().optional(),
  receipt_file_id: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Field validation component
interface FieldWithValidationProps {
  label: string;
  error?: string;
  validation?: 'valid' | 'invalid' | 'pending';
  required?: boolean;
  children: React.ReactNode;
  errorId?: string;
}

function FieldWithValidation({
  label,
  error,
  validation,
  required,
  children,
  errorId,
}: FieldWithValidationProps) {
  const getValidationIcon = () => {
    switch (validation) {
      case 'valid':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <Label className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
        {label}
      </Label>
      <div className="relative">
        {children}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {getValidationIcon()}
        </div>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

export function DonationForm({ onSuccess, onCancel }: DonationFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [fieldValidation, setFieldValidation] = useState<
    Record<string, 'valid' | 'invalid' | 'pending'>
  >({});

  // Real-time field validation
  const validateField = async (fieldName: keyof DonationFormData, value: unknown) => {
    try {
      await donationSchema.shape[fieldName].parseAsync(value);
      setFieldValidation((prev) => ({ ...prev, [fieldName]: 'valid' }));
    } catch {
      setFieldValidation((prev) => ({ ...prev, [fieldName]: 'invalid' }));
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      currency: 'TRY',
      amount: 0,
      status: 'pending',
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: (data: DonationFormData) => api.donations.createDonation(data),
    onSuccess: () => {
      toast.success('Bağış başarıyla kaydedildi');
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const error = err as Error;
      toast.error(`Bağış kaydedilirken hata oluştu: ${error.message}`);
    },
  });

  const onSubmit = async (data: DonationFormData) => {
    setIsSubmitting(true);
    try {
      let uploadedFileId: string | undefined = undefined;

      // Upload receipt file if provided (using direct API endpoint)
      if (receiptFile) {
        try {
          const formData = new FormData();
          formData.append('file', receiptFile);
          formData.append('bucket', 'receipts');

          const response = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            uploadedFileId = result.data?.fileId;
          }
        } catch (_error) {
          console.error('File upload error:', _error);
          // Continue without file if upload fails
        }
      }

      // Create donation with file reference
      const donationData = {
        ...data,
        receipt_file_id: uploadedFileId,
      };

      await createDonationMutation.mutateAsync(donationData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto relative">
      <CardHeader>
        <CardTitle>Yeni Bağış Ekle</CardTitle>
        <CardDescription>Bağış bilgilerini girerek yeni kayıt oluşturun</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3 p-6 bg-background rounded-lg shadow-lg border">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Bağış kaydediliyor...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Donör Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Donör Bilgileri</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWithValidation
                label="Donör Adı"
                error={errors.donor_name?.message}
                validation={fieldValidation.donor_name}
                required
                errorId="donor_name-error"
              >
                <Input
                  id="donor_name"
                  {...register('donor_name')}
                  placeholder="Ahmet Yılmaz"
                  onChange={(e) => {
                    register('donor_name').onChange(e);
                    if (e.target.value.length > 0) {
                      validateField('donor_name', e.target.value);
                    }
                  }}
                  aria-describedby={errors.donor_name ? 'donor_name-error' : undefined}
                  aria-invalid={!!errors.donor_name}
                  disabled={isSubmitting}
                />
              </FieldWithValidation>

              <FieldWithValidation
                label="Telefon"
                error={errors.donor_phone?.message}
                validation={fieldValidation.donor_phone}
                required
                errorId="donor_phone-error"
              >
                <Input
                  id="donor_phone"
                  {...register('donor_phone')}
                  placeholder="0555 123 45 67"
                  onChange={(e) => {
                    // Format Turkish phone number
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) value = value.slice(0, 10);

                    // Format as 0555 123 45 67
                    if (value.length >= 4) {
                      value = `${value.slice(0, 4)} ${value.slice(4)}`;
                    }
                    if (value.length >= 7) {
                      value = `${value.slice(0, 8)} ${value.slice(8)}`;
                    }
                    if (value.length >= 10) {
                      value = `${value.slice(0, 11)} ${value.slice(11)}`;
                    }

                    e.target.value = value;
                    register('donor_phone').onChange(e);
                    if (value.replace(/\s/g, '').length > 0) {
                      validateField('donor_phone', value.replace(/\s/g, ''));
                    }
                  }}
                  maxLength={14}
                  aria-describedby={errors.donor_phone ? 'donor_phone-error' : undefined}
                  aria-invalid={!!errors.donor_phone}
                  disabled={isSubmitting}
                />
              </FieldWithValidation>
            </div>

            <FieldWithValidation
              label="Email"
              error={errors.donor_email?.message}
              validation={fieldValidation.donor_email}
              errorId="donor_email-error"
            >
              <Input
                id="donor_email"
                type="email"
                {...register('donor_email')}
                placeholder="ahmet@example.com"
                onChange={(e) => {
                  register('donor_email').onChange(e);
                  if (e.target.value.length > 0) {
                    validateField('donor_email', e.target.value);
                  }
                }}
                aria-describedby={errors.donor_email ? 'donor_email-error' : undefined}
                aria-invalid={!!errors.donor_email}
                disabled={isSubmitting}
              />
            </FieldWithValidation>
          </div>

          {/* Bağış Bilgileri */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Bağış Bilgileri</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FieldWithValidation
                label="Tutar"
                error={errors.amount?.message}
                validation={fieldValidation.amount}
                required
                errorId="amount-error"
              >
                <Input
                  id="amount"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="1.000,00"
                  onChange={(e) => {
                    // Format currency input for Turkish locale
                    let value = e.target.value.replace(/[^\d,]/g, '');

                    // Allow only one comma
                    const parts = value.split(',');
                    if (parts.length > 2) {
                      value = `${parts[0]},${parts.slice(1).join('')}`;
                    }

                    // Limit decimal places to 2
                    if (parts[1] && parts[1].length > 2) {
                      value = `${parts[0]},${parts[1].substring(0, 2)}`;
                    }

                    e.target.value = value;
                    register('amount').onChange(e);

                    // Convert to number for validation
                    const numValue = parseFloat(value.replace(',', '.'));
                    if (!isNaN(numValue) && numValue > 0) {
                      validateField('amount', numValue);
                    }
                  }}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  aria-invalid={!!errors.amount}
                  disabled={isSubmitting}
                />
              </FieldWithValidation>

              <FieldWithValidation
                label="Para Birimi"
                error={errors.currency?.message}
                validation={fieldValidation.currency}
                required
                errorId="currency-error"
              >
                <Select
                  value={watch('currency')}
                  onValueChange={(value) => {
                    setValue('currency', value as 'TRY' | 'USD' | 'EUR');
                    validateField('currency', value);
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger aria-describedby={errors.currency ? 'currency-error' : undefined}>
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">₺ TRY</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </FieldWithValidation>

              <FieldWithValidation
                label="Makbuz No"
                error={errors.receipt_number?.message}
                validation={fieldValidation.receipt_number}
                required
                errorId="receipt_number-error"
              >
                <Input
                  id="receipt_number"
                  {...register('receipt_number')}
                  placeholder="MB2024001"
                  onChange={(e) => {
                    register('receipt_number').onChange(e);
                    if (e.target.value.length > 0) {
                      validateField('receipt_number', e.target.value);
                    }
                  }}
                  aria-describedby={errors.receipt_number ? 'receipt_number-error' : undefined}
                  aria-invalid={!!errors.receipt_number}
                  disabled={isSubmitting}
                />
              </FieldWithValidation>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldWithValidation
                label="Bağış Türü"
                error={errors.donation_type?.message}
                validation={fieldValidation.donation_type}
                required
                errorId="donation_type-error"
              >
                <Input
                  id="donation_type"
                  {...register('donation_type')}
                  placeholder="Nakdi, Ayni, Gıda..."
                  onChange={(e) => {
                    register('donation_type').onChange(e);
                    if (e.target.value.length > 0) {
                      validateField('donation_type', e.target.value);
                    }
                  }}
                  aria-describedby={errors.donation_type ? 'donation_type-error' : undefined}
                  aria-invalid={!!errors.donation_type}
                  disabled={isSubmitting}
                />
              </FieldWithValidation>

              <FieldWithValidation
                label="Ödeme Yöntemi"
                error={errors.payment_method?.message}
                validation={fieldValidation.payment_method}
                required
                errorId="payment_method-error"
              >
                <Select
                  value={watch('payment_method')}
                  onValueChange={(value) => {
                    setValue('payment_method', value);
                    validateField('payment_method', value);
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    aria-describedby={errors.payment_method ? 'payment_method-error' : undefined}
                  >
                    <SelectValue placeholder="Ödeme yöntemi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nakit">Nakit</SelectItem>
                    <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                    <SelectItem value="Banka Transferi">Banka Transferi</SelectItem>
                    <SelectItem value="Havale">Havale</SelectItem>
                    <SelectItem value="EFT">EFT</SelectItem>
                    <SelectItem value="Çek">Çek</SelectItem>
                  </SelectContent>
                </Select>
              </FieldWithValidation>
            </div>

            <FieldWithValidation
              label="Bağış Amacı"
              error={errors.donation_purpose?.message}
              validation={fieldValidation.donation_purpose}
              required
              errorId="donation_purpose-error"
            >
              <Input
                id="donation_purpose"
                {...register('donation_purpose')}
                placeholder="Ramazan paketi, Eğitim yardımı, Sağlık desteği..."
                onChange={(e) => {
                  register('donation_purpose').onChange(e);
                  if (e.target.value.length > 0) {
                    validateField('donation_purpose', e.target.value);
                  }
                }}
                aria-describedby={errors.donation_purpose ? 'donation_purpose-error' : undefined}
                aria-invalid={!!errors.donation_purpose}
                disabled={isSubmitting}
              />
            </FieldWithValidation>
          </div>

          {/* Ek Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ek Bilgiler</h3>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Ek açıklamalar, özel notlar..."
                rows={3}
              />
              {errors.notes && <p className="text-sm text-red-600">{errors.notes.message}</p>}
            </div>

            <FileUpload
              onFileSelect={setReceiptFile}
              accept="image/*,.pdf"
              maxSize={5}
              placeholder="Makbuz yükleyin (PNG, JPG, PDF - max 5MB)"
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
              data-testid="saveButton"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Bağış Ekle'
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
                data-testid="cancelButton"
              >
                İptal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
