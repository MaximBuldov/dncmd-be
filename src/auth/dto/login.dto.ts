import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
