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
import { DiscountType } from 'src/generated/prisma/client';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsEnum(DiscountType)
  discount_type: DiscountType = DiscountType.fixed_cart;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Transform(({ value }) => dayjs(value).toDate())
  date_expires: Date;

  @IsOptional()
  @IsArray()
  allowed_cat?: number[];

  @IsOptional()
  @IsArray()
  used_by?: number[];

  @IsOptional()
  @IsArray()
  allowed_users: number[];
}
