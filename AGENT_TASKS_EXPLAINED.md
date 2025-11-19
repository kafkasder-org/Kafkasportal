# Agent Task Nedir?

## 📖 Genel Tanım

**Agent Task**, AI agent'ların (yapay zeka asistanları) otomatik olarak görev (task) oluşturması, yönetmesi veya tamamlaması anlamına gelir.

## 🔍 Projenizdeki Durum

Kafkasder Panel projenizde iki ayrı sistem var:

### 1. **AI Agent Sistemi** (`convex/agents.ts`)
- Kullanıcılarla konuşan AI asistanlar
- Thread-based conversation management
- Tool integration (getDateTime, searchDatabase)
- Multi-agent support (Support Agent, General Assistant, Data Analyst)

### 2. **Task Yönetim Sistemi** (`convex/tasks.ts`)
- Kullanıcılara atanan görevler
- Task CRUD operations
- Priority, status, due_date yönetimi
- Category ve tags desteği

## 🤖 Agent Task Özellikleri

### Mevcut Durum

Şu anda projenizde **Agent Task** özelliği tam olarak entegre değil. Ancak:

✅ **Mevcut:**
- Agent'lar tool'lar kullanabiliyor (getDateTime, searchDatabase)
- Error assignment'da otomatik task oluşturma var (`src/app/api/errors/[id]/assign/route.ts`)

❌ **Eksik:**
- Agent'ların direkt task oluşturma yeteneği yok
- Agent'ların task'ları yönetme yeteneği yok
- Agent'ların task durumlarını güncelleme yeteneği yok

### Potansiyel Kullanım Senaryoları

Agent Task özelliği eklenirse şunlar yapılabilir:

1. **Otomatik Task Oluşturma:**
   ```
   Kullanıcı: "Yarın Ahmet Bey'i arayıp bağış teşekkürü gönder"
   Agent: Task oluşturur → "Ahmet Bey'i ara" (due_date: yarın)
   ```

2. **Toplantı Kararlarından Task:**
   ```
   Toplantı kararı: "Burs başvurularını gözden geçir"
   Agent: Otomatik task oluşturur
   ```

3. **Akıllı Task Yönetimi:**
   ```
   Agent: "Bugün 5 tane pending task'ın var, öncelik sırasına göre sıralayayım mı?"
   ```

4. **Task Durumu Güncelleme:**
   ```
   Kullanıcı: "Task #123 tamamlandı"
   Agent: Task durumunu "completed" olarak günceller
   ```

## 🛠️ Nasıl Eklenir?

### 1. Agent'a Task Tool'u Ekleme

`convex/agents.ts` dosyasına task oluşturma tool'u eklenebilir:

```typescript
createTask: tool({
  description: 'Create a new task for a user',
  parameters: z.object({
    title: z.string().describe('Task title'),
    description: z.string().optional().describe('Task description'),
    assigned_to: z.string().optional().describe('User ID to assign task to'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).describe('Task priority'),
    due_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
    category: z.string().optional().describe('Task category'),
  }),
  execute: async ({ title, description, assigned_to, priority, due_date, category }) => {
    // Task oluşturma logic'i
    const taskId = await ctx.runMutation(api.tasks.create, {
      title,
      description,
      assigned_to: assigned_to ? toConvexId(assigned_to, 'users') : undefined,
      created_by: args.userId,
      priority: priority || 'normal',
      status: 'pending',
      due_date,
      category,
      tags: [],
      is_read: false,
    });
    return { success: true, taskId, message: `Task "${title}" oluşturuldu` };
  },
}),
```

### 2. Task Yönetim Tool'ları

```typescript
updateTaskStatus: tool({
  description: 'Update task status',
  parameters: z.object({
    taskId: z.string().describe('Task ID'),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  }),
  execute: async ({ taskId, status }) => {
    // Task durumu güncelleme
  },
}),

getUserTasks: tool({
  description: 'Get tasks for a user',
  parameters: z.object({
    userId: z.string().optional().describe('User ID (default: current user)'),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  }),
  execute: async ({ userId, status }) => {
    // Task listesi getirme
  },
}),
```

## 📊 Mevcut Entegrasyon Örneği

Projenizde zaten bir örnek var:

**Error Assignment → Task Creation** (`src/app/api/errors/[id]/assign/route.ts`):

```typescript
// Hata atandığında otomatik task oluşturma
if (create_task) {
  taskId = await fetchMutation(api.tasks.create, {
    title: `Fix: ${error.title}`,
    description: error.description,
    assigned_to: assigned_to,
    priority: error.severity === 'critical' ? 'urgent' : 'normal',
    status: 'pending',
    category: 'bug_fix',
    tags: ['error', error.category, error.severity],
  });
}
```

## 🎯 Kullanım Senaryoları

### Senaryo 1: Toplantı Sonrası Task Oluşturma
```
Kullanıcı: "Toplantıda karar verildi: Burs başvurularını gözden geçir"
Agent: 
  - Task oluşturur: "Burs başvurularını gözden geçir"
  - Atar: İlgili kullanıcıya
  - Due date: Toplantı tarihinden 1 hafta sonra
```

### Senaryo 2: Hatırlatma Task'ları
```
Kullanıcı: "Her ay başında bağış raporu hazırla"
Agent: 
  - Recurring task oluşturur
  - Her ay başında hatırlatır
```

### Senaryo 3: Akıllı Task Önceliklendirme
```
Kullanıcı: "Bugün yapılacak işler neler?"
Agent:
  - Kullanıcının task'larını getirir
  - Öncelik sırasına göre sıralar
  - Due date yakın olanları vurgular
```

## 🔗 İlgili Dosyalar

- **Agent Sistemi:** `convex/agents.ts`
- **Task Sistemi:** `convex/tasks.ts`
- **Agent Chat UI:** `src/components/ai/AgentChat.tsx`
- **Task API:** `src/app/api/tasks/route.ts`
- **Error → Task:** `src/app/api/errors/[id]/assign/route.ts`

## 📚 Özet

**Agent Task** = AI agent'ların otomatik olarak:
- ✅ Task oluşturması
- ✅ Task yönetmesi
- ✅ Task durumlarını güncellemesi
- ✅ Task'ları önceliklendirmesi
- ✅ Task hatırlatmaları yapması

**Mevcut Durum:** Projenizde kısmen var (error assignment), tam entegrasyon yok.

**Öneri:** Agent'lara task yönetim tool'ları eklenerek tam Agent Task özelliği eklenebilir.

---

**Son Güncelleme:** 2025-11-19

