import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Response
} from '@nestjs/common';
import { Response as Res } from 'express';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Role } from 'src/generated/prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Roles(Role.administrator)
  @Get()
  async findAll(@Query() query: UserQueryDto, @Response() res: Res) {
    const [orders, total] = await this.userService.findAll(query);
    return res.set({ Total: total }).json(orders);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Auth()
  @Patch()
  update(@CurrentUser('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Auth()
  @Roles(Role.administrator)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
