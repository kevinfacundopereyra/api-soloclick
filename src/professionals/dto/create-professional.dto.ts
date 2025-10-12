import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsUrl,
} from 'class-validator';

export class CreateProfessionalDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly phone: string;

  @IsString()
  readonly city: string;

  @IsString()
  readonly specialty: string;

  @IsString()
  readonly password: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  readonly rating?: number;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  readonly images?: string[];

  @IsOptional()
  @IsNumber()
  readonly appointmentDuration?: number;

  @IsOptional()
  @IsString()
  readonly userType?: string;
}
