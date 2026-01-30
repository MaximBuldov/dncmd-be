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
import { Role } from 'src/generated/prisma/client';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Patch(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    return await this.categoryService.update(+id, name);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Get()
  async getAll(
    @Query('page') page: number,
    @Query('per_page') per_page,
    @Response() res: Res
  ) {
    const [data, total] = await this.categoryService.getAll(page, per_page);

    return res.set({ Total: total }).json(data);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(+id);
  }
}
