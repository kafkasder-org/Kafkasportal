/**
 * AI Chat Component
 *
 * Example React component demonstrating how to use the
 * @convex-dev/persistent-text-streaming component in the frontend.
 *
 * Features:
 * - Create new AI chat conversations
 * - Stream responses in real-time via HTTP
 * - Subscribe to chat updates via database queries
 * - View chat history
 */

'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useStream } from '@convex-dev/persistent-text-streaming/react';
import logger from '@/lib/logger';
import { api } from '@/convex/_generated/api';
import type { StreamId } from '@convex-dev/persistent-text-streaming';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare } from 'lucide-react';

interface AIChatProps {
  userId: string;
  convexSiteUrl: string; // e.g., "https://your-project.convex.site"
}

interface Chat {
  _id: string;
  title: string;
  prompt: string;
  stream_id: string;
  status: 'pending' | 'completed' | 'error';
  created_at: number;
}

export function AIChat({ userId, convexSiteUrl }: AIChatProps) {
  const [prompt, setPrompt] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Mutations
  const createChat = useMutation(api.ai_chat.createChat);

  // Queries
  const chats = useQuery(api.ai_chat.listChats, {
    user_id: userId as any,
    limit: 20,
  });

  // Stream hook - only active if we have an active chat
  const { text: streamedText, status: streamStatus } = useStream(
    api.ai_chat.getChatBody,
    new URL(`${convexSiteUrl}/chat-stream`),
    !!activeChat && activeChat.status === 'pending', // Only drive the stream if we created it
    activeChat?.stream_id as StreamId | undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const result = await createChat({
        user_id: userId as any,
        prompt: prompt.trim(),
        title: prompt.slice(0, 50), // Use first 50 chars as title
      });

      // Set as active chat to start streaming
      setActiveChat({
        _id: result.chatId,
        title: prompt.slice(0, 50),
        prompt: prompt.trim(),
        stream_id: result.streamId,
        status: 'pending',
        created_at: Date.now(),
      });

      setPrompt('');
    } catch (error) {
      logger.error('AI chat creation failed', { error });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Chat History Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sohbet Geçmişi
          </CardTitle>
          <CardDescription>Önceki AI sohbetleriniz</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {chats?.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => setActiveChat(chat as Chat)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    activeChat?._id === chat._id ? 'border-primary bg-accent' : ''
                  }`}
                >
                  <div className="truncate font-medium">{chat.title}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{chat.prompt}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        chat.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : chat.status === 'pending'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {chat.status === 'completed'
                        ? 'Tamamlandı'
                        : chat.status === 'pending'
                          ? 'Devam ediyor'
                          : 'Hata'}
                    </span>
                  </div>
                </button>
              ))}
              {(!chats || chats.length === 0) && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Henüz sohbet yok. Aşağıdan yeni bir sohbet başlatın!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Asistan</CardTitle>
          <CardDescription>Sorularınızı sorun, gerçek zamanlı yanıtlar alın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Display */}
          <ScrollArea className="h-[400px] rounded-lg border p-4">
            {activeChat ? (
              <div className="space-y-4">
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                    {activeChat.prompt}
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
                    {streamedText || 'Yanıt bekleniyor...'}
                    {streamStatus === 'streaming' && (
                      <Loader2 className="ml-2 inline h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>

                {activeChat.status === 'error' && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    Yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p>Yeni bir sohbet başlatın</p>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Bir soru sorun veya mesaj yazın..."
              disabled={isCreating}
              className="flex-1"
            />
            <Button type="submit" disabled={!prompt.trim() || isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gönder
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <strong>Not:</strong> Bu bir demo uygulamasıdır. Gerçek AI entegrasyonu için{' '}
            <code className="rounded bg-background px-1 py-0.5">convex/ai_chat.ts</code>{' '}
            dosyasındaki TODO yorumlarını takip edin.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
