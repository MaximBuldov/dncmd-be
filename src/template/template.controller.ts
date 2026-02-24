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
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateService } from './template.service';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Post()
  async create(@Body() data: CreateTemplateDto) {
    return await this.templateService.create(data);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateTemplateDto) {
    return await this.templateService.update(+id, data);
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Get()
  async getAll() {
    return await this.templateService.getAll();
  }

  @Auth()
  @Roles(Role.administrator)
  @HttpCode(200)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.templateService.remove(+id);
  }
}
