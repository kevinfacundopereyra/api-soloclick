import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../appointments/schemas/appointment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
  ) {}

  async createInitialPayment(appointmentId: string, amount: number, userEmail: string) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('La cita no existe');
    }
    // Simulación de pago inicial
    return {
      status: 'success',
      paymentId: 'simulated-initial-' + appointmentId,
      amount,
      userEmail,
      type: 'initial',
      createdAt: new Date(),
    };
  }

  async refundPayment(paymentId: string) {
    // Simulación de reembolso
    return {
      status: 'refunded',
      paymentId,
      refundedAt: new Date(),
    };
  }

  async createFinalPayment(appointmentId: string, amount: number, userEmail: string) {
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
}
