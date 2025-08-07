import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator';



@Injectable()

export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) {}



  canActivate(context: ExecutionContext): boolean {

    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [

      context.getHandler(),

      context.getClass(),

    ]);

    if (!required) return true;

    const { role } = context.switchToHttp().getRequest().user;

    return required.includes(role);

  }

}