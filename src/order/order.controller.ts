import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Response
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Response as Res } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { CreateIntentDto } from './dto/create-intent.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
    return this.orderService.create(createOrderDto, user);
  }

  @Auth()
  @Post('intent')
  createIntent(@Body() createIntentDto: CreateIntentDto) {
    return this.orderService.createIntent(createIntentDto);
  }

  @Auth()
  @Get()
  async findAll(@Query() query: OrderQueryDto, @Response() res: Res) {
    const [orders, total] = await this.orderService.findAll(query);

    return res.set({ Total: total }).json(orders);
  }

  @Auth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Post('update-stripe')
  async updateStripe(@Body() data) {
    return this.orderService.updateStripe(data);
  }

  @Auth()
  @Roles(Role.administrator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
