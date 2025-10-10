import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Appointment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user?: string; // Opcional porque puede ser un invitado

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  clientId: string;

  @Prop({ type: Types.ObjectId, ref: 'Professional', required: true })
  professional: string;

  @Prop([String]) // Array de servicios
  services: string[];

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true }) // Hora en formato string "14:30"
  time: string; // Formato "14:30"

  @Prop({ required: true })
  totalDuration: number; // Duración total en minutos

  @Prop({ required: true })
  totalPrice: number; // Precio total

  @Prop()
  notes?: string; // Notas opcionales

  @Prop({ default: 'scheduled' })
  status: 'scheduled' | 'completed' | 'cancelled';

  @Prop({ default: 'pending' })
  paymentStatus: 'pending' | 'paid_initial' | 'refunded' | 'paid_full';

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop()
  mercadoPagoInitId?: string;

  @Prop()
  mercadoPagoFinalId?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
