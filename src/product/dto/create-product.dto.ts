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
  wait_list?: number[] = [];

  @IsInt()
  @IsOptional()
  stock_quantity?: number = 13;
}
