# Convex Mutations

<cite>
**Referenced Files in This Document**   
- [auth.ts](file://convex/auth.ts)
- [beneficiaries.ts](file://convex/beneficiaries.ts)
- [schema.ts](file://convex/schema.ts)
- [api.ts](file://src/lib/convex/api.ts)
- [useFormMutation.ts](file://src/hooks/useFormMutation.ts)
- [BeneficiaryForm.tsx](file://src/components/forms/BeneficiaryForm.tsx)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Mutation Implementation with defineMutation](#mutation-implementation-with-defineMutation)
3. [Validation with Zod Schemas](#validation-with-zod-schemas)
4. [Security and Authorization](#security-and-authorization)
5. [Client-Side Invocation](#client-side-invocation)
6. [Error Handling and Transactional Integrity](#error-handling-and-transactional-integrity)
7. [Interaction with Database Indexes](#interaction-with-database-indexes)
8. [Form Submissions and UI Best Practices](#form-submissions-and-ui-best-practices)

## Introduction

Convex mutations in Kafkasder-panel are write operations that modify data within the Convex database. These operations are executed atomically with ACID guarantees, ensuring data consistency and reliability. Mutations are defined using the `defineMutation` function and can be invoked from the client-side through the Convex API. This document details the implementation, validation, security, and usage patterns of mutations in the Kafkasder-panel application.

## Mutation Implementation with defineMutation

Mutations in Kafkasder-panel are implemented using the `mutation` function from Convex. This function defines a mutation that is accessible from the client and allows modification of the database. The `mutation` function takes an object with `args` and `handler` properties. The `args` property defines the input schema using Convex values (`v`), and the `handler` property contains the logic to be executed.

For example, the `updateLastLogin` mutation in `auth.ts` updates the last login time of a user:

```typescript
export const updateLastLogin = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, {
      lastLogin: new Date().toISOString(),
    });

    return { success: true };
  },
});
```

Similarly, the `createBeneficiary` mutation in `beneficiaries.ts` creates a new beneficiary record:

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    tc_no: v.string(),
    phone: v.string(),
    address: v.string(),
    city: v.string(),
    district: v.string(),
    neighborhood: v.string(),
    family_size: v.number(),
    status: v.union(
      v.literal('TASLAK'),
      v.literal('AKTIF'),
      v.literal('PASIF'),
      v.literal('SILINDI')
    ),
  },
  handler: async (ctx, args) => {
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
```

**Section sources**

- [auth.ts](file://convex/auth.ts#L53-L67)
- [beneficiaries.ts](file://convex/beneficiaries.ts#L89-L169)

## Validation with Zod Schemas

Mutations are validated using Zod schemas on the client-side to ensure data integrity before sending requests to the server. The `BeneficiaryForm.tsx` component uses a Zod schema to validate form inputs:

```typescript
const beneficiarySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  tc_no: z.string().length(11, 'TC ID must be 11 digits'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'Enter city name'),
  district: z.string().min(2, 'Enter district name'),
  neighborhood: z.string().min(2, 'Enter neighborhood name'),
  income_level: z.enum(['0-3000', '3000-5000', '5000-8000', '80+']),
  family_size: z.number().min(1, 'Family size must be at least 1'),
  status: z.enum(['active', 'inactive', 'archived']),
});
```

The form uses `react-hook-form` with `zodResolver` to integrate Zod validation:

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<BeneficiaryFormData>({
  resolver: zodResolver(beneficiarySchema),
});
```

**Section sources**

- [BeneficiaryForm.tsx](file://src/components/forms/BeneficiaryForm.tsx#L27-L41)

## Security and Authorization

Mutations are secured using Convex's authorization model. The `auth.ts` file includes a `getCurrentUser` query that checks user authentication and returns user data without the password hash:

```typescript
export const getCurrentUser = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }

    const user = await ctx.db.get(args.userId);

    if (!user || !user.isActive) {
      return null;
    }

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
});
```

Additionally, mutations can include authorization checks within their handlers. For example, the `createBeneficiary` mutation ensures that the TC number is valid and unique:

```typescript
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
```

**Section sources**

- [auth.ts](file://convex/auth.ts#L9-L25)
- [beneficiaries.ts](file://convex/beneficiaries.ts#L153-L164)

## Client-Side Invocation

Mutations are invoked from the client-side using the `api.mutations.*` pattern and React hooks like `useMutation`. The `useFormMutation` custom hook in `useFormMutation.ts` standardizes mutation handling across the application:

```typescript
export function useFormMutation<TData = unknown, TVariables = unknown>({
  queryKey,
  successMessage,
  errorMessage,
  mutationFn,
  options,
  onSuccess,
  showSuccessToast = true,
  showErrorToast = true,
}: UseFormMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, unknown, TVariables>({
    mutationFn,
    ...options,
    onSuccess: (_data, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });

      if (showSuccessToast) {
        toast.success(successMessage);
      }

      onSuccess?.();
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : 'Unknown error';

      if (showErrorToast) {
        toast.error(`${errorMessage}: ${message}`);
      }

      console.error('Mutation error:', error);
    },
  });

  return {
    ...mutation,
    isSubmitting: mutation.isPending,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
  };
}
```

In `BeneficiaryForm.tsx`, the `useFormMutation` hook is used to create a beneficiary:

```typescript
const createBeneficiaryMutation = useFormMutation({
  queryKey: ['beneficiaries'],
  successMessage: 'Beneficiary created successfully',
  errorMessage: 'Error creating beneficiary',
  mutationFn: async (data: BeneficiaryFormData) => {
    const statusMap = {
      active: 'AKTIF',
      inactive: 'PASIF',
      archived: 'SILINDI',
    } as const;

    return api.beneficiaries.createBeneficiary({
      ...data,
      status: statusMap[data.status] || 'AKTIF',
    });
  },
  onSuccess: () => {
    onSuccess?.();
  },
});
```

**Section sources**

- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L47-L102)
- [BeneficiaryForm.tsx](file://src/components/forms/BeneficiaryForm.tsx#L121-L144)

## Error Handling and Transactional Integrity

Mutations in Convex are executed atomically, ensuring transactional integrity. If any part of the mutation fails, the entire operation is rolled back. Error handling is implemented both in the mutation handlers and in the client-side code.

In the `createBeneficiary` mutation, errors are thrown for invalid TC numbers or duplicate entries:

```typescript
if (!isValidTcNumber(payload.tc_no)) {
  throw new Error('Invalid TC number format');
}

if (existing) {
  throw new Error('Beneficiary with this TC number already exists');
}
```

On the client-side, the `useFormMutation` hook handles errors by displaying toast notifications and logging errors for debugging:

```typescript
onError: (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';

  if (showErrorToast) {
    toast.error(`${errorMessage}: ${message}`);
  }

  console.error('Mutation error:', error);
},
```

**Section sources**

- [beneficiaries.ts](file://convex/beneficiaries.ts#L153-L164)
- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L77-L93)

## Interaction with Database Indexes

Mutations interact with database indexes defined in `schema.ts` to ensure efficient data retrieval and uniqueness constraints. The `beneficiaries` table has several indexes:

```typescript
beneficiaries: defineTable({
  // ... fields
})
  .index('by_tc_no', ['tc_no'])
  .index('by_status', ['status'])
  .index('by_city', ['city'])
  .searchIndex('by_search', {
    searchField: 'name',
    filterFields: ['tc_no', 'phone', 'email'],
  }),
```

These indexes are used in mutations to check for existing records and to query data efficiently. For example, the `createBeneficiary` mutation uses the `by_tc_no` index to check for duplicate TC numbers:

```typescript
const existing = await ctx.db
  .query('beneficiaries')
  .withIndex('by_tc_no', (q) => q.eq('tc_no', payload.tc_no))
  .first();
```

**Section sources**

- [schema.ts](file://convex/schema.ts#L156-L162)
- [beneficiaries.ts](file://convex/beneficiaries.ts#L158-L161)

## Form Submissions and UI Best Practices

Form submissions in Kafkasder-panel follow best practices for user experience, including optimistic updates and loading states. The `BeneficiaryForm.tsx` component uses a loading state to indicate submission progress:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (data: BeneficiaryFormData) => {
  setIsSubmitting(true);
  try {
    await createBeneficiaryMutation.mutateAsync(data);
  } finally {
    setIsSubmitting(false);
  }
};
```

The form also provides real-time validation feedback using the `fieldValidation` state:

```typescript
const [fieldValidation, setFieldValidation] = useState<
  Record<string, 'valid' | 'invalid' | 'pending'>
>({});

const validateField = useCallback(async (fieldName: keyof BeneficiaryFormData, value: unknown) => {
  try {
    await beneficiarySchema.shape[fieldName].parseAsync(value);
    setFieldValidation((prev) => ({ ...prev, [fieldName]: 'valid' }));
  } catch {
    setFieldValidation((prev) => ({ ...prev, [fieldName]: 'invalid' }));
  }
}, []);
```

Optimistic updates are achieved by invalidating queries on success, which triggers a refetch of the data:

```typescript
onSuccess: () => {
  toast.success('Beneficiary created successfully');
  void queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
  onSuccess?.();
},
```

**Section sources**

- [BeneficiaryForm.tsx](file://src/components/forms/BeneficiaryForm.tsx#L102-L144)
- [useFormMutation.ts](file://src/hooks/useFormMutation.ts#L63-L73)
