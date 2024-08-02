import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateCostDto } from './dto/create-report.dto';
import { UpdateCostDto } from './dto/update-report.dto';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Auth()
  @Roles(Role.administrator)
  @Post()
  async create(@Body() data: CreateCostDto[]) {
    return await this.reportService.create(data);
  }

  @Auth()
  @Roles(Role.administrator)
  @Get()
  async findAll(@Query('from') from: string, @Query('to') to: string) {
    return await this.reportService.findAll({
      from,
      to
    });
  }

  @Auth()
  @Roles(Role.administrator)
  @Patch()
  update(@Body() data: UpdateCostDto[]) {
    return this.reportService.update(data);
  }
}
