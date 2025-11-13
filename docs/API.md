# API Dokümantasyonu

Dernek Yönetim Sistemi için kapsamlı API dokümantasyonu.

## 📋 İçindekiler

- [Kimlik Doğrulama](#kimlik-doğrulama)
- [Kullanıcılar](#kullanıcılar)
- [İhtiyaç Sahipleri](#ihtiyaç-sahipleri)
- [Bağışlar](#bağışlar)
- [Burslar](#burslar)
- [Finansal İşlemler](#finansal-işlemler)
- [Toplantılar](#toplantılar)
- [Görevler](#görevler)
- [Raporlama](#raporlama)

## 🔐 Kimlik Doğrulama

### Giriş Yapma

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "kullanici@example.com",
  "password": "sifre123"
}
```

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "kullanici@example.com",
      "name": "Ahmet Yılmaz",
      "role": "admin",
      "permissions": ["read", "write", "delete"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Hata Yanıtı:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Geçersiz email veya şifre"
  }
}
```

### Çıkış Yapma

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Başarılı Yanıt:**

```json
{
  "success": true,
  "message": "Başarıyla çıkış yapıldı"
}
```

### Şifre Sıfırlama

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "kullanici@example.com"
}
```

## 👥 Kullanıcılar

### Tüm Kullanıcıları Listeleme

```http
GET /api/users
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası (varsayılan: 1)
- `limit` (number): Sayfa başına sonuç (varsayılan: 10)
- `role` (string): Rol filtresi (admin, user, volunteer)
- `search` (string): Arama terimi

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "kullanici@example.com",
        "name": "Ahmet Yılmaz",
        "role": "admin",
        "createdAt": "2024-01-15T10:30:00Z",
        "lastLogin": "2024-01-20T15:45:00Z",
        "isActive": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Kullanıcı Oluşturma

```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "yeni@example.com",
  "password": "guclu-sifre-123",
  "name": "Yeni Kullanıcı",
  "role": "user",
  "permissions": ["read", "write"]
}
```

### Kullanıcı Güncelleme

```http
PUT /api/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Güncellenmiş İsim",
  "role": "admin",
  "permissions": ["read", "write", "delete"]
}
```

### Kullanıcı Silme

```http
DELETE /api/users/{userId}
Authorization: Bearer {token}
```

## 🎯 İhtiyaç Sahipleri

### Tüm İhtiyaç Sahiplerini Listeleme

```http
GET /api/beneficiaries
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına sonuç
- `status` (string): Durum filtresi (active, inactive, pending)
- `search` (string): Arama terimi (isim, TC, telefon)
- `city` (string): Şehir filtresi
- `helpType` (string): Yardım türü filtresi

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "beneficiaries": [
      {
        "id": "beneficiary_123",
        "firstName": "Ayşe",
        "lastName": "Kaya",
        "tcNumber": "12345678901",
        "phone": "+90-555-123-45-67",
        "email": "ayse@example.com",
        "address": {
          "street": "Atatürk Cd. No:123",
          "city": "İstanbul",
          "district": "Kadıköy",
          "postalCode": "34000"
        },
        "familyInfo": {
          "maritalStatus": "married",
          "childrenCount": 2,
          "dependents": 4
        },
        "financialInfo": {
          "monthlyIncome": 5000,
          "incomeSource": "employment",
          "debtStatus": true
        },
        "healthInfo": {
          "hasChronicIllness": false,
          "disabilityStatus": "none",
          "healthNotes": "Sağlıklı"
        },
        "helpType": "food",
        "urgencyLevel": "high",
        "status": "active",
        "applicationDate": "2024-01-10T09:00:00Z",
        "lastAssistanceDate": "2024-01-15T14:30:00Z",
        "notes": "3 çocuklu aile, geçici yardıma ihtiyaç duyuyor"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### İhtiyaç Sahibi Oluşturma

```http
POST /api/beneficiaries
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Mehmet",
  "lastName": "Öz",
  "tcNumber": "12345678902",
  "phone": "+90-555-987-65-43",
  "email": "mehmet@example.com",
  "address": {
    "street": "İstiklal Cd. No:456",
    "city": "Ankara",
    "district": "Çankaya",
    "postalCode": "06000"
  },
  "familyInfo": {
    "maritalStatus": "single",
    "childrenCount": 0,
    "dependents": 1
  },
  "financialInfo": {
    "monthlyIncome": 0,
    "incomeSource": "unemployed",
    "debtStatus": true
  },
  "healthInfo": {
    "hasChronicIllness": true,
    "disabilityStatus": "partial",
    "healthNotes": "Diyabet hastası"
  },
  "helpType": "medical",
  "urgencyLevel": "medium",
  "notes": "İşsiz, sağlık sorunları var"
}
```

### İhtiyaç Sahibi Güncelleme

```http
PUT /api/beneficiaries/{beneficiaryId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "active",
  "lastAssistanceDate": "2024-01-20T10:00:00Z",
  "notes": "Yardım ulaştırıldı, durumu iyileşiyor"
}
```

### İhtiyaç Sahibi Silme

```http
DELETE /api/beneficiaries/{beneficiaryId}
Authorization: Bearer {token}
```

## 💝 Bağışlar

### Tüm Bağışları Listeleme

```http
GET /api/donations
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına sonuç
- `type` (string): Bağış türü (standard, kumbara)
- `status` (string): Durum (completed, pending, cancelled)
- `dateFrom` (string): Başlangıç tarihi (ISO 8601)
- `dateTo` (string): Bitiş tarihi (ISO 8601)
- `donorId` (string): Bağışçı ID'si

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": "donation_123",
        "donor": {
          "id": "donor_456",
          "name": "Ali Veli",
          "email": "ali@example.com",
          "phone": "+90-555-111-22-33"
        },
        "type": "standard",
        "amount": 1000,
        "currency": "TRY",
        "paymentMethod": "bank_transfer",
        "status": "completed",
        "donationDate": "2024-01-15T10:00:00Z",
        "receiptNumber": "RCPT-2024-00123",
        "purpose": "general",
        "notes": "Genel bağış",
        "attachments": [
          {
            "id": "file_789",
            "filename": "bank_receipt.pdf",
            "url": "/api/files/file_789",
            "uploadedAt": "2024-01-15T10:05:00Z"
          }
        ]
      }
    ],
    "summary": {
      "totalDonations": 150,
      "totalAmount": 125000,
      "averageDonation": 833.33,
      "currency": "TRY"
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Bağış Oluşturma

```http
POST /api/donations
Authorization: Bearer {token}
Content-Type: application/json

{
  "donorId": "donor_456",
  "type": "standard",
  "amount": 500,
  "currency": "TRY",
  "paymentMethod": "cash",
  "purpose": "education",
  "notes": "Eğitim yardımı için",
  "receiptRequested": true
}
```

### Kumbara Bağışı

```http
POST /api/donations/kumbara
Authorization: Bearer {token}
Content-Type: application/json

{
  "location": {
    "latitude": 41.0082,
    "longitude": 28.9784,
    "address": "İstanbul, Türkiye",
    "description": "Mecidiyeköy Metro İstasyonu"
  },
  "collectorId": "volunteer_123",
  "amount": 250,
  "currency": "TRY",
  "notes": "Cuma namazı sonrası toplandı"
}
```

### Bağış Güncelleme

```http
PUT /api/donations/{donationId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "receiptNumber": "RCPT-2024-00124"
}
```

## 🎓 Burslar

### Tüm Bursları Listeleme

```http
GET /api/scholarships
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına sonuç
- `type` (string): Burs türü (orphan, student, general)
- `status` (string): Durum (active, completed, suspended)
- `studentId` (string): Öğrenci ID'si

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "scholarships": [
      {
        "id": "scholarship_123",
        "student": {
          "id": "student_456",
          "firstName": "Zeynep",
          "lastName": "Demir",
          "school": "İstanbul Üniversitesi",
          "department": "Mühendislik Fakültesi",
          "grade": 2,
          "gpa": 3.5
        },
        "type": "orphan",
        "amount": 2000,
        "currency": "TRY",
        "duration": "monthly",
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "status": "active",
        "paymentMethod": "bank_transfer",
        "bankAccount": {
          "iban": "TR12 3456 7890 1234 5678 9012 34",
          "bankName": "Ziraat Bankası",
          "accountHolder": "Zeynep Demir"
        },
        "guardianInfo": {
          "name": "Ayşe Demir",
          "relationship": "mother",
          "phone": "+90-555-222-33-44"
        },
        "documents": [
          {
            "id": "doc_789",
            "type": "student_certificate",
            "filename": "ogrenci_belgesi.pdf",
            "uploadedAt": "2024-01-10T09:00:00Z"
          }
        ],
        "notes": "Başarılı öğrenci, maddi durumu zayıf"
      }
    ],
    "summary": {
      "totalScholarships": 45,
      "activeScholarships": 38,
      "totalMonthlyAmount": 76000,
      "currency": "TRY"
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### Burs Oluşturma

```http
POST /api/scholarships
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "student_456",
  "type": "orphan",
  "amount": 2000,
  "currency": "TRY",
  "duration": "monthly",
  "startDate": "2024-02-01",
  "endDate": "2024-12-31",
  "paymentMethod": "bank_transfer",
  "bankAccount": {
    "iban": "TR12 3456 7890 1234 5678 9012 34",
    "bankName": "Ziraat Bankası",
    "accountHolder": "Zeynep Demir"
  },
  "guardianInfo": {
    "name": "Ayşe Demir",
    "relationship": "mother",
    "phone": "+90-555-222-33-44"
  },
  "notes": "Yetim bursu, babası vefat etmiş"
}
```

### Burs Ödemesi

```http
POST /api/scholarships/{scholarshipId}/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 2000,
  "currency": "TRY",
  "paymentDate": "2024-01-31",
  "paymentMethod": "bank_transfer",
  "transactionId": "TXN-2024-001",
  "notes": "Ocak 2024 burs ödemesi"
}
```

## 💰 Finansal İşlemler

### Tüm İşlemleri Listeleme

```http
GET /api/finance/transactions
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına sonuç
- `type` (string): İşlem türü (income, expense)
- `category` (string): Kategori
- `dateFrom` (string): Başlangıç tarihi
- `dateTo` (string): Bitiş tarihi

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_123",
        "type": "income",
        "category": "donation",
        "amount": 1000,
        "currency": "TRY",
        "description": "Aylık bağış",
        "transactionDate": "2024-01-15T10:00:00Z",
        "referenceId": "donation_123",
        "paymentMethod": "bank_transfer",
        "account": {
          "id": "account_456",
          "name": "Ana Hesap",
          "accountNumber": "TR12 3456 7890 1234 5678 9012 34"
        },
        "attachments": [
          {
            "id": "file_789",
            "filename": "banka_hesap_ozeti.pdf",
            "url": "/api/files/file_789"
          }
        ],
        "createdBy": {
          "id": "user_123",
          "name": "Ahmet Yılmaz"
        }
      }
    ],
    "summary": {
      "totalIncome": 125000,
      "totalExpense": 85000,
      "netBalance": 40000,
      "currency": "TRY"
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 200,
      "totalPages": 10
    }
  }
}
```

### Gelir Kaydı Oluşturma

```http
POST /api/finance/income
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "donation",
  "amount": 1000,
  "currency": "TRY",
  "description": "Aylık bağış",
  "transactionDate": "2024-01-15",
  "referenceId": "donation_123",
  "paymentMethod": "bank_transfer",
  "accountId": "account_456"
}
```

### Gider Kaydı Oluşturma

```http
POST /api/finance/expense
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "operational",
  "amount": 500,
  "currency": "TRY",
  "description": "Ofis kira ödemesi",
  "transactionDate": "2024-01-15",
  "paymentMethod": "bank_transfer",
  "accountId": "account_456",
  "vendor": "ABC Gayrimenkul",
  "receiptNumber": "RCP-2024-001"
}
```

## 🤝 Toplantılar

### Tüm Toplantıları Listeleme

```http
GET /api/meetings
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına sonuç
- `status` (string): Durum (scheduled, completed, cancelled)
- `dateFrom` (string): Başlangıç tarihi
- `dateTo` (string): Bitiş tarihi

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "id": "meeting_123",
        "title": "Aylık Yönetim Kurulu Toplantısı",
        "description": "Ocak ayı değerlendirme toplantısı",
        "scheduledDate": "2024-01-25T14:00:00Z",
        "duration": 120,
        "location": "Dernek Merkezi - Toplantı Salonu",
        "meetingType": "board",
        "status": "scheduled",
        "organizer": {
          "id": "user_123",
          "name": "Ahmet Yılmaz"
        },
        "participants": [
          {
            "id": "user_456",
            "name": "Mehmet Öz",
            "role": "board_member",
            "attendanceStatus": "confirmed"
          }
        ],
        "agenda": [
          {
            "id": "agenda_1",
            "title": "Açılış",
            "duration": 10,
            "order": 1
          },
          {
            "id": "agenda_2",
            "title": "Faaliyet Raporu",
            "duration": 30,
            "order": 2
          }
        ],
        "decisions": [],
        "actionItems": [],
        "attachments": [
          {
            "id": "file_123",
            "filename": "faaliyet_raporu.pdf",
            "url": "/api/files/file_123"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Toplantı Oluşturma

```http
POST /api/meetings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Aylık Yönetim Kurulu Toplantısı",
  "description": "Şubat ayı değerlendirme toplantısı",
  "scheduledDate": "2024-02-25T14:00:00Z",
  "duration": 120,
  "location": "Dernek Merkezi - Toplantı Salonu",
  "meetingType": "board",
  "organizerId": "user_123",
  "participantIds": ["user_456", "user_789"],
  "agenda": [
    {
      "title": "Açılış",
      "duration": 10,
      "order": 1
    },
    {
      "title": "Faaliyet Raporu",
      "duration": 30,
      "order": 2
    }
  ]
}
```

### Toplantı Kararı Ekleme

```http
POST /api/meetings/{meetingId}/decisions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Yeni proje onayı",
  "description": "Eğitim yardım projesi için 50.000 TL bütçe ayrılması",
  "decisionType": "budget",
  "priority": "high",
  "dueDate": "2024-02-01",
  "responsibleUserId": "user_456"
}
```

## ✅ Görevler

### Tüm Görevleri Listeleme

```http
GET /api/tasks
Authorization: Bearer {token}
```

**Query Parametreleri:**

- `page` (number): Sayfa numarası
- `limit` (number): Sayfa başına sonuç
- `status` (string): Durum (pending, in_progress, completed, cancelled)
- `priority` (string): Öncelik (low, medium, high, urgent)
- `assignedTo` (string): Atanan kullanıcı ID'si
- `dueDateFrom` (string): Başlangıç tarihi
- `dueDateTo` (string): Bitiş tarihi

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_123",
        "title": "Bağışçı listesini güncelle",
        "description": "Ocak ayı bağışçı bilgilerini sisteme gir",
        "status": "pending",
        "priority": "medium",
        "dueDate": "2024-01-30T17:00:00Z",
        "createdAt": "2024-01-15T09:00:00Z",
        "assignedTo": {
          "id": "user_456",
          "name": "Mehmet Öz"
        },
        "createdBy": {
          "id": "user_123",
          "name": "Ahmet Yılmaz"
        },
        "category": "administrative",
        "tags": ["donation", "data-entry"],
        "progress": 0,
        "comments": [
          {
            "id": "comment_1",
            "text": "Excel dosyası hazır",
            "createdBy": {
              "id": "user_123",
              "name": "Ahmet Yılmaz"
            },
            "createdAt": "2024-01-15T10:00:00Z"
          }
        ],
        "attachments": [
          {
            "id": "file_123",
            "filename": "bagisci_listesi.xlsx",
            "url": "/api/files/file_123"
          }
        ]
      }
    ],
    "summary": {
      "totalTasks": 50,
      "pendingTasks": 15,
      "inProgressTasks": 20,
      "completedTasks": 15
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### Görev Oluşturma

```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Yeni bağış kampanyası planla",
  "description": "Ramazan ayı için bağış kampanyası organize et",
  "assignedToId": "user_456",
  "priority": "high",
  "dueDate": "2024-02-15T17:00:00Z",
  "category": "fundraising",
  "tags": ["campaign", "ramadan"],
  "estimatedHours": 8
}
```

### Görev Durumu Güncelleme

```http
PUT /api/tasks/{taskId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "progress": 50,
  "notes": "Kampanya konsepti hazırlandı"
}
```

## 📊 Raporlama

### Genel İstatistikler

```http
GET /api/reports/dashboard-stats
Authorization: Bearer {token}
```

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "beneficiaries": {
      "total": 150,
      "active": 120,
      "newThisMonth": 15
    },
    "donations": {
      "total": 125000,
      "count": 200,
      "average": 625,
      "thisMonth": 25000,
      "currency": "TRY"
    },
    "scholarships": {
      "total": 45,
      "active": 38,
      "monthlyAmount": 76000,
      "currency": "TRY"
    },
    "finance": {
      "totalIncome": 125000,
      "totalExpense": 85000,
      "netBalance": 40000,
      "currency": "TRY"
    },
    "tasks": {
      "total": 50,
      "pending": 15,
      "inProgress": 20,
      "completed": 15
    }
  }
}
```

### Aylık Rapor

```http
GET /api/reports/monthly-report?month=2024-01
Authorization: Bearer {token}
```

**Başarılı Yanıt:**

```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "beneficiaries": {
      "newRegistrations": 15,
      "activeAssistance": 120,
      "byHelpType": {
        "food": 45,
        "education": 30,
        "medical": 25,
        "housing": 20
      }
    },
    "donations": {
      "total": 25000,
      "count": 45,
      "byType": {
        "standard": 20000,
        "kumbara": 5000
      },
      "currency": "TRY"
    },
    "expenses": {
      "total": 18000,
      "byCategory": {
        "beneficiary_assistance": 12000,
        "operational": 4000,
        "scholarships": 2000
      },
      "currency": "TRY"
    },
    "scholarships": {
      "newScholarships": 5,
      "totalPayments": 15000,
      "currency": "TRY"
    }
  }
}
```

### Özelleştirilebilir Rapor

```http
POST /api/reports/custom
Authorization: Bearer {token}
Content-Type: application/json

