import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { AppointmentService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Professional, ProfessionalSchema } from '../professionals/schemas/professional.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
      { name: 'Professional', schema: ProfessionalSchema },
      { name: 'User', schema: UserSchema }, // <--- Agrega el esquema de User
    ]),
  ],
  providers: [AppointmentService, NotificationsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}