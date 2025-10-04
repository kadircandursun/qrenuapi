import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/user.entity';
import { EmailVerificationController } from '../controllers/email-verification.controller';
import { EmailVerificationService } from '../services/email-verification.service';
import { MailModule } from './mail.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    MailModule,
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
