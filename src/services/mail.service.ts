import { Injectable, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendEmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly fromName = 'QRenu';

  constructor() {
    this.fromEmail = process.env.ZOHO_FROM_EMAIL || 'support@tuluk.dev';
    
    this.transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.eu',
      port: 465,
      secure: true, // SSL kullan
      auth: {
        user: process.env.ZOHO_SMTP_USER || 'support@tuluk.dev',
        pass: process.env.ZOHO_SMTP_PASSWORD || '1ZrRerGNGAW4',
      },
    });
  }

  /**
   * Internal email gönderim servisi
   * @param emailData Email gönderim bilgileri
   * @returns Email gönderim sonucu
   */
  async sendEmail(emailData: SendEmailData): Promise<void> {
    try {
      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html || emailData.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email gönderildi:', result.messageId);
    } catch (error) {
      // Zoho Mail hatalarını detaylı logla
      console.error('Zoho Mail Error:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Bilinmeyen hata';
      
      if (error.response) {
        // SMTP response hatası
        errorMessage = error.response;
      } else if (error.code) {
        // Nodemailer error code
        errorMessage = `${error.code}: ${error.message}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      throw new BadRequestException(`Email gönderim hatası: ${errorMessage}`);
    }
  }
}
