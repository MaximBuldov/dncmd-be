import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/generated/prisma/client';
import { BundleService } from './bundle.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';

@Controller('bundle')
export class BundleController {
  constructor(private readonly bundleService: BundleService) {}

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Post()
  async create(@Body() data: CreateBundleDto) {
    return await this.bundleService.create(data);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateBundleDto) {
    return await this.bundleService.update(+id, data);
  }

  @Auth()
  @HttpCode(200)
  @Get()
  async getAll() {
    return await this.bundleService.getAll();
  }

  @Auth()
  @HttpCode(200)
  @Post('products')
  async getProductsWithPrice(@Body('ids') ids: number[]) {
    return await this.bundleService.getProductsWithPrice(ids);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.bundleService.remove(+id);
  }
}
