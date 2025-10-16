import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/user.entity';
import { Package } from '../entities/package.entity';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { PackageService } from '../services/package.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { EmailVerificationService } from '../services/email-verification.service';
import { MailModule } from './mail.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User, Package]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as string },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PackageService, JwtStrategy, EmailVerificationService],
  exports: [AuthService],
})
export class AuthModule {}
