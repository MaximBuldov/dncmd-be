import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role, User } from 'src/generated/prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth()
  @Roles(Role.administrator)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productService.create(createProductDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @Post('/batch')
  async createMany(@Body() createProductDto: CreateProductDto[]) {
    return await this.productService.createMany(createProductDto);
  }

  @Auth()
  @Get()
  async findAll(@CurrentUser() user: User, @Query('month') month?: string) {
    return await this.productService.findAll(user, month);
  }

  @Auth()
  @Patch(':id/wait-list')
  async joinWaitList(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    return await this.productService.joinWaitList(+id, user.id);
  }

  @Auth()
  @Roles(Role.administrator)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return await this.productService.update(+id, updateProductDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(+id);
  }
}
