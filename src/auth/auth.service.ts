import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: any) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (user && user.password === loginDto.password) {
      // Generar token JWT
      const token = jwt.sign(
        {
          sub: user._id,
          name: user.name,
          userType: user.userType,
          email: user.email,
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' }
      );
      return { user, token };
    }
    return { message: 'Credenciales inválidas' };
  }
}
