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
      // MailerSend API hatalarını detaylı logla
      console.error('MailerSend API Error:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Bilinmeyen hata';
      
      // MailerSend API hata yapısını kontrol et
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // MailerSend validation hataları
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = errors.map(err => err.message || err).join(', ');
        } else if (typeof errors === 'object') {
          errorMessage = JSON.stringify(errors);
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.toString && error.toString() !== '[object Object]') {
        errorMessage = error.toString();
      }
      
      throw new BadRequestException(`Email gönderim hatası: ${errorMessage}`);
    }
  }
}
