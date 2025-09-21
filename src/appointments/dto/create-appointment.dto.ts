import { IsMongoId, IsDateString, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  professional: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsMongoId()
  user?: string;
}
