import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  categories: number[];
}
