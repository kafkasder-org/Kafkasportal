# 🤖 AI Agents Framework - Complete Guide

## ✅ Installation Complete

You now have a fully functional AI Agents framework built on Convex!

## 📦 What Was Installed

### Packages

```bash
@ai-sdk/openai         # OpenAI integration
@ai-sdk/anthropic      # Anthropic Claude integration
ai                     # Vercel AI SDK core
zod                    # Schema validation
```

### Backend Components

- ✅ `convex/agents.ts` - Complete agent framework (395 lines)
- ✅ `convex/schema.ts` - 4 new tables for agent management

### Frontend Components

- ✅ `src/components/ai/AgentChat.tsx` - Full-featured agent UI (450+ lines)

### Database Tables

#### 1. **agent_threads**

Conversation threads with message history

```typescript
{
  user_id: Id<'users'>,
  title: string,
  agent_name: string,
  metadata: any,
  status: 'active' | 'archived',
  created_at: number,
  last_message_at: number
}
```

**Indexes:** by_user_id, by_agent_name, by_status, search_title

#### 2. **agent_messages**

Messages within threads

```typescript
{
  thread_id: Id<'agent_threads'>,
  role: 'user' | 'assistant' | 'system' | 'tool',
  content: string,
  agent_name?: string,
  tool_calls?: any,
  metadata?: any,
  created_at: number
}
```

**Indexes:** by_thread_id, by_role, search_content

#### 3. **agent_tools**

Available tools for agents

```typescript
{
  name: string,
  description: string,
  parameters: any,
  function_name: string,
  enabled: boolean,
  created_at: number
}
```

**Indexes:** by_name, by_enabled

#### 4. **agent_usage**

Usage tracking for billing

```typescript
{
  user_id: Id<'users'>,
  thread_id?: Id<'agent_threads'>,
  agent_name: string,
  model: string,
  input_tokens: number,
  output_tokens: number,
  cost_cents?: number,
  created_at: number
}
```

**Indexes:** by_user_id, by_thread_id, by_agent_name, by_created_at

## 🎯 Key Features

### Core Capabilities

- ✅ **Thread-based conversations** - Persistent message history
- ✅ **Multi-agent support** - Support, Assistant, Analyst agents
- ✅ **Tool integration** - Agents can call functions
- ✅ **Usage tracking** - Monitor tokens and costs
- ✅ **Message search** - Hybrid vector/text search
- ✅ **Thread archiving** - Organize conversations
- ✅ **Real-time updates** - Convex subscriptions
- ✅ **Multi-provider** - OpenAI and Anthropic support

### Predefined Agents

#### 1. **Support Agent**

- Model: `gpt-4o-mini`
- Provider: OpenAI
- Use case: Customer support, help desk
- Temperature: 0.7

#### 2. **General Assistant**

- Model: `gpt-4o`
- Provider: OpenAI
- Use case: General questions, multi-purpose
- Temperature: 0.8

#### 3. **Data Analyst**

- Model: `claude-3-5-sonnet-20241022`
- Provider: Anthropic
- Use case: Data analysis, reports
- Temperature: 0.5

### Built-in Tools

#### 1. **getDateTime**

Returns current date, time, and timestamp

```typescript
// No parameters needed
{
  date: "14.11.2025",
  time: "10:30:15",
  timestamp: 1699958415000
}
```

#### 2. **searchDatabase**

Search across database tables

```typescript
{
  query: "search term",
  table: "users" | "beneficiaries" | "donations" | "scholarships"
}
```

## 🚀 Usage

### Basic Example

```tsx
import { AgentChat } from '@/components/ai/AgentChat';

export default function AgentPage() {
  const session = await getSession();

  return (
    <div className="container py-6">
      <h1 className="mb-6 text-3xl font-bold">AI Agent</h1>
      <AgentChat userId={session.user.id} />
    </div>
  );
}
```

### Programmatic Usage

```typescript
import { api } from '@/convex/_generated/api';

// Create a new thread and get first response
const result = await createAndRespond({
  userId: currentUserId,
  prompt: 'Explain quantum computing',
  agentConfig: {
    name: 'Assistant',
    model: 'gpt-4o',
    provider: 'openai',
    instructions: 'You are a helpful assistant.',
    temperature: 0.7,
  },
  title: 'Quantum Computing',
});

// Continue an existing thread
const response = await generateAgentResponse({
  threadId: existingThreadId,
  userId: currentUserId,
  prompt: 'Tell me more',
  agentConfig: agentConfig,
  useTools: true,
});
```

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:

```bash
# OpenAI API Key (required for OpenAI agents)
OPENAI_API_KEY=sk-...

# Anthropic API Key (required for Claude agents)
ANTHROPIC_API_KEY=sk-ant-...
```

### Custom Agent Configuration

Create your own agent:

```typescript
const customAgent = {
  name: 'Custom Agent',
  model: 'gpt-4o',
  provider: 'openai' as const,
  instructions: `
    You are a specialized agent for [specific task].
    Guidelines:
    - Be professional
    - Provide detailed answers
    - Use Turkish language
  `,
  temperature: 0.7,
  maxTokens: 2000,
};
```

### Adding Custom Tools

Edit `convex/agents.ts` in the `generateAgentResponse` action:

