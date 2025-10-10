import {
  IsMongoId,
  IsDateString,
  IsOptional,
  IsArray,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsOptional()
  @IsMongoId()
  readonly user?: string; // ID del usuario (opcional, se puede obtener del token)

  @IsString()
  professionalId: string;

  @IsOptional()
  @IsString()
  clientId?: string; // ✅ Campo opcional que envía el frontend

  @IsOptional()
  @IsString()
  userId?: string; // ✅ Campo interno del backend

  @IsArray()
  services: string[];

  @IsDateString()
  date: string;

  @IsString()
  time: string; // ✅ Campo obligatorio

  @IsNumber()
  totalPrice: number;

  @IsNumber()
  totalDuration: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
