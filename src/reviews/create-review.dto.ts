// src/reviews/dto/create-review.dto.ts
import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'El ID del profesional es obligatorio.' })
  @IsString({ message: 'El ID del profesional debe ser una cadena.' })
  professionalId: string; // ID del profesional

  @IsNotEmpty({ message: 'La calificación es obligatoria.' })
  @IsInt({ message: 'La calificación debe ser un número entero.' })
  @Min(1, { message: 'La calificación mínima es 1 estrella.' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas.' })
  rating: number;

  @IsNotEmpty({ message: 'El comentario es obligatorio.' })
  @IsString({ message: 'El comentario debe ser una cadena de texto.' })
  @MinLength(10, {
    message: 'El comentario debe tener al menos 10 caracteres.',
  })
  comment: string;
}
