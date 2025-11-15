/**
 * Beneficiary Form Hook
 * Extracted form logic for better organization
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import logger from '@/lib/logger';

import { docSchema, type FormValues } from '@/types/beneficiary-form';
import { beneficiaries } from '@/lib/api/crud-factory';
import type { BeneficiaryDocument } from '@/types/database';

// Stub function for Mernis TC Kimlik validation
const checkMernis = async (tcNo: string) => {
  try {
    const response = await fetch('/api/mernis/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tc_no: tcNo }),
    });

    if (!response.ok) {
      throw new Error('Mernis validation failed');
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    logger.error('Mernis validation error:', error);
    return false;
  }
};

export function useBeneficiaryForm(beneficiaryId: string) {
  const router = useRouter();

  // Form state
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [selectedDiseaseCategory, setSelectedDiseaseCategory] = useState<string>('');

  // React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(docSchema),
    mode: 'onChange',
  });

  // Fetch beneficiary data
  const {
    data: beneficiary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['beneficiary', beneficiaryId],
    queryFn: async () => {
      const response = await beneficiaries.getById(beneficiaryId);
      return response.data as BeneficiaryDocument;
    },
  });

  // Populate form when data is available
  React.useEffect(() => {
    if (beneficiary) {
      form.reset({
        name: beneficiary.name || '',
        surname: '', // surname field doesn't exist in BeneficiaryDocument
        tc_no: beneficiary.tc_no || '',
        phone: beneficiary.phone || '',
        email: beneficiary.email || '',
        address: beneficiary.address || '',
        city: beneficiary.city || '',
        district: beneficiary.district || '',
        neighborhood: beneficiary.neighborhood || '',
        postal_code: '', // postal_code field doesn't exist in BeneficiaryDocument
        birth_date: beneficiary.birth_date || '',
        gender: beneficiary.gender || '',
        marital_status: beneficiary.marital_status || '',
        education_status: beneficiary.education_level || '', // use education_level
        occupation: beneficiary.occupation || '',
        blood_type: '', // blood_type field doesn't exist in BeneficiaryDocument
        chronic_disease: beneficiary.chronic_illness_detail || '', // use chronic_illness_detail
        disease_category: '', // disease_category field doesn't exist in BeneficiaryDocument
        disability_status: beneficiary.has_disability ? 'var' : 'yok', // convert boolean to string
        disability_percentage: '', // disability_percentage field doesn't exist in BeneficiaryDocument
        contact_preference: '', // contact_preference field doesn't exist in BeneficiaryDocument
      });

      // Set dropdown selections
      if (beneficiary.city) setSelectedCity(beneficiary.city);
      if (beneficiary.district) setSelectedDistrict(beneficiary.district);
      if (beneficiary.neighborhood) setSelectedNeighborhood(beneficiary.neighborhood);
      // disease_category doesn't exist in BeneficiaryDocument
    }
  }, [beneficiary, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await beneficiaries.update(beneficiaryId, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Başvuru sahibi bilgileri güncellendi');
    },
    onError: (error) => {
      toast.error('Güncelleme başarısız oldu');
      logger.error('Update error:', error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await beneficiaries.delete(beneficiaryId);
    },
    onSuccess: () => {
      toast.success('Başvuru sahibi silindi');
      router.push('/yardim/ihtiyac-sahipleri');
    },
    onError: (error) => {
      toast.error('Silme işlemi başarısız oldu');
      logger.error('Delete error:', error);
    },
  });

  // Form handlers
  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm('Bu başvuru sahibini silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate();
    }
  };

  const handleMernisCheck = async () => {
    const tcNo = form.getValues('tc_no');
    if (!tcNo || tcNo.length !== 11) {
      toast.error('Geçerli TC Kimlik No giriniz');
      return;
    }

    const isValid = await checkMernis(tcNo);
    if (isValid) {
      toast.success('TC Kimlik No doğrulandı');
    } else {
      toast.error('TC Kimlik No geçersiz');
    }
  };

  // Reset form
  const resetForm = () => {
    form.reset();
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedNeighborhood('');
    setSelectedDiseaseCategory('');
  };

  return {
    // Form
    form,
    onSubmit,
    resetForm,

    // State
    openModal,
    setOpenModal,
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    selectedNeighborhood,
    setSelectedNeighborhood,
    selectedDiseaseCategory,
    setSelectedDiseaseCategory,

    // Data
    beneficiary,
    isLoading,
    error,

    // Mutations
    updateMutation,
    deleteMutation,

    // Handlers
    handleDelete,
    handleMernisCheck,
  };
}
