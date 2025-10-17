import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [UsersModule, ProfessionalsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
