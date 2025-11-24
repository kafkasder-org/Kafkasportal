/**
 * POST /api/messages/send-bulk
 * Send bulk messages via SMS, Email, or WhatsApp
 * Supports multiple message types and recipient lists
 * Requires authentication and messages module access
 *
 * REQUEST BODY:
 * {
 *   type: 'sms' | 'email' | 'whatsapp',
 *   recipients: string[], // Phone numbers or email addresses
 *   message: string,
 *   subject?: string, // Required for email
 *   template?: string, // Optional template ID
 * }
 *
 * RESPONSE:
 * {
 *   success: boolean,
 *   total: number,
 *   successful: number,
 *   failed: number,
 *   failedRecipients: Array<{recipient: string, error: string}>,
 *   communicationLogId?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireModuleAccess, verifyCsrfToken, buildErrorResponse } from '@/lib/api/auth-utils';
import { dataModificationRateLimit } from '@/lib/rate-limit';
import logger from '@/lib/logger';
import { z } from 'zod';
import { sendSMS } from '@/lib/services/sms';
import { sendEmail } from '@/lib/services/email';
import { sendBulkWhatsAppMessages } from '@/lib/services/whatsapp';

// Validation schema
const bulkMessageSchema = z.object({
  type: z.enum(['sms', 'email', 'whatsapp']),
  recipients: z
    .array(z.string().min(1, 'Alıcı bilgisi boş olamaz'))
    .min(1, 'En az bir alıcı belirtmelisiniz')
    .max(1000, 'Maksimum 1000 alıcıya aynı anda mesaj gönderebilirsiniz'),
  message: z.string().min(1, 'Mesaj boş olamaz'),
  subject: z.string().optional(),
  template: z.string().optional(),
});

/**
 * Send bulk SMS messages
 */
async function sendBulkSMSMessages(
  recipients: string[],
  message: string
): Promise<{
  total: number;
  successful: number;
  failed: number;
  failedRecipients: Array<{ recipient: string; error: string }>;
}> {
  const result = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    failedRecipients: [] as Array<{ recipient: string; error: string }>,
  };

  for (const phone of recipients) {
    try {
      const success = await sendSMS({ to: phone, message });

      if (success) {
        result.successful++;
      } else {
        result.failed++;
        result.failedRecipients.push({
          recipient: phone,
          error: 'SMS gönderilemedi',
        });
      }

      // Rate limiting - 1 second between messages
      if (recipients.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      result.failed++;
      result.failedRecipients.push({
        recipient: phone,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
    }
  }

  return result;
}

/**
 * Send bulk Email messages
 */
async function sendBulkEmailMessages(
  recipients: string[],
  message: string,
  subject?: string
): Promise<{
  total: number;
  successful: number;
  failed: number;
  failedRecipients: Array<{ recipient: string; error: string }>;
}> {
  const result = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    failedRecipients: [] as Array<{ recipient: string; error: string }>,
  };

  const emailSubject = subject || 'Kafkasder - Bilgilendirme';

  for (const email of recipients) {
    try {
      const success = await sendEmail({
        to: email,
        subject: emailSubject,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
      });

      if (success) {
        result.successful++;
      } else {
        result.failed++;
        result.failedRecipients.push({
          recipient: email,
          error: 'Email gönderilemedi',
        });
      }

      // Rate limiting - 500ms between emails
      if (recipients.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      result.failed++;
      result.failedRecipients.push({
        recipient: email,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      });
    }
  }

  return result;
}

async function sendBulkMessageHandler(request: NextRequest) {
  try {
    // Require authentication with messages module access
    const { user } = await requireModuleAccess('messages');

    // CSRF protection
    await verifyCsrfToken(request);

    // Parse and validate request body
    const body = await request.json();
    const validation = bulkMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz istek',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { type, recipients, message, subject } = validation.data;

    // Email requires subject
    if (type === 'email' && !subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email göndermek için konu başlığı gereklidir',
        },
        { status: 400 }
      );
    }

    logger.info('Starting bulk message sending', {
      service: 'messages',
      type,
      userId: user.id,
      recipientCount: recipients.length,
      messageLength: message.length,
    });

    let result: {
      total: number;
      successful: number;
      failed: number;
      failedRecipients: Array<{ recipient: string; error: string }>;
    };

    // Send messages based on type
    switch (type) {
      case 'sms':
        result = await sendBulkSMSMessages(recipients, message);
        break;

      case 'email':
        result = await sendBulkEmailMessages(recipients, message, subject);
        break;

      case 'whatsapp':
        try {
          const whatsappResult = await sendBulkWhatsAppMessages(recipients, message);
          result = {
            total: whatsappResult.total,
            successful: whatsappResult.successful,
            failed: whatsappResult.failed,
            failedRecipients: whatsappResult.failedRecipients.map((phone) => ({
              recipient: phone,
              error: 'WhatsApp mesajı gönderilemedi',
            })),
          };
        } catch (error) {
          // WhatsApp client not initialized
          return NextResponse.json(
            {
              success: false,
              error: 'WhatsApp servisi hazır değil. Lütfen önce WhatsApp QR kodunu okutun.',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 503 }
          );
        }
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Geçersiz mesaj tipi',
          },
          { status: 400 }
        );
    }

    logger.info('Bulk message sending completed', {
      service: 'messages',
      type,
      userId: user.id,
      total: result.total,
      successful: result.successful,
      failed: result.failed,
    });

    // Save to communication_logs using Appwrite
    try {
      const { appwriteCommunicationLogs } = await import('@/lib/appwrite/api');
      
      const logData = {
        type: type as 'email' | 'sms' | 'whatsapp',
        recipient_count: recipients.length,
        message,
        successful: result.successful,
        failed: result.failed,
        sent_at: new Date().toISOString(),
        user_id: user.id,
        status: result.failed === 0 ? 'sent' : result.successful === 0 ? 'failed' : 'partial',
        metadata: {
          subject,
          failedRecipients: result.failedRecipients,
        },
      };

      const logResponse = await appwriteCommunicationLogs.create(logData);
      const typedLogResponse = logResponse as { $id?: string; id?: string };
      const logId = typedLogResponse.$id || typedLogResponse.id || '';

      logger.info('Bulk operation logged successfully', {
        service: 'messages',
        logId,
      });
    } catch (logError) {
      // Log error but don't fail the request
      logger.error('Failed to save communication log', logError, {
        service: 'messages',
      });
    }

    return NextResponse.json({
      success: true,
      message: `${result.successful} mesaj başarıyla gönderildi${result.failed > 0 ? `, ${result.failed} mesaj başarısız` : ''}`,
      data: result,
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Failed to send bulk messages', error, {
      service: 'messages',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Toplu mesaj gönderilemedi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const POST = dataModificationRateLimit(sendBulkMessageHandler);
