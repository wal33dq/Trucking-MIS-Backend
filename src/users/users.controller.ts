// src/users/users.controller.ts
import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
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
}