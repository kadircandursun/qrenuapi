import { Injectable, BadRequestException } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

export interface SendEmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly mailerSend: MailerSend;
  private readonly fromEmail = 'no-reply@test-y7zpl98qjk545vx6.mlsender.net';
  private readonly fromName = 'QRenu';

  constructor() {
    const apiKey = process.env.SMTP_TOKEN;
    if (!apiKey) {
      throw new Error('SMTP_TOKEN environment variable is required');
    }
    this.mailerSend = new MailerSend({
      apiKey: apiKey,
    });
  }

  /**
   * Internal email gönderim servisi
   * @param emailData Email gönderim bilgileri
   * @returns Email gönderim sonucu
   */
  async sendEmail(emailData: SendEmailData): Promise<void> {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      
      const recipients = [
        new Recipient(emailData.to, emailData.to)
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(emailData.subject)
        .setHtml(emailData.html || emailData.text)
        .setText(emailData.text);

      await this.mailerSend.email.send(emailParams);
    } catch (error) {
      const errorMessage = error.message || error.toString() || 'Bilinmeyen hata';
      throw new BadRequestException(`Email gönderim hatası: ${errorMessage}`);
    }
  }
}
