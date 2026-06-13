import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload & { refreshToken: string }> {
    const refreshToken = req.body?.refreshToken as string;
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user?.refreshTokenHash) throw new UnauthorizedException('Refresh token invalid');

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Refresh token mismatch');

    return { sub: user.id, email: user.email, phone: user.phone, role: user.role, refreshToken };
  }
}
