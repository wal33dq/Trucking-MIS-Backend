// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // --- FIX: Add this ServeStaticModule configuration ---
    ServeStaticModule.forRoot({
      // This is the URL prefix for your static files.
      // A request to /api/documents/file.jpg will be handled by this module.
      serveRoot: '/api/documents',

      // This is the physical directory on your server where the files are stored.
      // 'join(__dirname, '..', 'uploads')' assumes you have an 'uploads' folder
      // at the root of your project.
      // IMPORTANT: Change 'uploads' to the actual name of your folder.
      rootPath: join(__dirname, '..', 'uploads'),
    }),

    // 1. Make ConfigModule global and load the .env file. This should be first.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // 2. Configure Mongoose to use the ConfigService for the database URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    AuthModule,
    UsersModule,
    TasksModule,
  ],
})
export class AppModule {}
