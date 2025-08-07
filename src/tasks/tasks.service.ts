// src/tasks/tasks.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import * as csv from 'fast-csv';
import { Readable } from 'stream';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  // Create bulk assignments from a CSV buffer
  async createMany(saleAgentId: string, buffer: Buffer): Promise<{ inserted: number }> {
    // Validate the provided saleAgentId to ensure it's a valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(saleAgentId)) {
      throw new BadRequestException(`Invalid saleAgentId format: "${saleAgentId}" is not a valid ObjectId.`);
    }
    
    // FIX: Add a check to ensure the buffer exists and is not empty before processing.
    if (!buffer || buffer.length === 0) {
        throw new BadRequestException('The uploaded CSV file is empty or corrupted.');
    }

    const agentObjectId = new Types.ObjectId(saleAgentId);
    const rows: Partial<Task>[] = [];

    await new Promise<void>((resolve, reject) => {
      // Create a readable stream from the buffer
      const stream = Readable.from(buffer);

      stream
        .pipe(csv.parse({ headers: true, trim: true }))
        .on('error', (error) => reject(error))
        .on('data', (row: any) => {
          // Map CSV row data to the Task schema.
          // This handles different possible header names like 'MC Number' or 'mcNumber'.
          const taskData: Partial<Task> = {
            mcNumber: row['MC Number'] || row['mcNumber'],
            companyName: row['Company Name'] || row['companyName'],
            address: row['Address'] || row['address'],
            email: row['Email'] || row['email'],
            phone: row['Phone'] || row['phone'],
            saleAgent: agentObjectId,
            status: 'assigned', // Set initial status
          };
          rows.push(taskData);
        })
        .on('end', (rowCount: number) => {
          console.log(`Parsed ${rowCount} rows from CSV`);
          resolve();
        });
    });

    if (rows.length === 0) {
        throw new BadRequestException('CSV file is empty or does not contain valid data rows.');
    }

    // Insert all the parsed tasks into the database in a single operation.
    const created = await this.taskModel.insertMany(rows);
    return { inserted: created.length };
  }

  // Find all tasks assigned to a specific agent
  async findByAgent(agentId: string): Promise<Task[]> {
    if (!Types.ObjectId.isValid(agentId)) {
        throw new BadRequestException(`Invalid agentId format: "${agentId}"`);
    }
    return this.taskModel.find({ saleAgent: new Types.ObjectId(agentId) }).exec();
  }

  // Find a single assignment by its ID
  async findOne(id: string): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: "${id}"`);
    }
    const t = await this.taskModel.findById(id).exec();
    if (!t) {
      throw new NotFoundException('Assignment not found');
    }
    return t;
  }

  // Sale Agent submits a completed task with documents
  async submitTask(
    id: string,
    payload: Partial<Task> & { dispatcherId: string },
    files: Array<Express.Multer.File>,
  ): Promise<Task> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(payload.dispatcherId)) {
        throw new BadRequestException('Invalid ID format for task or dispatcher');
    }

    // In a real-world app, you would upload to a cloud service (e.g., S3, Azure Blob Storage)
    // and store the URLs. Here, we are storing the local file path.
    const documentUrls = files.map(file => file.path);

    const updated = await this.taskModel.findByIdAndUpdate(
      id,
      {
        ...payload,
        documentUrls, // Add the array of document paths to the task
        dispatcher: new Types.ObjectId(payload.dispatcherId),
        status: 'submitted', // Update the task status
      },
      { new: true }, // Return the updated document
    );
    if (!updated) {
      throw new NotFoundException('Task not found for submission');
    }
    return updated;
  }

  // Dispatcher: list all submitted tasks
  async findSubmitted(): Promise<Task[]> {
    return this.taskModel.find({ status: 'submitted' }).exec();
  }

  // Dispatcher: finalize a task with invoice details
  async finalizeTask(
    id: string,
    invoice: Partial<Task>,
  ): Promise<Task> {
    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid ID format');
    }
    const final = await this.taskModel.findByIdAndUpdate(
      id,
      {
        ...invoice,
        status: 'invoiced', // Update status to 'invoiced'
      },
      { new: true },
    );
    if (!final) {
      throw new NotFoundException('Task not found for finalization');
    }
    return final;
  }
}
