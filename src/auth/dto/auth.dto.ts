import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';
import * as dayjs from 'dayjs';

export enum UserRole {
  Admin = 'admin',
  Customer = 'customer'
}

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long'
  })
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  instagram: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => dayjs(value).toDate())
  dob: Date;

  @IsNotEmpty()
  @IsString()
  billing_phone: string;

  @IsOptional()
  role?: Role;
}
