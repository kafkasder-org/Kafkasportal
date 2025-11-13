# Beneficiary Profiles

<cite>
**Referenced Files in This Document**   
- [schema.ts](file://convex/schema.ts)
- [beneficiary.ts](file://src/lib/validations/beneficiary.ts)
- [BeneficiaryForm.tsx](file://src/components/forms/BeneficiaryForm.tsx)
- [route.ts](file://src/app/api/beneficiaries/route.ts)
- [beneficiaries.ts](file://convex/beneficiaries.ts)
- [beneficiaries/[id]/route.ts](file://src/app/api/beneficiaries/[id]/route.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Data Model Structure](#data-model-structure)
3. [Form Validation Logic](#form-validation-logic)
4. [UI Components](#ui-components)
5. [API Routes and CRUD Operations](#api-routes-and-crud-operations)
6. [Workflows](#workflows)
7. [Integration with Authentication, Audit Logging, and Error Handling](#integration-with-authentication-audit-logging-and-error-handling)
8. [Common Issues and Performance Optimization](#common-issues-and-performance-optimization)

## Introduction

The Beneficiary Profiles feature enables users to manage detailed information about aid recipients within the Kafkasder-panel application. This comprehensive system supports the creation, viewing, editing, and deletion of beneficiary records through a robust combination of data modeling, form validation, user interface components, and API endpoints. The implementation leverages Convex as the backend database and application platform, ensuring real-time data synchronization and secure operations. This document details the architecture and functionality of the beneficiary management system, focusing on its core components and operational workflows.

## Data Model Structure

The data model for beneficiary profiles is defined in the `schema.ts` file within the convex directory. This schema establishes the structure of the `beneficiaries` collection, specifying all fields and their data types, constraints, and indexing strategies. The model is designed to capture comprehensive information about each beneficiary, including personal details, contact information, family composition, economic status, health conditions, and administrative metadata.

The schema utilizes the Convex values library (`v`) to define field types with precision. Key fields include `name`, `tc_no` (Turkish National Identity Number), `phone`, `email`, `birth_date`, `gender`, `nationality`, and `address`. The model also captures detailed information about family size through `family_size`, `children_count`, `orphan_children_count`, `elderly_count`, and `disabled_count`. Economic data is stored in fields like `income_level`, `income_source`, `has_debt`, and `housing_type`. Health-related information is managed with `health_status`, `has_chronic_illness`, `chronic_illness_detail`, `has_disability`, and `disability_detail`.

A critical aspect of the data model is its status management system, which uses an enum with the values `'TASLAK'`, `'AKTIF'`, `'PASIF'`, and `'SILINDI'` to represent Draft, Active, Inactive, and Deleted states. This implements a soft-delete pattern, where records are not permanently removed but marked as deleted. The model also includes an `approval_status` field with values `'pending'`, `'approved'`, or `'rejected'` to manage the application review process.

To ensure data integrity and efficient querying, the schema defines several indexes. The `by_tc_no` index on the `tc_no` field guarantees the uniqueness of Turkish ID numbers and enables fast lookups. The `by_status` index on the `status` field allows for efficient filtering of beneficiaries by their current state. The `by_city` index on the `city` field facilitates location-based queries. Additionally, a search index named `by_search` is configured on the `name` field, with `tc_no`, `phone`, and `email` included as filter fields, enabling powerful full-text search capabilities across key identifiers.

**Section sources**

- [schema.ts](file://convex/schema.ts#L47-L152)

## Form Validation Logic

The form validation logic for beneficiary profiles is centralized in the `beneficiary.ts` file located in `src/lib/validations/`. This file exports multiple Zod schemas that define the rules for validating data both on the client-side and server-side. The primary schema, `beneficiarySchema`, is a comprehensive object schema that validates all fields of a beneficiary profile.

The validation logic begins with helper validators. The `tcKimlikNoSchema` is a sophisticated validator for Turkish National Identity Numbers. It ensures the number is exactly 11 digits long, contains only numeric characters, and passes the official TC Kimlik No algorithm check, which includes verifying the first digit is not zero and calculating check digits. The `phoneSchema` validates phone numbers against the E.164 format, accepting both numbers with and without the country code (+90). The `emailSchema` uses a standard regex pattern to ensure email addresses are correctly formatted.

The `beneficiarySchema` itself is structured into logical sections. The "Temel Bilgiler" (Basic Information) section validates `firstName`, `lastName`, and `nationality` with minimum and maximum length constraints and regex patterns to ensure they contain only letters and spaces. The `identityNumber` field uses the `tcKimlikNoSchema` for validation. The `category`, `fundRegion`, and `fileConnection` fields are validated as native enums, ensuring only predefined values are accepted. The `fileNumber` field is validated to be non-empty, no longer than 20 characters, and to contain only uppercase letters and numbers.

The schema employs several `refine` methods to enforce complex business rules. One refinement ensures that individuals under 18 years old cannot have a marital status of "married" (`EVLI`). Another critical refinement mandates that if a `tc_no` (Turkish ID) is provided, the `mernisCheck` flag must be set to `true`, enforcing a compliance rule. Additional refinements require that if `hasChronicIllness` is `true`, then `chronicIllnessDetail` must be provided and contain at least three characters, and similarly for `hasDisability` and `disabilityDetail`.

For simpler use cases, such as quick add forms, the file also exports a `quickAddBeneficiarySchema`. This schema includes only the most essential fields—`category`, `firstName`, `lastName`, `nationality`, `birthDate`, `identityNumber`, `mernisCheck`, `fundRegion`, `fileConnection`, and `fileNumber`—making it ideal for rapid data entry while still enforcing core validation rules.

**Section sources**

- [beneficiary.ts](file://src/lib/validations/beneficiary.ts#L37-L392)

## UI Components

The primary user interface for managing beneficiary profiles is the `BeneficiaryForm` component, located in `src/components/forms/BeneficiaryForm.tsx`. This React component is built using the `react-hook-form` library for form state management and `zodResolver` for integrating the Zod validation schema. It provides a structured, multi-section form for creating and editing beneficiary records.

The component is designed with a clean, card-based layout. It uses state to manage the submission process (`isSubmitting`) and real-time field validation (`fieldValidation`). The form is divided into distinct sections: "Kişisel Bilgiler" (Personal Information), "Adres Bilgileri" (Address Information), "Ekonomik Bilgiler" (Economic Information), and "Sağlık Bilgileri" (Health Information). Each section groups related fields for better user experience.

A key feature is the `FieldWithValidation` component, which wraps form inputs to provide real-time feedback. It displays a green checkmark icon for valid fields, a red X for invalid fields, and no icon for pending validation. It also renders error messages below the input if validation fails. This component uses the `cn` utility for conditional CSS class application, adding a red asterisk to the label of required fields.

The form implements optimized `onChange` handlers for specific fields. The `handleNameChange` function updates the field value and triggers validation if the input is non-empty. The `handleTCChange` function automatically strips non-numeric characters from the TC number input and triggers validation. The `handlePhoneChange` function formats the phone number as the user types (e.g., 0555 123 45 67) and strips formatting for validation.

The form's submission is handled by a `useMutation` hook from `@tanstack/react-query`. On submit, it calls the `createBeneficiaryMutation`, which sends the form data to the Convex backend. The mutation includes success and error callbacks that display user-friendly toast notifications. A loading overlay with a spinner is displayed during submission to prevent duplicate submissions.

**Section sources**

- [BeneficiaryForm.tsx](file://src/components/forms/BeneficiaryForm.tsx#L26-L478)

## API Routes and CRUD Operations

The API routes for beneficiary management are located in the `src/app/api/beneficiaries/` directory and follow the Next.js App Router convention. These routes provide the HTTP endpoints for all CRUD (Create, Read, Update, Delete) operations, acting as a bridge between the frontend UI and the Convex backend.

The `route.ts` file in the `beneficiaries` directory handles the `GET` and `POST` methods. The `GET` method, implemented in `getBeneficiariesHandler`, retrieves a paginated list of beneficiaries. It uses `requireModuleAccess` middleware to enforce authentication and authorization, ensuring only users with the appropriate permissions can access the data. It parses query parameters for pagination (`limit`, `skip`), filtering (e.g., `city`, `status`), and searching. It then calls the `convexBeneficiaries.list` Convex query with these parameters and returns the results in a standardized JSON response.

The `POST` method, implemented in `createBeneficiaryHandler`, creates a new beneficiary. It is protected by CSRF (Cross-Site Request Forgery) protection via the `verifyCsrfToken` middleware and the same module access check. The handler first parses the JSON body and validates it using the `validateBeneficiaryData` function. This function checks for required fields, validates the TC number format, phone number, email, and status value. If validation fails, it returns a 400 error. If the TC number already exists in the database (checked by the Convex `create` mutation), it returns a 409 Conflict error. On success, it maps the form data to the Convex schema (e.g., converting the `status` from 'active' to 'AKTIF') and calls the `convexBeneficiaries.create` mutation, returning a 201 Created response.

The `route.ts` file in the `beneficiaries/[id]` directory handles the `GET`, `PUT`, and `DELETE` methods for a specific beneficiary. The `GET` method (`getBeneficiaryHandler`) retrieves a single beneficiary by ID, returning a 404 error if not found. The `PUT` method (`updateBeneficiaryHandler`) updates an existing beneficiary. It validates the incoming data with `validateBeneficiaryUpdate`, which performs similar checks to the create validation but only for provided fields. It then calls the `convexBeneficiaries.update` mutation. The `DELETE` method (`deleteBeneficiaryHandler`) performs a soft delete by calling the `convexBeneficiaries.remove` mutation, which sets the beneficiary's status to 'SILINDI' (Deleted).

**Section sources**

- [route.ts](file://src/app/api/beneficiaries/route.ts#L45-L246)
- [beneficiaries/[id]/route.ts](file://src/app/api/beneficiaries/[id]/route.ts#L12-L220)

## Workflows

The workflows for managing beneficiary profiles are built around the CRUD operations and are designed to be intuitive and secure. The "Add New Beneficiary" workflow begins when a user navigates to the beneficiary creation page. The `BeneficiaryForm` component is rendered, allowing the user to input all required and optional information. As the user types, real-time validation provides immediate feedback. Upon submission, the form data is validated client-side, then sent to the `/api/beneficiaries` endpoint via a `POST` request. The server validates the data again, checks for duplicate TC numbers, and creates the record in the Convex database. A success toast is displayed, and the list of beneficiaries is refreshed.

The "Update Existing Record" workflow starts when a user edits a beneficiary. The form is pre-filled with the existing data fetched from the `GET /api/beneficiaries/[id]` endpoint. The user can modify any field, with the same real-time validation applied. On submission, a `PUT` request is sent to `/api/beneficiaries/[id]`. The server validates the changes and applies them. A critical business rule is enforced during updates: if the `tc_no` is changed, the system checks for duplicates to prevent conflicts.

The "Handle Soft Deletes" workflow is implemented through the `DELETE` endpoint. When a user deletes a beneficiary, a `DELETE` request is sent to `/api/beneficiaries/[id]`. The `remove` mutation in Convex does not permanently delete the record but instead updates its `status` field to `'SILINDI'`. This allows the record to be excluded from most queries (due to the `by_status` index) while preserving its data for auditing and potential recovery. The UI reflects this by showing a success message, and the beneficiary disappears from the active list.

**Section sources**

- [beneficiaries.ts](file://convex/beneficiaries.ts#L89-L227)
- [beneficiaries/[id]/route.ts](file://src/app/api/beneficiaries/[id]/route.ts#L176-L220)

## Integration with Authentication, Audit Logging, and Error Handling

The beneficiary profiles feature is tightly integrated with the application's core services for security, auditing, and reliability. Authentication and authorization are enforced at the API layer. The `requireModuleAccess` function, used in all API handlers, verifies that the requesting user is authenticated and has the necessary role (e.g., 'admin', 'staff') to access the beneficiaries module. This function extracts the user's session and role from the request context.

Audit logging is implemented through structured logging with the `logger` module. Every significant operation is logged with relevant context. For example, a failed beneficiary creation attempt logs the endpoint, method, and a masked version of the TC number for privacy. This provides a clear audit trail for security reviews and debugging. The logs include metadata like timestamps, user IDs, and IP addresses.

Error handling is comprehensive and user-friendly. The system uses a layered approach. At the Convex level, mutations throw descriptive errors (e.g., "Beneficiary with this TC number already exists"). These errors are caught by the API routes, which use the `buildErrorResponse` helper to translate authentication errors into appropriate HTTP responses. For other errors, a generic 500 error is returned, but the details are logged for debugging. The frontend uses `sonner` to display toast notifications, showing user-friendly messages like "Bu TC Kimlik No zaten kayıtlı" (This TC ID is already registered) instead of raw error messages. The API responses follow a consistent JSON structure with `success`, `error`, and `message` fields, making it easy for the frontend to handle different outcomes.

**Section sources**

- [beneficiaries.ts](file://convex/beneficiaries.ts#L153-L163)
- [route.ts](file://src/app/api/beneficiaries/route.ts#L228-L234)
- [beneficiaries/[id]/route.ts](file://src/app/api/beneficiaries/[id]/route.ts#L158-L167)

## Common Issues and Performance Optimization

Several common issues are proactively addressed in the implementation. **Validation errors** are handled with clear, inline messages and real-time feedback, preventing submission of invalid data. **Duplicate TC numbers** are prevented by a unique index in the Convex schema and a pre-insert check in the `create` mutation, which returns a 409 error with a clear message. The system also handles edge cases like invalid TC algorithms and improperly formatted phone numbers.

For **performance optimization** when listing large datasets, the system employs several strategies. The `list` query in Convex uses server-side pagination (`limit` and `skip` parameters) to avoid transferring large amounts of data. It leverages database indexes (`by_status`, `by_city`, `by_tc_no`) to make filtering operations efficient. The search functionality uses a dedicated search index (`by_search`) for fast full-text lookups on the `name` field. The frontend uses `@tanstack/react-query` to cache the results of list queries, reducing the number of network requests and improving perceived performance when users navigate back to the list view.