{
  "reportType": "donation_analysis",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "groupBy": "week",
  "metrics": ["total_amount", "donation_count", "average_donation"],
  "filters": {
    "donationType": "standard",
    "minAmount": 100
  },
  "format": "json"
}
```

## 🔧 Hata İşleme

### Hata Yanıt Formatı

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "İstek doğrulama hatası",
    "details": [
      {
        "field": "email",
        "message": "Geçerli bir email adresi giriniz"
      }
    ]
  },
  "requestId": "req_123456"
}
```

### Hata Kodları

| Kod                   | Açıklama                 | HTTP Durumu |
| --------------------- | ------------------------ | ----------- |
| `UNAUTHORIZED`        | Kimlik doğrulama gerekli | 401         |
| `FORBIDDEN`           | Yetkisiz erişim          | 403         |
| `NOT_FOUND`           | Kaynak bulunamadı        | 404         |
| `VALIDATION_ERROR`    | Doğrulama hatası         | 400         |
| `RATE_LIMIT_EXCEEDED` | Hız sınırı aşıldı        | 429         |
| `INTERNAL_ERROR`      | Sunucu hatası            | 500         |
| `SERVICE_UNAVAILABLE` | Servis kullanılamıyor    | 503         |

## 📚 Veri Türleri

### Para Birimi

