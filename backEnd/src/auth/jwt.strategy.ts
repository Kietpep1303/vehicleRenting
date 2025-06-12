import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    // Validate the JWT token.
    async validate(payload: { userId: number, email: string, accountLevel: number, deviceId: string }) {
        return { 
            userId: payload.userId, 
            email: payload.email,
            accountLevel: payload.accountLevel,
            deviceId: payload.deviceId,
        };
    }
}