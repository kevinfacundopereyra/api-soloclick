import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercado-pago.service';

@Module({
  providers: [MercadoPagoService],
  exports: [MercadoPagoService], // <-- Exporta el servicio para usarlo en otros módulos
})
export class MercadoPagoModule {}
