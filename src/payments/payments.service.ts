// api-soloclick/src/payments/payments.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject, // 👈 AÑADIDO
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

// ❌ ELIMINADO: Ya no importamos el servicio local de Mercado Pago
// import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';

// 📦 AÑADIDO: Importamos las herramientas para llamar al microservicio
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    // 📡 CAMBIADO: Inyectamos el "cliente" del microservicio
    // en lugar del servicio local.
    @Inject('PAGOS_SERVICE') private clientPagos: ClientProxy,
  ) {}

  // Nuevo método para crear un pago y preferencia en Mercado Pago
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const { amount, appointmentId } = createPaymentDto;

    if (!amount || !appointmentId) {
      throw new BadRequestException(
        'Los campos "amount" y "appointmentId" son requeridos.',
      );
    }

    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException(
        `No se encontró la cita con el ID: ${appointmentId}`,
      );
    }

    const paymentTitle =
      appointment.services && appointment.services.length > 0
        ? appointment.services.join(', ')
        : `Pago de Cita`;

    try {
      // 🚚 ESTE ES EL GRAN CAMBIO
      // Ya no llamamos a 'this.mercadoPagoService.createPreference'

      // 1. Preparamos los datos para enviar al microservicio
      const preferenceData = {
        id: appointmentId,
        title: paymentTitle,
        price: Number(appointment.totalPrice),
        quantity: 1,
      };

      // 2. Enviamos el mensaje 'crear_preferencia_mp' al microservicio
      //    y esperamos la respuesta.
      const preference = await firstValueFrom(
        this.clientPagos.send('crear_preferencia_mp', preferenceData),
      );

      // 3. El resto del código sigue igual...
      // Opcional: Guardar el pago en la base de datos
      const newPayment = new this.paymentModel({
        ...createPaymentDto,
        paymentId: preference.preferenceId, // Usamos la respuesta del microservicio
        paymentUrl: preference.initPoint, // Usamos la respuesta del microservicio
        status: 'pending',
        createdAt: new Date(),
      });
      await newPayment.save();

      return {
        preference_id: preference.preferenceId,
        preference_url: preference.initPoint,
        status: 'pending',
      };
    } catch (error) {
      console.error('❌ Error al contactar microservicio de pagos:', error);
      throw new NotFoundException(
        'No se pudo crear la preferencia de pago (microservicio).',
      );
    }
  }

  // ===================================================================
  // TODOS LOS MÉTODOS DE AQUÍ PARA ABAJO NO SE TOCAN
  // Siguen funcionando igual porque solo leen tu base de datos local.
  // ===================================================================

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

  async getPaymentsByProfessional(professionalId: string): Promise<Payment[]> {
    return await this.paymentModel
      .find({ professionalId: new Types.ObjectId(professionalId) })
      .populate('clientId', 'name email')
      .populate('appointmentId', 'date status')
      .sort({ paymentDate: -1 })
      .exec();
  }

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

  async getMyPayments(professionalId: string) {
    try {
      if (!Types.ObjectId.isValid(professionalId)) {
        throw new BadRequestException('El ID del profesional no es válido.');
      }

      const professionalObjectId = new Types.ObjectId(professionalId);

      const allPayments = await this.paymentModel
        .find({
          professionalId: professionalObjectId,
        })
        .populate('clientId', 'name email')
        .exec();

      console.log('🔍 SERVICE - Pagos encontrados:', allPayments.length);

      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(
        new Date(now).setDate(now.getDate() - now.getDay()),
      ).setHours(0, 0, 0, 0);
      const monthStart = new Date(
        new Date(now).getFullYear(),
        now.getMonth(),
        1,
      );

      const completedPayments = allPayments.filter(
        (p) => p.status === 'completed',
      );
      const pendingPayments = allPayments.filter((p) => p.status === 'pending');

      const stats = {
        totalIncome: completedPayments.reduce(
          (sum, p) => sum + (p.netAmount || 0),
          0,
        ),
        thisMonth: completedPayments
          .filter((p) => p.paymentDate >= monthStart)
          .reduce((sum, p) => sum + (p.netAmount || 0), 0),
        thisWeek: completedPayments
          .filter((p) => p.paymentDate >= new Date(weekStart))
          .reduce((sum, p) => sum + (p.netAmount || 0), 0),
        today: completedPayments
          .filter((p) => p.paymentDate >= todayStart)
          .reduce((sum, p) => sum + (p.netAmount || 0), 0),
        totalCommissions: allPayments.reduce(
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
        payments: allPayments,
        stats,
      };
    } catch (error) {
      console.error('❌ SERVICE Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }
}
