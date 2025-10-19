import { Type } from 'class-transformer';
/* import { ValidateNested } from 'class-validator'; */

import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsObject,
  Min,
  Max,
  IsArray,
  IsUrl,
  IsNotEmpty,
  MinLength,
  ValidateNested,
  IsEnum,
} from 'class-validator';

export class LocationDto {
  @IsString()
  address: string;

  @IsString()
  @IsOptional()
  branchName?: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}

export class CreateProfessionalDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  readonly specialty: string;

  @IsEnum(['local', 'home'])
  @IsOptional()
  readonly modality?: 'local' | 'home';

  @IsOptional()
  @IsString()
  readonly userType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  readonly rating?: number;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  readonly appointmentDuration?: number;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  readonly images?: string[];

  // AÑADE ESTA PROPIEDAD
  @IsArray()
  @ValidateNested({ each: true }) // Valida cada objeto dentro del array
  @Type(() => LocationDto)
  locations: LocationDto[];
}
