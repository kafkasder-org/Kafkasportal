# Donation Management API

<cite>
**Referenced Files in This Document**   
- [donations.ts](file://convex/donations.ts)
- [route.ts](file://src/app/api/donations/route.ts)
- [\[id\]/route.ts](file://src/app/api/donations/[id]/route.ts)
- [stats/route.ts](file://src/app/api/donations/stats/route.ts)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx)
- [kumbara.ts](file://src/lib/validations/kumbara.ts)
- [financial.ts](file://src/types/financial.ts)
- [finance_records.ts](file://convex/finance_records.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [API Endpoints](#api-endpoints)
   - [GET /api/donations](#get-apidonations)
   - [POST /api/donations](#post-apidonations)
   - [GET /api/donations/[id]](#get-apidonationsid)
   - [PUT /api/donations/[id]](#put-apidonationsid)
   - [GET /api/donations/stats](#get-apidonationsstats)
3. [Data Models](#data-models)
4. [Kumbara Donation Workflow](#kumbara-donation-workflow)
5. [Validation Rules](#validation-rules)
6. [File Attachment and Storage](#file-attachment-and-storage)
7. [Financial Record Integration](#financial-record-integration)
8. [Error Handling](#error-handling)
9. [Usage Examples](#usage-examples)

## Introduction

The Donation Management API provides comprehensive functionality for managing donation records within the system. It supports standard donation tracking as well as specialized kumbara (piggy bank) collection workflows. The API enables creation, retrieval, updating, and analysis of donation records with robust filtering capabilities, file attachment support, and integration with financial systems.

The API is built on a Next.js backend with Convex as the database layer, providing real-time data synchronization and serverless functions. All endpoints require proper authentication and CSRF protection to ensure data security.

**Section sources**

- [donations.ts](file://convex/donations.ts#L1-L149)
- [route.ts](file://src/app/api/donations/route.ts#L1-L148)

## API Endpoints

### GET /api/donations

Retrieves a paginated list of donation records with optional filtering parameters.

**Query Parameters:**

- `limit` (number, optional): Maximum number of records to return (default: 50)
- `skip` (number, optional): Number of records to skip for pagination
- `status` (string, optional): Filter by donation status (pending, completed, cancelled)
- `donor_email` (string, optional): Filter by donor email address
- `is_kumbara` (boolean, optional): Filter by kumbara donation status

**Response Format:**

```json
{
  "success": true,
  "data": [
    {
      "donor_name": "string",
      "donor_phone": "string",
      "donor_email": "string",
      "amount": number,
      "currency": "TRY" | "USD" | "EUR",
      "donation_type": "string",
      "payment_method": "string",
      "donation_purpose": "string",
      "status": "pending" | "completed" | "cancelled",
      "receipt_number": "string",
      "is_kumbara": boolean,
      "_id": "string",
      "_creationTime": number
    }
  ],
  "total": number
}
```

**Section sources**

- [donations.ts](file://convex/donations.ts#L5-L52)
- [route.ts](file://src/app/api/donations/route.ts#L54-L82)

### POST /api/donations

Creates a new donation record in the system.

**Request Body (Required Fields):**

- `donor_name` (string): Name of the donor
- `donor_phone` (string): Phone number of the donor
- `amount` (number): Donation amount (must be positive)
- `currency` (string): Currency code (TRY, USD, EUR)
- `donation_type` (string): Type of donation
- `payment_method` (string): Payment method used
- `donation_purpose` (string): Purpose of the donation
- `receipt_number` (string): Unique receipt number

**Request Body (Optional Kumbara Fields):**

- `is_kumbara` (boolean): Indicates if this is a kumbara collection
- `kumbara_location` (string): Location where kumbara was collected
- `collection_date` (string): Date when kumbara was collected
- `kumbara_institution` (string): Institution or address where kumbara was located
- `location_coordinates` (object): GPS coordinates (lat, lng)
- `location_address` (string): Full address of collection point
- `route_points` (array): Array of GPS points for collection route
- `route_distance` (number): Total distance of collection route
- `route_duration` (number): Duration of collection route

**Response Format:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "donor_name": "string",
    "amount": number,
    "status": "pending"
  },
  "message": "Donation successfully created"
}
```

**Section sources**

- [donations.ts](file://convex/donations.ts#L77-L108)
- [route.ts](file://src/app/api/donations/route.ts#L89-L145)

### GET /api/donations/[id]

Retrieves detailed information about a specific donation record by ID.

**Path Parameter:**

- `id` (string): The unique identifier of the donation record

**Response Format:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "donor_name": "string",
    "donor_phone": "string",
    "donor_email": "string",
    "amount": number,
    "currency": "TRY" | "USD" | "EUR",
    "donation_type": "string",
    "payment_method": "string",
    "donation_purpose": "string",
    "notes": "string",
    "receipt_number": "string",
    "receipt_file_id": "string",
    "status": "pending" | "completed" | "cancelled",
    "is_kumbara": boolean,
    "kumbara_location": "string",
    "collection_date": "string",
    "kumbara_institution": "string",
    "location_coordinates": {
      "lat": number,
      "lng": number
    },
    "location_address": "string",
    "route_points": [
      {
        "lat": number,
        "lng": number
      }
    ],
    "route_distance": number,
    "route_duration": number,
    "_creationTime": number
  }
}
```

**Section sources**

- [donations.ts](file://convex/donations.ts#L56-L61)
- [\[id\]/route.ts](file://src/app/api/donations/[id]/route.ts#L42-L78)

### PUT /api/donations/[id]

Updates an existing donation record.

**Path Parameter:**

- `id` (string): The unique identifier of the donation record

**Request Body (Updatable Fields):**

- `status` (string, optional): Updated status (pending, completed, cancelled)
- `amount` (number, optional): Updated donation amount
- `notes` (string, optional): Additional notes or comments

**Response Format:**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "status": "completed",
    "amount": 500,
    "notes": "Donation confirmed"
  },
  "message": "Donation successfully updated"
}
```

**Section sources**

- [donations.ts](file://convex/donations.ts#L112-L133)
- [\[id\]/route.ts](file://src/app/api/donations/[id]/route.ts#L84-L137)

### GET /api/donations/stats

Retrieves donation analytics and reporting data.

**Query Parameters:**

- `type` (string, optional): Type of statistics to retrieve
  - `overview`: Summary statistics (default)
  - `monthly`: Monthly donation trends
  - `status`: Distribution by donation status
  - `payment`: Distribution by payment method

**Response Format (Overview):**

```json
{
  "success": true,
  "data": {
    "total_donations": number,
    "total_amount": number,
    "this_month_amount": number,
    "monthly_growth": number,
    "pending_donations": number,
    "completed_donations": number,
    "cancelled_donations": number
  }
}
```

**Response Format (Monthly):**

```json
{
  "success": true,
  "data": [
    {
      "month": "string",
      "amount": number,
      "count": number
    }
  ]
}
```

**Section sources**

- [stats/route.ts](file://src/app/api/donations/stats/route.ts#L22-L198)
- [donations.ts](file://convex/donations.ts#L5-L52)

## Data Models

### Donation Document Structure

The donation document contains comprehensive information about each donation, including donor details, financial information, and kumbara-specific data.

**Core Fields:**

- `donor_name`: Donor's full name
- `donor_phone`: Donor's contact phone number
- `donor_email`: Donor's email address
- `amount`: Donation amount
- `currency`: Currency code (TRY, USD, EUR)
- `donation_type`: Category of donation
- `payment_method`: Method of payment
- `donation_purpose`: Purpose or campaign for the donation
- `status`: Current status (pending, completed, cancelled)
- `receipt_number`: Unique receipt identifier
- `receipt_file_id`: Reference to attached receipt file
- `notes`: Additional comments or notes

**Kumbara-Specific Fields:**

- `is_kumbara`: Flag indicating kumbara collection
- `kumbara_location`: Collection location name
- `collection_date`: Date of collection
- `kumbara_institution`: Institution or organization
- `location_coordinates`: GPS coordinates of collection point
- `location_address`: Full address of collection point
- `route_points`: Array of GPS points for collection route
- `route_distance`: Total distance traveled
- `route_duration`: Duration of collection activity

**Section sources**

- [donations.ts](file://convex/donations.ts#L77-L105)
- [kumbara.ts](file://src/lib/validations/kumbara.ts#L5-L77)

## Kumbara Donation Workflow

The Kumbara donation workflow supports specialized collection activities where donations are gathered from physical piggy banks at various locations. This workflow includes enhanced tracking of collection routes, locations, and team activities.

**Workflow Steps:**

1. **Collection Planning**: Define collection route with multiple kumbara locations
2. **Field Collection**: Collect donations at each location, recording GPS coordinates
3. **Data Entry**: Enter donation details with kumbara-specific information
4. **Route Documentation**: Upload route points, distance, and duration
5. **Verification**: Review and approve kumbara collection records
6. **Reporting**: Generate analytics on kumbara collection performance

The system supports both individual kumbara collections and batch processing of multiple collections from a single route.

**Section sources**

- [kumbara.ts](file://src/lib/validations/kumbara.ts#L5-L77)
- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L27-L40)

## Validation Rules

The API enforces strict validation rules to ensure data quality and consistency.

**Required Field Validations:**

- `donor_name`: Minimum 2 characters
- `donor_phone`: Valid Turkish phone number format (5XXXXXXXXX)
- `amount`: Positive number greater than 0
- `currency`: Must be TRY, USD, or EUR
- `donation_type`: Minimum 2 characters
- `payment_method`: Minimum 2 characters
- `donation_purpose`: Minimum 2 characters
- `receipt_number`: Minimum 3 characters

**Data Type Validations:**

- Phone numbers must follow Turkish mobile format
- Email addresses must be valid format
- Amounts must be positive numbers
- Dates must be valid ISO format
- Coordinates must be valid latitude/longitude values

**Kumbara-Specific Validations:**

- `kumbara_location`: Minimum 2 characters
- `kumbara_institution`: Minimum 2 characters
- `collection_date`: Required and valid date
- `route_points`: Array of valid coordinate objects
- `route_distance`: Positive number
- `route_duration`: Positive number

**Section sources**

- [kumbara.ts](file://src/lib/validations/kumbara.ts#L5-L77)
- [route.ts](file://src/app/api/donations/route.ts#L14-L48)

## File Attachment and Storage

The system supports file attachments for donation records, primarily for receipt documentation.

**Attachment Process:**

1. Upload file to `/api/storage/upload` endpoint
2. Receive file ID in response
3. Include file ID in donation creation/update request
4. File is securely stored and linked to donation record

**Supported File Types:**

- Images (PNG, JPG, JPEG)
- PDF documents

**File Constraints:**

- Maximum size: 5MB
- Required fields: `file`, `bucket` (set to "receipts")

The storage system automatically generates secure URLs for file access while maintaining proper access controls.

**Section sources**

- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L152-L167)
- [storage/upload/route.ts](file://src/app/api/storage/upload/route.ts)

## Financial Record Integration

Donation records are automatically integrated with the financial management system to ensure proper accounting and reporting.

**Integration Process:**

1. When a donation status changes to "completed"
2. A corresponding finance record is created
3. The record is linked to the original donation
4. Financial metrics are updated in real-time

**Finance Record Creation:**

- `record_type`: "income"
- `category`: Based on donation type
- `amount`: Donation amount
- `currency`: Donation currency
- `description`: Donation purpose
- `transaction_date`: Donation creation date
- `payment_method`: Donation payment method
- `receipt_number`: Donation receipt number
- `related_to`: Donation ID
- `status`: "approved" (for completed donations)

This integration ensures that all donations are properly accounted for in financial reports and dashboards.

**Section sources**

- [finance_records.ts](file://convex/finance_records.ts#L55-L76)
- [donations.ts](file://convex/donations.ts#L77-L108)

## Error Handling

The API implements comprehensive error handling to provide meaningful feedback to clients.

**Common Error Responses:**

- `400 Bad Request`: Validation errors with detailed error messages
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Donation record not found
- `409 Conflict`: Duplicate receipt number
- `500 Internal Server Error`: Unexpected server errors

**Error Response Format:**

```json
{
  "success": false,
  "error": "Error description",
  "details": ["Validation error 1", "Validation error 2"]
}
```

The system logs all errors with contextual information for debugging and monitoring purposes.

**Section sources**

- [route.ts](file://src/app/api/donations/route.ts#L71-L82)
- [\[id\]/route.ts](file://src/app/api/donations/[id]/route.ts#L117-L136)

## Usage Examples

### Standard Donation Creation

```json
POST /api/donations
{
  "donor_name": "Ahmet Yılmaz",
  "donor_phone": "5551234567",
  "donor_email": "ahmet@example.com",
  "amount": 500,
  "currency": "TRY",
  "donation_type": "Nakdi",
  "payment_method": "Nakit",
  "donation_purpose": "Ramazan Yardımı",
  "receipt_number": "MB2024001",
  "status": "completed"
}
```

### Kumbara Collection

```json
POST /api/donations
{
  "donor_name": "Kumbara Toplama Ekibi",
  "donor_phone": "5559876543",
  "amount": 2500,
  "currency": "TRY",
  "donation_type": "Kumbara",
  "payment_method": "Nakit",
  "donation_purpose": "Kumbara Toplama",
  "receipt_number": "KMB2024001",
  "status": "completed",
  "is_kumbara": true,
  "kumbara_location": "Beşiktaş Şubesi",
  "kumbara_institution": "Beşiktaş İlçe Başkanlığı",
  "collection_date": "2024-01-15",
  "location_coordinates": {
    "lat": 41.0354,
    "lng": 29.0253
  },
  "location_address": "Beşiktaş Mahallesi, İstanbul",
  "route_points": [
    {"lat": 41.0354, "lng": 29.0253},
    {"lat": 41.0415, "lng": 29.0156}
  ],
  "route_distance": 5.2,
  "route_duration": 120
}
```

### Donation Update

```json
PUT /api/donations/doc123
{
  "status": "completed",
  "notes": "Payment confirmed via bank transfer"
}
```

### Filtered Donation Retrieval

```http
GET /api/donations?status=completed&is_kumbara=true&limit=25
```

**Section sources**

- [DonationForm.tsx](file://src/components/forms/DonationForm.tsx#L146-L183)
- [kumbara.ts](file://src/lib/validations/kumbara.ts#L5-L77)
