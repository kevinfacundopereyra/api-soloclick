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

  // En appointments.controller.ts - en el método create:

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    // ✅ AGREGAR - Mapear clientId a userId si viene
    if (createAppointmentDto.clientId && !createAppointmentDto.userId) {
      createAppointmentDto.userId = createAppointmentDto.clientId;
    }

    return this.appointmentService.create(createAppointmentDto);
  }

  @Get('client/:clientId') // GET /appointments/client/:clientId
  findByClient(@Param('clientId') clientId: string) {
    return this.appointmentService.findByClient(clientId);
  }

/*   @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  } */

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }

  @Get('professional/:professionalId')
  findByProfessional(@Param('professionalId') professionalId: string) {
    return this.appointmentService.findByProfessional(professionalId);
  }
}
