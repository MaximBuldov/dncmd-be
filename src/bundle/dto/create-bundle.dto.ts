import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateBundleDto {
  @IsArray()
  @IsNotEmpty()
  products: number[];

  @IsNotEmpty()
  discount: number | string;
}
