/**
 * AI Agent Chat Component
 *
 * Full-featured agent interface with:
 * - Thread management
 * - Multi-agent support
 * - Tool execution visualization
 * - Usage tracking
 * - Message search
 */

'use client';

import { useState } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import logger from '@/lib/logger';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send, Bot, User, TrendingUp, Archive, Search, Wrench } from 'lucide-react';

interface AgentChatProps {
  userId: string;
}

interface Thread {
  _id: string;
  title: string;
  agent_name: string;
  status: 'active' | 'archived';
  last_message_at: number;
}

// Message interface removed - using query results directly

// Predefined agent configurations
const AGENT_CONFIGS = {
  support: {
    name: 'Support Agent',
    model: 'gpt-4o-mini',
    provider: 'openai' as const,
    instructions:
      'You are a helpful customer support agent. Assist users with their questions professionally and courteously. Speak Turkish.',
    temperature: 0.7,
  },
  assistant: {
    name: 'General Assistant',
    model: 'gpt-4o',
    provider: 'openai' as const,
    instructions:
      'You are a helpful AI assistant. Provide accurate and helpful information. Speak Turkish.',
    temperature: 0.8,
  },
  analyst: {
    name: 'Data Analyst',
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic' as const,
    instructions:
      'You are a data analyst. Help analyze data, create reports, and provide insights. Speak Turkish.',
    temperature: 0.5,
  },
};

export function AgentChat({ userId }: AgentChatProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<keyof typeof AGENT_CONFIGS>('support');
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const threads = useQuery(api.agents.listThreads, {
    userId: userId as any,
    status: 'active',
  });

  const messages = useQuery(
    api.agents.getMessages,
    activeThread ? { threadId: activeThread._id as any } : 'skip'
  );

  const usageStats = useQuery(api.agents.getUsageStats, {
    userId: userId as any,
  });

  // Actions
  const createAndRespond = useAction(api.agents.createThreadAndRespond);
  const generateResponse = useAction(api.agents.generateAgentResponse);

  // Mutations
  const archiveThread = useMutation(api.agents.archiveThread);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const agentConfig = AGENT_CONFIGS[selectedAgent];

      if (activeThread) {
        // Continue existing thread
        await generateResponse({
          threadId: activeThread._id as any,
          userId: userId as any,
          prompt: prompt.trim(),
          agentConfig,
          useTools: true,
        });
      } else {
        // Create new thread
        await createAndRespond({
          userId: userId as any,
          prompt: prompt.trim(),
          agentConfig,
          title: prompt.slice(0, 50),
        });

        // Refresh threads list will happen automatically via Convex subscription
      }

      setPrompt('');
    } catch (error) {
      logger.error('Agent response generation failed', { error });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleArchive = async (threadId: string) => {
    await archiveThread({ threadId: threadId as any });
    if (activeThread?._id === threadId) {
      setActiveThread(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* Sidebar - Threads List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Threads
          </CardTitle>
          <CardDescription>Conversation history</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {threads?.map((thread) => (
                <button
                  key={thread._id}
                  onClick={() => setActiveThread(thread as Thread)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    activeThread?._id === thread._id ? 'border-primary bg-accent' : ''
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <Badge variant="outline">{thread.agent_name}</Badge>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(thread._id);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Archive className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="truncate font-medium">{thread.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(thread.last_message_at).toLocaleDateString('tr-TR')}
                  </div>
                </button>
              ))}
              {(!threads || threads.length === 0) && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No active threads. Start a new conversation!
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Agent Chat
              </CardTitle>
              <CardDescription>
                {activeThread ? `Thread: ${activeThread.title}` : 'Start a new conversation'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedAgent}
                onValueChange={(value) => setSelectedAgent(value as keyof typeof AGENT_CONFIGS)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Support Agent
                    </div>
                  </SelectItem>
                  <SelectItem value="assistant">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      General Assistant
                    </div>
                  </SelectItem>
                  <SelectItem value="analyst">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Data Analyst
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <ScrollArea className="mb-4 h-[450px] rounded-lg border p-4">
                {messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {msg.role === 'user' ? (
                              <User className="h-3 w-3" />
                            ) : (
                              <Bot className="h-3 w-3" />
                            )}
                            {msg.agent_name || msg.role}
                            {msg.tool_calls && <Wrench className="h-3 w-3" />}
                          </div>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          {msg.tool_calls && (
                            <div className="mt-2 rounded bg-background/50 p-2 text-xs">
                              <div className="font-medium">Tool Calls:</div>
                              <pre className="mt-1 overflow-auto">
                                {JSON.stringify(msg.tool_calls, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                    <div>
                      <Bot className="mx-auto mb-2 h-12 w-12 opacity-50" />
                      <p>
                        {activeThread
                          ? 'No messages yet'
                          : 'Select a thread or start a new conversation'}
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isGenerating}
                  className="flex-1"
                />
                <Button type="submit" disabled={!prompt.trim() || isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-2 text-xs text-muted-foreground">
                Agent: {AGENT_CONFIGS[selectedAgent].name} ({AGENT_CONFIGS[selectedAgent].model})
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    disabled={!activeThread}
                  />
                  <Button disabled={!activeThread || !searchTerm}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {!activeThread && (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    Select a thread to search messages
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usageStats ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Tokens</div>
                          <div className="text-2xl font-bold">
                            {usageStats.totalTokens.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Requests</div>
                          <div className="text-2xl font-bold">
                            {usageStats.requestCount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Input Tokens</div>
                          <div className="text-xl font-bold">
                            {usageStats.inputTokens.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Output Tokens</div>
                          <div className="text-xl font-bold">
                            {usageStats.outputTokens.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Loading stats...</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agent Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{AGENT_CONFIGS[selectedAgent].name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-medium">{AGENT_CONFIGS[selectedAgent].model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider:</span>
                        <span className="font-medium">{AGENT_CONFIGS[selectedAgent].provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="font-medium">
                          {AGENT_CONFIGS[selectedAgent].temperature}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
