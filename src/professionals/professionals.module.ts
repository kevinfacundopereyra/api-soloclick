import { Module } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';
import { ProfessionalsController } from './professionals.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Professional,
  ProfessionalSchema,
} from './schemas/professional.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Professional.name, schema: ProfessionalSchema },
    ]),
  ],
  providers: [ProfessionalsService],
  controllers: [ProfessionalsController],
  exports: [ProfessionalsService], // ← Exportar el servicio para que otros módulos puedan usarlo
})
export class ProfessionalsModule {}
