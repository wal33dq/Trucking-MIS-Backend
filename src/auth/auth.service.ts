// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = await this.validateUser(email, password);
    if (!user) return null;

    // --- FIX APPLIED ---
    // The 'name' field from the user object is now included in the payload.
    const payload = { 
      username: user.email, 
      sub: user._id.toString(), 
      role: user.role,
      name: user.name // <-- FIX: Added user's name to the payload
    };
    
    return this.jwtService.sign(payload);
  }
}
