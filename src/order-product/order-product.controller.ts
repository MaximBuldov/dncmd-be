import { Body, Controller, Param, Patch } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role, User } from 'src/generated/prisma/client';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';
import { OrderProductService } from './order-product.service';

@Controller('order-product')
export class OrderProductController {
  constructor(private readonly orderProductService: OrderProductService) {}

  @Auth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateOrderProductDto,
    @CurrentUser() user: User
  ) {
    return await this.orderProductService.update(+id, data, user);
  }

  @Auth()
  @Roles(Role.administrator)
  @Patch()
  async updateMany(
    @Body() updateOrderProductDto: UpdateOrderProductDto,
    @CurrentUser('id') actorId: number
  ) {
    return await this.orderProductService.updateMany(
      updateOrderProductDto,
      actorId
    );
  }
}
