import {
  Controller,
  Post,
  Body,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  async createPreference(
    @Body() createPaymentDto: CreatePaymentDto,
    @Res() res: Response,
  ) {
    console.log('POST /payments/create-preference body:', createPaymentDto);

    try {
      const preference =
        await this.paymentsService.createPayment(createPaymentDto);
      console.log('✅ Preference creada:', preference);

      return res.status(200).json({
        preference_id: preference.preference_id,
        preference_url: preference.preference_url,
      });
    } catch (error: any) {
      console.error('❌ Error creando preferencia (controller):', error);
      const statusCode =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      return res
        .status(statusCode)
        .json({ message: error.message, details: error.response });
    }
  }
}
