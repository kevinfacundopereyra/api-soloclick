import { Controller, Post, Body, Get, Delete, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { AppointmentService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

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

  @UseGuards(JwtAuthGuard)
  @Get('professional') // GET /appointments/professional (usando JWT)
  async getProfessionalAppointments(@Request() req: any) {
    const professionalId = req.user.sub; // El ID viene del JWT como 'sub'
    return this.appointmentService.findByProfessional(professionalId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }

  @Get('professional/:professionalId')
  findByProfessional(@Param('professionalId') professionalId: string) {
    return this.appointmentService.findByProfessional(professionalId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') appointmentId: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateStatus(appointmentId, updateStatusDto.status);
  }
}
