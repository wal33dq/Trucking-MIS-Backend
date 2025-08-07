// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import {

  ExtractJwt,

  Strategy,

  StrategyOptionsWithoutRequest,

} from 'passport-jwt';


@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor() {

    const secret = process.env.JWT_SECRET;

    if (!secret) {

      throw new Error('Environment variable JWT_SECRET must be defined');

    }
    const options: StrategyOptionsWithoutRequest = {

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey: secret,  // now guaranteed string :contentReference[oaicite:3]{index=3}

    };
    super(options);
  }
  async validate(payload: any) {
    return { userId: payload.sub, role: payload.role };
  }
}
