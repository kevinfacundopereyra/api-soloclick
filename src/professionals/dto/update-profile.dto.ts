import {
  IsOptional,
  IsString,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { LocationDto } from './create-professional.dto'; // Reutilizamos el DTO de ubicación
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  workingHours?: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional() // 👈 ¡Esta es la clave! Hace que el campo no sea obligatorio.
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations?: LocationDto[]; // El '?' también indica que es opcional en TypeScript.
}
