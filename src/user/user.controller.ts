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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('search') search: string = '',
    @Response() res: Res
  ) {
    const [orders, total] = await this.userService.findAll({
      page,
      per_page,
      search
    });
    return res.set({ Total: total }).json(orders);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
