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

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsString()
  readonly city?: string;

  @IsOptional()
  @IsString()
  readonly specialty?: string;

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
}
