import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

// configurar axios para llamadas internas a la API (si realmente necesitas llamar a /services desde aquí)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

// helper para normalizar _id -> id (igual que en servicesService)
const normalizeService = (service: any) => ({
  ...service,
  id: service._id || service.id,
  _id: service._id || service.id,
});

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  // Nuevo método para crear un pago y preferencia en Mercado Pago
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const { serviceName, amount } = createPaymentDto;

    // Opcional: Validar datos, buscar cita, etc.

    const preference = new Preference(client);

    try {
      const data = await preference.create({
        body: {
          items: [
            {
              id: new Date().getTime().toString(),
              title: serviceName || 'Servicio',
              quantity: 1,
              unit_price: amount,
            },
          ],
          payer: {
            email: '',
          },
        },
      });

      // Opcional: Guardar el pago en la base de datos
      // const newPayment = new this.paymentModel({
      //   ...createPaymentDto,
      //   paymentId: data.id,
      //   paymentUrl: data.init_point,
      //   status: 'pending',
      //   createdAt: new Date(),
      // });
      // await newPayment.save();

      return {
        preference_id: data.id,
        preference_url: data.init_point,
        status: 'pending',
      };
    } catch (error) {
      console.error('❌ Error creando preferencia Mercado Pago:', error);
      throw new NotFoundException('No se pudo crear la preferencia de pago');
    }
  }

  async refundPayment(paymentId: string) {
    // Simulación de reembolso
    return {
      status: 'refunded',
      paymentId,
      refundedAt: new Date(),
    };
  }

  async createFinalPayment(
    appointmentId: string,
    amount: number,
    userEmail: string,
  ) {
    // Simulación de pago final
    return {
      status: 'success',
      paymentId: 'simulated-final-' + appointmentId,
      amount,
      userEmail,
      type: 'final',
      createdAt: new Date(),
    };
  }

  // Método para obtener todos los pagos (para debugging)
  async getAllPayments(): Promise<Payment[]> {
    try {
      const payments = await this.paymentModel.find({}).limit(5);
      console.log(
        '🔍 SERVICE - Todos los pagos (primeros 5):',
        payments.length,
      );
      return payments;
    } catch (error) {
      console.error('Error getAllPayments:', error);
      return [];
    }
  }

  // Obtener todos los pagos de un profesional
  async getPaymentsByProfessional(professionalId: string): Promise<Payment[]> {
    return await this.paymentModel
      .find({ professionalId: new Types.ObjectId(professionalId) })
      .populate('clientId', 'name email')
      .populate('appointmentId', 'date status')
      .sort({ paymentDate: -1 })
      .exec();
  }

  // Obtener estadísticas de pagos de un profesional
  async getPaymentStatsByProfessional(professionalId: string) {
    const payments = await this.paymentModel
      .find({
        professionalId: new Types.ObjectId(professionalId),
        status: 'completed',
      })
      .exec();

    const totalEarnings = payments.reduce(
      (sum, payment) => sum + payment.netAmount,
      0,
    );
    const totalCommissions = payments.reduce(
      (sum, payment) => sum + payment.commission,
      0,
    );
    const totalPayments = payments.length;

    return {
      totalEarnings,
      totalCommissions,
      totalPayments,
      averagePayment: totalPayments > 0 ? totalEarnings / totalPayments : 0,
    };
  }

  // Obtener pagos por método de pago
  async getPaymentsByMethod(
    professionalId: string,
    paymentMethod: string,
  ): Promise<Payment[]> {
    return await this.paymentModel
      .find({
        professionalId: new Types.ObjectId(professionalId),
        paymentMethod,
      })
      .populate('clientId', 'name email')
      .populate('appointmentId', 'date status')
      .sort({ paymentDate: -1 })
      .exec();
  }

  // Obtener pagos por estado
  async getPaymentsByStatus(
    professionalId: string,
    status: string,
  ): Promise<Payment[]> {
    return await this.paymentModel
      .find({
        professionalId: new Types.ObjectId(professionalId),
        status,
      })
      .populate('clientId', 'name email')
      .populate('appointmentId', 'date status')
      .sort({ paymentDate: -1 })
      .exec();
  }

  // Obtener pagos por rango de fechas
  async getPaymentsByDateRange(
    professionalId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]> {
    return await this.paymentModel
      .find({
        professionalId: new Types.ObjectId(professionalId),
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('clientId', 'name email')
      .populate('appointmentId', 'date status')
      .sort({ paymentDate: -1 })
      .exec();
  }

  // Método principal para obtener pagos y estadísticas del profesional autenticado
  async getMyPayments(professionalId: string) {
    try {
      console.log('🔍 SERVICE - Buscando pagos...');
      console.log('🔍 SERVICE - professionalId recibido:', professionalId);
      console.log('🔍 SERVICE - Tipo:', typeof professionalId);

      // ✅ PROBAR múltiples formas de buscar

      // Método 1: String directo
      const payments1 = await this.paymentModel.find({
        professionalId: professionalId,
      });
      console.log('🔍 SERVICE - Método 1 (string):', payments1.length);

      // Método 2: Con ObjectId
      let payments2 = [];
      try {
        const { Types } = require('mongoose');
        payments2 = await this.paymentModel.find({
          professionalId: new Types.ObjectId(professionalId),
        });
        console.log('🔍 SERVICE - Método 2 (ObjectId):', payments2.length);
      } catch (e) {
        console.log('🔍 SERVICE - Método 2 falló (no es ObjectId válido)');
      }

      // Método 3: Comparación flexible
      const payments3 = await this.paymentModel.find({
        $or: [
          { professionalId: professionalId },
          { professionalId: { $eq: professionalId } },
        ],
      });
      console.log('🔍 SERVICE - Método 3 ($or):', payments3.length);

      // Usar el que tenga resultados
      let finalPayments = payments1;
      if (payments1.length === 0 && payments2.length > 0) {
        finalPayments = payments2;
        console.log('🔍 SERVICE - Usando método 2 (ObjectId)');
      } else if (payments1.length === 0 && payments3.length > 0) {
        finalPayments = payments3;
        console.log('🔍 SERVICE - Usando método 3 ($or)');
      } else {
        console.log('🔍 SERVICE - Usando método 1 (string)');
      }

      console.log(
        '🔍 SERVICE - Pagos encontrados FINAL:',
        finalPayments.length,
      );

      if (finalPayments.length > 0) {
        console.log('🔍 SERVICE - Primer pago encontrado:', {
          _id: finalPayments[0]._id,
          professionalId: finalPayments[0].professionalId,
          clientName: finalPayments[0].clientName,
          amount: finalPayments[0].amount,
        });
      }

      // Calcular stats
      const completedPayments = finalPayments.filter(
        (p) => p.status === 'completed',
      );
      const pendingPayments = finalPayments.filter(
        (p) => p.status === 'pending',
      );

      const stats = {
        totalIncome: completedPayments.reduce(
          (sum, p) => sum + (p.netAmount || 0),
          0,
        ),
        thisMonth: completedPayments.reduce(
          (sum, p) => sum + (p.netAmount || 0),
          0,
        ),
        thisWeek: completedPayments.reduce(
          (sum, p) => sum + (p.netAmount || 0),
          0,
        ),
        today: completedPayments.reduce(
          (sum, p) => sum + (p.netAmount || 0),
          0,
        ),
        totalCommissions: finalPayments.reduce(
          (sum, p) => sum + (p.commission || 0),
          0,
        ),
        completedPayments: completedPayments.length,
        pendingPayments: pendingPayments.length,
        averageService:
          completedPayments.length > 0
            ? completedPayments.reduce(
                (sum, p) => sum + (p.netAmount || 0),
                0,
              ) / completedPayments.length
            : 0,
      };

      return {
        success: true,
        payments: finalPayments,
        stats,
      };
    } catch (error) {
      console.error('❌ SERVICE Error:', error);
      return {
        success: false,
        payments: [],
        stats: {},
      };
    }
  }

  async updateService(serviceId: string, serviceData: any) {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData);
      console.log('🔍 Respuesta updateService:', response.data);

      return {
        success: true,
        service: normalizeService(response.data),
        message: 'Servicio actualizado exitosamente',
      };
    } catch (error: any) {
      console.error('❌ Error en updateService:', error);
      throw error;
    }
  }
}
