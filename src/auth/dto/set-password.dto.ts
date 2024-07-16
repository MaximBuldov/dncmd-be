import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long'
  })
  password: string;

  @IsOptional()
  confirm: string;
}
