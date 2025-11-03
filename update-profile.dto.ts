import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  workingHours?: any;

  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'La reseña no puede tener más de 150 caracteres' })
  review?: string;

  @IsOptional()
  @IsBoolean()
  isProfileComplete?: boolean;
}
