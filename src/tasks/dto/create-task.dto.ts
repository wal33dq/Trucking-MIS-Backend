import { IsNotEmpty, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty() mcNumber: string;
  @IsNotEmpty() companyName: string;
  @IsNotEmpty() address: string;
  @IsNotEmpty() email: string;
  @IsNotEmpty() phone: string;
  @IsNotEmpty() saleAgent: string;
}