import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';
import { MailService } from './mail.service';
import { SendPasswordResetDto } from '../dto/send-password-reset.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { PasswordResetResponseDto } from '../dto/password-reset-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly mailService: MailService,
  ) {}

  /**
   * Şifre sıfırlama maili gönder
   * @param sendPasswordResetDto Email bilgileri
   * @returns Şifre sıfırlama maili gönderim sonucu
   */
  async sendPasswordResetEmail(sendPasswordResetDto: SendPasswordResetDto): Promise<PasswordResetResponseDto> {
    const { email } = sendPasswordResetDto;

    // Kullanıcıyı bul
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new NotFoundException('Bu email adresi ile kayıtlı kullanıcı bulunamadı');
    }

    // Kullanıcı aktif mi?
    if (!user.isUserActive()) {
      throw new BadRequestException('Hesabınız aktif değil');
    }

    // 10 dakika cooldown kontrolü
    if (!user.canSendPasswordResetEmail()) {
      const nextResetAt = new Date(user.lastPasswordResetEmailSentAt!.getTime() + 10 * 60 * 1000);
      throw new BadRequestException(`Şifre sıfırlama maili çok sık gönderildi. ${nextResetAt.toISOString()} tarihinde tekrar deneyin.`);
    }

    // Yeni şifre sıfırlama token'ı oluştur
    const resetToken = this.generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    // Kullanıcıyı güncelle
    user.passwordResetToken = resetToken;
    user.passwordResetTokenExpiresAt = expiresAt;
    user.lastPasswordResetEmailSentAt = new Date();
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    // Şifre sıfırlama maili gönder
    await this.sendPasswordResetEmailToUser(user, resetToken);

    return {
      status: 'success',
      message: 'Şifre sıfırlama maili gönderildi',
      nextResetAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  }

  /**
   * Şifre sıfırlama token'ını doğrula ve şifreyi güncelle
   * @param resetPasswordDto Şifre sıfırlama bilgileri
   * @returns Şifre sıfırlama sonucu
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<PasswordResetResponseDto> {
    const { token, newPassword } = resetPasswordDto;

    // Token ile kullanıcıyı bul
    const user = await this.userRepository.findOne({ passwordResetToken: token });
    if (!user) {
      throw new BadRequestException('Geçersiz şifre sıfırlama tokenı');
    }

    // Token süresi dolmuş mu?
    if (user.passwordResetTokenExpiresAt && user.passwordResetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Şifre sıfırlama tokenının süresi dolmuş');
    }

    // Kullanıcı aktif mi?
    if (!user.isUserActive()) {
      throw new BadRequestException('Hesabınız aktif değil');
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Şifreyi güncelle ve token'ları temizle
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    return {
      status: 'success',
      message: 'Şifre başarıyla sıfırlandı',
    };
  }

  /**
   * Şifre sıfırlama token'ı oluştur
   * @returns Random şifre sıfırlama token'ı
   */
  private generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Kullanıcıya şifre sıfırlama maili gönder
   * @param user Kullanıcı bilgileri
   * @param token Şifre sıfırlama token'ı
   */
  private async sendPasswordResetEmailToUser(user: User, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const emailData = {
      to: user.email,
      subject: 'QRenu - Şifre Sıfırlama',
      text: `Merhaba ${user.getFullName()},\n\nŞifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n${resetUrl}\n\nBu link 24 saat geçerlidir.\n\nEğer bu işlemi siz yapmadıysanız, bu maili görmezden gelebilirsiniz.\n\nQRenu Ekibi`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Şifre Sıfırlama</h2>
          <p>Merhaba <strong>${user.getFullName()}</strong>,</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Şifremi Sıfırla</a>
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
