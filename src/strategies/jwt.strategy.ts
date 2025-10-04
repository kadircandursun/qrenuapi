import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Kullanıcının hala aktif olup olmadığını kontrol et
    const user = await this.userRepository.findOne({ 
      id: payload.sub,
      isActive: true 
    });

    if (!user) {
      throw new UnauthorizedException('Kullanıcı bulunamadı veya hesap deaktif');
    }

    return { userId: payload.sub, email: payload.email };
  }
}
