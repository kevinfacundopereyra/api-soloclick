import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Post('create-preference')
  async createPreference(@Body() body: any, @Res() res: Response) {
    console.log('POST /payments/create-preference body:', body);

    // Si el frontend envía el monto, usarlo directamente (caso real)
    const amount = body.amount ?? body.netAmount ?? null;

    // Intento de compatibilidad con serviceId/professionalId
    const SERVICES = [
      { id: '1', title: 'Corte de pelo', price: 1500, professionalId: 'a' },
      { id: '2', title: 'Manicura', price: 1200, professionalId: 'b' },
    ];

    let title = body.title ?? `Pago cita ${body.appointmentId ?? ''}`;
    if (!amount && body.serviceId && body.professionalId) {
      const service = SERVICES.find(
        (s) =>
          s.id === body.serviceId && s.professionalId === body.professionalId,
      );
      if (!service) {
        return res.status(404).json({ error: 'Servicio no encontrado' });
      }
      title = service.title;
    }

    if (!amount) {
      // no hay monto, error claro
      return res
        .status(400)
        .json({ error: 'Falta amount/netAmount en el body' });
    }

    try {
      const pref = await this.mercadoPagoService.createPreference({
        title,
        price: Number(amount),
        quantity: 1,
      });

      const url = pref.initPoint ?? pref.raw?.init_point ?? null;
      console.log('✅ Preference creada:', pref);

      return res.status(200).json({
        preference_id: pref.preferenceId ?? pref.raw?.id ?? null,
        preference_url: url,
      });
    } catch (error: any) {
      console.error('❌ Error creando preferencia (controller):', error);
      return res.status(500).json({
        error: 'Error creando preferencia',
        details: error?.response?.data ?? error?.message ?? 'see server logs',
      });
    }
  }
}
