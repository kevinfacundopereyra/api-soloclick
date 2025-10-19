import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor() {
    const token =
      process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || '';
    if (!token) {
      console.warn(
        '⚠️ MERCADOPAGO_ACCESS_TOKEN no está definido. La creación de preferencias fallará.',
      );
    }

    this.client = new MercadoPagoConfig({
      accessToken: token,
    });
  }

  async createPreference(item: {
    title: string;
    price: number;
    quantity?: number;
  }) {
    const preference = new Preference(this.client);
    const { title, price, quantity = 1 } = item;

    try {
      const result = await preference.create({
        body: {
          items: [
            {
              id: '', // opcional
              title,
              quantity,
              unit_price: price,
            },
          ],
        },
      });

      console.log('MercadoPago create response:', result);
      return {
        preferenceId: result.id,
        initPoint: result.init_point,
        raw: result,
      };
    } catch (err: any) {
      console.error('❌ Error in MercadoPagoService.createPreference:', {
        message: err?.message,
        body: err?.body ?? err?.response?.data ?? err,
      });
      throw err; // relanzar para que el controlador lo capture (o puedes lanzar un Error con más contexto)
    }
  }
}
