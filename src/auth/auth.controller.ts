import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { Roles } from './decorators/roles.decorator';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(Role.customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getUsers() {
    return await this.authService.users();
  }

  @HttpCode(200)
  @Post('register')
  async register(@Body() dto: AuthDto) {
    return await this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @HttpCode(200)
  @Auth()
  @Post('login/access-token')
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return await this.authService.getNewTokens(dto.refreshToken);
  }

  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.email);
  }

  @HttpCode(200)
  @Post('set-password')
  async setPassword(@Body() dto: SetPasswordDto) {
    return await this.authService.setPassword(dto);
  }
}