```typescript
type Currency = 'TRY' | 'USD' | 'EUR';
```

### Kullanıcı Rolleri

```typescript
type UserRole = 'admin' | 'user' | 'volunteer' | 'accountant';
```

### Burs Türleri

```typescript
type ScholarshipType = 'orphan' | 'student' | 'general';
```

### Yardım Türleri

```typescript
type HelpType = 'food' | 'education' | 'medical' | 'housing' | 'clothing' | 'financial';
```

## 🔐 Güvenlik

### Rate Limiting

- **Standart limit**: 100 istek/dakika
- **Kimlik doğrulama**: 5 istek/dakika
- **Şifre sıfırlama**: 3 istek/saat

### CSRF Koruması

Tüm POST, PUT, DELETE istekleri için CSRF token gerekir:

```http
X-CSRF-Token: {csrf_token}
```

### Veri Maskeleme

Hassas veriler otomatik olarak maskelenir:

- **TC Kimlik No**: `12345*****67`
- **Telefon**: `+90-***-***-12-34`
- **IBAN**: `TR12 **** **** **** 5678 90`

## 📞 Destek

API ile ilgili sorularınız için:

- **Email**: api-support@dernek-yonetim.com
- **Dokümantasyon**: [https://docs.dernek-yonetim.com/api](https://docs.dernek-yonetim.com/api)
- **Status Page**: [https://status.dernek-yonetim.com](https://status.dernek-yonetim.com)

---

**Son Güncelleme**: 2024-01-20
**API Versiyonu**: v1.0.0
