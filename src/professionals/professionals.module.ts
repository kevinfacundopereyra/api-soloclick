import { Module } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsController } from './professionals.controller';

@Module({
  providers: [ProfessionalsService],
  controllers: [ProfessionalsController]
})
export class ProfessionalsModule {}
