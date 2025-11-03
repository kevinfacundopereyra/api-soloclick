// src/reviews/review.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Usamos el nombre 'Review' para la inyección en MongooseModule
@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Professional' })
  professionalId: Types.ObjectId; // Referencia al profesional

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId; // Referencia al usuario cliente

  @Prop({ required: true })
  userName: string; // Nombre del usuario que reseña (para visualización)

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // Calificación (1 a 5)

  @Prop({ required: true, trim: true, minlength: 10 })
  comment: string; // El texto de la reseña
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
