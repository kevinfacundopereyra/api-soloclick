import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

/*   @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  } */
  
    // Agregado el endpoint para registrar usuarios (23-09-Brian)
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.registerUser(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  
}
