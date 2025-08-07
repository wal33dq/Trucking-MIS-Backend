import { IsArray } from 'class-validator';
export class BulkUploadDto {
  @IsArray() data: any[];
}