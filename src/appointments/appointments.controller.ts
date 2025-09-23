import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments') // <--- Cambio aquí
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('') // GET /api/appointments/user
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.appointmentService.findByUser(userId);
  }

  @Get('professional/:professionalId')
  findByProfessional(@Param('professionalId') professionalId: string) {
    return this.appointmentService.findByProfessional(professionalId);
  }

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}