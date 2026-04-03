import { BadRequestException, Injectable } from '@nestjs/common';
import { BundleService } from 'src/bundle/bundle.service';
import { Coupon, DiscountType } from 'src/generated/prisma/client';
import { CouponGetPayload } from 'src/generated/prisma/models';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponQueryDto } from './dto/query-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

export interface CodeValidation {
  valid: boolean;
  coupon: Coupon;
  message?: string;
}

@Injectable()
export class CouponService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private readonly bundleService: BundleService
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
          connect: data.allowed_users?.map((id) => ({ id }))
        },
        used_by: { connect: [] },
        allowed_cat: {
          connect: data.allowed_cat?.map((id) => ({ id }))
        },
        isPublic: !data.allowed_users?.length
      },
      include: {
        allowed_users: selectUser,
        allowed_cat: true
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
        used_by: {
          none: { id }
        },
        date_expires: {
          gte: new Date()
        },
        OR: [
          {
            allowed_users: {
              some: { id }
            }
          },
          { isPublic: true }
        ]
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        allowed_users: true,
        allowed_cat: true
      }
    });
  }

  async findOne(id: number, { code, products }: ValidateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        code: code.toLowerCase(),
        used_by: { none: { id } },
        OR: [{ date_expires: null }, { date_expires: { gte: new Date() } }],
        AND: [
          {
            OR: [{ isPublic: true }, { allowed_users: { some: { id } } }]
          }
        ]
      },
      include: {
        allowed_cat: true
      }
    });

    if (!coupon) {
      return {
        valid: false,
        coupon,
        message:
          'Coupon is invalid, expired, or not available for your account.'
      };
    }

    return await this.validateCoupon(coupon, products);
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
          : undefined,
        allowed_cat: !!data?.allowed_cat
          ? {
              set: data.allowed_cat.map((id) => ({ id }))
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
          orders: true,
          allowed_cat: true
        }
      }),
      this.prisma.coupon.count()
    ]);
  }

  private async validateCoupon(
    coupon: CouponGetPayload<{
      include: { allowed_cat: true };
    }>,
    productIds: number[]
  ): Promise<CodeValidation> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, is_canceled: false },
      include: { categories: true }
    });

    if (products.length === 0) {
      return {
        valid: false,
        coupon,
        message: 'No valid products found for the provided IDs.'
      };
    }

    const allowedCatIds = coupon.allowed_cat.map((c) => c.id);
    const hasCategoryRestriction = allowedCatIds.length > 0;

    const eligibleItems = hasCategoryRestriction
      ? products.filter((item) =>
          item.categories.some((cat) => allowedCatIds.includes(cat.id))
        )
      : products;

    if (eligibleItems.length === 0) {
      return {
        valid: false,
        coupon,
        message: 'None of your selected products are eligible for this coupon.'
      };
    }

    if (coupon.discount_type === DiscountType.credit) {
      const price = await this.bundleService.getProductPriceFromBundle(
        eligibleItems.map((el) => el.id)
      );
      coupon.amount = price;
    }

    return {
      valid: true,
      coupon
    };
  }
}

const selectUser = {
  select: {
    id: true,
    email: true,
    first_name: true
  }
};
