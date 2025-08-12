import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  mcNumber: string;

  @Prop({ required: true })
  companyName: string;

  @Prop()
  address?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  workingDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  saleAgent: Types.ObjectId;

  @Prop()
  driverName?: string;

  @Prop()
  truckType?: string;

  // Replaced documentUrl with an array to store multiple document paths
  @Prop({ type: [String] })
  documentUrls?: string[];

  @Prop()
  offerRate?: number;

  @Prop()
  weight?: number;

  @Prop()
  callTime?: string;

  @Prop()
  comments?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  dispatcher?: Types.ObjectId;

  @Prop()
  status?: string;

  // FIX: Added missing properties for the invoice
  @Prop()
  poNumber?: string;

  @Prop()
  loadDetail?: string;

  @Prop()
  pickupDate?: Date;

  @Prop()
  deliveryDate?: Date;

  @Prop()
  rate?: number;

  @Prop()
  brokerDetail?: string;

  @Prop()
  loadStatus?: string;

  @Prop()
  invoiceAmount?: number;

  @Prop()
  invoiceDate?: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
