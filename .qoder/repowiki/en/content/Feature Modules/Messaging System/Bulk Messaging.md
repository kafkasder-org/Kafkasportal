# Bulk Messaging

<cite>
**Referenced Files in This Document**   
- [RecipientSelector.tsx](file://src/components/messages/RecipientSelector.tsx)
- [message.ts](file://src/lib/validations/message.ts)
- [MessageForm.tsx](file://src/components/forms/MessageForm.tsx)
- [sms.ts](file://src/lib/services/sms.ts)
- [page.tsx](file://src/app/(dashboard)/mesaj/toplu/page.tsx)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Recipient Selection and Management](#recipient-selection-and-management)
3. [Bulk Messaging Workflow](#bulk-messaging-workflow)
4. [Validation and Limits](#validation-and-limits)
5. [Backend Processing](#backend-processing)
6. [Performance Considerations](#performance-considerations)
7. [Rate Limiting and Audit Integration](#rate-limiting-and-audit-integration)

## Introduction

The Bulk Messaging feature enables users to send messages to multiple recipients simultaneously through SMS, email, or internal messaging channels. The system implements comprehensive validation, recipient management, and confirmation workflows to ensure reliable bulk communication. This documentation details the implementation of recipient selection limits, automatic flagging of bulk messages, confirmation dialogs, backend processing through Convex mutations, and integration with rate limiting and audit logging systems.

## Recipient Selection and Management

The recipient selection interface provides multiple sources for choosing recipients, including beneficiaries, donors, users, and custom entries. Users can search, filter, and select recipients with visual feedback on selection status.

The UI displays selected recipients as removable badges, allowing users to easily manage their recipient list. The component supports importing recipients from CSV files and exporting selected lists for external use.

```mermaid
flowchart TD
A[Start] --> B[Select Recipient Source]
B --> C{Beneficiaries/Donors/Users/Custom}
C --> D[Search and Filter]
D --> E[Select Individual Recipients]
E --> F[Add to Selected List]
F --> G[Display as Badges]
G --> H[Remove via X Button]
H --> I[Update Selection]
I --> J[Proceed to Next Step]
```

**Diagram sources**

- [RecipientSelector.tsx](file://src/components/messages/RecipientSelector.tsx#L48-L603)

**Section sources**

- [RecipientSelector.tsx](file://src/components/messages/RecipientSelector.tsx#L48-L603)

## Bulk Messaging Workflow

The bulk messaging process follows a multi-step wizard pattern that guides users through message composition, recipient selection, preview, and sending. Each step validates inputs before allowing progression to the next stage.

When multiple recipients are selected, the system automatically sets the `is_bulk` flag to true and displays a confirmation dialog before sending. This prevents accidental mass messaging and ensures user intent.

```mermaid
sequenceDiagram
participant User
participant UI
participant Backend
User->>UI : Compose Message
UI->>UI : Validate Content
User->>UI : Select Recipients
UI->>UI : Validate Recipient Count
User->>UI : Preview Message
UI->>User : Show Confirmation Dialog
User->>UI : Confirm Sending
UI->>Backend : Create Message with is_bulk=true
Backend->>Backend : Process Recipients
Backend->>Backend : Send via SMS/Email Service
Backend->>UI : Return Results
UI->>User : Display Success/Failure Summary
```

**Diagram sources**

- [page.tsx](<file://src/app/(dashboard)/mesaj/toplu/page.tsx#L59-L787>)
- [MessageForm.tsx](file://src/components/forms/MessageForm.tsx#L235-L294)

**Section sources**

- [page.tsx](<file://src/app/(dashboard)/mesaj/toplu/page.tsx#L59-L787>)
- [MessageForm.tsx](file://src/components/forms/MessageForm.tsx#L235-L294)

## Validation and Limits

The system enforces strict validation rules to maintain data integrity and prevent abuse. The maximum recipient limit is set to 100 recipients per message, with real-time feedback on selection count.

Validation rules vary by message type:

- SMS messages require valid Turkish phone numbers (10 digits, starting with 5)
- Email messages require valid email addresses and a subject line
- Internal messages require valid user IDs and a subject

```mermaid
flowchart TD
A[Start Validation] --> B{Message Type}
B --> C[SMS]
B --> D[Email]
B --> E[Internal]
C --> F[Check Phone Format]
C --> G[Max 160 Characters]
C --> H[Max 100 Recipients]
D --> I[Valid Email Addresses]
D --> J[Subject Required]
D --> K[Max 5000 Characters]
E --> L[Valid User IDs]
E --> M[Subject Required]
E --> N[Max 100 Recipients]
F --> O[All Valid?]
G --> O
H --> O
I --> P[All Valid?]
J --> P
K --> P
L --> Q[All Valid?]
M --> Q
N --> Q
O --> R{Yes/No}
P --> R
Q --> R
R --> |Yes| S[Proceed]
R --> |No| T[Show Errors]
```

**Diagram sources**

- [message.ts](file://src/lib/validations/message.ts#L1-L271)

**Section sources**

- [message.ts](file://src/lib/validations/message.ts#L1-L271)

## Backend Processing

Bulk messages are processed through Convex mutations that handle message creation and delivery. The backend separates concerns between message storage and actual delivery, allowing for reliable processing and error handling.

For SMS delivery, the system uses Twilio with rate limiting to prevent exceeding service limits. Each message is sent with a 1-second delay between recipients to comply with rate limits.

```mermaid
flowchart TD
A[Create Message Mutation] --> B[Store Message in Database]
B --> C{Message Type}
C --> D[SMS]
C --> E[Email]
C --> F[Internal]
D --> G[Extract Phone Numbers]
G --> H[Send via Twilio]
H --> I[Apply 1s Delay Between Messages]
I --> J[Track Success/Failure]
E --> K[Extract Email Addresses]
K --> L[Send via Email Service]
L --> M[Track Results]
F --> N[Update Message Status]
N --> O[No External Delivery]
J --> P[Return Results]
M --> P
O --> P
P --> Q[Update UI]
```

**Diagram sources**

- [sms.ts](file://src/lib/services/sms.ts#L1-L219)
- [page.tsx](<file://src/app/(dashboard)/mesaj/toplu/page.tsx#L156-L231>)

**Section sources**

- [sms.ts](file://src/lib/services/sms.ts#L1-L219)
- [page.tsx](<file://src/app/(dashboard)/mesaj/toplu/page.tsx#L156-L231>)

## Performance Considerations

The bulk messaging system implements several performance optimizations to handle large recipient lists efficiently:

- Batch processing with configurable batch sizes (default: 50 recipients per batch)
- Progress tracking with percentage completion
- Asynchronous processing to prevent UI blocking
- Error isolation to ensure partial failures don't stop the entire process

The system estimates delivery time based on recipient count and applies appropriate delays between messages to respect rate limits. For large recipient lists, the estimated delivery time can be several minutes, which is communicated to users through the progress interface.

```mermaid
flowchart TD
A[Start Bulk Send] --> B[Calculate Batches]
B --> C{Batch Size: 50}
C --> D[Process First Batch]
D --> E[Wait 1s Between Messages]
E --> F[Track Success/Failure]
F --> G[Update Progress Bar]
G --> H{More Batches?}
H --> |Yes| I[Process Next Batch]
I --> D
H --> |No| J[Compile Results]
J --> K[Display Summary]
K --> L[Enable Retry for Failed]
```

**Diagram sources**

- [page.tsx](<file://src/app/(dashboard)/mesaj/toplu/page.tsx#L182-L215>)

**Section sources**

- [page.tsx](<file://src/app/(dashboard)/mesaj/toplu/page.tsx#L182-L215>)

## Rate Limiting and Audit Integration

The system integrates comprehensive rate limiting and audit logging to prevent abuse and maintain security. All bulk messaging operations are logged with details including:

- User ID and IP address
- Timestamp and message type
- Recipient count and content summary
- Success/failure status

Rate limiting is implemented at multiple levels:

- Per-user limits to prevent individual abuse
- Per-IP limits to prevent distributed attacks
- Service-level limits to protect external providers

The audit system tracks all bulk messaging operations and generates alerts for suspicious patterns, such as unusually high message volumes or frequent failures.

```mermaid
flowchart TD
A[Send Bulk Message] --> B[Rate Limit Check]
B --> C{Within Limits?}
C --> |Yes| D[Process Message]
C --> |No| E[Reject Request]
E --> F[Log Violation]
D --> G[Send Messages]
G --> H[Log Results]
H --> I[Update Statistics]
I --> J[Check for Anomalies]
J --> K{Suspicious Pattern?}
K --> |Yes| L[Generate Alert]
K --> |No| M[Store Normal Log]
L --> N[Notify Admin]
M --> O[Complete]
```

**Diagram sources**

- [sms.ts](file://src/lib/services/sms.ts#L108-L161)
- [security.ts](file://src/lib/security.ts#L81-L121)

**Section sources**

- [sms.ts](file://src/lib/services/sms.ts#L108-L161)
- [security.ts](file://src/lib/security.ts#L81-L121)
