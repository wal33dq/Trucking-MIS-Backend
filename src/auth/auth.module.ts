// src/auth/auth.module.ts

import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from '../users/users.module';

import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';



@Module({

  imports: [

    UsersModule,

    PassportModule,

    // 3. Configure JwtModule asynchronously to get the secret

    JwtModule.registerAsync({

      imports: [ConfigModule], // Import ConfigModule to use ConfigService

      inject: [ConfigService],  // Inject ConfigService

      useFactory: async (configService: ConfigService) => ({

        secret: configService.get<string>('JWT_SECRET'),

        signOptions: { expiresIn: '1h' }, // Your original expiration time

      }),

    }),

  ],

  providers: [AuthService, JwtStrategy],

  controllers: [AuthController],

  exports: [AuthService],

})

export class AuthModule {}