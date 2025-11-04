// api-soloclick/src/payments/payments.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import {
  Appointment,
  AppointmentSchema,
} from '../appointments/schemas/appointment.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Professional,
  ProfessionalSchema,
} from '../professionals/schemas/professional.schema';
// import { NotificationService } from '../notifications/notifications.service';

// 1. IMPORTAR ClientsModule AQUÍ
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // 2. REGISTRAR el microservicio AQUÍ
    ClientsModule.register([
      {
        name: 'PAGOS_SERVICE', // El mismo token que usaste en el service
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3001, // El puerto del microservicio de pagos
        },
      },
    ]),

    // El resto de tus imports de Mongoose
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Professional.name, schema: ProfessionalSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
