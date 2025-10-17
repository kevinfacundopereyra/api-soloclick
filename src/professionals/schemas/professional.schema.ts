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

@Schema({ timestamps: true })
export class Professional extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  specialty: string;

  @Prop({ 
    required: true, 
    enum: ['local', 'home'],
    default: 'local'
  })
  modality: 'local' | 'home';

  @Prop({ default: 'professional' })
  userType: string;

  @Prop({ default: 60 }) // duración en minutos
  appointmentDuration: number;

  // Campos adicionales del perfil como propiedades directas
  @Prop()
  description: string;

  @Prop()
  address: string;

  @Prop({
    type: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    },
    default: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: { open: '', close: '' }
    }
  })
  workingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };

  @Prop([String])
  images: string[];

  @Prop({ default: false })
  profileCompleted: boolean;

  // NUEVOS CAMPOS PARA PERFIL COMPLETO
  @Prop({
    type: {
      description: String,
      address: String,
      workingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
      },
      images: [String],
      isProfileComplete: { type: Boolean, default: false }
    },
    default: {
      isProfileComplete: false,
      workingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '15:00' },
        sunday: { open: '', close: '' }
      }
    }
  })
  profile: {
    description?: string;
    address?: string;
    workingHours?: any;
    images?: string[];
    isProfileComplete: boolean;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
