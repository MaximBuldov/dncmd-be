import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { returnUserObject } from './return-user.object';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.prisma.user.findMany({
      where: {
        role: 'customer'
      },
      select: returnUserObject
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: returnUserObject
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
