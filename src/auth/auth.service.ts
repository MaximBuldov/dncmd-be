import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { returnUserObject } from 'src/user/return-user.object';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { SetPasswordDto } from './dto/set-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService
  ) {}

  async users() {
    return await this.prisma.user.findMany({
      select: { id: true }
    });
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto);
    return await this.returnUserFields(user);
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({
      where: { id: result.id }
    });

    return await this.returnUserFields(user);
  }

  async register({ email, dob, password, ...rest }: AuthDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (oldUser) throw new BadRequestException('User already exists');

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        email,
        dob: new Date(dob),
        password: await hash(password)
      }
    });

    await this.mailService.welcome(user.email, user.first_name);

    await this.mailService.newStudent(user);

    return await this.returnUserFields(user);
  }

  async resetPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Email not found');

    const token = this.jwt.sign({ id: user.id }, { expiresIn: '1h' });
    const link = `${process.env.UI_URL}/reset-password/${token}`;

    await this.mailService.resetPassword(user, link);

    return { message: 'Password reset link sent' };
  }

  async setPassword({ token, password }: SetPasswordDto) {
    const { id } = await this.jwt.verifyAsync<{ id?: number }>(token);
    if (!id) throw new UnauthorizedException('Invalid or expired token');

    const user = await this.prisma.user.update({
      where: { id },
      data: { password },
      select: returnUserObject
    });
    if (!user) throw new NotFoundException('User not found');

    return await this.returnUserFields(user);
  }

  private async issueTokens(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h'
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }

  private async returnUserFields(user: User) {
    const { password, ...rest } = user;
    const tokens = await this.issueTokens(user.id);

    return {
      user: rest,
      ...tokens
    };
  }

  private async validateUser({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await verify(user.password, password);

    if (!isValid) throw new UnauthorizedException('Invalid password');

    return user;
  }
}
