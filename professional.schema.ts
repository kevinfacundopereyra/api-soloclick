import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsString, MaxLength, IsOptional } from 'class-validator';

export type ProfessionalDocument = Professional & Document;

@Schema({ timestamps: true })
export class Professional {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  specialty: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] })
  services: Types.ObjectId[];

  @Prop({
    type: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }],
    },
  })
  availability: Record<
    string,
    {
      start: string;
      end: string;
    }[]
  >;

  @Prop({ type: String, maxlength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  review?: string;

  @Prop()
  photo?: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalRatings: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;
}

export const ProfessionalSchema = SchemaFactory.createForClass(Professional);
