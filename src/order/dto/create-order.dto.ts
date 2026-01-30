import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  Coupon,
  OrderProduct,
  OrderStatus,
  PaymentMethod
} from 'src/generated/prisma/client';

export class CreateOrderDto {
  @IsArray()
  line_items: OrderProduct[];

  @IsOptional()
  @IsArray()
  coupons: Coupon[] = [];

  @IsOptional()
  @IsString()
  stripe_id: string;

  @IsString()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  @IsEnum(OrderStatus)
  status: OrderStatus = OrderStatus.processing;

  @IsOptional()
  @IsString()
  note: string;
}
