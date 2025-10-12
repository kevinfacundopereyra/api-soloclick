/* import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Post()
  create(@Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.create(createProfessionalDto);
  }
}
 */

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalsService.findById(id);
  }

  @Get('by-specialty/:specialty')
  findBySpecialty(@Param('specialty') specialty: string) {
    return this.professionalsService.findBySpecialty(specialty);
  }

  @Post()
  async create(@Body() createProfessionalDto: CreateProfessionalDto) {
    try {
      // Validar que todos los campos requeridos estén presentes
      const requiredFields = [
        'name',
        'email',
        'password',
        'phone',
        'city',
        'specialty',
      ];
      const missingFields = requiredFields.filter(
        (field) => !createProfessionalDto[field],
      );

      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        };
      }

      // Verificar si el email ya existe
      const existingProfessional = await this.professionalsService.findByEmail(
        createProfessionalDto.email,
      );
      if (existingProfessional) {
        return {
          success: false,
          message: 'El email ya está registrado',
        };
      }

      const professional = await this.professionalsService.create(
        createProfessionalDto,
      );

      return {
        success: true,
        message: 'Profesional registrado exitosamente',
        professional: {
          id: professional._id,
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          city: professional.city,
          specialty: professional.specialty,
          userType: professional.userType,
        },
      };
    } catch (error) {
      console.error('Error al crear profesional:', error);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: CreateProfessionalDto,
  ) {
    return this.professionalsService.update(id, updateProfessionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professionalsService.remove(id);
  }

  // GET /professionals/profile - Obtener perfil del profesional logueado
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.professionalsService.getProfile(req.user.sub);
  }

  // PUT /professionals/profile - Completar/actualizar perfil
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.professionalsService.updateProfile(
      req.user.sub,
      updateProfileDto,
    );
  }

  // POST /professionals/upload-images - Subir imágenes
  @Post('upload-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@Request() req, @UploadedFiles() files) {
    return this.professionalsService.uploadProfileImages(req.user.sub, files);
  }

  // POST /professionals/login - Login específico para profesionales
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    const professional = await this.professionalsService.findByEmail(
      loginDto.email,
    );

    if (!professional || professional.password !== loginDto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const jwt = require('jsonwebtoken');
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

    return {
      user: professional,
      token,
    };
  }
}
