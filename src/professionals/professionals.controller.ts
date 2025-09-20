import { Controller, Post, Body, Get } from '@nestjs/common';
import { ProfessionalsService } from './professionals.service';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Post()
  create(@Body() createProfessionalDto: any) {
    return this.professionalsService.create(createProfessionalDto);
  }
}
