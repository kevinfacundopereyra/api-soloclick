import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Professional', required: true })
  professionalId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: Number })
  duration: number; // en minutos

  @Prop({ required: true })
  category: string;

  @Prop({ default: true })
  isActive: boolean;

  // Timestamps automáticos: createdAt, updatedAt
}

export const ServiceSchema = SchemaFactory.createForClass(Service);