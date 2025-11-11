'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  History,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MessageForm = dynamic(() => import('@/components/forms/MessageForm').then(mod => ({ default: mod.MessageForm })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>,
  ssr: false,
});
import { RecipientSelector } from '@/components/messages/RecipientSelector';
import { MessageTemplateSelector } from '@/components/messages/MessageTemplateSelector';
import {
  getMessageTypeLabel,
  estimateSmsCost,
  getSmsMessageCount,
  formatPhoneNumber,
} from '@/lib/validations/message';
import type { MessageDocument } from '@/types/database';

type MessageType = 'sms' | 'email';
type WizardStep = 'compose' | 'recipients' | 'preview' | 'sending';

interface SendingResult {
  success: number;
  failed: number;
  errors: Array<{ recipient: string; error: string }>;
}

export default function BulkMessagingPage() {
  const queryClient = useQueryClient();

  // State management
  const [messageType, setMessageType] = useState<MessageType>('sms');
  const [step, setStep] = useState<WizardStep>('compose');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageData, setMessageData] = useState<{
    subject?: string;
    content: string;
  }>({ content: '' });
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingResults, setSendingResults] = useState<SendingResult>({
    success: 0,
    failed: 0,
    errors: [],
  });
  const [isSending, setIsSending] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Fetch statistics
  // const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
  //   queryKey: ['messages-statistics'],
  //   queryFn: () => api.messages.getMessagesStatistics(),
  // });

  const statsResponse = { data: { totalSms: 0, totalEmails: 0, failedMessages: 0 } };
  const isLoadingStats = false;

  const stats = statsResponse?.data || {
    totalSms: 0,
    totalEmails: 0,
    failedMessages: 0,
    draftMessages: 0,
  };

  // Fetch bulk message history
  // const { data: historyResponse, isLoading: isLoadingHistory } = useQuery({
  //   queryKey: ['bulk-messages-history'],
  //   queryFn: () => api.messages.getMessages({
  //     filters: { is_bulk: true },
  //     limit: 50
  //   }),
  // });

  const historyResponse = { data: [] };
  const _isLoadingHistory = false;

  const historyMessages = historyResponse?.data || [];

  // Mutations
  const createMessageMutation = useMutation({
    mutationFn: (_data: Record<string, unknown>) => Promise.resolve({ data: null, error: null }), // api.messages.createMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (_id: string) => Promise.resolve({ data: null, error: null }), // api.messages.sendMessage(id),
  });

  // Event handlers
  const handleNextStep = () => {
    if (step === 'compose') {
      if (!messageData.content.trim()) {
        toast.error('Mesaj içeriği zorunludur.');
        return;
      }
      setStep('recipients');
    } else if (step === 'recipients') {
      if (selectedRecipients.length === 0) {
        toast.error('En az bir alıcı seçmelisiniz.');
        return;
      }
      setStep('preview');
    } else if (step === 'preview') {
      if (!confirmed) {
        toast.error('Lütfen gönderimi onaylayın.');
        return;
      }
      setStep('sending');
      handleSendBulkMessage();
    }
  };

  const handlePrevStep = () => {
    if (step === 'recipients') {
      setStep('compose');
    } else if (step === 'preview') {
      setStep('recipients');
    }
  };

  const handleSendBulkMessage = async () => {
    if (selectedRecipients.length === 0 || !messageData.content.trim()) {
      toast.error('Mesaj verileri eksik.');
      return;
    }

    setIsSending(true);
    setSendingProgress(0);
    setSendingResults({ success: 0, failed: 0, errors: [] });

    try {
      // Create bulk message
      const bulkMessageData = {
        message_type: messageType,
        recipients: selectedRecipients,
        subject: messageData.subject,
        content: messageData.content,
        status: 'sent' as const,
        is_bulk: true,
        sent_at: new Date().toISOString(),
      };

      const result = await createMessageMutation.mutateAsync(bulkMessageData);

      if (result.data) {
        // Simulate batch sending (in real implementation, this would be handled by backend)
        const batchSize = 50;
        const totalBatches = Math.ceil(selectedRecipients.length / batchSize);
        let successCount = 0;
        let failedCount = 0;
        const errors: Array<{ recipient: string; error: string }> = [];

        for (let i = 0; i < totalBatches; i++) {
          const batchStart = i * batchSize;
          const batchEnd = Math.min(batchStart + batchSize, selectedRecipients.length);
          const batch = selectedRecipients.slice(batchStart, batchEnd);

          // Simulate sending delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Simulate some failures (10% failure rate)
          batch.forEach((recipient) => {
            if (Math.random() < 0.1) {
              failedCount++;
              errors.push({
                recipient,
                error: 'Alıcı bulunamadı',
              });
            } else {
              successCount++;
            }
          });

          setSendingProgress(Math.round(((i + 1) / totalBatches) * 100));
          setSendingResults({
            success: successCount,
            failed: failedCount,
            errors,
          });
        }

        // Send the actual message
        // await sendMessageMutation.mutateAsync(result.data._id);
        await sendMessageMutation.mutateAsync('dummy-id');

        toast.success(
          `Toplu mesaj gönderildi! ${successCount} başarılı, ${failedCount} başarısız.`
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error(`Toplu mesaj gönderilirken hata oluştu: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartOver = () => {
    setStep('compose');
    setSelectedRecipients([]);
    setMessageData({ content: '' });
    setSendingProgress(0);
    setSendingResults({ success: 0, failed: 0, errors: [] });
    setConfirmed(false);
    setShowPreview(false);
  };

  const handleRetryFailed = () => {
    const failedRecipients = sendingResults.errors.map((e) => e.recipient);
    setSelectedRecipients(failedRecipients);
    setStep('preview');
    setConfirmed(false);
  };

  const handleDownloadReport = () => {
    const reportData = {
      messageType,
      totalRecipients: selectedRecipients.length,
      successCount: sendingResults.success,
      failedCount: sendingResults.failed,
      errors: sendingResults.errors,
      timestamp: new Date().toISOString(),
      content: messageData.content,
      subject: messageData.subject,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-message-report-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'compose':
        return 'Mesaj Oluştur';
      case 'recipients':
        return 'Alıcı Seçimi';
      case 'preview':
        return 'Önizleme ve Onay';
      case 'sending':
        return 'Gönderiliyor';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'compose':
        return 'Mesajınızı yazın ve şablon seçin';
      case 'recipients':
        return 'Mesajı göndereceğiniz alıcıları seçin';
      case 'preview':
        return 'Mesajı kontrol edin ve gönderimi onaylayın';
      case 'sending':
        return 'Mesajlar gönderiliyor...';
      default:
        return '';
    }
  };

  const estimatedCost =
    messageType === 'sms' ? estimateSmsCost(selectedRecipients.length, messageData.content) : 0;
  const smsMessageCount = messageType === 'sms' ? getSmsMessageCount(messageData.content) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Toplu Mesaj Gönderimi</h2>
          <p className="text-gray-600 mt-2">SMS veya E-posta ile toplu mesaj gönderin</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                Gönderim Geçmişi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Toplu Mesaj Geçmişi</DialogTitle>
              </DialogHeader>
              <BulkMessageHistory messages={historyMessages} />
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={messageType === 'sms' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMessageType('sms')}
              className="gap-1"
            >
              <Phone className="h-4 w-4" />
              SMS
            </Button>
            <Button
              variant={messageType === 'email' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMessageType('email')}
              className="gap-1"
            >
              <Mail className="h-4 w-4" />
              E-posta
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam SMS</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                stats.totalSms
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam E-posta</CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <Mail className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                stats.totalEmails
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarısız</CardTitle>
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                stats.failedMessages
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                stats.totalSms + stats.totalEmails
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wizard Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Adım{' '}
                {step === 'compose'
                  ? '1'
                  : step === 'recipients'
                    ? '2'
                    : step === 'preview'
                      ? '3'
                      : '4'}{' '}
                / 4
              </span>
              <span className="text-sm text-gray-600">
                {step === 'compose'
                  ? '25%'
                  : step === 'recipients'
                    ? '50%'
                    : step === 'preview'
                      ? '75%'
                      : '100%'}
              </span>
            </div>
            <Progress
              value={
                step === 'compose' ? 25 : step === 'recipients' ? 50 : step === 'preview' ? 75 : 100
              }
              className="h-2"
            />
          </div>

          {/* Step Content */}
          {step === 'compose' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MessageForm
                    defaultMessageType={messageType}
                    initialData={{
                      message_type: messageType,
                      subject: messageData.subject,
                      content: messageData.content,
                    }}
                    onSuccess={() => {
                      // Update message data state when form is saved
                      // This allows the wizard to proceed to next step
                      setStep('recipients');
                    }}
                    onCancel={() => {
                      // Reset wizard if user cancels
                      handleStartOver();
                    }}
                  />
                </div>
                <div>
                  <MessageTemplateSelector
                    messageType={messageType}
                    onSelect={(template) => {
                      setMessageData({
                        subject: template.subject,
                        content: template.content,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 'recipients' && (
            <div className="space-y-6">
              <RecipientSelector
                messageType={messageType}
                selectedRecipients={selectedRecipients}
                onRecipientsChange={setSelectedRecipients}
                maxRecipients={1000}
              />
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Mesaj Önizlemesi</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm text-gray-600">Tür</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {messageType === 'sms' ? (
                              <Phone className="h-4 w-4" />
                            ) : (
                              <Mail className="h-4 w-4" />
                            )}
                            <span>{getMessageTypeLabel(messageType)}</span>
                          </div>
                        </div>

                        {messageData.subject && (
                          <div>
                            <Label className="text-sm text-gray-600">Konu</Label>
                            <p className="mt-1 font-medium">{messageData.subject}</p>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm text-gray-600">İçerik</Label>
                          <div className="mt-1 bg-gray-50 p-3 rounded text-sm">
                            {messageData.content}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Gönderim Detayları</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Alıcı Sayısı</span>
                          <span className="font-semibold">{selectedRecipients.length}</span>
                        </div>

                        {messageType === 'sms' && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">SMS Sayısı</span>
                              <span className="font-semibold">{smsMessageCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Tahmini Maliyet</span>
                              <span className="font-semibold text-blue-600">
                                {estimatedCost.toFixed(2)} ₺
                              </span>
                            </div>
                          </>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tahmini Süre</span>
                          <span className="font-semibold">
                            {Math.ceil(selectedRecipients.length / 50)} dakika
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="confirm-sending"
                        checked={confirmed}
                        onCheckedChange={(checked) => setConfirmed(checked === true)}
                      />
                      <Label htmlFor="confirm-sending" className="text-sm">
                        Mesajı göndermek istediğimi onaylıyorum
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipients Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Alıcı Listesi</h3>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                    {showPreview ? (
                      <EyeOff className="h-4 w-4 mr-1" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1" />
                    )}
                    {showPreview ? 'Gizle' : 'Göster'}
                  </Button>
                </div>

                {showPreview && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {selectedRecipients.map((recipient, index) => (
                            <Badge key={index} variant="secondary" className="justify-start">
                              {messageType === 'sms' ? formatPhoneNumber(recipient) : recipient}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  <Progress value={sendingProgress} className="h-3" />
                </div>
                <p className="text-lg font-semibold">{sendingProgress}% tamamlandı</p>
                <p className="text-sm text-gray-600">
                  {sendingResults.success + sendingResults.failed} / {selectedRecipients.length}{' '}
                  gönderildi
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Başarılı</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {sendingResults.success}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold">Başarısız</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-2">{sendingResults.failed}</p>
                  </CardContent>
                </Card>
              </div>

              {sendingResults.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Başarısız Gönderimler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {sendingResults.errors.map((error, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>
                            {messageType === 'sms'
                              ? formatPhoneNumber(error.recipient)
                              : error.recipient}
                          </span>
                          <span className="text-red-600">{error.error}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isSending && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleRetryFailed} disabled={sendingResults.failed === 0}>
                    <Send className="h-4 w-4 mr-1" />
                    Başarısız Olanları Tekrar Gönder
                  </Button>
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-1" />
                    Rapor İndir
                  </Button>
                  <Button variant="outline" onClick={handleStartOver}>
                    <FileText className="h-4 w-4 mr-1" />
                    Yeni Mesaj
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {step !== 'sending' && (
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevStep} disabled={step === 'compose'}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Geri
              </Button>

              <Button
                onClick={handleNextStep}
                disabled={
                  (step === 'compose' && !messageData.content.trim()) ||
                  (step === 'recipients' && selectedRecipients.length === 0) ||
                  (step === 'preview' && !confirmed) ||
                  isSending
                }
              >
                {step === 'preview' ? (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Gönder
                  </>
                ) : (
                  <>
                    İleri
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Bulk Message History Component
function BulkMessageHistory({ messages }: { messages: MessageDocument[] }) {
  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz toplu mesaj gönderilmedi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <Card key={message._id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{message.subject || 'Konusuz Mesaj'}</h3>
                      <Badge variant="outline">{getMessageTypeLabel(message.message_type)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{message.recipients.length} alıcı</span>
                      <span>{new Date(message._creationTime).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
