import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(DiscountType)
  discount_type: DiscountType = DiscountType.fixed_cart;

  @IsString()
  @IsOptional()
  description: string;

  @IsDate()
  @Transform(({ value }) => dayjs(value).toDate())
  date_expires: Date;

  @IsOptional()
  @IsNumber()
  usage_count: number = 0;

  @IsBoolean()
  individual_use: boolean = true;

  @IsNumber()
  usage_limit: number;

  @IsNumber()
  usage_limit_per_user: number;

  @IsOptional()
  @IsArray()
  product_categories: number[] = [];

  @IsOptional()
  @IsArray()
  exc_cat: number[] = [];

  @IsOptional()
  @IsArray()
  used_by: number[] = [];

  @IsOptional()
  @IsArray()
  allowed_users: number[] = [];
}
