# 🚀 AI Agents - Quick Start Guide

## ✅ What's Installed

The AI Agents framework is now fully configured in your project!

## 📦 Installation Summary

```bash
✅ Installed packages:
   - @ai-sdk/openai (OpenAI integration)
   - @ai-sdk/anthropic (Anthropic Claude)
   - ai (Vercel AI SDK)
   - zod (validation)

✅ Backend files:
   - convex/agents.ts (395 lines)
   - 4 new database tables

✅ Frontend files:
   - src/components/ai/AgentChat.tsx (450+ lines)
```

## 🔧 Setup (3 Steps)

### Step 1: Add API Keys

Edit `.env.local`:

```bash
# Choose ONE or BOTH:

# For OpenAI agents (Support, Assistant)
OPENAI_API_KEY=sk-...

# For Anthropic agents (Data Analyst)
ANTHROPIC_API_KEY=sk-ant-...
```

### Step 2: Regenerate Types

```bash
npx convex dev
```

Wait for: `✔ Convex functions ready!`

### Step 3: Use the Component

Create a page (e.g., `app/(dashboard)/agent/page.tsx`):

```tsx
import { AgentChat } from '@/components/ai/AgentChat';
import { auth } from '@/lib/auth';

export default async function AgentPage() {
  const session = await auth();

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">AI Agent</h1>
      <AgentChat userId={session.user.id} />
    </div>
  );
}
```

## 🎯 Features

### 3 Predefined Agents

1. **Support Agent** (gpt-4o-mini) - Customer support
2. **General Assistant** (gpt-4o) - Multi-purpose
3. **Data Analyst** (Claude 3.5 Sonnet) - Data analysis

### Built-in Tools

- ✅ `getDateTime` - Current date/time
- ✅ `searchDatabase` - Search your data

### Core Capabilities

- ✅ Thread-based conversations
- ✅ Persistent message history
- ✅ Real-time updates
- ✅ Usage tracking
- ✅ Message search
- ✅ Thread archiving

## 💬 How to Use

### From UI

1. Open your agent page
2. Select an agent (Support/Assistant/Analyst)
3. Type your message
4. Click "Send"

### Programmatically

```typescript
import { api } from '@/convex/_generated/api';

// Create thread + first response
const result = await createAndRespond({
  userId: user._id,
  prompt: 'Explain AI agents',
  agentConfig: {
    name: 'Assistant',
    model: 'gpt-4o',
    provider: 'openai',
    instructions: 'You are helpful.',
    temperature: 0.7,
  },
  title: 'AI Agents Discussion',
});

console.log(result.text); // Agent's response
console.log(result.threadId); // Save for later
```

## 🔍 API Quick Reference

### Actions

```typescript
// Create new conversation
api.agents.createThreadAndRespond(userId, prompt, agentConfig);

// Continue existing conversation
api.agents.generateAgentResponse(threadId, userId, prompt, agentConfig);
```

### Queries

```typescript
// Get threads
api.agents.listThreads(userId, status?, limit?)

// Get messages
api.agents.getMessages(threadId, limit?)

// Search messages
api.agents.searchMessages(threadId, searchTerm, limit?)

// Get usage stats
api.agents.getUsageStats(userId, startDate?, endDate?)
```

### Mutations

```typescript
// Create thread
api.agents.createThread(userId, agentName, title);

// Archive thread
api.agents.archiveThread(threadId);

// Add message
api.agents.addMessage(threadId, role, content);
```

## 🎨 Component Features

The `AgentChat` component includes:

- **Sidebar**: Thread list with archiving
- **Chat Tab**: Main conversation interface
- **Search Tab**: Search messages
- **Stats Tab**: Usage statistics
- **Agent Selector**: Switch between agents
- **Real-time Updates**: Live message sync

## 🛠️ Customization

### Add a Custom Agent

Edit `src/components/ai/AgentChat.tsx`:

```typescript
const AGENT_CONFIGS = {
  // ... existing agents
  translator: {
    name: 'Translator',
    model: 'gpt-4o',
    provider: 'openai' as const,
    instructions: 'You are a professional translator. Translate accurately.',
    temperature: 0.3,
  },
};
```

### Add a Custom Tool

Edit `convex/agents.ts` in `generateAgentResponse`:

```typescript
const tools = {
  // ... existing tools
  calculateSum: tool({
    description: 'Add two numbers',
    parameters: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: async ({ a, b }) => {
      return { result: a + b };
    },
  }),
};
```

## 📊 Database Tables

The framework created 4 tables:

1. **agent_threads** - Conversation threads
2. **agent_messages** - Messages within threads
3. **agent_tools** - Available tools
4. **agent_usage** - Usage tracking for billing

All tables have proper indexes and search capabilities.

## 🐛 Troubleshooting

### "Authentication failed"

➜ Check API keys in `.env.local`

### "Property 'agents' does not exist"

➜ Run `npx convex dev` to regenerate types

### Agent not responding

➜ Check console for errors
➜ Verify API key is correct
➜ Check model is available

### High costs

➜ Use `gpt-4o-mini` instead of `gpt-4o`
➜ Set lower `maxTokens` limit
➜ Monitor usage in Stats tab

## 📖 Full Documentation

See `docs/AI_AGENTS.md` for:

- Complete API reference
- Advanced features
- Best practices
- Example use cases
- Tool development guide

## 🎯 Next Steps

1. ✅ **Test the demo** - Try the component
2. **Add API keys** - Enable real AI
3. **Create a page** - Make it accessible
4. **Customize agents** - Add your own
5. **Add tools** - Extend capabilities
6. **Monitor usage** - Track costs

---

**Everything is ready!** Start using AI agents in your application now. 🤖
