/* import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Professional', required: true })
  professional: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ default: false })
  booked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Professional', required: true })
  professional: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ default: false })
  booked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user?: string;

  @Prop({ required: true }) // duración en minutos
  duration: number;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
