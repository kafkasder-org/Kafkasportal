'use client';

import React, { use } from 'react';
import { useBeneficiaryForm } from '@/hooks/useBeneficiaryForm';
import {
  ArrowLeft,
  Save,
  Trash2,
  User,
  AlertCircle,
  Loader2,
  MapPin,
  Heart,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function BeneficiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const {
    form,
    onSubmit,
    beneficiary,
    isLoading,
    error,
    updateMutation,
    deleteMutation,
    handleDelete,
  } = useBeneficiaryForm(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  if (error || !beneficiary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Hata</h2>
          <p className="text-muted-foreground">
            Başvuru sahibi bulunamadı veya yüklenirken hata oluştu.
          </p>
          <Button asChild className="mt-4">
            <Link href="/yardim/ihtiyac-sahipleri">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Listeye Dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/yardim/ihtiyac-sahipleri">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Listeye Dön
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{beneficiary.name}</h1>
              <p className="text-muted-foreground">Başvuru Sahibi Detayları</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" form="beneficiary-form" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <form id="beneficiary-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad</Label>
                <Input id="name" {...form.register('name')} placeholder="Ad giriniz" />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname">Soyad</Label>
                <Input id="surname" {...form.register('surname')} placeholder="Soyad giriniz" />
                {form.formState.errors.surname && (
                  <p className="text-sm text-red-500">{form.formState.errors.surname.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tc_no">TC Kimlik No</Label>
                <Input
                  id="tc_no"
                  {...form.register('tc_no')}
                  placeholder="TC Kimlik No"
                  maxLength={11}
                />
                {form.formState.errors.tc_no && (
                  <p className="text-sm text-red-500">{form.formState.errors.tc_no.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" {...form.register('phone')} placeholder="Telefon numarası" />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="E-posta adresi"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Doğum Tarihi</Label>
                <Input id="birth_date" type="date" {...form.register('birth_date')} />
                {form.formState.errors.birth_date && (
                  <p className="text-sm text-red-500">{form.formState.errors.birth_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Cinsiyet</Label>
                <Input id="gender" {...form.register('gender')} placeholder="Cinsiyet" />
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-500">{form.formState.errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marital_status">Medeni Durum</Label>
                <Input
                  id="marital_status"
                  {...form.register('marital_status')}
                  placeholder="Medeni durum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_status">Eğitim Durumu</Label>
                <Input
                  id="education_status"
                  {...form.register('education_status')}
                  placeholder="Eğitim durumu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Meslek</Label>
                <Input id="occupation" {...form.register('occupation')} placeholder="Meslek" />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Adres Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  {...form.register('address')}
                  placeholder="Tam adres"
                  rows={3}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Şehir</Label>
                <Input id="city" {...form.register('city')} placeholder="Şehir" />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">İlçe</Label>
                <Input id="district" {...form.register('district')} placeholder="İlçe" />
                {form.formState.errors.district && (
                  <p className="text-sm text-red-500">{form.formState.errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Mahalle</Label>
                <Input id="neighborhood" {...form.register('neighborhood')} placeholder="Mahalle" />
                {form.formState.errors.neighborhood && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.neighborhood.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Posta Kodu</Label>
                <Input
                  id="postal_code"
                  {...form.register('postal_code')}
                  placeholder="Posta kodu"
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Sağlık Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood_type">Kan Grubu</Label>
                <Input id="blood_type" {...form.register('blood_type')} placeholder="Kan grubu" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chronic_disease">Kronik Hastalık</Label>
                <Input
                  id="chronic_disease"
                  {...form.register('chronic_disease')}
                  placeholder="Kronik hastalık varsa belirtiniz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disease_category">Hastalık Kategorisi</Label>
                <Input
                  id="disease_category"
                  {...form.register('disease_category')}
                  placeholder="Hastalık kategorisi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disability_status">Engellilik Durumu</Label>
                <Input
                  id="disability_status"
                  {...form.register('disability_status')}
                  placeholder="Engellilik durumu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disability_percentage">Engellilik Oranı (%)</Label>
                <Input
                  id="disability_percentage"
                  {...form.register('disability_percentage')}
                  placeholder="Engellilik oranı"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                İletişim Tercihi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="contact_preference">İletişim Tercihi</Label>
                <Input
                  id="contact_preference"
                  {...form.register('contact_preference')}
                  placeholder="Tercih edilen iletişim yöntemi"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </React.Fragment>
  );
}
