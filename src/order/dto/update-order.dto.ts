import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from 'src/generated/prisma/client';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  stripe_id?: string;

  @IsOptional()
  @IsString()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
