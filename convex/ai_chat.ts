/**
 * AI Chat with Persistent Text Streaming
 *
 * This module demonstrates how to use the @convex-dev/persistent-text-streaming
 * component for AI chat applications. It provides:
 * - HTTP streaming for real-time chat responses
 * - Database persistence for chat history
 * - Support for multiple users viewing the same chat
 */

import { query, mutation, httpAction } from './_generated/server';
import { v } from 'convex/values';
import { PersistentTextStreaming } from '@convex-dev/persistent-text-streaming';
import { components } from './_generated/api';
import type { StreamId } from '@convex-dev/persistent-text-streaming';

const persistentTextStreaming = new PersistentTextStreaming(components.persistentTextStreaming);

// Validator for StreamId
export const StreamIdValidator = v.string();

/**
 * Create a new chat with a stream
 * Returns the chat ID which includes the stream ID
 */
export const createChat = mutation({
  args: {
    user_id: v.id('users'),
    prompt: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a stream using the component
    const streamId = await persistentTextStreaming.createStream(ctx);

    // Store the chat in the database with the stream ID
    const chatId = await ctx.db.insert('ai_chats', {
      user_id: args.user_id,
      title: args.title || 'New Chat',
      prompt: args.prompt,
      stream_id: streamId,
      status: 'pending',
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return { chatId, streamId };
  },
});

/**
 * Get chat by ID
 */
export const getChat = query({
  args: {
    chatId: v.id('ai_chats'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId);
  },
});

/**
 * Get the current body of a chat stream
 * This query will be subscribed to and will update as the stream progresses
 */
export const getChatBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(ctx, args.streamId as StreamId);
  },
});

/**
 * List all chats for a user
 */
export const listChats = query({
  args: {
    user_id: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query('ai_chats')
      .withIndex('by_user_id', (q) => q.eq('user_id', args.user_id))
      .order('desc')
      .take(args.limit || 50);

    return chats;
  },
});

/**
 * Update chat status
 */
export const updateChatStatus = mutation({
  args: {
    chatId: v.id('ai_chats'),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('error')),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, {
      status: args.status,
      updated_at: Date.now(),
    });
  },
});

/**
 * Delete a chat
 */
export const deleteChat = mutation({
  args: {
    chatId: v.id('ai_chats'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.chatId);
  },
});

/**
 * HTTP Action: Stream chat response
 *
 * This endpoint receives a stream ID and generates AI responses,
 * streaming them to the client via HTTP while also persisting to the database.
 *
 * Usage from frontend:
 * POST /chat-stream
 * Body: { streamId: string, prompt: string }
 */
export const streamChat = httpAction(async (ctx, request) => {
  const body = (await request.json()) as {
    streamId: string;
    prompt: string;
    chatId: string;
  };

  /**
   * Generate chat response function
   * This is where you'd integrate with your AI service (OpenAI, Anthropic, etc.)
   * For now, this is a placeholder that demonstrates the streaming pattern
   */
  const generateChat = async (
    ctx: any,
    _request: Request,
    _streamId: StreamId,
    chunkAppender: (chunk: string) => Promise<void>
  ) => {
    try {
      // TODO: Replace this with your actual AI integration
      // Example with OpenAI:
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      // const stream = await openai.chat.completions.create({
      //   model: "gpt-4",
      //   messages: [{ role: "user", content: body.prompt }],
      //   stream: true,
      // });
      //
      // for await (const chunk of stream) {
      //   const content = chunk.choices[0]?.delta?.content || '';
      //   if (content) {
      //     await chunkAppender(content);
      //   }
      // }

      // Placeholder simulation
      const simulatedResponse = [
        'Merhaba! ',
        'Size nasıl yardımcı olabilirim?\n\n',
        'Bu, Convex persistent text streaming ',
        'bileşenini kullanan bir demo yanıttır. ',
        'Gerçek bir AI entegrasyonu için, ',
        'yukarıdaki TODO yorumunu takip edin.\n\n',
        'Özellikler:\n',
        '- HTTP streaming ile anlık yanıtlar\n',
        '- Veritabanında kalıcı saklama\n',
        '- Çoklu kullanıcı desteği\n',
        '- Bağlantı kopsa bile erişilebilir geçmiş\n\n',
        'İyi günler! 🚀',
      ];

      for (const chunk of simulatedResponse) {
        await chunkAppender(chunk);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Update chat status to completed
      await ctx.runMutation(ctx.mutations.ai_chat.updateChatStatus, {
        chatId: body.chatId,
        status: 'completed',
      });
    } catch (error) {
      console.error('Error generating chat:', error);
      await ctx.runMutation(ctx.mutations.ai_chat.updateChatStatus, {
        chatId: body.chatId,
        status: 'error',
      });
      throw error;
    }
  };

  // Use the component to stream the response
  const response = await persistentTextStreaming.stream(
    ctx,
    request,
    body.streamId as StreamId,
    generateChat
  );

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Vary', 'Origin');

  return response;
});
