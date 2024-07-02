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
import { Role } from '@prisma/client';
import { Response as Res } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth()
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('id') id: string
  ) {
    return this.orderService.create(createOrderDto, +id);
  }

  @Auth()
  @Get()
  async findAll(@Query() query: OrderQueryDto, @Response() res: Res) {
    const [orders, total] = await this.orderService.findAll(query);

    return res.set({ Total: total }).json(orders);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Auth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
