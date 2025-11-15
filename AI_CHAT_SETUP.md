# 🚀 Quick Start: AI Chat Streaming Setup

## ✅ Installation Complete

The `@convex-dev/persistent-text-streaming` component has been installed and configured!

## 📦 What Was Added

### 1. **Component Configuration**

- ✅ `convex/convex.config.ts` - Component registration
- ✅ `convex/schema.ts` - Added `ai_chats` table
- ✅ `convex/ai_chat.ts` - Chat logic with streaming
- ✅ `convex/http.ts` - HTTP endpoint for streaming

### 2. **React Components**

- ✅ `src/components/ai/AIChat.tsx` - Complete chat UI component

### 3. **Documentation**

- ✅ `docs/AI_CHAT_STREAMING.md` - Full implementation guide

## 🔧 Next Steps

### 1. Regenerate Convex Types

Run this command to update generated types:

\`\`\`bash
npx convex dev
\`\`\`

This will:

- Register the persistent-text-streaming component
- Generate TypeScript types for `components.persistentTextStreaming`
- Create the `ai_chats` table in your database

### 2. Add AI Provider API Key

Choose your AI provider and add the API key to `.env.local`:

**For OpenAI:**
\`\`\`bash
OPENAI_API_KEY=sk-...
\`\`\`

**For Anthropic Claude:**
\`\`\`bash
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

### 3. Update AI Integration

Edit `convex/ai_chat.ts` and replace the placeholder in the `generateChat` function with real AI calls:

\`\`\`typescript
// Replace lines 145-173 with:
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const stream = await openai.chat.completions.create({
model: "gpt-4",
messages: [{ role: "user", content: body.prompt }],
stream: true,
});

for await (const chunk of stream) {
const content = chunk.choices[0]?.delta?.content || '';
if (content) {
await chunkAppender(content);
}
}
\`\`\`

### 4. Use the Component

Add the chat component to any page:

\`\`\`tsx
import { AIChat } from '@/components/ai/AIChat';

export default function ChatPage() {
const session = useSession(); // or your auth method

return (
<AIChat
      userId={session.user.id}
      convexSiteUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}
    />
);
}
\`\`\`

## 🎯 Test the Setup

1. **Start Convex:**
   \`\`\`bash
   npx convex dev
   \`\`\`

2. **Start Next.js:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Navigate to your chat page** and try creating a chat!

## 📊 Database Schema

The following table was added to your schema:

\`\`\`typescript
ai_chats: {
user_id: Id<'users'>
title: string
prompt: string
stream_id: string // Managed by persistent-text-streaming
status: 'pending' | 'completed' | 'error'
created_at: number
updated_at: number
}
\`\`\`

## 🔌 HTTP Endpoint

The following endpoint is now available:

**POST** `https://your-project.convex.site/chat-stream`

Request body:
\`\`\`json
{
"streamId": "...",
"prompt": "...",
"chatId": "..."
}
\`\`\`

## 🐛 Troubleshooting

### TypeScript Error: "Property 'persistentTextStreaming' does not exist"

**Solution:** Run `npx convex dev` to regenerate types

### CORS Errors

**Solution:** CORS headers are already configured in `convex/http.ts`

### Stream Not Starting

**Solution:**

1. Ensure Convex is running: `npx convex dev`
2. Check browser console for errors
3. Verify `convexSiteUrl` prop is correct

## 📚 Learn More

See `docs/AI_CHAT_STREAMING.md` for:

- Complete API reference
- OpenAI/Anthropic integration examples
- Advanced usage patterns
- Component customization

---

**Need help?** Check the [Convex Discord](https://discord.gg/convex) or [documentation](https://docs.convex.dev)
