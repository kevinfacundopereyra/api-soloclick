import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Professional extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  city: string;

  @Prop()
  specialty: string;

  @Prop()
  rating: number;
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
