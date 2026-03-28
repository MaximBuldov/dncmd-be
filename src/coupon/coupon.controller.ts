import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Response
} from '@nestjs/common';
import { Response as Res } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role } from 'src/generated/prisma/client';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponQueryDto } from './dto/query-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth()
  @Roles(Role.administrator)
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    return await this.couponService.create(createCouponDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Get()
  async findAll(@Query() query: CouponQueryDto, @Response() res: Res) {
    const [data, total] = await this.couponService.findAll(query);

    return res.set({ Total: total }).json(data);
  }

  @Auth()
  @Roles(Role.customer)
  @HttpCode(200)
  @Get('my')
  async findMy(@CurrentUser('id') id: number) {
    return await this.couponService.findMy(id);
  }

  @Auth()
  @Post('validate')
  async findOne(
    @CurrentUser('id') user: string,
    @Body() data: ValidateCouponDto
  ) {
    return await this.couponService.findOne(+user, data);
  }

  @Auth()
  @Roles(Role.administrator)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.couponService.remove(+id);
  }

  @Auth()
  @Roles(Role.administrator)
  @Patch(':id')
  async updateCoupon(
    @Param('id') id: number,
    @Body() updateCouponDto: UpdateCouponDto
  ) {
    return await this.couponService.update(id, updateCouponDto);
  }
}
