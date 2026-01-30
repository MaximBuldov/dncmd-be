import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { OrderStatus } from 'src/generated/prisma/client';

export class OrderQueryDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? +value : undefined))
  page: number = 1;

  @IsInt()
  @Transform(({ value }) => (value ? +value : 10))
  @Min(1)
  per_page: number = 10;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => (value ? +value : undefined))
  customer?: number;

  @IsOptional()
  @IsDateString()
  before?: Date;

  @IsOptional()
  @IsDateString()
  after?: Date;

  @IsOptional()
  @IsArray()
  status?: OrderStatus[];

  @IsOptional()
  all?: boolean;
}
