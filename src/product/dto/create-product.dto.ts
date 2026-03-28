import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
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

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categories?: number[] = [];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  wait_list?: number[] = [];

  @IsInt()
  @IsOptional()
  stock_quantity?: number = 13;
}
