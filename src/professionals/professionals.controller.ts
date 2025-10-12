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
} from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';

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
}
