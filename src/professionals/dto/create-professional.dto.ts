import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsUrl,
  IsNotEmpty,
  MinLength,
  IsEnum,
} from 'class-validator';

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
  @IsNotEmpty()
  readonly modality: 'local' | 'home';

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
}
