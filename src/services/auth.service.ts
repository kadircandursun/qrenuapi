import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { LogoutResponseDto } from '../dto/logout-response.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import { EmailVerificationService } from './email-verification.service';
import { PackageService } from './package.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(Package)
    private readonly packageRepository: EntityRepository<Package>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly packageService: PackageService,
  ) {}

  /**
   * Kullanıcı kaydı
   * @param registerDto Kayıt bilgileri
   * @returns JWT token ve kullanıcı bilgileri
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Email kontrolü
    const existingUser = await this.userRepository.findOne({ email: registerDto.email });
    if (existingUser) {
      throw new ConflictException('Bu email adresi zaten kullanılıyor');
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Varsayılan paketi al
    const defaultPackage = await this.packageService.getDefaultPackage();

    // Yeni kullanıcı oluştur
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: 'user',
      package: defaultPackage,
      packageExpiresAt: new Date(Date.now() + defaultPackage.durationInDays * 24 * 60 * 60 * 1000),
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(user);

    // Email doğrulama maili gönder
    try {
      await this.emailVerificationService.sendVerificationEmailByUserId(user.id);
    } catch (error) {
      // Email gönderim hatası kritik değil, kayıt devam eder
      console.warn('Email doğrulama maili gönderilemedi:', error.message);
    }

    // JWT token oluştur
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.mapToProfileDto(user),
    };
  }

  /**
   * Kullanıcı girişi
   * @param loginDto Giriş bilgileri
   * @returns JWT token ve kullanıcı bilgileri
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Kullanıcıyı bul
    const user = await this.userRepository.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email veya şifre hatalı');
    }

    // Aktif kullanıcı kontrolü
    if (!user.isActive) {
      throw new UnauthorizedException('Hesabınız deaktif durumda');
    }

    // JWT token oluştur
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.mapToProfileDto(user),
    };
  }

  /**
   * Kullanıcı profil bilgilerini getir
   * @param userId Kullanıcı ID
   * @returns Kullanıcı profil bilgileri
   */
  async getProfile(userId: number): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    return this.mapToProfileDto(user);
  }

  /**
   * Email doğrulama kontrolü
   * @param userId Kullanıcı ID
   * @throws ForbiddenException eğer email doğrulanmamışsa
   */
  async checkEmailVerification(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email adresinizi doğrulamanız gerekiyor. Lütfen email kutunuzu kontrol edin.');
    }
  }

  /**
   * Kullanıcı profil bilgilerini güncelle
   * @param userId Kullanıcı ID
   * @param updateProfileDto Güncellenecek profil bilgileri
   * @returns Güncellenmiş kullanıcı profil bilgileri
   */
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<UserProfileDto> {
    const user = await this.userRepository.findOne({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Sadece gönderilen alanları güncelle (email hariç)
    if (updateProfileDto.firstName !== undefined) {
      user.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      user.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.phoneNumber !== undefined) {
      user.phoneNumber = updateProfileDto.phoneNumber;
    }
    if (updateProfileDto.companyName !== undefined) {
      user.companyName = updateProfileDto.companyName;
    }

    user.updatedAt = new Date();

    await this.em.persistAndFlush(user);

    return this.mapToProfileDto(user);
  }

  /**
   * Kullanıcı hesabını tamamen sil
   * @param userId Kullanıcı ID
   * @param deleteAccountDto Şifre doğrulama bilgileri
   * @returns Başarı mesajı
   */
  async deleteAccount(userId: number, deleteAccountDto: DeleteAccountDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ id: userId });
    
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // Şifre doğrulama
    const isPasswordValid = await bcrypt.compare(deleteAccountDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Şifre hatalı');
    }

    // Önce kullanıcıyı deaktif et (session'ları geçersiz hale getir)
    user.isActive = false;
    await this.em.persistAndFlush(user);

    // Sonra kullanıcıyı tamamen sil (cascade ile tüm veriler silinir)
    await this.em.removeAndFlush(user);

    return { message: 'Hesabınız başarıyla silindi' };
  }

  /**
   * Kullanıcı çıkışı
   * @param userId Kullanıcı ID
   * @returns Logout bilgileri
   */
  async logout(userId: number): Promise<LogoutResponseDto> {
    const user = await this.userRepository.findOne({ id: userId });
    
    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı');
    }

    // JWT token'lar stateless olduğu için server-side logout işlemi yok
    // Client-side token'ı silmeli
    const logoutTime = new Date().toISOString();

    return {
      message: 'Başarıyla çıkış yapıldı',
      logoutTime,
    };
  }

  /**
   * Entity'yi Profile DTO'ya dönüştür
   * @param user User entity
   * @returns UserProfileDto
   */
  private mapToProfileDto(user: User): UserProfileDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      companyName: user.companyName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
