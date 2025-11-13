# API Reference

<cite>
**Referenced Files in This Document**   
- [route-helpers.ts](file://src/lib/api/route-helpers.ts)
- [csrf.ts](file://src/lib/csrf.ts)
- [rate-limit-config.ts](file://src/lib/rate-limit-config.ts)
- [errors.ts](file://src/lib/errors.ts)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts)
- [api.ts](file://convex/api.ts)
- [schema.ts](file://convex/schema.ts)
- [aid_applications.ts](file://convex/aid_applications.ts)
- [beneficiaries.ts](file://convex/beneficiaries.ts)
- [donations.ts](file://convex/donations.ts)
- [meetings.ts](file://convex/meetings.ts)
- [messages.ts](file://convex/messages.ts)
- [partners.ts](file://convex/partners.ts)
- [tasks.ts](file://convex/tasks.ts)
- [users.ts](file://convex/users.ts)
- [workflow_notifications.ts](file://convex/workflow_notifications.ts)
- [audit_logs.ts](file://convex/audit_logs.ts)
- [errors.ts](file://convex/errors.ts)
- [storage.ts](file://convex/storage.ts)
- [system_settings.ts](file://convex/system_settings.ts)
- [analytics.ts](file://convex/analytics.ts)
- [communication_logs.ts](file://convex/communication_logs.ts)
- [consents.ts](file://convex/consents.ts)
- [data_import_export.ts](file://convex/data_import_export.ts)
- [dependents.ts](file://convex/dependents.ts)
- [documents.ts](file://convex/documents.ts)
- [finance_records.ts](file://convex/finance_records.ts)
- [meeting_action_items.ts](file://convex/meeting_action_items.ts)
- [meeting_decisions.ts](file://convex/meeting_decisions.ts)
- [scholarships.ts](file://convex/scholarships.ts)
- [security_audit.ts](file://convex/security_audit.ts)
- [two_factor_auth.ts](file://convex/two_factor_auth.ts)
- [bank_accounts.ts](file://convex/bank_accounts.ts)
- [reports.ts](file://convex/reports.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Security Considerations](#security-considerations)
5. [Rate Limiting](#rate-limiting)
6. [API Versioning](#api-versioning)
7. [Client Implementation Guidelines](#client-implementation-guidelines)
8. [Performance Optimization](#performance-optimization)
9. [Resource Endpoints](#resource-endpoints)
   - [Aid Applications](#aid-applications)
   - [Beneficiaries](#beneficiaries)
   - [Donations](#donations)
   - [Meetings](#meetings)
   - [Messages](#messages)
   - [Partners](#partners)
   - [Tasks](#tasks)
   - [Users](#users)
   - [Workflow Notifications](#workflow-notifications)
   - [Audit Logs](#audit-logs)
   - [Errors](#errors)
   - [Storage](#storage)
   - [System Settings](#system-settings)
   - [Analytics](#analytics)
   - [Communication Logs](#communication-logs)
   - [Consents](#consents)
   - [Data Import/Export](#data-importexport)
   - [Dependents](#dependents)
   - [Documents](#documents)
   - [Finance Records](#finance-records)
   - [Meeting Action Items](#meeting-action-items)
   - [Meeting Decisions](#meeting-decisions)
   - [Scholarships](#scholarships)
   - [Security Audit](#security-audit)
   - [Two-Factor Authentication](#two-factor-authentication)
   - [Bank Accounts](#bank-accounts)
   - [Reports](#reports)

## Introduction

The Kafkasder-panel API provides comprehensive access to the application's data and functionality. All endpoints follow a consistent pattern using standard HTTP methods and return JSON responses. The API is organized around resources with predictable URL patterns and standardized response formats.

**Section sources**

- [route-helpers.ts](file://src/lib/api/route-helpers.ts#L1-L73)
- [schema.ts](file://convex/schema.ts#L1-L50)

## Authentication

The API uses session-based authentication with CSRF protection. Users must authenticate through the login endpoint to establish a session.

### Authentication Endpoints

- **POST /api/auth/login**: Authenticate with email and password
- **POST /api/auth/logout**: Terminate current session
- **GET /api/auth/session**: Check current session status
- **GET /api/csrf**: Retrieve CSRF token for state-changing operations

All authenticated requests must include session cookies. The CSRF token must be included in the `x-csrf-token` header for POST, PUT, PATCH, and DELETE requests.

**Section sources**

- [auth-utils.ts](file://src/lib/api/auth-utils.ts#L81-L123)
- [csrf.ts](file://src/lib/csrf.ts#L1-L57)
- [auth.ts](file://convex/auth.ts#L1-L100)

## Error Handling

The API uses a standardized error response format across all endpoints.

### Standard Error Format

```json
{
  "success": false,
  "error": "Error message in Turkish",
  "code": "ERROR_CODE",
  "details": ["Additional error details"]
}
```

### Common Status Codes

| Status Code | Meaning               | Error Code            |
| ----------- | --------------------- | --------------------- |
| 400         | Bad Request           | BAD_REQUEST           |
| 401         | Unauthorized          | UNAUTHORIZED          |
| 403         | Forbidden             | FORBIDDEN             |
| 404         | Not Found             | NOT_FOUND             |
| 409         | Conflict              | CONFLICT              |
| 429         | Too Many Requests     | RATE_LIMIT            |
| 500         | Internal Server Error | INTERNAL_SERVER_ERROR |

### Error Response Examples

**404 Not Found**

```json
{
  "success": false,
  "error": "Kullanıcı bulunamadı",
  "code": "NOT_FOUND"
}
```

**409 Conflict**

```json
{
  "success": false,
  "error": "Bu email adresi zaten kayıtlı",
  "code": "user_already_exists"
}
```

**429 Rate Limit**

```json
{
  "success": false,
  "error": "Çok fazla istek. Lütfen bekleyin",
  "code": "RATE_LIMIT"
}
```

**Section sources**

- [errors.ts](file://src/lib/errors.ts#L1-L377)
- [route-helpers.ts](file://src/lib/api/route-helpers.ts#L58-L71)

## Security Considerations

The API implements multiple security measures to protect data and prevent abuse.

### CSRF Protection

All state-changing operations (POST, PUT, PATCH, DELETE) require CSRF token validation:

1. Client retrieves CSRF token from `/api/csrf`
2. Client includes token in `x-csrf-token` header
3. Server validates token against cookie value
4. Constant-time comparison prevents timing attacks

### Input Validation

All inputs are validated server-side:

- Email format validation
- Phone number validation (Turkish format)
- Turkish ID number (TC Kimlik No) validation
- SQL injection prevention
- XSS protection

### Authentication Requirements

- All endpoints require authentication except health check and CSRF token
- Role-based access control enforces permissions
- Session expiration after inactivity
- Secure cookies in production (HTTPS only)

**Section sources**

- [csrf.ts](file://src/lib/csrf.ts#L1-L90)
- [security.ts](file://src/lib/security.ts#L37-L83)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts#L81-L123)

## Rate Limiting

The API implements rate limiting to prevent abuse and ensure service availability.

### Rate Limit Policies

| Endpoint Pattern                    | Limit        | Window     | Description                 |
| ----------------------------------- | ------------ | ---------- | --------------------------- |
| `/api/auth/*`                       | 5 requests   | 5 minutes  | Authentication endpoints    |
| `/api/storage/upload`               | 10 uploads   | 1 minute   | File upload endpoints       |
| Data modification (POST/PUT/DELETE) | 50 requests  | 15 minutes | Data modification endpoints |
| Read-only (GET)                     | 200 requests | 15 minutes | Read-only endpoints         |
| Search endpoints                    | 30 searches  | 1 minute   | Search endpoints            |
| `/api/health`                       | Unlimited    | -          | Health check endpoints      |

### Rate Limit Headers

Rate-limited responses include:

- `X-RateLimit-Limit`: Maximum number of requests
- `X-RateLimit-Remaining`: Remaining requests in current window
- `Retry-After`: Seconds to wait before retrying

### Rate Limit Bypass

Health check endpoints (`/api/health`) are not rate-limited to allow monitoring systems to function properly.

**Section sources**

- [rate-limit-config.ts](file://src/lib/rate-limit-config.ts#L1-L195)
- [rate-limit.ts](file://src/lib/rate-limit.ts#L1-L41)

## API Versioning

The API uses URL-based versioning with the following scheme:

```
/api/v1/resource
```

Currently, the API is at version 1.0.0, which is stable and production-ready. Backward compatibility is maintained for all minor version updates. Breaking changes will increment the major version number.

Version information is also available in the application's changelog, with the current stable version being v1.0.0.

**Section sources**

- [CHANGELOG.md](file://CHANGELOG.md#L101-L110)

## Client Implementation Guidelines

Follow these guidelines when implementing API clients.

### Authentication Flow

1. Retrieve CSRF token from `/api/csrf`
2. Submit login credentials to `/api/auth/login`
3. Store session cookies for subsequent requests
4. Include CSRF token in state-changing requests

### Error Handling

Implement robust error handling:

- Check `success` field in all responses
- Handle specific error codes appropriately
- Display user-friendly error messages
- Implement retry logic for rate-limited requests

### Request Best Practices

- Use appropriate HTTP methods
- Include proper content type headers
- Validate request data before submission
- Handle redirects appropriately
- Implement proper timeout handling

**Section sources**

- [convex-api-client.ts](file://src/lib/api/convex-api-client.ts#L56-L112)
- [auth-utils.ts](file://src/lib/api/auth-utils.ts#L81-L123)

## Performance Optimization

Optimize API usage with these performance tips.

### Caching Strategy

The API supports client-side caching with different durations:

- **REAL_TIME (30s)**: Frequently changing data
- **SHORT (2m)**: Frequently changing data
- **STANDARD (5m)**: Moderate data
- **MEDIUM (10m)**: Relatively stable data
- **LONG (30m)**: Static or rarely changing data
- **VERY_LONG (1h)**: Configuration or parameters
- **SESSION (Infinity)**: Auth session data

### Cache Headers

The API includes cache control headers:

- `Cache-Control`: Specifies cache duration
- `ETag`: Enables conditional requests
- `Last-Modified`: Timestamp for cache validation

### Optimized Requests

- Use query parameters to filter results
- Request only needed fields when possible
- Use pagination for large datasets
- Batch operations when appropriate
- Implement lazy loading for large resources

**Section sources**

- [cache-config.ts](file://src/lib/cache-config.ts#L1-L48)
- [persistent-cache.ts](file://src/lib/persistent-cache.ts#L1-L30)

## Resource Endpoints

This section documents all public API endpoints organized by resource type.

### Aid Applications

Endpoints for managing aid applications.

**Base URL**: `/api/aid-applications`

| Method | Endpoint | Description                  |
| ------ | -------- | ---------------------------- |
| GET    | /        | List all aid applications    |
| POST   | /        | Create new aid application   |
| GET    | /[id]    | Get specific aid application |
| PUT    | /[id]    | Update aid application       |
| DELETE | /[id]    | Delete aid application       |

**Request Schema (POST/PUT)**

```json
{
  "beneficiaryId": "string",
  "applicationDate": "string",
  "aidType": "string",
  "amount": "number",
  "status": "string",
  "notes": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "beneficiaryId": "string",
  "applicationDate": "string",
  "aidType": "string",
  "amount": "number",
  "status": "string",
  "notes": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [aid_applications.ts](file://convex/aid_applications.ts#L1-L50)
- [aid-applications/route.ts](file://src/app/api/aid-applications/route.ts#L1-L100)

### Beneficiaries

Endpoints for managing beneficiaries.

**Base URL**: `/api/beneficiaries`

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| GET    | /        | List all beneficiaries   |
| POST   | /        | Create new beneficiary   |
| GET    | /[id]    | Get specific beneficiary |
| PUT    | /[id]    | Update beneficiary       |
| DELETE | /[id]    | Delete beneficiary       |

**Request Schema (POST/PUT)**

```json
{
  "name": "string",
  "surname": "string",
  "tcNo": "string",
  "birthDate": "string",
  "gender": "string",
  "phoneNumber": "string",
  "email": "string",
  "address": "string",
  "city": "string",
  "district": "string",
  "neighborhood": "string",
  "postalCode": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "name": "string",
  "surname": "string",
  "tcNo": "string",
  "birthDate": "string",
  "gender": "string",
  "phoneNumber": "string",
  "email": "string",
  "address": "string",
  "city": "string",
  "district": "string",
  "neighborhood": "string",
  "postalCode": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [beneficiaries.ts](file://convex/beneficiaries.ts#L1-L50)
- [beneficiaries/route.ts](file://src/app/api/beneficiaries/route.ts#L1-L100)

### Donations

Endpoints for managing donations.

**Base URL**: `/api/donations`

| Method | Endpoint | Description             |
| ------ | -------- | ----------------------- |
| GET    | /        | List all donations      |
| POST   | /        | Create new donation     |
| GET    | /[id]    | Get specific donation   |
| PUT    | /[id]    | Update donation         |
| DELETE | /[id]    | Delete donation         |
| GET    | /stats   | Get donation statistics |

**Request Schema (POST/PUT)**

```json
{
  "donorName": "string",
  "amount": "number",
  "currency": "string",
  "donationDate": "string",
  "paymentMethod": "string",
  "status": "string",
  "notes": "string",
  "beneficiaryId": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "donorName": "string",
  "amount": "number",
  "currency": "string",
  "donationDate": "string",
  "paymentMethod": "string",
  "status": "string",
  "notes": "string",
  "beneficiaryId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [donations.ts](file://convex/donations.ts#L1-L50)
- [donations/route.ts](file://src/app/api/donations/route.ts#L1-L100)

### Meetings

Endpoints for managing meetings.

**Base URL**: `/api/meetings`

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| GET    | /        | List all meetings    |
| POST   | /        | Create new meeting   |
| GET    | /[id]    | Get specific meeting |
| PUT    | /[id]    | Update meeting       |
| DELETE | /[id]    | Delete meeting       |

**Request Schema (POST/PUT)**

```json
{
  "title": "string",
  "description": "string",
  "meetingDate": "string",
  "startTime": "string",
  "endTime": "string",
  "location": "string",
  "organizerId": "string",
  "participants": ["string"],
  "agenda": "string",
  "status": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "meetingDate": "string",
  "startTime": "string",
  "endTime": "string",
  "location": "string",
  "organizerId": "string",
  "participants": ["string"],
  "agenda": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [meetings.ts](file://convex/meetings.ts#L1-L50)
- [meetings/route.ts](file://src/app/api/meetings/route.ts#L1-L100)

### Messages

Endpoints for managing messages.

**Base URL**: `/api/messages`

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| GET    | /        | List all messages    |
| POST   | /        | Send new message     |
| GET    | /[id]    | Get specific message |
| PUT    | /[id]    | Update message       |
| DELETE | /[id]    | Delete message       |

**Request Schema (POST/PUT)**

```json
{
  "senderId": "string",
  "recipientId": "string",
  "subject": "string",
  "body": "string",
  "priority": "string",
  "status": "string",
  "isRead": "boolean"
}
```

**Response Schema**

```json
{
  "id": "string",
  "senderId": "string",
  "recipientId": "string",
  "subject": "string",
  "body": "string",
  "priority": "string",
  "status": "string",
  "isRead": "boolean",
  "readAt": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [messages.ts](file://convex/messages.ts#L1-L50)
- [messages/route.ts](file://src/app/api/messages/route.ts#L1-L100)

### Partners

Endpoints for managing partners.

**Base URL**: `/api/partners`

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| GET    | /        | List all partners    |
| POST   | /        | Create new partner   |
| GET    | /[id]    | Get specific partner |
| PUT    | /[id]    | Update partner       |
| DELETE | /[id]    | Delete partner       |

**Request Schema (POST/PUT)**

```json
{
  "name": "string",
  "type": "string",
  "contactPerson": "string",
  "phoneNumber": "string",
  "email": "string",
  "address": "string",
  "website": "string",
  "agreementDate": "string",
  "status": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "contactPerson": "string",
  "phoneNumber": "string",
  "email": "string",
  "address": "string",
  "website": "string",
  "agreementDate": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [partners.ts](file://convex/partners.ts#L1-L50)
- [partners/route.ts](file://src/app/api/partners/route.ts#L1-L100)

### Tasks

Endpoints for managing tasks.

**Base URL**: `/api/tasks`

| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| GET    | /        | List all tasks    |
| POST   | /        | Create new task   |
| GET    | /[id]    | Get specific task |
| PUT    | /[id]    | Update task       |
| DELETE | /[id]    | Delete task       |

**Request Schema (POST/PUT)**

```json
{
  "title": "string",
  "description": "string",
  "assignedTo": "string",
  "priority": "string",
  "status": "string",
  "dueDate": "string",
  "estimatedHours": "number",
  "tags": ["string"]
}
```

**Response Schema**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "assignedTo": "string",
  "priority": "string",
  "status": "string",
  "dueDate": "string",
  "estimatedHours": "number",
  "actualHours": "number",
  "tags": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [tasks.ts](file://convex/tasks.ts#L1-L50)
- [tasks/route.ts](file://src/app/api/tasks/route.ts#L1-L100)

### Users

Endpoints for managing users.

**Base URL**: `/api/users`

| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| GET    | /        | List all users    |
| POST   | /        | Create new user   |
| GET    | /[id]    | Get specific user |
| PUT    | /[id]    | Update user       |
| DELETE | /[id]    | Delete user       |

**Request Schema (POST/PUT)**

```json
{
  "name": "string",
  "surname": "string",
  "email": "string",
  "phoneNumber": "string",
  "role": "string",
  "department": "string",
  "status": "string",
  "permissions": ["string"]
}
```

**Response Schema**

```json
{
  "id": "string",
  "name": "string",
  "surname": "string",
  "email": "string",
  "phoneNumber": "string",
  "role": "string",
  "department": "string",
  "status": "string",
  "permissions": ["string"],
  "lastLogin": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [users.ts](file://convex/users.ts#L1-L50)
- [users/route.ts](file://src/app/api/users/route.ts#L1-L100)

### Workflow Notifications

Endpoints for managing workflow notifications.

**Base URL**: `/api/workflow-notifications`

| Method | Endpoint | Description                        |
| ------ | -------- | ---------------------------------- |
| GET    | /        | List all workflow notifications    |
| POST   | /        | Create new workflow notification   |
| GET    | /[id]    | Get specific workflow notification |
| PUT    | /[id]    | Update workflow notification       |
| DELETE | /[id]    | Delete workflow notification       |

**Request Schema (POST/PUT)**

```json
{
  "workflowId": "string",
  "triggerEvent": "string",
  "notificationType": "string",
  "recipients": ["string"],
  "template": "string",
  "conditions": {},
  "status": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "workflowId": "string",
  "triggerEvent": "string",
  "notificationType": "string",
  "recipients": ["string"],
  "template": "string",
  "conditions": {},
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [workflow_notifications.ts](file://convex/workflow_notifications.ts#L1-L50)
- [workflow-notifications/route.ts](file://src/app/api/workflow-notifications/route.ts#L1-L100)

### Audit Logs

Endpoints for accessing audit logs.

**Base URL**: `/api/audit-logs`

| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | /        | List audit logs        |
| GET    | /[id]    | Get specific audit log |

**Response Schema**

```json
{
  "id": "string",
  "userId": "string",
  "action": "string",
  "resource": "string",
  "resourceId": "string",
  "ipAddress": "string",
  "userAgent": "string",
  "details": {},
  "createdAt": "string"
}
```

**Section sources**

- [audit_logs.ts](file://convex/audit_logs.ts#L1-L50)
- [audit-logs/route.ts](file://src/app/api/audit-logs/route.ts#L1-L100)

### Errors

Endpoints for error reporting and management.

**Base URL**: `/api/errors`

| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | /            | List errors          |
| POST   | /            | Report new error     |
| GET    | /[id]        | Get specific error   |
| PUT    | /[id]        | Update error         |
| POST   | /[id]/assign | Assign error to user |
| GET    | /stats       | Get error statistics |

**Request Schema (POST)**

```json
{
  "title": "string",
  "description": "string",
  "severity": "string",
  "category": "string",
  "component": "string",
  "url": "string",
  "userAgent": "string",
  "stackTrace": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "severity": "string",
  "category": "string",
  "component": "string",
  "url": "string",
  "userAgent": "string",
  "stackTrace": "string",
  "status": "string",
  "assignedTo": "string",
  "resolvedAt": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [errors.ts](file://convex/errors.ts#L1-L50)
- [errors/route.ts](file://src/app/api/errors/route.ts#L1-L100)

### Storage

Endpoints for file storage operations.

**Base URL**: `/api/storage`

| Method | Endpoint  | Description       |
| ------ | --------- | ----------------- |
| POST   | /upload   | Upload file       |
| GET    | /[fileId] | Get file metadata |
| DELETE | /[fileId] | Delete file       |

**Request Schema (POST /upload)**

```json
{
  "file": "binary",
  "fileName": "string",
  "contentType": "string",
  "tags": ["string"]
}
```

**Response Schema**

```json
{
  "id": "string",
  "fileName": "string",
  "contentType": "string",
  "size": "number",
  "url": "string",
  "tags": ["string"],
  "createdAt": "string"
}
```

**Section sources**

- [storage.ts](file://convex/storage.ts#L1-L50)
- [storage/upload/route.ts](file://src/app/api/storage/upload/route.ts#L1-L100)

### System Settings

Endpoints for managing system settings.

**Base URL**: `/api/settings`

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| GET    | /                 | List all settings        |
| GET    | /[category]       | Get settings by category |
| GET    | /[category]/[key] | Get specific setting     |
| POST   | /[category]/[key] | Create or update setting |

**Response Schema**

```json
{
  "category": "string",
  "key": "string",
  "value": {},
  "type": "string",
  "description": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [system_settings.ts](file://convex/system_settings.ts#L1-L50)
- [settings/route.ts](file://src/app/api/settings/route.ts#L1-L100)

### Analytics

Endpoints for accessing analytics data.

**Base URL**: `/api/analytics`

| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | /        | Get analytics overview |

**Response Schema**

```json
{
  "beneficiaries": {
    "total": "number",
    "active": "number",
    "inactive": "number"
  },
  "donations": {
    "totalAmount": "number",
    "totalCount": "number",
    "averageAmount": "number"
  },
  "users": {
    "total": "number",
    "active": "number",
    "roles": {}
  },
  "tasks": {
    "total": "number",
    "completed": "number",
    "overdue": "number"
  },
  "meetings": {
    "total": "number",
    "upcoming": "number",
    "completed": "number"
  }
}
```

**Section sources**

- [analytics.ts](file://convex/analytics.ts#L1-L50)
- [analytics/route.ts](file://src/app/api/analytics/route.ts#L1-L100)

### Communication Logs

Endpoints for accessing communication logs.

**Base URL**: `/api/communication-logs`

| Method | Endpoint | Description             |
| ------ | -------- | ----------------------- |
| GET    | /        | List communication logs |

**Response Schema**

```json
{
  "id": "string",
  "userId": "string",
  "beneficiaryId": "string",
  "communicationType": "string",
  "channel": "string",
  "subject": "string",
  "content": "string",
  "status": "string",
  "scheduledTime": "string",
  "sentTime": "string",
  "response": "string",
  "createdAt": "string"
}
```

**Section sources**

- [communication_logs.ts](file://convex/communication_logs.ts#L1-L50)
- [communication-logs/route.ts](file://src/app/api/communication-logs/route.ts#L1-L100)

### Consents

Endpoints for managing consents.

**Base URL**: `/api/consents`

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| GET    | /        | List consents        |
| POST   | /        | Create consent       |
| GET    | /[id]    | Get specific consent |
| PUT    | /[id]    | Update consent       |

**Request Schema (POST/PUT)**

```json
{
  "beneficiaryId": "string",
  "consentType": "string",
  "consentText": "string",
  "givenAt": "string",
  "expiresAt": "string",
  "status": "string",
  "witnesses": ["string"]
}
```

**Response Schema**

```json
{
  "id": "string",
  "beneficiaryId": "string",
  "consentType": "string",
  "consentText": "string",
  "givenAt": "string",
  "expiresAt": "string",
  "status": "string",
  "witnesses": ["string"],
  "signedDocumentId": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [consents.ts](file://convex/consents.ts#L1-L50)

### Data Import/Export

Endpoints for data import and export operations.

**Base URL**: `/api/data-import-export`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST   | /import  | Import data |
| GET    | /export  | Export data |

**Request Schema (POST /import)**

```json
{
  "importType": "string",
  "fileId": "string",
  "options": {}
}
```

**Response Schema (GET /export)**

```json
{
  "exportId": "string",
  "exportType": "string",
  "format": "string",
  "status": "string",
  "fileUrl": "string",
  "recordCount": "number",
  "createdAt": "string",
  "completedAt": "string"
}
```

**Section sources**

- [data_import_export.ts](file://convex/data_import_export.ts#L1-L50)

### Dependents

Endpoints for managing dependents.

**Base URL**: `/api/dependents`

| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | /        | List dependents        |
| POST   | /        | Create dependent       |
| GET    | /[id]    | Get specific dependent |
| PUT    | /[id]    | Update dependent       |
| DELETE | /[id]    | Delete dependent       |

**Request Schema (POST/PUT)**

```json
{
  "beneficiaryId": "string",
  "name": "string",
  "surname": "string",
  "relationship": "string",
  "birthDate": "string",
  "gender": "string",
  "educationLevel": "string",
  "schoolName": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "beneficiaryId": "string",
  "name": "string",
  "surname": "string",
  "relationship": "string",
  "birthDate": "string",
  "gender": "string",
  "educationLevel": "string",
  "schoolName": "string",
  "status": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [dependents.ts](file://convex/dependents.ts#L1-L50)

### Documents

Endpoints for managing documents.

**Base URL**: `/api/documents`

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | /        | List documents        |
| POST   | /        | Create document       |
| GET    | /[id]    | Get specific document |
| PUT    | /[id]    | Update document       |
| DELETE | /[id]    | Delete document       |

**Request Schema (POST/PUT)**

```json
{
  "beneficiaryId": "string",
  "documentType": "string",
  "fileId": "string",
  "issueDate": "string",
  "expiryDate": "string",
  "status": "string",
  "notes": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "beneficiaryId": "string",
  "documentType": "string",
  "fileId": "string",
  "issueDate": "string",
  "expiryDate": "string",
  "status": "string",
  "notes": "string",
  "verifiedAt": "string",
  "verifiedBy": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [documents.ts](file://convex/documents.ts#L1-L50)

### Finance Records

Endpoints for managing finance records.

**Base URL**: `/api/finance-records`

| Method | Endpoint | Description                 |
| ------ | -------- | --------------------------- |
| GET    | /        | List finance records        |
| POST   | /        | Create finance record       |
| GET    | /[id]    | Get specific finance record |
| PUT    | /[id]    | Update finance record       |
| DELETE | /[id]    | Delete finance record       |

**Request Schema (POST/PUT)**

```json
{
  "transactionType": "string",
  "amount": "number",
  "currency": "string",
  "date": "string",
  "categoryId": "string",
  "description": "string",
  "reference": "string",
  "status": "string",
  "attachments": ["string"]
}
```

**Response Schema**

```json
{
  "id": "string",
  "transactionType": "string",
  "amount": "number",
  "currency": "string",
  "date": "string",
  "categoryId": "string",
  "description": "string",
  "reference": "string",
  "status": "string",
  "attachments": ["string"],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [finance_records.ts](file://convex/finance_records.ts#L1-L50)

### Meeting Action Items

Endpoints for managing meeting action items.

**Base URL**: `/api/meeting-action-items`

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| GET    | /        | List action items        |
| POST   | /        | Create action item       |
| GET    | /[id]    | Get specific action item |
| PUT    | /[id]    | Update action item       |
| DELETE | /[id]    | Delete action item       |

**Request Schema (POST/PUT)**

```json
{
  "meetingId": "string",
  "title": "string",
  "description": "string",
  "assignedTo": "string",
  "dueDate": "string",
  "priority": "string",
  "status": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "meetingId": "string",
  "title": "string",
  "description": "string",
  "assignedTo": "string",
  "dueDate": "string",
  "priority": "string",
  "status": "string",
  "completedAt": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [meeting_action_items.ts](file://convex/meeting_action_items.ts#L1-L50)

### Meeting Decisions

Endpoints for managing meeting decisions.

**Base URL**: `/api/meeting-decisions`

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | /        | List decisions        |
| POST   | /        | Create decision       |
| GET    | /[id]    | Get specific decision |
| PUT    | /[id]    | Update decision       |
| DELETE | /[id]    | Delete decision       |

**Request Schema (POST/PUT)**

```json
{
  "meetingId": "string",
  "title": "string",
  "description": "string",
  "decisionType": "string",
  "status": "string",
  "implementationPlan": "string",
  "responsible": "string",
  "deadline": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "meetingId": "string",
  "title": "string",
  "description": "string",
  "decisionType": "string",
  "status": "string",
  "implementationPlan": "string",
  "responsible": "string",
  "deadline": "string",
  "implementationStatus": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [meeting_decisions.ts](file://convex/meeting_decisions.ts#L1-L50)

### Scholarships

Endpoints for managing scholarships.

**Base URL**: `/api/scholarships`

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| GET    | /        | List scholarships        |
| POST   | /        | Create scholarship       |
| GET    | /[id]    | Get specific scholarship |
| PUT    | /[id]    | Update scholarship       |
| DELETE | /[id]    | Delete scholarship       |

**Request Schema (POST/PUT)**

```json
{
  "studentId": "string",
  "scholarshipType": "string",
  "amount": "number",
  "currency": "string",
  "startDate": "string",
  "endDate": "string",
  "status": "string",
  "fundingSource": "string",
  "conditions": "string"
}
```

**Response Schema**

```json
{
  "id": "string",
  "studentId": "string",
  "scholarshipType": "string",
  "amount": "number",
  "currency": "string",
  "startDate": "string",
  "endDate": "string",
  "status": "string",
  "fundingSource": "string",
  "conditions": "string",
  "paymentSchedule": [],
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [scholarships.ts](file://convex/scholarships.ts#L1-L50)

### Security Audit

Endpoints for security audit operations.

**Base URL**: `/api/security-audit`

| Method | Endpoint | Description                |
| ------ | -------- | -------------------------- |
| GET    | /        | List security audit events |

**Response Schema**

```json
{
  "id": "string",
  "eventType": "string",
  "severity": "string",
  "description": "string",
  "ipAddress": "string",
  "userId": "string",
  "details": {},
  "createdAt": "string"
}
```

**Section sources**

- [security_audit.ts](file://convex/security_audit.ts#L1-L50)

### Two-Factor Authentication

Endpoints for two-factor authentication management.

**Base URL**: `/api/two-factor-auth`

| Method | Endpoint | Description     |
| ------ | -------- | --------------- |
| POST   | /enable  | Enable 2FA      |
| POST   | /disable | Disable 2FA     |
| POST   | /verify  | Verify 2FA code |
| GET    | /status  | Get 2FA status  |

**Request Schema (POST /verify)**

```json
{
  "code": "string",
  "recoveryCode": "string"
}
```

**Response Schema (GET /status)**

```json
{
  "enabled": "boolean",
  "method": "string",
  "recoveryCodesGeneratedAt": "string",
  "lastVerifiedAt": "string"
}
```

**Section sources**

- [two_factor_auth.ts](file://convex/two_factor_auth.ts#L1-L50)

### Bank Accounts

Endpoints for managing bank accounts.

**Base URL**: `/api/bank-accounts`

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| GET    | /        | List bank accounts        |
| POST   | /        | Create bank account       |
| GET    | /[id]    | Get specific bank account |
| PUT    | /[id]    | Update bank account       |
| DELETE | /[id]    | Delete bank account       |

**Request Schema (POST/PUT)**

```json
{
  "accountName": "string",
  "bankName": "string",
  "branchName": "string",
  "accountNumber": "string",
  "iban": "string",
  "currency": "string",
  "status": "string",
  "balance": "number"
}
```

**Response Schema**

```json
{
  "id": "string",
  "accountName": "string",
  "bankName": "string",
  "branchName": "string",
  "accountNumber": "string",
  "iban": "string",
  "currency": "string",
  "status": "string",
  "balance": "number",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Section sources**

- [bank_accounts.ts](file://convex/bank_accounts.ts#L1-L50)

### Reports

Endpoints for generating reports.

**Base URL**: `/api/reports`

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | /                    | List available reports |
| GET    | /[reportId]/generate | Generate report        |
| GET    | /[reportId]/download | Download report        |

**Response Schema (GET /)**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "parameters": [],
  "formats": ["string"],
  "lastGeneratedAt": "string",
  "createdAt": "string"
}
```

**Section sources**

- [reports.ts](file://convex/reports.ts#L1-L50)
