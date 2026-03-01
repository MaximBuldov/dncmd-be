import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsArray()
  products?: number[];
}
