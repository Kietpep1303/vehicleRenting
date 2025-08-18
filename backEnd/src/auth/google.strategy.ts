import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'https://vehicle.kietpep1303.com/api/auth/google/redirect',
            scope: ['email', 'profile']
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const { name, emails, photos } = profile;
        const user = {
            googleId: profile.id,
            email: profile.emails[0].value,
            nickname: profile.name?.givenName || profile.displayName,
            photo: profile.photos?.[0]?.value,
            accessToken,
        };

        done(null, user);
    }
}