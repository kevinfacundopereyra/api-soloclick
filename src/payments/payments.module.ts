import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';

@Module({
  imports: [MercadoPagoModule], // <-- Importa el módulo aquí
  controllers: [PaymentsController],
})
export class PaymentsModule {}
