/* import { IsMongoId, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  professional: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsMongoId()
  user?: string;
} */

import { IsMongoId, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  readonly user: string; // ID del usuario
  readonly professional: string; // ID del profesional
  readonly date: Date; // Fecha y hora de la cita
}
