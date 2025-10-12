import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProfessionalsService } from '../professionals/professionals.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly professionalsService: ProfessionalsService
  ) {}

  async login(loginDto: any) {
    // Primero buscar en usuarios (clientes)
    const user = await this.usersService.findByEmail(loginDto.email);
    if (user && user.password === loginDto.password) {
      // Generar token JWT para usuario
      const token = jwt.sign(
        {
          sub: user._id,
          name: user.name,
          userType: user.userType,
          email: user.email,
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' },
      );
      return { user, token };
    }

    // Si no se encuentra en usuarios, buscar en profesionales
    const professional = await this.professionalsService.findByEmail(loginDto.email);
    if (professional && professional.password === loginDto.password) {
      // Generar token JWT para profesional
      const token = jwt.sign(
        {
          sub: professional._id,
          name: professional.name,
          userType: professional.userType,
          email: professional.email,
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' },
      );
      // Devolver como 'user' para mantener consistencia con el frontend
      return { user: professional, token };
    }

    return { message: 'Credenciales inválidas' };
  }
}
