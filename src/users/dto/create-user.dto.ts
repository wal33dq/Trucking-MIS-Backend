// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../roles.enum';

export class CreateUserDto {
  @IsNotEmpty() name: string;
  @IsEmail()    email: string;
  @IsNotEmpty() password: string;
  @IsEnum(Role) role: Role;
}