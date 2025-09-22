import { Controller, Post, Param, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initial/:appointmentId')
  async payInitial(
    @Param('appointmentId') appointmentId: string,
    @Body('amount') amount: number,
    @Body('userEmail') userEmail: string,
  ) {
    return await this.paymentsService.createInitialPayment(appointmentId, amount, userEmail);
  }

  @Post('refund/:paymentId')
  async refund(
    @Param('paymentId') paymentId: string,
  ) {
    return await this.paymentsService.refundPayment(paymentId);
  }

  @Post('final/:appointmentId')
  async payFinal(
    @Param('appointmentId') appointmentId: string,
    @Body('amount') amount: number,
    @Body('userEmail') userEmail: string,
  ) {
    return await this.paymentsService.createFinalPayment(appointmentId, amount, userEmail);
  }
}
