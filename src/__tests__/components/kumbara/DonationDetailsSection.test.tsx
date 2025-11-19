/**
 * Tests for DonationDetailsSection component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import { DonationDetailsSection } from '@/components/kumbara/sections/DonationDetailsSection';
import type { KumbaraCreateInput } from '@/lib/validations/kumbara';

describe('DonationDetailsSection', () => {
  const useRenderWithForm = (currentCurrency: 'TRY' | 'USD' | 'EUR' = 'TRY') => {
    const methods = useForm<KumbaraCreateInput>({
      defaultValues: {
        donor_name: '',
        donor_phone: '',
        amount: 0,
        currency: currentCurrency,
        payment_method: 'Nakit',
        donation_type: 'Kumbara',
        donation_purpose: 'Kumbara Bağışı',
        kumbara_location: '',
        kumbara_institution: '',
        collection_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        is_kumbara: true,
        notes: '',
      },
    });

    const result = render(
      <FormProvider {...methods}>
        <DonationDetailsSection control={methods.control} currentCurrency={currentCurrency} />
      </FormProvider>
    );

    return { ...result, methods };
  };

  it('should render the section title', () => {
    useRenderWithForm();
    expect(screen.getByText('Bağış Detayları')).toBeInTheDocument();
  });

  it('should render all required fields', () => {
    useRenderWithForm();

    expect(screen.getByLabelText(/Tutar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Para Birimi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ödeme/i)).toBeInTheDocument();
  });

  it('should show required asterisk for all fields', () => {
    useRenderWithForm();

    const amountLabel = screen.getByText(/Tutar/i).closest('label');
    expect(amountLabel).toHaveTextContent('*');

    const currencyLabel = screen.getByText(/Para Birimi/i).closest('label');
    expect(currencyLabel).toHaveTextContent('*');

    const paymentLabel = screen.getByText(/Ödeme/i).closest('label');
    expect(paymentLabel).toHaveTextContent('*');
  });

  it('should display correct currency symbol for TRY', () => {
    useRenderWithForm('TRY');
    expect(screen.getByText('₺')).toBeInTheDocument();
  });

  it('should display correct currency symbol for USD', () => {
    useRenderWithForm('USD');
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('should display correct currency symbol for EUR', () => {
    useRenderWithForm('EUR');
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('should allow numeric input in amount field', async () => {
    const user = userEvent.setup();
    const { methods } = useRenderWithForm();

    const input = screen.getByPlaceholderText('0.00');
    await user.clear(input);
    await user.type(input, '1500.50');

    const amountValue = methods.getValues('amount');
    expect(amountValue).toBe(1500.5);
  });

  it('should have step="0.01" for decimal amounts', () => {
    useRenderWithForm();
    const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
    expect(input.step).toBe('0.01');
  });

  it('should have min="0.01" to prevent negative amounts', () => {
    useRenderWithForm();
    const input = screen.getByPlaceholderText('0.00') as HTMLInputElement;
    expect(input.min).toBe('0.01');
  });

  it('should render currency select with all options', async () => {
    const user = userEvent.setup();
    useRenderWithForm();

    const currencySelect = screen.getByTestId('currencySelect');
    expect(currencySelect).toBeInTheDocument();

    await user.click(currencySelect);

    // Check for currency options (using partial text match because of emoji flags)
    expect(screen.getByText(/TRY/)).toBeInTheDocument();
    expect(screen.getByText(/USD/)).toBeInTheDocument();
    expect(screen.getByText(/EUR/)).toBeInTheDocument();
  });

  it('should render payment method select with all options', async () => {
    const user = userEvent.setup();
    useRenderWithForm();

    const paymentSelect = screen.getByTestId('paymentMethodSelect');
    expect(paymentSelect).toBeInTheDocument();

    await user.click(paymentSelect);

    expect(screen.getByText(/Nakit/)).toBeInTheDocument();
    expect(screen.getByText(/Banka Kartı/)).toBeInTheDocument();
    expect(screen.getByText(/Kredi Kartı/)).toBeInTheDocument();
    expect(screen.getByText(/Havale\/EFT/)).toBeInTheDocument();
  });

  it('should render in a 3-column grid layout', () => {
    const { container } = useRenderWithForm();

    const gridContainer = container.querySelector('.grid.grid-cols-3');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should have money bag emoji in section header', () => {
    useRenderWithForm();
    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('should have green-themed styling', () => {
    const { container } = useRenderWithForm();

    const section = container.querySelector('.bg-green-50\\/50');
    expect(section).toBeInTheDocument();
  });

  it('should update currency symbol when currency changes', async () => {
    const { rerender } = useRenderWithForm('TRY');

    expect(screen.getByText('₺')).toBeInTheDocument();

    // Rerender with USD
    const methodsUSD = useForm<KumbaraCreateInput>({
      defaultValues: {
        donor_name: '',
        donor_phone: '',
        amount: 0,
        currency: 'USD',
        payment_method: 'Nakit',
        donation_type: 'Kumbara',
        donation_purpose: 'Kumbara Bağışı',
        kumbara_location: '',
        kumbara_institution: '',
        collection_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        is_kumbara: true,
        notes: '',
      },
    });

    rerender(
      <FormProvider {...methodsUSD}>
        <DonationDetailsSection control={methodsUSD.control} currentCurrency="USD" />
      </FormProvider>
    );

    expect(screen.getByText('$')).toBeInTheDocument();
  });
});
