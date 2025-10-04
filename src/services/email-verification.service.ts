import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { MailService } from './mail.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerificationResponseDto } from '../dto/verification-response.dto';
import { EmailVerificationStatusDto } from '../dto/email-verification-status.dto';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly mailService: MailService,
  ) {}

  /**
   * User ID ile email doğrulama maili gönder
   * @param userId Kullanıcı ID
   * @returns Doğrulama maili gönderim sonucu
   */
  async sendVerificationEmailByUserId(userId: number): Promise<VerificationResponseDto> {
    // Kullanıcıyı bul
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Email zaten doğrulanmış mı?
    if (user.isEmailVerified) {
      throw new BadRequestException('Email zaten doğrulanmış');
    }

    // 10 dakika cooldown kontrolü
    if (!user.canSendVerificationEmail()) {
      const nextVerificationAt = new Date(user.lastVerificationEmailSentAt!.getTime() + 10 * 60 * 1000);
      throw new BadRequestException(`Doğrulama maili çok sık gönderildi. ${nextVerificationAt.toISOString()} tarihinde tekrar deneyin.`);
    }

    // Yeni doğrulama token'ı oluştur
    const verificationToken = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    // Kullanıcıyı güncelle
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiresAt = expiresAt;
    user.lastVerificationEmailSentAt = new Date();
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    // Doğrulama maili gönder
    await this.sendVerificationEmailToUser(user, verificationToken);

    return {
      status: 'success',
      message: 'Email doğrulama maili gönderildi',
      nextVerificationAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  }

  /**
   * Email doğrulama token'ını doğrula
   * @param verifyEmailDto Doğrulama token bilgileri
   * @returns Doğrulama sonucu
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<VerificationResponseDto> {
    const { token } = verifyEmailDto;

    // Token ile kullanıcıyı bul
    const user = await this.userRepository.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new BadRequestException('Geçersiz doğrulama tokenı');
    }

    // Token süresi dolmuş mu?
    if (user.emailVerificationTokenExpiresAt && user.emailVerificationTokenExpiresAt < new Date()) {
      throw new BadRequestException('Doğrulama tokenının süresi dolmuş');
    }

    // Email zaten doğrulanmış mı?
    if (user.isEmailVerified) {
      throw new BadRequestException('Email zaten doğrulanmış');
    }

    // Email'i doğrula
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    return {
      status: 'success',
      message: 'Email başarıyla doğrulandı',
    };
  }

  /**
   * Kullanıcının email doğrulama durumunu getir
   * @param userId Kullanıcı ID
   * @returns Email doğrulama durumu bilgileri
   */
  async getEmailVerificationStatus(userId: number): Promise<EmailVerificationStatusDto> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const nextVerificationAt = user.lastVerificationEmailSentAt 
      ? new Date(user.lastVerificationEmailSentAt.getTime() + 10 * 60 * 1000)
      : undefined;

    return {
      isEmailVerified: user.isEmailVerified,
      email: user.email,
      lastVerificationEmailSentAt: user.lastVerificationEmailSentAt,
      nextVerificationAt,
      tokenExpiresAt: user.emailVerificationTokenExpiresAt,
    };
  }

  /**
   * Doğrulama token'ı oluştur
   * @returns Random doğrulama token'ı
   */
  private generateVerificationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Kullanıcıya doğrulama maili gönder
   * @param user Kullanıcı bilgileri
   * @param token Doğrulama token'ı
   */
  private async sendVerificationEmailToUser(user: User, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    const emailData = {
      to: user.email,
      subject: 'QRenu - Email Doğrulama',
      text: `Merhaba ${user.getFullName()},\n\nEmail adresinizi doğrulamak için aşağıdaki linke tıklayın:\n${verificationUrl}\n\nBu link 24 saat geçerlidir.\n\nQRenu Ekibi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Doğrulama</h2>
          <p>Merhaba <strong>${user.getFullName()}</strong>,</p>
          <p>QRenu hesabınızı oluşturduğunuz için teşekkürler! Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Email Adresimi Doğrula</a>
          </div>
          <p style="color: #666; font-size: 14px;">Bu link 24 saat geçerlidir.</p>
          <p style="color: #666; font-size: 14px;">Eğer bu işlemi siz yapmadıysanız, bu maili görmezden gelebilirsiniz.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">QRenu Ekibi</p>
        </div>
      `,
    };

    await this.mailService.sendEmail(emailData);
  }
}
