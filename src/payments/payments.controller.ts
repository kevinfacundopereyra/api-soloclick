import { Controller, Post, Param, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
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

  // Crear un nuevo pago
  @Post()
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.createPayment(createPaymentDto);
  }

  // GET /payments/my-payments - Obtener pagos del profesional autenticado
  @Get('my-payments')
  async getMyPayments(@Request() req) {
    try {
      console.log('🔍 === DEBUG DETALLADO ===');
      console.log('🔍 req.user completo:', JSON.stringify(req.user, null, 2));
      console.log('🔍 req.user.id:', req.user.id);
      console.log('🔍 req.user._id:', req.user._id);
      console.log('🔍 req.user.sub:', req.user.sub);
      console.log('🔍 Tipo de req.user.id:', typeof req.user.id);
      
      const professionalId = req.user.id || req.user._id || req.user.sub;
      console.log('🔍 professionalId usado para buscar:', professionalId);
      console.log('🔍 Tipo de professionalId:', typeof professionalId);
      
      // ✅ AGREGAR: Buscar todos los pagos primero
      const allPayments = await this.paymentsService.getAllPayments();
      console.log('🔍 Total pagos en DB:', allPayments.length);
      
      if (allPayments.length > 0) {
        console.log('🔍 Primer pago completo:', JSON.stringify(allPayments[0], null, 2));
        console.log('🔍 professionalId del primer pago:', allPayments[0].professionalId);
        console.log('🔍 Tipo del professionalId en DB:', typeof allPayments[0].professionalId);
        console.log('🔍 ¿Son iguales?', allPayments[0].professionalId === professionalId);
        console.log('🔍 ¿Son iguales (string)?', String(allPayments[0].professionalId) === String(professionalId));
      }
      
      // Buscar pagos
      const result = await this.paymentsService.getMyPayments(professionalId);
      console.log('🔍 Resultado final:', {
        success: result.success,
        paymentsCount: result.payments?.length || 0
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Error en getMyPayments:', error);
      throw error;
    }
  }

  // Obtener todos los pagos de un profesional
  @Get('professional/:professionalId')
  async getPaymentsByProfessional(@Param('professionalId') professionalId: string) {
    return await this.paymentsService.getPaymentsByProfessional(professionalId);
  }

  // Obtener estadísticas de pagos de un profesional
  @Get('professional/:professionalId/stats')
  async getPaymentStats(@Param('professionalId') professionalId: string) {
    return await this.paymentsService.getPaymentStatsByProfessional(professionalId);
  }

  // Obtener pagos por método de pago
  @Get('professional/:professionalId/method/:paymentMethod')
  async getPaymentsByMethod(
    @Param('professionalId') professionalId: string,
    @Param('paymentMethod') paymentMethod: string,
  ) {
    return await this.paymentsService.getPaymentsByMethod(professionalId, paymentMethod);
  }

  // Obtener pagos por estado
  @Get('professional/:professionalId/status/:status')
  async getPaymentsByStatus(
    @Param('professionalId') professionalId: string,
    @Param('status') status: string,
  ) {
    return await this.paymentsService.getPaymentsByStatus(professionalId, status);
  }

  // Obtener pagos por rango de fechas
  @Get('professional/:professionalId/date-range')
  async getPaymentsByDateRange(
    @Param('professionalId') professionalId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return await this.paymentsService.getPaymentsByDateRange(professionalId, start, end);
  }
}
