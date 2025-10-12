/* import { Controller, Post, Body, Get } from '@nestjs/common';
import { AppointmentService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentService) {}

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Post()
  create(@Body() createAppointmentDto: any) {
    return this.appointmentsService.create(createAppointmentDto);
  }
}
 */

/* Segundo  guardado
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './schemas/appointment.schema';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  async findAll(): Promise<Appointment[]> {
    return this.appointmentService.findAll();
  }

  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentService.create(createAppointmentDto);
  }
}

 */

import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    try {
      // Validar que todos los campos requeridos estén presentes
      const requiredFields = ['user', 'professional', 'date'];
      const missingFields = requiredFields.filter(
        (field) => !createAppointmentDto[field],
      );

      if (missingFields.length > 0) {
        return {
          success: false,
          message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        };
      }

      const appointment =
        await this.appointmentService.create(createAppointmentDto);

      return {
        success: true,
        message: 'Reserva creada exitosamente',
        appointment: {
          id: appointment._id,
          user: appointment.user,
          professional: appointment.professional,
          date: appointment.date,
          duration: appointment.duration,
          paymentStatus: appointment.paymentStatus,
        },
      };
    } catch (error) {
      console.error('Error al crear reserva:', error);
      return {
        success: false,
        message: error.message || 'Error interno del servidor',
      };
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }

  @Get('professional/:professionalId')
  findByProfessional(@Param('professionalId') professionalId: string) {
    return this.appointmentService.findByProfessional(professionalId);
  }
}
