'use client';

import { useQuery } from '@tanstack/react-query';
import { parametersApi } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { ParameterCategory, ParameterDocument } from '@/types/database';

interface ParameterSelectProps {
  category: ParameterCategory;
  value?: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export function ParameterSelect({
  category,
  value,
  onChange,
  label,
  required = false,
  placeholder,
  error,
  disabled = false,
}: ParameterSelectProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['parameters', category],
    queryFn: () => parametersApi.getParametersByCategory(category),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const parameters: ParameterDocument[] = (data?.data as ParameterDocument[]) || [];

  return (
    <div className="space-y-2">
      <Label htmlFor={category}>
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger id={category}>
          <SelectValue placeholder={placeholder || `${label} seçin`} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Yükleniyor...
            </SelectItem>
          ) : parameters.length === 0 ? (
            <SelectItem value="empty" disabled>
              Parametre bulunamadı
            </SelectItem>
          ) : (
            parameters.map((param) => (
              <SelectItem key={param._id} value={param.value}>
                {param.name_tr}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
