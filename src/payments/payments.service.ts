import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment } from '../appointments/schemas/appointment.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  // Nuevo método para crear un pago y preferencia en Mercado Pago
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    // El DTO puede no tener 'title', así que lo manejamos como opcional.
    const { amount, appointmentId } = createPaymentDto;

    if (!amount || !appointmentId) {
      throw new BadRequestException(
        'Los campos "amount" y "appointmentId" son requeridos.',
      );
    }

    // 1. Buscar la cita en la base de datos usando el ID proporcionado.
    const appointment = await this.appointmentModel.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundException(
        `No se encontró la cita con el ID: ${appointmentId}`,
      );
    }

    // 2. Construir el título a partir de los servicios de la cita encontrada.
    const paymentTitle =
      appointment.services && appointment.services.length > 0
        ? appointment.services.join(', ')
        : `Pago de Cita`;

    try {
      const preference = await this.mercadoPagoService.createPreference({
        id: appointmentId, // Pasamos el ID de la cita como ID del item
        title: paymentTitle,
        price: Number(appointment.totalPrice), // Usar el precio de la cita para mayor seguridad
        quantity: 1,
      });

      // Opcional: Guardar el pago en la base de datos
      const newPayment = new this.paymentModel({
        ...createPaymentDto,
        paymentId: preference.preferenceId,
        paymentUrl: preference.initPoint,
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
      console.error('❌ Error creando preferencia Mercado Pago:', error);
      // Re-lanzar un error de NestJS para que el controlador lo maneje adecuadamente
      throw new NotFoundException(
        'No se pudo crear la preferencia de pago con Mercado Pago.',
      );
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
      if (!Types.ObjectId.isValid(professionalId)) {
        throw new BadRequestException('El ID del profesional no es válido.');
      }

      const professionalObjectId = new Types.ObjectId(professionalId);

      const allPayments = await this.paymentModel.find({
        professionalId: professionalObjectId,
      });

      console.log('🔍 SERVICE - Pagos encontrados:', allPayments.length);

      // Calcular stats
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(
        now.setDate(now.getDate() - now.getDay()),
      ).setHours(0, 0, 0, 0);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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
