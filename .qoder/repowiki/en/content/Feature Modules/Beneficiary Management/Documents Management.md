# Documents Management

<cite>
**Referenced Files in This Document**   
- [documents.ts](file://convex/documents.ts)
- [storage.ts](file://convex/storage.ts)
- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx)
- [upload/route.ts](file://src/app/api/storage/upload/route.ts)
- [\[fileId\]/route.ts](file://src/app/api/storage/[fileId]/route.ts)
- [database.ts](file://src/types/database.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Data Model](#data-model)
3. [File Storage Integration](#file-storage-integration)
4. [API Routes](#api-routes)
5. [UI Components](#ui-components)
6. [Document Workflows](#document-workflows)
7. [Security Considerations](#security-considerations)
8. [Common Issues and Solutions](#common-issues-and-solutions)

## Introduction

The Documents Management feature provides a comprehensive system for uploading, viewing, and managing documents for beneficiaries within the Kafkasder-panel application. This system enables users to handle identification documents, medical reports, and other supporting files with robust security and access controls. The implementation leverages Convex as the backend platform, utilizing its file storage capabilities and database functionality to create a seamless document management experience. The feature supports document versioning, access control, and metadata tracking, ensuring that sensitive beneficiary information is properly managed and secured.

## Data Model

The document management system uses a structured data model to track document metadata and relationships. The core document schema includes essential fields for tracking file information, ownership, and access permissions.

```mermaid
erDiagram
DOCUMENTS {
string _id PK
string fileName
number fileSize
string fileType
string bucket
string storageId FK
string beneficiary_id FK
string document_type
string uploadedBy FK
string uploadedAt
string category
array tags
string accessLevel
array sharedWith
number version
}
DOCUMENT_VERSIONS {
string _id PK
string document_id FK
number version_number
string storage_id
string file_name
number file_size
string file_type
string version_notes
string created_by FK
created_at timestamp
}
BENEFICIARIES {
string _id PK
string name
string tc_no
string phone
}
USERS {
string _id PK
string name
string email
string role
}
DOCUMENTS ||--o{ DOCUMENT_VERSIONS : "has versions"
DOCUMENTS }|--|| BENEFICIARIES : "belongs to"
DOCUMENTS }|--|| USERS : "uploaded by"
DOCUMENTS }|--|| USERS : "shared with"
```

**Diagram sources**

- [documents.ts](file://convex/documents.ts#L53-L104)
- [database.ts](file://src/types/database.ts#L8-L15)

**Section sources**

- [documents.ts](file://convex/documents.ts#L53-L104)
- [database.ts](file://src/types/database.ts#L8-L15)

## File Storage Integration

The document management system integrates with Convex's storage system to handle file uploads and retrieval. The integration follows a secure pattern where files are first uploaded to Convex storage, and then metadata is stored in the database.

```mermaid
sequenceDiagram
participant Client as "Client Application"
participant API as "API Route"
participant Convex as "Convex Backend"
participant Storage as "Convex Storage"
Client->>API : POST /api/storage/upload
API->>Convex : Request upload URL
Convex->>Storage : Generate signed upload URL
Storage-->>Convex : Return upload URL
Convex-->>API : Return upload URL
API->>Storage : Upload file to signed URL
Storage-->>API : Confirm upload success
API->>Convex : Create document metadata
Convex->>Database : Insert document record
Database-->>Convex : Return document ID
Convex-->>API : Confirm metadata creation
API-->>Client : Return success response with file ID
```

**Diagram sources**

- [documents.ts](file://convex/documents.ts#L101-L106)
- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L49-L66)

**Section sources**

- [documents.ts](file://convex/documents.ts#L101-L106)
- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L49-L66)

## API Routes

The document management system exposes several API routes to handle document operations, including upload, retrieval, and deletion. These routes follow REST principles and provide secure access to document functionality.

### Upload Route

The upload route handles document uploads by first validating the file and then coordinating with Convex storage.

```mermaid
flowchart TD
Start([Upload Request]) --> ValidateInput["Validate Input Parameters"]
ValidateInput --> FileExists{"File Provided?"}
FileExists --> |No| ReturnError["Return 400: File not found"]
FileExists --> |Yes| ValidateSize["Validate File Size"]
ValidateSize --> SizeValid{"Size < 10MB?"}
SizeValid --> |No| ReturnErrorSize["Return 400: File too large"]
SizeValid --> |Yes| ValidateType["Validate File Type"]
ValidateType --> TypeValid{"Type Allowed?"}
TypeValid --> |No| ReturnErrorType["Return 400: Unsupported file type"]
TypeValid --> |Yes| GetUploadUrl["Get Convex Upload URL"]
GetUploadUrl --> UploadFile["Upload to Convex Storage"]
UploadFile --> UploadSuccess{"Upload Successful?"}
UploadSuccess --> |No| HandleUploadError["Throw Error: Upload failed"]
UploadSuccess --> |Yes| CreateMetadata["Create Document Metadata"]
CreateMetadata --> MetadataSuccess{"Metadata Created?"}
MetadataSuccess --> |No| HandleMetadataError["Return 500: Metadata creation failed"]
MetadataSuccess --> |Yes| ReturnSuccess["Return 200: Success"]
HandleUploadError --> ReturnError500["Return 500: Upload error"]
HandleMetadataError --> ReturnError500
ReturnError --> End([Response])
ReturnErrorSize --> End
ReturnErrorType --> End
ReturnError500 --> End
ReturnSuccess --> End
```

**Diagram sources**

- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L1-L98)

**Section sources**

- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L1-L98)

### Document Retrieval and Deletion Routes

The system provides routes for retrieving and deleting documents, ensuring proper access control and error handling.

```mermaid
sequenceDiagram
participant Client as "Client App"
participant API as "API Route"
participant Convex as "Convex Backend"
participant Storage as "Convex Storage"
Client->>API : GET /api/storage/{fileId}
API->>Convex : Query document metadata
Convex->>Database : Find document by storageId
Database-->>Convex : Return document
Convex->>Storage : Get file URL
Storage-->>Convex : Return signed URL
Convex-->>API : Return document with URL
API->>Client : Redirect to file URL
Client->>API : DELETE /api/storage/{fileId}
API->>Convex : Delete document
Convex->>Database : Find document by ID
Database-->>Convex : Return document
Convex->>Storage : Delete file from storage
Storage-->>Convex : Confirm deletion
Convex->>Database : Delete metadata
Database-->>Convex : Confirm deletion
Convex-->>API : Return success
API-->>Client : Return 200 : Success
```

**Diagram sources**

- [\[fileId\]/route.ts](file://src/app/api/storage/[fileId]/route.ts#L1-L53)

**Section sources**

- [\[fileId\]/route.ts](file://src/app/api/storage/[fileId]/route.ts#L1-L53)

## UI Components

The DocumentsManager component provides a user-friendly interface for managing beneficiary documents, featuring drag-and-drop upload functionality and document listing.

```mermaid
classDiagram
class DocumentsManager {
+beneficiaryId : string
-documents : Document[]
-uploading : boolean
-dragActive : boolean
+useQuery : fetchDocuments()
+useMutation : deleteDocument()
+handleFileUpload(file : File) : Promise~void~
+handleDownload(doc : Document) : void
+formatFileSize(bytes : number) : string
+getFileIcon(fileType : string) : Component
}
class Document {
+_id : string
+fileName : string
+fileSize : number
+fileType : string
+document_type? : string
+uploadedAt : string
+url? : string
}
DocumentsManager --> Document : "manages"
DocumentsManager --> "React Query" : "uses"
DocumentsManager --> "Convex Client" : "uses"
DocumentsManager --> "Toast Notifications" : "uses"
```

**Diagram sources**

- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L1-L277)

**Section sources**

- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L1-L277)

## Document Workflows

The document management system supports several key workflows for handling beneficiary documents, including uploading identification documents, medical reports, and other supporting files.

### Document Upload Workflow

The document upload process follows a standardized workflow to ensure data integrity and security.

```mermaid
flowchart TD
A([User selects file]) --> B{File validation}
B --> C[Check file size < 10MB]
C --> D[Check file type: image/*, application/pdf]
D --> E[Generate Convex upload URL]
E --> F[Upload file to Convex storage]
F --> G[Create document metadata]
G --> H[Link to beneficiary]
H --> I[Update UI with new document]
I --> J([Upload complete])
C --> |Fail| K[Show error: File too large]
D --> |Fail| L[Show error: Unsupported file type]
F --> |Fail| M[Show error: Upload failed]
G --> |Fail| N[Show error: Metadata creation failed]
K --> J
L --> J
M --> J
N --> J
```

**Section sources**

- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L1-L98)
- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L78-L106)

### Document Versioning Workflow

The system supports document versioning, allowing users to maintain a history of document changes.

```mermaid
sequenceDiagram
participant User as "User"
participant UI as "DocumentsManager"
participant Convex as "Convex Backend"
User->>UI : Upload new version of document
UI->>Convex : createDocumentVersion mutation
Convex->>Database : Get current document
Database-->>Convex : Return document
Convex->>Database : Update document with new version
Convex->>Database : Create version history entry
Database-->>Convex : Confirm creation
Convex-->>UI : Return success
UI->>User : Show success message
User->>UI : View version history
UI->>Convex : getDocumentVersions query
Convex->>Database : Get version history
Database-->>Convex : Return versions
Convex-->>UI : Return versions with URLs
UI->>User : Display version history
```

**Section sources**

- [documents.ts](file://convex/documents.ts#L109-L159)
- [documents.ts](file://convex/documents.ts#L162-L182)

## Security Considerations

The document management system implements several security measures to protect sensitive beneficiary information and ensure proper access control.

### Access Control

The system implements role-based access control for documents, with different access levels and sharing capabilities.

```mermaid
classDiagram
class Document {
+accessLevel : 'public'|'private'|'restricted'
+sharedWith : string[]
}
class User {
+role : string
+permissions : string[]
}
class DocumentsManager {
+getBeneficiaryDocuments()
+getSharedDocuments()
+updateDocumentMetadata()
}
DocumentsManager --> Document : "retrieves"
DocumentsManager --> User : "checks permissions"
Document --> User : "shared with"
note right of Document
Access Levels :
- public : visible to all users
- private : only visible to uploader
- restricted : visible to specific users in sharedWith
end note
```

**Section sources**

- [documents.ts](file://convex/documents.ts#L220-L265)
- [documents.ts](file://convex/documents.ts#L346-L403)

### File Security

The system implements file security measures including type restrictions, size limits, and secure storage.

| Security Aspect | Implementation | Details                                                                                                                                         |
| --------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **File Types**  | Allowed Types  | image/jpeg, image/png, image/webp, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document |
| **File Size**   | Maximum Size   | 10MB per file                                                                                                                                   |
| **Storage**     | Convex Storage | Files stored in secure Convex storage with signed URLs                                                                                          |
| **Access**      | URL Expiration | Document URLs are temporary and expire after use                                                                                                |
| **Validation**  | Server-side    | All file validation occurs on server, not just client-side                                                                                      |

**Section sources**

- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L29-L42)
- [documents.ts](file://convex/documents.ts#L16-L20)

## Common Issues and Solutions

The document management system addresses several common issues related to document handling and provides solutions for troubleshooting.

### Failed Uploads

Failed uploads can occur due to various reasons, and the system provides appropriate error handling.

| Issue                      | Cause                             | Solution                                  |
| -------------------------- | --------------------------------- | ----------------------------------------- |
| **File too large**         | File exceeds 10MB limit           | Compress file or split into smaller parts |
| **Unsupported file type**  | File type not in allowed list     | Convert to PDF or image format            |
| **Network issues**         | Connection problems during upload | Retry upload or check network connection  |
| **Authentication failure** | Session expired or invalid        | Re-authenticate and retry upload          |
| **Server errors**          | Backend processing issues         | Contact support with error details        |

**Section sources**

- [upload/route.ts](file://src/app/api/storage/upload/route.ts#L89-L95)
- [DocumentsManager.tsx](file://src/components/documents/DocumentsManager.tsx#L101-L103)

### Access Control for Sensitive Documents

The system provides mechanisms to control access to sensitive documents through proper categorization and sharing.

```mermaid
flowchart TD
A([Document uploaded]) --> B{Document type}
B --> |Identification| C[Set accessLevel: restricted]
B --> |Medical Report| D[Set accessLevel: restricted]
B --> |General| E[Set accessLevel: private]
C --> F[Add specific users to sharedWith]
D --> F
E --> G[Only uploader can access]
F --> H[Users in sharedWith can view]
G --> I[Document listed in private documents]
H --> J[Document listed in shared documents]
```

**Section sources**

- [documents.ts](file://convex/documents.ts#L220-L265)
- [documents.ts](file://convex/documents.ts#L346-L403)

### Integration with External Verification Services

While not currently implemented, the system is designed to support integration with external document verification services through its extensible architecture.

| Integration Point                 | Current Status        | Future Implementation                                |
| --------------------------------- | --------------------- | ---------------------------------------------------- |
| **Document Validation**           | Basic type validation | Integrate with OCR services for content validation   |
| **Identity Verification**         | Not implemented       | Connect to government ID verification APIs           |
| **Medical Document Verification** | Not implemented       | Partner with healthcare providers for authentication |
| **Document Expiration**           | Not implemented       | Add expiration tracking and renewal reminders        |
| **Automated Classification**      | Manual categorization | Implement AI-based document classification           |

**Section sources**

- [documents.ts](file://convex/documents.ts#L220-L265)
- [documents.ts](file://convex/documents.ts#L322-L343)
