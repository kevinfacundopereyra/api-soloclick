import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ 
    type: String, 
    ref: 'Professional', 
    required: true 
  })
  professionalId: string;

  @Prop({ 
    type: String, 
    ref: 'Appointment', 
    required: true 
  })
  appointmentId: string;

  @Prop({ 
    type: String, 
    ref: 'User', 
    required: true 
  })
  clientId: string;

  @Prop()
  clientName: string;

  @Prop()
  serviceName: string;

  @Prop({ 
    type: Number, 
    required: true 
  })
  amount: number;

  @Prop({ 
    type: Number, 
    default: 0 
  })
  commission: number;

  @Prop({ 
    type: Number, 
    required: true 
  })
  netAmount: number;

  @Prop({ 
    type: String,
    enum: ['cash', 'card', 'transfer', 'digital'],
    default: 'cash'
  })
  paymentMethod: string;

  @Prop({ 
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  })
  status: string;

  @Prop({ 
    type: Date, 
    default: Date.now 
  })
  paymentDate: Date;

  @Prop({ type: Date })
  serviceDate: Date;

  @Prop()
  city: string;

  @Prop()
  notes: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);