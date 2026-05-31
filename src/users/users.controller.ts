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

import { Controller, Post, Body, Get, HttpStatus, HttpCode, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // PUT /users/profile - Guardar métodos de pago del usuario
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateData: { paymentMethods?: Array<{ cardNumber: string; cardholderName: string; expiryDate: string; cvv: string }> },
  ) {
    console.log('👤 PUT /users/profile');
    console.log('👤 Usuario autenticado ID:', req.user?.sub);
    console.log('👤 Datos recibidos:', updateData);
    
    try {
      const result = await this.usersService.updateUserPaymentMethods(
        req.user.sub,
        updateData.paymentMethods || [],
      );
      console.log('✅ Perfil de usuario actualizado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error en updateProfile controller:', error);
      throw error;
    }
  }
}
