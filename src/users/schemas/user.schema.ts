import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  //Agregamos este prop por que nos olvidamos
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  userType: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
