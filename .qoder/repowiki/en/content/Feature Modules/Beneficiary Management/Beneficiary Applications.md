# Beneficiary Applications

<cite>
**Referenced Files in This Document**   
- [aid_applications.ts](file://convex/aid_applications.ts)
- [aid-application.ts](file://src/lib/validations/aid-application.ts)
- [AidApplicationForm.tsx](file://src/components/forms/AidApplicationForm.tsx)
- [route.ts](file://src/app/api/aid-applications/route.ts)
- [route.ts](file://src/app/api/aid-applications/[id]/route.ts)
- [database.ts](file://src/types/database.ts)
- [api.ts](file://src/lib/convex/api.ts)
- [convex-api-client.ts](file://src/lib/api/convex-api-client.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Data Model](#data-model)
3. [Form Validation](#form-validation)
4. [UI Components](#ui-components)
5. [API Routes](#api-routes)
6. [Workflows](#workflows)
7. [Integration Points](#integration-points)
8. [Common Issues](#common-issues)

## Introduction

The Beneficiary Applications module enables the submission, review, and tracking of aid applications for beneficiaries. This system supports various application types including individuals, organizations, and partners. The module provides comprehensive functionality for managing application lifecycles from initial submission through approval and completion. Applications can request multiple types of aid including one-time financial assistance, regular financial support, food aid, in-kind donations, and service referrals. The system integrates with beneficiary profiles, document management, and notification systems to provide a complete solution for aid distribution management.

## Data Model

The aid application data model is defined in the `AidApplicationDocument` interface and implemented in the Convex database. The data structure includes application metadata, aid types, status tracking, and workflow information.

```mermaid
erDiagram
AID_APPLICATIONS {
string _id PK
string _creationTime
string _updatedAt
string application_date
string applicant_type
string applicant_name
string beneficiary_id FK
number one_time_aid
number regular_financial_aid
number regular_food_aid
number in_kind_aid
number service_referral
string stage
string status
string description
string notes
string priority
string processed_by
string processed_at
string approved_by
string approved_at
string completed_at
}
BENEFICIARIES {
string _id PK
string name
string tc_no
string phone
string city
}
USERS {
string _id PK
string name
string email
string role
}
AID_APPLICATIONS ||--o{ BENEFICIARIES : "beneficiary_id"
AID_APPLICATIONS }o--|| USERS : "processed_by"
AID_APPLICATIONS }o--|| USERS : "approved_by"
```

**Diagram sources**

- [database.ts](file://src/types/database.ts#L186-L215)
- [aid_applications.ts](file://convex/aid_applications.ts#L55-L92)

**Section sources**

- [database.ts](file://src/types/database.ts#L186-L215)
- [aid_applications.ts](file://convex/aid_applications.ts#L55-L92)

## Form Validation

Form validation is implemented using Zod schemas to ensure data integrity at both the client and server levels. The validation schema defines required fields, data types, and constraints for aid applications.

```mermaid
classDiagram
class AidApplicationValidation {
+applicant_type : enum['person','organization','partner']
+applicant_name : string (min 2 chars)
+beneficiary_id : string (optional)
+one_time_aid : number (min 0)
+regular_financial_aid : number (min 0)
+regular_food_aid : number (min 0)
+in_kind_aid : number (min 0)
+service_referral : number (min 0)
+description : string (optional)
+notes : string (optional)
+priority : enum['low','normal','high','urgent'] (optional)
+isValidAidApplicationDocument(data) : boolean
+validateAidApplicationDocument(data) : AidApplicationDocument | null
}
```

**Diagram sources**

- [aid-application.ts](file://src/lib/validations/aid-application.ts#L8-L44)

**Section sources**

- [aid-application.ts](file://src/lib/validations/aid-application.ts#L8-L67)

## UI Components

The UI components provide a user-friendly interface for creating and managing aid applications. The main component is the AidApplicationForm which handles form rendering, validation, and submission.

```mermaid
flowchart TD
A[AidApplicationForm] --> B[Form State Management]
A --> C[Beneficiary Selection]
A --> D[Aid Type Inputs]
A --> E[Priority Selection]
A --> F[Form Validation]
A --> G[Submission Handling]
G --> H[API Call]
H --> I[Success/Error Handling]
I --> J[Toast Notifications]
I --> K[Form Reset]
```

**Diagram sources**

- [AidApplicationForm.tsx](file://src/components/forms/AidApplicationForm.tsx#L51-L349)

**Section sources**

- [AidApplicationForm.tsx](file://src/components/forms/AidApplicationForm.tsx#L26-L41)

## API Routes

The API routes handle CRUD operations for aid applications, providing endpoints for creating, reading, updating, and deleting application records. These routes serve as the interface between the frontend and the Convex database.

```mermaid
sequenceDiagram
participant Client
participant API
participant Convex
participant Database
Client->>API : POST /api/aid-applications
API->>API : validateApplication(data)
API->>Convex : convexAidApplications.create(applicationData)
Convex->>Database : Insert record
Database-->>Convex : Return created record
Convex-->>API : Return response
API-->>Client : 201 Created
Client->>API : GET /api/aid-applications/[id]
API->>Convex : convexAidApplications.get(id)
Convex->>Database : Query record
Database-->>Convex : Return record
Convex-->>API : Return response
API-->>Client : 200 OK
Client->>API : PATCH /api/aid-applications/[id]
API->>API : validateApplicationUpdate(data)
API->>Convex : convexAidApplications.update(id, applicationData)
Convex->>Database : Update record
Database-->>Convex : Return updated record
Convex-->>API : Return response
API-->>Client : 200 OK
```

**Diagram sources**

- [route.ts](file://src/app/api/aid-applications/route.ts#L61-L114)
- [route.ts](file://src/app/api/aid-applications/[id]/route.ts#L53-L120)

**Section sources**

- [route.ts](file://src/app/api/aid-applications/route.ts#L61-L114)
- [route.ts](file://src/app/api/aid-applications/[id]/route.ts#L53-L120)

## Workflows

The application workflows cover the complete lifecycle of aid applications from submission to completion. These workflows include application creation, status updates, and history tracking.

```mermaid
stateDiagram-v2
[*] --> Draft
Draft --> UnderReview : Submit for review
UnderReview --> Approved : Review completed
UnderReview --> Draft : Request changes
Approved --> Ongoing : Aid distribution starts
Ongoing --> Completed : Aid distribution ends
Ongoing --> Approved : Pause aid
Completed --> [*]
Draft --> [*] : Delete
UnderReview --> [*] : Reject
```

**Diagram sources**

- [aid_applications.ts](file://convex/aid_applications.ts#L95-L147)
- [AidApplicationForm.tsx](file://src/components/forms/AidApplicationForm.tsx#L82-L88)

**Section sources**

- [aid_applications.ts](file://convex/aid_applications.ts#L95-L147)

## Integration Points

The Beneficiary Applications module integrates with several other system components including beneficiary profiles, document uploads, and notification systems. These integrations provide a comprehensive solution for aid management.

```mermaid
graph TD
A[Aid Applications] --> B[Beneficiary Profiles]
A --> C[Document Management]
A --> D[Notification System]
A --> E[User Management]
A --> F[Audit Logs]
B --> G[Beneficiary Details]
C --> H[Uploaded Documents]
D --> I[Email/SMS Notifications]
E --> J[User Roles & Permissions]
F --> K[Application History]
```

**Diagram sources**

- [aid_applications.ts](file://convex/aid_applications.ts#L55-L92)
- [convex-api-client.ts](file://src/lib/api/convex-api-client.ts#L654-L714)

**Section sources**

- [convex-api-client.ts](file://src/lib/api/convex-api-client.ts#L654-L714)

## Common Issues

This section addresses common issues encountered when working with the Beneficiary Applications module, including validation errors, status transitions, and expired applications.

### Application Validation

Validation issues typically occur when required fields are missing or contain invalid data. The system validates applications at both the client and server levels to ensure data integrity.

**Section sources**

- [aid-application.ts](file://src/lib/validations/aid-application.ts#L8-L44)
- [route.ts](file://src/app/api/aid-applications/route.ts#L6-L27)

### Status Transitions

Status transitions follow a specific workflow to maintain application integrity. Invalid transitions are prevented by server-side validation.

**Section sources**

- [aid_applications.ts](file://convex/aid_applications.ts#L136-L142)
- [route.ts](file://src/app/api/aid-applications/[id]/route.ts#L7-L21)

### Expired Applications

Applications may expire if not processed within a specified timeframe. The system does not automatically handle expiration but provides the necessary fields to track application timelines.

**Section sources**

- [database.ts](file://src/types/database.ts#L201-L202)
- [aid_applications.ts](file://convex/aid_applications.ts#L70-L75)
