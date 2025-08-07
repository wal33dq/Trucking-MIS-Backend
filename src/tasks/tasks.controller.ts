// src/tasks/tasks.controller.ts
import { Controller, Post, Get, Param, Req, Body, UseGuards, UseInterceptors, UploadedFiles, InternalServerErrorException, UploadedFile } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/roles.enum';
import { diskStorage, memoryStorage } from 'multer'; // Import memoryStorage
import { extname } from 'path';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 1) Project Divider: bulk CSV/XLSX upload
  @Post('upload/:saleAgentId')
  @Roles(Role.ProjectDivider)
  // FIX: Configure FileInterceptor to use memoryStorage.
  // This ensures that the uploaded file is available as a buffer in memory (file.buffer).
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
  }))
  async uploadAssignments(
    @Param('saleAgentId') saleAgentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new InternalServerErrorException('File is missing in the request.');
    }
    
    // The saleAgentId might come with a leading ':' from the frontend, this removes it.
    const sanitizedId = saleAgentId.startsWith(':') ? saleAgentId.substring(1) : saleAgentId;
    
    // Pass the file buffer to the service for processing.
    return this.tasksService.createMany(sanitizedId, file.buffer);
  }

  // 2) Sale Agent: list assignments
  @Get('my-assignments')
  @Roles(Role.SaleAgent)
  async listMyAssignments(@Req() req) {
    const agentId = req.user.sub || req.user._id || req.user.userId;

    if (!agentId) {
      throw new InternalServerErrorException('Could not determine agent ID from JWT token.');
    }
    
    return this.tasksService.findByAgent(agentId.toString());
  }

  // 3) Sale Agent: fetch one assignment
  @Get(':id')
  @Roles(Role.SaleAgent)
  async getAssignment(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // 4) Sale Agent: submit completed assignment with documents
  @Post('submit/:id')
  @Roles(Role.SaleAgent)
  @UseInterceptors(FilesInterceptor('documents', 5, { // 'documents' is the field name from the frontend
      storage: diskStorage({
          destination: './uploads', // Make sure this directory exists
          filename: (req, file, cb) => {
              const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
              cb(null, `${randomName}${extname(file.originalname)}`);
          }
      }),
      fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/)) {
              return cb(new Error('Only image and document files are allowed!'), false);
          }
          cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
  }))
  async submitAssignment(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() payload: {
      driverName: string;
      workingDate: string;
      offerRate: number;
      weight: number;
      callTime: string;
      comments: string;
      dispatcherId: string;
    },
  ) {
    const payloadWithDate = {
        ...payload,
        workingDate: new Date(payload.workingDate),
    };
    return this.tasksService.submitTask(id, payloadWithDate, files);
  }

  // 5) Dispatcher: list submitted tasks
  @Get('dispatch/pending')
  @Roles(Role.Dispatcher)
  async listPending() {
    return this.tasksService.findSubmitted();
  }

  // 6) Dispatcher: fetch one submitted task
  @Get('dispatch/:id')
  @Roles(Role.Dispatcher)
  async getSubmitted(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // 7) Dispatcher: generate invoice / finalize
  @Post('dispatch/:id/invoice')
  @Roles(Role.Dispatcher)
  async invoiceTask(
    @Param('id') id: string,
    @Body() invoice: {
      poNumber: string;
      loadDetail: string;
      pickupDate: string;
      deliveryDate: string;
      rate: number;
      brokerDetail: string;
      loadStatus: string;
      invoiceAmount: number;
      invoiceDate: string;
    },
  ) {
    const invoicePayload = {
        ...invoice,
        pickupDate: new Date(invoice.pickupDate),
        deliveryDate: new Date(invoice.deliveryDate),
        invoiceDate: new Date(invoice.invoiceDate),
    };
    return this.tasksService.finalizeTask(id, invoicePayload);
  }
}
