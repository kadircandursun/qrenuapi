import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../entities/user.entity';
import { PasswordResetController } from '../controllers/password-reset.controller';
import { PasswordResetService } from '../services/password-reset.service';
import { MailModule } from './mail.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    MailModule,
  ],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