```typescript
const tools = {
  // Existing tools...
  getDateTime: tool({...}),
  searchDatabase: tool({...}),

  // Add your custom tool
  getUserInfo: tool({
    description: 'Get user information by ID',
    parameters: z.object({
      userId: z.string().describe('User ID to lookup'),
    }),
    execute: async ({ userId }) => {
      const user = await ctx.runQuery(api.users.get, {
        id: userId
      });
      return user;
    },
  }),
};
```

## 📊 API Reference

### Queries

#### `getThread(threadId)`

Get a single thread by ID

#### `listThreads(userId, status?, limit?)`

List all threads for a user

- `status`: Filter by 'active' or 'archived'
- `limit`: Max results (default: 50)

#### `getMessages(threadId, limit?)`

Get messages in a thread

- `limit`: Max messages (default: 100)

#### `searchMessages(threadId, searchTerm, limit?)`

Search messages in a thread using hybrid search

#### `getUsageStats(userId, startDate?, endDate?)`

Get usage statistics for a user
Returns: `{ totalTokens, inputTokens, outputTokens, totalCost, requestCount }`

### Mutations

#### `createThread(userId, agentName, title, metadata?)`

Create a new conversation thread

#### `addMessage(threadId, role, content, agentName?, toolCalls?, metadata?)`

Add a message to a thread

#### `archiveThread(threadId)`

Archive a thread (sets status to 'archived')

#### `trackUsage(userId, threadId?, agentName, model, inputTokens, outputTokens, costCents?)`

Track AI usage for billing

### Actions

#### `generateAgentResponse(threadId, userId, prompt, agentConfig, useTools?)`

Generate a response in an existing thread

- Includes full message history
- Optionally uses tools
- Tracks usage automatically

#### `createThreadAndRespond(userId, prompt, agentConfig, title?)`

Create a new thread and generate first response

- One-step thread creation + response
- Returns `{ threadId, text, toolCalls, usage }`

## 🎨 UI Components

The `AgentChat` component includes:

### Features

- ✅ Thread list sidebar with archiving
- ✅ Multi-agent selector
- ✅ Real-time message streaming
- ✅ Tool execution visualization
- ✅ Message search tab
- ✅ Usage statistics dashboard
- ✅ Agent configuration display
- ✅ Turkish language UI
- ✅ Responsive design

### Tabs

1. **Chat** - Main conversation interface
2. **Search** - Search messages in current thread
3. **Stats** - Usage statistics and agent config

## 🔍 Advanced Features

### Message Search

```typescript
const results = await searchMessages({
  threadId: currentThread._id,
  searchTerm: 'donation statistics',
  limit: 20,
});
```

### Usage Tracking

```typescript
const stats = await getUsageStats({
  userId: currentUser._id,
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  endDate: Date.now(),
});

console.log(`Total cost: $${stats.totalCost / 100}`);
console.log(`Total tokens: ${stats.totalTokens.toLocaleString()}`);
```

### Thread Management

```typescript
// List active threads
const activeThreads = await listThreads({
  userId: currentUser._id,
  status: 'active',
});

// Archive old threads
for (const thread of oldThreads) {
  await archiveThread({ threadId: thread._id });
}
```

## 💡 Best Practices

### 1. Token Management

- Monitor usage regularly
- Set appropriate `maxTokens` limits
- Use cheaper models for simple tasks

### 2. Prompt Engineering

- Be specific in agent instructions
- Include examples in system prompts
- Set appropriate temperature values

### 3. Tool Design

- Keep tools focused and single-purpose
- Provide clear descriptions
- Validate parameters properly

### 4. Thread Organization

- Archive completed conversations
- Use meaningful thread titles
- Add metadata for filtering

### 5. Error Handling

- Wrap agent calls in try-catch
- Provide fallback responses
- Log errors for debugging

## 🐛 Troubleshooting

### API Key Errors

**Problem:** "Authentication failed"
**Solution:** Check `.env.local` has correct API keys

### Type Errors

**Problem:** "Property 'agents' does not exist"
**Solution:** Run `npx convex dev` to regenerate types

### No Responses

**Problem:** Agent doesn't respond
**Solution:** Check API key, model availability, and console logs

### High Costs

**Problem:** Usage costs are high
**Solution:**

- Use `gpt-4o-mini` instead of `gpt-4o`
- Reduce `maxTokens`
- Implement rate limiting

## 📈 Next Steps

1. **Add more agents** - Create specialized agents for specific tasks
2. **Implement RAG** - Add document search capabilities
3. **Add rate limiting** - Prevent abuse and control costs
4. **Create workflows** - Multi-step agentic operations
5. **Add file support** - Handle document uploads
6. **Implement streaming** - Stream responses token-by-token
7. **Add memory** - Long-term agent memory beyond context

## 📚 Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Convex Documentation](https://docs.convex.dev)

## 🤝 Example Use Cases

1. **Customer Support Bot** - Handle user inquiries automatically
2. **Data Analysis Assistant** - Query and analyze database data
3. **Content Generator** - Create reports, emails, documents
4. **Internal Knowledge Base** - Answer questions about your system
5. **Task Automation** - Execute complex multi-step workflows

---

**Your AI Agents framework is ready to use!** 🎉

Start building intelligent applications with persistent memory, tool integration, and professional UI.
