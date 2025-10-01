/* import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Professional extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  specialty: string;

  @Prop()
  rating: number;
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Professional extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  specialty: string;

  @Prop()
  rating: number;

  @Prop({ required: true }) //Agregamos este prop por que nos olvidamos
  password: string;

  @Prop({ required: true, default: 60 }) // duración en minutos
  appointmentDuration: number;

  @Prop({ required: true }) //por las dudas
  userType: string;

  @Prop()
  description: string;

  @Prop([String])
  images: string[];
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
