import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { AppointmentSchema } from '../appointments/schemas/appointment.schema';
import { AppointmentService } from '../appointments/appointments.service';
import {
  Professional,
  ProfessionalSchema,
} from '../professionals/schemas/professional.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [
    MercadoPagoModule, // <-- Importa el módulo aquí
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: 'Appointment', schema: AppointmentSchema },
      { name: 'Professional', schema: ProfessionalSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, AppointmentService, NotificationsService],
})
export class PaymentsModule {}
