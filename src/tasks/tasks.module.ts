import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskSchema } from './schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    // Configure Multer for file uploads
    MulterModule.register({
      dest: './uploads', // Destination directory for uploaded files
    }),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
