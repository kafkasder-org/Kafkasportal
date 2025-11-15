# AI Chat with Persistent Text Streaming

This module implements AI chat functionality using the `@convex-dev/persistent-text-streaming` component. It enables real-time text streaming from HTTP actions while simultaneously storing data in the database.

## 📋 Features

- **Real-time HTTP Streaming**: Instant token-by-token responses for great UX
- **Database Persistence**: Chat history stored permanently in Convex
- **Multi-user Access**: Other users can view chats even while they're being generated
- **Reconnection Support**: If the connection drops, users can still access the chat history
- **Optimized Bandwidth**: Combines the speed of HTTP streaming with the reliability of database storage

## 🚀 Setup

### 1. Installation

The component is already installed in this project:

```bash
npm install @convex-dev/persistent-text-streaming
```

### 2. Configuration

The component is configured in `convex/convex.config.ts`:

```typescript
import { defineApp } from 'convex/server';
import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config.js';

const app = defineApp();
app.use(persistentTextStreaming);
export default app;
```

### 3. Database Schema

The `ai_chats` table is defined in `convex/schema.ts`:

```typescript
ai_chats: defineTable({
  user_id: v.id('users'),
  title: v.string(),
  prompt: v.string(),
  stream_id: v.string(), // From persistent-text-streaming
  status: v.union(v.literal('pending'), v.literal('completed'), v.literal('error')),
  created_at: v.number(),
  updated_at: v.number(),
})
  .index('by_user_id', ['user_id'])
  .index('by_status', ['status'])
  .index('by_created_at', ['created_at']);
```

## 📝 Usage

### Backend (Convex)

#### 1. Create a Chat

```typescript
const createChat = useMutation(api.ai_chat.createChat);

const { chatId, streamId } = await createChat({
  user_id: currentUserId,
  prompt: 'Explain quantum computing',
  title: 'Quantum Computing Question',
});
```

#### 2. Stream the Response

The HTTP endpoint at `/chat-stream` handles streaming:

```typescript
// Automatically called by the useStream hook
POST https://your-project.convex.site/chat-stream
Body: { streamId, prompt, chatId }
```

#### 3. Subscribe to Updates

```typescript
const getChatBody = useQuery(api.ai_chat.getChatBody, {
  streamId: chat.stream_id,
});
```

### Frontend (React)

Use the `AIChat` component:

```tsx
import { AIChat } from '@/components/ai/AIChat';

export default function ChatPage() {
  return <AIChat userId={session.user.id} convexSiteUrl={process.env.NEXT_PUBLIC_CONVEX_URL!} />;
}
```

Or use the `useStream` hook directly:

```tsx
import { useStream } from '@convex-dev/persistent-text-streaming/react';

const { text, status } = useStream(
  api.ai_chat.getChatBody, // Query to get full stream body
  new URL(`${convexUrl}/chat-stream`), // HTTP streaming endpoint
  isDriven, // True if this client drives the stream
  streamId // Stream ID from chat record
);
```

## 🔌 AI Integration

### OpenAI Example

Update `convex/ai_chat.ts` in the `generateChat` function:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateChat = async (ctx, request, streamId, chunkAppender) => {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: body.prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      await chunkAppender(content);
    }
  }
};
```

### Anthropic Claude Example

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const generateChat = async (ctx, request, streamId, chunkAppender) => {
  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: body.prompt }],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      await chunkAppender(chunk.delta.text);
    }
  }
};
```

## 🎯 API Reference

### Queries

#### `getChatBody(streamId: string)`

Returns the current body of a chat stream. Automatically updates as the stream progresses.

#### `getChat(chatId: Id<"ai_chats">)`

Returns a single chat by ID.

#### `listChats(user_id: Id<"users">, limit?: number)`

Lists all chats for a user, ordered by creation date.

### Mutations

#### `createChat(user_id, prompt, title?)`

Creates a new chat and returns `{ chatId, streamId }`.

#### `updateChatStatus(chatId, status)`

Updates the status of a chat ('pending', 'completed', 'error').

#### `deleteChat(chatId)`

Deletes a chat from the database.

### HTTP Actions

#### `POST /chat-stream`

Streams AI responses to the client while persisting to the database.

**Request Body:**

```json
{
  "streamId": "string",
  "prompt": "string",
  "chatId": "string"
}
```

## 🔧 Environment Variables

Add your AI provider API keys to `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Or Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Convex URL (usually set automatically)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.site
```

## 📊 How It Works

1. **Client creates chat**: Calls `createChat` mutation, gets `streamId`
2. **Component initializes stream**: `useStream` hook detects new chat
3. **HTTP streaming begins**: POST request to `/chat-stream` endpoint
4. **Dual output**:
   - Tokens stream to client via HTTP (fast, real-time)
   - Complete sentences written to database (persistent, accessible)
5. **Database subscription**: Other clients see updates via Convex subscriptions
6. **Stream completes**: Status updated to 'completed', HTTP connection closes
7. **History available**: Full chat accessible from database anytime

## 🎨 UI Components Used

- `Card`, `CardHeader`, `CardContent` - Layout structure
- `Button` - Action buttons
- `Input` - Prompt input field
- `ScrollArea` - Scrollable chat history
- `Loader2`, `Send`, `MessageSquare` - Lucide icons

## 📖 Example Use Cases

1. **AI Customer Support**: Real-time responses with full history
2. **Content Generation**: Blog posts, emails, documents
3. **Code Assistant**: Programming help with streaming code
4. **Translation Services**: Real-time translation with persistence
5. **Educational Tutoring**: Q&A sessions with saved conversations

## 🐛 Troubleshooting

### Stream not starting

- Check that `convex.config.ts` has the component registered
- Verify Convex deployment is up to date: `npx convex dev`
- Check browser console for CORS errors

### Text not persisting

- Verify `ai_chats` table exists in schema
- Check database indexes are created
- Look for errors in Convex dashboard logs

### TypeScript errors

- Run `npx convex dev` to regenerate types
- Check that `components.persistentTextStreaming` is available

## 📚 Additional Resources

- [Component Documentation](https://github.com/get-convex/convex-helpers/tree/main/packages/persistent-text-streaming)
- [Convex Documentation](https://docs.convex.dev)
- [Stack Post: AI Chat with HTTP Streaming](https://stack.convex.dev/ai-chat-with-http-streaming)

## 🤝 Contributing

Feel free to enhance this implementation:

- Add user authentication checks
- Implement rate limiting
- Add chat editing/regeneration
- Support for image/file attachments
- Multi-turn conversations with context

---

**Happy streaming!** 🚀
