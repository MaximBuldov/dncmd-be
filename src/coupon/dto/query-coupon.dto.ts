import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CouponQueryDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? +value : undefined))
  page: number = 1;

  @IsInt()
  @Transform(({ value }) => (value ? +value : 10))
  @Min(1)
  per_page: number = 10;
}
