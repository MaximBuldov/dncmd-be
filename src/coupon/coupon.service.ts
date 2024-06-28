import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCouponDto) {
    return await this.prisma.coupon.create({ data });
  }

  async findMy(id: number) {
    return await this.prisma.coupon.findMany({
      where: {
        allowed_users: {
          has: id
        },
        isExceeded: false,
        date_expires: {
          gte: new Date()
        }
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
