/* import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfessionalsModule } from './professionals/professionals.module';
import { UsersModule } from './users/users.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || ),
    ProfessionalsModule,
    UsersModule,
    AppointmentsModule,
  ],
})
export class AppModule {} */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfessionalsModule } from './professionals/professionals.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    ProfessionalsModule,
    AppointmentsModule,
    UsersModule,
      PaymentsModule,
  ],
  controllers: [AppController], // 👈 tiene que estar aquí
  providers: [AppService],
})
export class AppModule {}
