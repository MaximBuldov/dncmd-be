import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateCostDto {
  @IsDate()
  @Transform(({ value }) => dayjs(value).toDate())
  date: Date;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  sum: number;
}
