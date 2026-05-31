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

  @Prop({
    type: [
      {
        cardNumber: String,
        cardholderName: String,
        expiryDate: String,
        cvv: String,
        savedAt: Date,
      },
    ],
    default: [],
  })
  paymentMethods: Array<{
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
    savedAt: Date;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
