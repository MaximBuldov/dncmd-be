import { StockStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  date_time: Date;

  @IsBoolean()
  @IsOptional()
  is_canceled?: boolean;

  @IsEnum(StockStatus)
  stock_status: StockStatus = StockStatus.instock;

  @IsNumber()
  category_id: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cancel?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paid?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pending?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wait_list?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  confirm?: string[] = [];

  @IsInt()
  @IsOptional()
  stock_quantity?: number = 13;
}
