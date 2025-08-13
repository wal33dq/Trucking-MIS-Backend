// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Role } from './roles.enum';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const hash = await bcrypt.hash(dto.password, 10);
    const createdUser = new this.userModel({ ...dto, password: hash });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByRole(role: Role): Promise<UserDocument[]> {
    return this.userModel.find({ role }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async countAll(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  // Method to update a user
  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    // If password is being updated, hash it
    if (dto.password) {
        dto.password = await bcrypt.hash(dto.password, 10);
    }

    const existingUser = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();

    if (!existingUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return existingUser;
  }

  // Method to remove a user
  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return { deleted: true };
  }
}
