import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfessionalsModule } from './professionals/professionals.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // <--- AGREGAR ESTA LÍNEA
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Clave secreta para firmar los tokens
      signOptions: { expiresIn: '1h' }, // Duración del token
    }),
    ProfessionalsModule,
    AppointmentsModule,
    UsersModule,
    AuthModule, // <--- AGREGAR ESTA LÍNEA
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
