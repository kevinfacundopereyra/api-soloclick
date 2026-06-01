import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Review } from './review.schema';
import { Professional } from '../professionals/schemas/professional.schema';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Professional.name) private professionalModel: Model<Professional>,
  ) {}

  private async updateProfessionalRating(professionalId: string) {
    if (!ObjectId.isValid(professionalId)) {
      this.logger.warn(`No se puede actualizar el rating, ID inválido: ${professionalId}`);
      return;
    }

    const professionalObjectId = new ObjectId(professionalId);
    const aggregation = await this.reviewModel
      .aggregate([
        { $match: { professionalId: professionalObjectId } },
        {
          $group: {
            _id: '$professionalId',
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ])
      .exec();

    const avgRating = aggregation.length > 0 ? aggregation[0].avgRating : null;

    await this.professionalModel.findByIdAndUpdate(professionalId, {
      rating: avgRating,
    });
  }

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
        !ObjectId.isValid(professionalId) ||
        !ObjectId.isValid(userId)
      ) {
        throw new BadRequestException(
          'ID de profesional o usuario no tiene un formato válido.',
        );
      }

      const professionalObjectId = new ObjectId(professionalId);
      const userObjectId = new ObjectId(userId);

      const newReview = new this.reviewModel({
        professionalId: professionalObjectId,
        userId: userObjectId,
        userName,
        rating,
        comment,
      });

      const savedReview = await newReview.save();
      this.logger.log(`Reseña creada con éxito. ID: ${savedReview._id}`);

      await this.updateProfessionalRating(professionalId);

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
      if (!ObjectId.isValid(professionalId)) {
        this.logger.warn(`ID de profesional inválido: ${professionalId}`);
        return []; // Devolvemos un array vacío si el ID no es válido
      }

      // 2. CONVERTIMOS LA CADENA A OBJECTID
      const professionalObjectId = new ObjectId(professionalId);

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
