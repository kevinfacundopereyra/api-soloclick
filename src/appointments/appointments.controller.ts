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
