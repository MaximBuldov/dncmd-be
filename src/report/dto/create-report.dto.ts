import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber } from 'class-validator';
import * as dayjs from 'dayjs';

export class CreateReportDto {
  @IsDate()
  @Transform(({ value }) => dayjs(value).toDate())
  date: Date;

  @IsNumber()
  cash: number;

  @IsNumber()
  card: number;

  @IsNumber()
  revenue: number;

  @IsNumber()
  profit: number;

  @IsNumber()
  beg: number;

  @IsNumber()
  adv: number;

  @IsNumber()
  students: number;

  @IsBoolean()
  completed: boolean;

  @IsNumber()
  stripe: number;

  @IsArray()
  costs: [];
}
