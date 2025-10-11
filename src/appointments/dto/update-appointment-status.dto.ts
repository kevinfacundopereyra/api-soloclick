import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'completed', 'scheduled'], {
    message: 'Status must be: pending, confirmed, cancelled, completed, or scheduled'
  })
  readonly status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'scheduled';
}