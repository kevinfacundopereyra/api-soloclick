// src/reviews/reviews.controller.ts
import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Request,
  UseGuards,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';

// Asumiendo que esta es la ruta de tu guardia
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// 🚨 CORRECCIÓN 1: Asegúrate de que el nombre del archivo sea correcto (reviews.service)
import { ReviewsService } from './review.services';
import { CreateReviewDto } from './create-review.dto'; // Asegúrate de que la ruta del DTO es correcta

@Controller('reviews') // Nueva ruta base: /reviews
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  // 🚨 CORRECCIÓN 2: NUEVA RUTA GET MÁS ESPECÍFICA para evitar el 404
  // Ruta final: GET /reviews/by-professional/68f4502c6f811b0a5ad14145
  @Get('by-professional/:professionalId')
  async findByProfessionalId(@Param('professionalId') professionalId: string) {
    // El log confirmó que esta parte se ejecuta correctamente
    this.logger.log(
      `[GET] Buscando reseñas para el profesional ID: ${professionalId}`,
    );

    // El servicio maneja el findByProfessionalId(id) que devuelve las reseñas
    return this.reviewsService.findByProfessionalId(professionalId);
  }

  // RUTA POST - Funciona correctamente para guardar reseñas
  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    // Validamos que el ID de usuario exista en el token
    if (!req.user || !req.user.sub || !req.user.name) {
      throw new InternalServerErrorException(
        'Datos de usuario no encontrados en el token JWT.',
      );
    }

    const userId = req.user.sub;
    const userName = req.user.name;

    this.logger.log(
      `[POST] Recibida reseña. Prof ID: ${createReviewDto.professionalId}. Usuario: ${userName}`,
    );

    try {
      return this.reviewsService.create(
        createReviewDto.professionalId,
        userId,
        userName,
        createReviewDto.rating,
        createReviewDto.comment,
      );
    } catch (error) {
      this.logger.error(
        'Fallo en el controlador al llamar al servicio:',
        error.message,
      );
      throw error;
    }
  }
}
