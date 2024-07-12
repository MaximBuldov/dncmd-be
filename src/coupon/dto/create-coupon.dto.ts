import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
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
  @IsArray()
  exc_cat: number[] = [];

  @IsOptional()
  @IsArray()
  used_by: number[] = [];

  @IsOptional()
  @IsArray()
  allowed_users: number[] = [];
}
