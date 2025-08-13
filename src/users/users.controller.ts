// src/users/users.controller.ts
import { Controller, Post, Body, Get, Query, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Import UpdateUserDto
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from './roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin, Role.Owner)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Role.Admin, Role.Owner, Role.ProjectDivider, Role.SaleAgent)
  findAll(@Query('role') role?: Role) {
    return role
      ? this.usersService.findByRole(role)
      : this.usersService.findAll();
  }

  // New endpoint for updating a user
  @Patch(':id')
  @Roles(Role.Admin, Role.Owner)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // New endpoint for deleting a user
  @Delete(':id')
  @Roles(Role.Admin, Role.Owner)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
