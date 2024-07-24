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
import { Role } from '@prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Auth()
  @Roles(Role.administrator)
  @Post()
  async create(@Body() createReportDto: CreateReportDto) {
    return await this.reportService.create(createReportDto);
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
