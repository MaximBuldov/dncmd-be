import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UserQueryDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? +value : undefined))
  page: number = 1;

  @IsInt()
  @Transform(({ value }) => (value ? +value : 10))
  @Min(1)
  per_page: number = 10;

  @IsOptional()
  @Transform(({ value }) => (value ? value : ''))
  @IsString()
  search?: string = '';

  @IsOptional()
  all?: boolean;
}
