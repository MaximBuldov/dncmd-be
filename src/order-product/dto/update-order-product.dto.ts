import { ProductStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString
} from 'class-validator';

export class UpdateOrderProductDto {
  @IsOptional()
  @IsString()
  @IsEnum(ProductStatus)
  productStatus?: ProductStatus;

  @IsOptional()
  @IsArray()
  ids?: number[];

  @IsOptional()
  @IsBoolean()
  isDeadline?: boolean;
}
