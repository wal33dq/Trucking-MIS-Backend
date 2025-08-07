// src/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

import { Role } from '../roles.enum';



export type UserDocument = User & Document;



@Schema({ timestamps: true })

export class User {

  @Prop({ required: true })

  name: string;



  @Prop({ required: true, unique: true })

  email: string;



  @Prop({ required: true })

  password: string;



  @Prop({ type: String, enum: Role, required: true })

  role: Role;

}



export const UserSchema = SchemaFactory.createForClass(User);