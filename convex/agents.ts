/**
 * AI Agent Framework for Convex
 *
 * Custom implementation of AI agents with:
 * - Thread-based conversation management
 * - Tool integration
 * - Usage tracking
 * - Message history with search
 * - Multi-agent support
 */

import { v } from 'convex/values';
import { query, mutation, action } from './_generated/server';
import { api } from './_generated/api';
import { openai as openaiProvider } from '@ai-sdk/openai';
import { anthropic as anthropicProvider } from '@ai-sdk/anthropic';
import { generateText, CoreMessage, tool } from 'ai';
import { z } from 'zod';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a thread by ID
 */
export const getThread = query({
  args: { threadId: v.id('agent_threads') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

/**
 * List threads for a user
 */
export const listThreads = query({
  args: {
    userId: v.id('users'),
    status: v.optional(v.union(v.literal('active'), v.literal('archived'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query('agent_threads')
      .withIndex('by_user_id', (q) => q.eq('user_id', args.userId));

    if (args.status) {
      const threads = await query.collect();
      return threads
        .filter((t) => t.status === args.status)
        .sort((a, b) => b.last_message_at - a.last_message_at)
        .slice(0, args.limit || 50);
    }

    return await query.order('desc').take(args.limit || 50);
  },
});

/**
 * Get messages for a thread
 */
export const getMessages = query({
  args: {
    threadId: v.id('agent_threads'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('agent_messages')
      .withIndex('by_thread_id', (q) => q.eq('thread_id', args.threadId))
      .order('asc')
      .take(args.limit || 100);
  },
});

/**
 * Search messages in a thread
 */
export const searchMessages = query({
  args: {
    threadId: v.id('agent_threads'),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('agent_messages')
      .withSearchIndex('search_content', (q) =>
        q.search('content', args.searchTerm).eq('thread_id', args.threadId)
      )
      .take(args.limit || 20);
  },
});

/**
 * Get usage statistics
 */
export const getUsageStats = query({
  args: {
    userId: v.id('users'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query('agent_usage')
      .withIndex('by_user_id', (q) => q.eq('user_id', args.userId))
      .collect();

    const filtered = usage.filter((u) => {
      if (args.startDate && u.created_at < args.startDate) return false;
      if (args.endDate && u.created_at > args.endDate) return false;
      return true;
    });

    return {
      totalTokens: filtered.reduce((sum, u) => sum + u.input_tokens + u.output_tokens, 0),
      inputTokens: filtered.reduce((sum, u) => sum + u.input_tokens, 0),
      outputTokens: filtered.reduce((sum, u) => sum + u.output_tokens, 0),
      totalCost: filtered.reduce((sum, u) => sum + (u.cost_cents || 0), 0),
      requestCount: filtered.length,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new agent thread
 */
export const createThread = mutation({
  args: {
    userId: v.id('users'),
    agentName: v.string(),
    title: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const threadId = await ctx.db.insert('agent_threads', {
      user_id: args.userId,
      agent_name: args.agentName,
      title: args.title,
      metadata: args.metadata,
      status: 'active',
      created_at: Date.now(),
      last_message_at: Date.now(),
    });

    return threadId;
  },
});

/**
 * Add a message to a thread
 */
export const addMessage = mutation({
  args: {
    threadId: v.id('agent_threads'),
    role: v.union(
      v.literal('user'),
      v.literal('assistant'),
      v.literal('system'),
      v.literal('tool')
    ),
    content: v.string(),
    agentName: v.optional(v.string()),
    toolCalls: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert('agent_messages', {
      thread_id: args.threadId,
      role: args.role,
      content: args.content,
      agent_name: args.agentName,
      tool_calls: args.toolCalls,
      metadata: args.metadata,
      created_at: Date.now(),
    });

    // Update thread's last message timestamp
    await ctx.db.patch(args.threadId, {
      last_message_at: Date.now(),
    });

    return messageId;
  },
});

/**
 * Archive a thread
 */
export const archiveThread = mutation({
  args: { threadId: v.id('agent_threads') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.threadId, { status: 'archived' });
  },
});

/**
 * Track usage
 */
export const trackUsage = mutation({
  args: {
    userId: v.id('users'),
    threadId: v.optional(v.id('agent_threads')),
    agentName: v.string(),
    model: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costCents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('agent_usage', {
      user_id: args.userId,
      thread_id: args.threadId,
      agent_name: args.agentName,
      model: args.model,
      input_tokens: args.inputTokens,
      output_tokens: args.outputTokens,
      cost_cents: args.costCents,
      created_at: Date.now(),
    });
  },
});

// ============================================================================
// ACTIONS - Agent Logic
// ============================================================================

/**
 * Generate text with an agent
 */
export const generateAgentResponse = action({
  args: {
    threadId: v.id('agent_threads'),
    userId: v.id('users'),
    prompt: v.string(),
    agentConfig: v.object({
      name: v.string(),
      model: v.string(),
      provider: v.union(v.literal('openai'), v.literal('anthropic')),
      instructions: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
    useTools: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get message history
    const messages = await ctx.runQuery(api.agents.getMessages, {
      threadId: args.threadId,
    });

    // Convert to AI SDK format
    const history: CoreMessage[] = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Add system message
    history.unshift({
      role: 'system',
      content: args.agentConfig.instructions,
    });

    // Add new user message
    history.push({
      role: 'user',
      content: args.prompt,
    });

    // Select provider
    const provider =
      args.agentConfig.provider === 'openai'
        ? openaiProvider(args.agentConfig.model)
        : anthropicProvider(args.agentConfig.model);

    // Define example tools
    const tools = args.useTools
      ? {
          getDateTime: tool({
            description: 'Get current date and time',
            parameters: z.object({}),
            execute: async () => {
              return {
                date: new Date().toLocaleDateString('tr-TR'),
                time: new Date().toLocaleTimeString('tr-TR'),
                timestamp: Date.now(),
              };
            },
          } as any),
          searchDatabase: tool({
            description: 'Search the database for information',
            parameters: z.object({
              query: z.string().describe('Search query'),
              table: z
                .enum(['users', 'beneficiaries', 'donations', 'scholarships'])
                .describe('Table to search'),
            }),
            execute: async ({
              query,
              table,
            }: {
              query: string;
              table: 'users' | 'beneficiaries' | 'donations' | 'scholarships';
            }) => {
              // Placeholder - implement actual search
              return {
                results: [],
                message: `Searching ${table} for: ${query}`,
              };
            },
          } as any),
        }
      : undefined;

    // Generate response
    const result = await generateText({
      model: provider,
      messages: history,
      temperature: args.agentConfig.temperature || 0.7,
      maxRetries: args.agentConfig.maxTokens || 1000,
      tools,
    });

    // Save user message
    await ctx.runMutation(api.agents.addMessage, {
      threadId: args.threadId,
      role: 'user',
      content: args.prompt,
    });

    // Save assistant response
    await ctx.runMutation(api.agents.addMessage, {
      threadId: args.threadId,
      role: 'assistant',
      content: result.text,
      agentName: args.agentConfig.name,
      toolCalls: result.toolCalls,
    });

    // Track usage
    if (result.usage) {
      await ctx.runMutation(api.agents.trackUsage, {
        userId: args.userId,
        threadId: args.threadId,
        agentName: args.agentConfig.name,
        model: args.agentConfig.model,
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
      });
    }

    return {
      text: result.text,
      toolCalls: result.toolCalls,
      usage: result.usage,
    };
  },
});

/**
 * Create thread and generate first response
 */
export const createThreadAndRespond = action({
  args: {
    userId: v.id('users'),
    prompt: v.string(),
    agentConfig: v.object({
      name: v.string(),
      model: v.string(),
      provider: v.union(v.literal('openai'), v.literal('anthropic')),
      instructions: v.string(),
      temperature: v.optional(v.number()),
      maxTokens: v.optional(v.number()),
    }),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ threadId: string; response: { text: string } }> => {
    // Create thread
    const threadId = await ctx.runMutation(api.agents.createThread, {
      userId: args.userId,
      agentName: args.agentConfig.name,
      title: args.title || args.prompt.slice(0, 50),
    });

    // Generate response
    const result = (await ctx.runAction(api.agents.generateAgentResponse, {
      threadId: threadId as any,
      userId: args.userId,
      prompt: args.prompt,
      agentConfig: args.agentConfig,
    })) as { text: string; toolCalls?: unknown; usage?: unknown };

    return {
      threadId: threadId as string,
      response: result,
    };
  },
});
