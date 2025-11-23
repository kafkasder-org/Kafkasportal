/**
 * AI Chat Component
 *
 * React component for AI chat conversations using Appwrite backend.
 *
 * Features:
 * - Create new AI chat conversations
 * - Stream responses in real-time via polling
 * - View chat history
 * - Manage chat status and messages
 */

'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import logger from '@/lib/logger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageSquare } from 'lucide-react';

interface AIChatProps {
  userId: string;
  convexSiteUrl?: string; // Deprecated parameter, no longer used
}

interface Chat {
  _id?: string;
  $id?: string;
  title?: string;
  prompt?: string;
  status?: 'pending' | 'completed' | 'error';
  created_at?: string;
  createdAt?: string;
  body?: string;
  [key: string]: unknown;
}

export function AIChat({ userId }: AIChatProps) {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Queries
  const { data: chatsData } = useQuery({
    queryKey: ['ai-chats', userId],
    queryFn: async () => {
      // TODO: Implement AI chats API endpoint
      // For now, return empty array
      return [];
    },
    enabled: !!userId,
  });

  const chats = chatsData || [];

  // Poll for active chat updates
  const { data: activeChatData } = useQuery({
    queryKey: ['ai-chat', activeChat?._id || activeChat?.$id],
    queryFn: async () => {
      if (!activeChat?._id && !activeChat?.$id) return null;
      // TODO: Fetch chat by ID
      return activeChat;
    },
    enabled: !!activeChat && (!!activeChat._id || !!activeChat.$id),
    refetchInterval: activeChat?.status === 'pending' ? 2000 : false,
  });

  const streamedText = activeChatData?.body || '';
  const streamStatus = activeChatData?.status === 'pending' ? 'streaming' : 'idle';

  const createChatMutation = useMutation({
    mutationFn: async (_data: { user_id: string; prompt: string; title: string }) => {
      // TODO: Implement AI chat creation API endpoint
      // For now, return a mock response
      return {
        chatId: `chat_${Date.now()}`,
        streamId: `stream_${Date.now()}`,
      };
    },
    onSuccess: (result) => {
      const newChat: Chat = {
        _id: result.chatId,
        title: prompt.slice(0, 50),
        prompt: prompt.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setActiveChat(newChat);
      queryClient.invalidateQueries({ queryKey: ['ai-chats', userId] });
      setPrompt('');
    },
    onError: (error) => {
      logger.error('AI chat creation failed', { error });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isCreating) return;

    setIsCreating(true);
    try {
      await createChatMutation.mutateAsync({
        user_id: userId,
        prompt: prompt.trim(),
        title: prompt.slice(0, 50),
      });
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
              {chats?.map((chat: Chat) => {
                const chatId = chat._id || chat.$id || '';
                return (
                <button
                  key={chatId}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    (activeChat?._id || activeChat?.$id) === chatId ? 'border-primary bg-accent' : ''
                  }`}
                >
                  <div className="truncate font-medium">{chat.title || 'Başlıksız'}</div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">{chat.prompt || ''}</div>
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
              );
              })}
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
            <Button type="submit" disabled={!prompt.trim() || isCreating || createChatMutation.isPending}>
              {isCreating || createChatMutation.isPending ? (
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
            <strong>Not:</strong> AI Chat özelliği Appwrite'a geçiş sırasında güncelleniyor. 
            Gerçek AI entegrasyonu için API endpoint'leri oluşturulmalıdır.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
