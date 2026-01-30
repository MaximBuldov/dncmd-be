import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Coupon } from 'src/generated/prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponQueryDto } from './dto/query-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async create(data: CreateCouponDto) {
    const oldCoupon = await this.prisma.coupon.findUnique({
      where: { code: data.code.toLowerCase() }
    });

    if (oldCoupon) throw new BadRequestException('Coupon already exists');

    const coupon = await this.prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toLowerCase(),
        allowed_users: {
          connect: data.allowed_users.map((id) => ({ id }))
        },
        used_by: { connect: [] }
      },
      include: {
        allowed_users: selectUser
      }
    });

    coupon.allowed_users.forEach((user) => {
      this.mailService.coupon(user, coupon.code, coupon.amount);
    });

    return coupon;
  }

  async findMy(id: number) {
    return await this.prisma.coupon.findMany({
      where: {
        allowed_users: {
          some: {
            id
          }
        },
        used_by: {
          none: { id }
        },
        date_expires: {
          gte: new Date()
        }
      }
    });
  }

  async findOne(id: number, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        code: code.toLowerCase(),
        allowed_users: {
          some: { id }
        },
        used_by: {
          none: { id }
        },
        date_expires: {
          gte: new Date()
        }
      }
    });

    if (!coupon) throw new NotFoundException('Coupon not found');

    return coupon;
  }

  async useCoupon(
    userId: number,
    coupon: Coupon,
    action: 'connect' | 'disconnect'
  ) {
    await this.prisma.coupon.update({
      where: { code: coupon.code.toLowerCase() },
      data: {
        used_by: {
          [action]: { id: userId }
        }
      }
    });
  }

  async update(id: number, data: UpdateCouponDto) {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        allowed_users: !!data?.allowed_users
          ? {
              set: data.allowed_users.map((id) => ({ id }))
            }
          : undefined,
        used_by: !!data?.used_by
          ? {
              set: data.used_by.map((id) => ({ id }))
            }
          : undefined
      },
      include: {
        used_by: selectUser,
        allowed_users: selectUser
      }
    });
  }

  async remove(id: number): Promise<Coupon> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: { orders: true }
    });

    if (coupon && coupon.orders.length > 0)
      throw new BadRequestException(
        'Coupon is already linked to an order and cannot be deleted'
      );

    return this.prisma.coupon.delete({
      where: { id }
    });
  }

  async findAll({ per_page, page }: CouponQueryDto) {
    const skip = (+page - 1) * +per_page;

    return await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        take: +per_page,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          allowed_users: selectUser,
          used_by: selectUser,
          orders: true
        }
      }),
      this.prisma.coupon.count()
    ]);
  }
}

const selectUser = {
  select: {
    id: true,
    email: true,
    first_name: true
  }
};
