import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString
} from 'class-validator';
import { ProductStatus } from 'src/generated/prisma/client';

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
