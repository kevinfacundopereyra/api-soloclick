/* import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }
} */

import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Post('register')
  async register(@Body() createUserDto: any) {
    try {
      // Validar que todos los campos requeridos estén presentes
      const requiredFields = ['name', 'email', 'password', 'phone', 'city'];
      const missingFields = requiredFields.filter(
        (field) => !createUserDto[field],
      );

      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        };
      }

      // Verificar si el email ya existe
      const existingUser = await this.usersService.findByEmail(
        createUserDto.email,
      );
      if (existingUser) {
        return {
          success: false,
          message: 'El email ya está registrado',
        };
      }

      const user = await this.usersService.create(createUserDto);

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          userType: user.userType,
        },
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }
}
