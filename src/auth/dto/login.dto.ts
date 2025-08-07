// src/auth/dto/login.dto.ts

import { IsEmail, IsNotEmpty } from 'class-validator';



export class LoginDto {

  // allow no top-level domain (e.g. admin@local)

  @IsEmail({ require_tld: false })

  email: string;



  @IsNotEmpty()

  password: string
}