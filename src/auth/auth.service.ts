import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaService } from 'prisma.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
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
