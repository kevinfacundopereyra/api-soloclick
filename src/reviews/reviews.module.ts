// src/reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsService } from './review.services';
import { ReviewsController } from './review.controller';
import { Review, ReviewSchema } from './review.schema';
// Importa el módulo de autenticación para que JwtAuthGuard funcione, si es necesario.
// import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    // AuthModule, // Descomentar si tu JwtAuthGuard lo requiere
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
