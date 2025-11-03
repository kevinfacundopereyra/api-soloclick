// src/reviews/reviews.service.ts

import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // <-- Types es necesario
import { Review } from './review.schema';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(@InjectModel(Review.name) private reviewModel: Model<Review>) {}

  async create(
    professionalId: string,
    userId: string,
    userName: string,
    rating: number,
    comment: string,
  ): Promise<Review> {
    this.logger.debug(
      `Intentando crear Review. Prof ID: ${professionalId}, User ID: ${userId}`,
    );

    try {
      if (
        !Types.ObjectId.isValid(professionalId) ||
        !Types.ObjectId.isValid(userId)
      ) {
        throw new BadRequestException(
          'ID de profesional o usuario no tiene un formato válido.',
        );
      }

      const professionalObjectId = new Types.ObjectId(professionalId);
      const userObjectId = new Types.ObjectId(userId);

      const newReview = new this.reviewModel({
        professionalId: professionalObjectId,
        userId: userObjectId,
        userName,
        rating,
        comment,
      });

      const savedReview = await newReview.save();
      this.logger.log(`Reseña creada con éxito. ID: ${savedReview._id}`);
      return savedReview;
    } catch (error) {
      this.logger.error(
        'Error FATAL al guardar la reseña en la DB:',
        error.stack || error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error interno al procesar la reseña en la base de datos.',
      );
    }
  }

  // 🚨 FUNCIÓN CORREGIDA PARA OBTENER RESEÑAS
  async findByProfessionalId(professionalId: string): Promise<Review[]> {
    try {
      // 1. Validamos la cadena ID antes de la conversión
      if (!Types.ObjectId.isValid(professionalId)) {
        this.logger.warn(`ID de profesional inválido: ${professionalId}`);
        return []; // Devolvemos un array vacío si el ID no es válido
      }

      // 2. CONVERTIMOS LA CADENA A OBJECTID
      const professionalObjectId = new Types.ObjectId(professionalId);

      // 3. BUSCAMOS usando el ObjectId
      const reviews = await this.reviewModel
        .find({ professionalId: professionalObjectId })
        .exec();

      this.logger.log(
        `[QUERY SUCCESS] Se encontraron ${reviews.length} reseñas.`,
      );
      return reviews;
    } catch (error) {
      this.logger.error(
        'Error al buscar reseñas por ID de profesional:',
        error,
      );
      // Devolvemos array vacío en lugar de lanzar una excepción para no romper el Promise.all en el frontend
      return [];
    }
  }
}
