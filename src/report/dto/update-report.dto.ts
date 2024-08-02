import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateCostDto } from './create-report.dto';

export class UpdateCostDto extends PartialType(CreateCostDto) {
  @IsNumber()
  @IsOptional()
  id: number;

  @IsOptional()
  created_at: Date;

  @IsOptional()
  updated_at: Date;
}
