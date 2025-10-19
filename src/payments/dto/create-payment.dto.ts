import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsMongoId,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  professionalId: string;

  @IsString()
  appointmentId: string;

  @IsString()
  clientId: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsNumber()
  netAmount: number;

  @IsOptional()
  @IsEnum(['cash', 'card', 'transfer', 'digital'])
  paymentMethod?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  status?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: Date;

  @IsOptional()
  @IsDateString()
  serviceDate?: Date;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
