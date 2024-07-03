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
import { Role, User } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth()
  @Roles(Role.administrator)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @Post('/batch')
  createMany(@Body() createProductDto: CreateProductDto[]) {
    return this.productService.createMany(createProductDto);
  }

  @Auth()
  @Get()
  findAll(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.productService.findAll(user, month);
  }

  @Auth()
  @Roles(Role.administrator)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
