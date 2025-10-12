import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // ============ ENDPOINTS PARA PROFESIONALES (AUTENTICADOS) ============

  // GET /services/my-services - Servicios del profesional logueado
  @Get('my-services')
  @UseGuards(JwtAuthGuard)
  async getMyServices(@Request() req) {
    return this.servicesService.getMyServices(req.user.sub);
  }

  // POST /services - Crear nuevo servicio
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(req.user.sub, createServiceDto);
  }

  // PUT /services/:id - Actualizar servicio
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateServiceDto: UpdateServiceDto
  ) {
    return this.servicesService.update(id, req.user.sub, updateServiceDto);
  }

  // DELETE /services/:id - Eliminar servicio
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    return this.servicesService.remove(id, req.user.sub);
  }

  // PATCH /services/:id/status - Cambiar estado activo/inactivo
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body('isActive') isActive: boolean
  ) {
    return this.servicesService.updateStatus(id, req.user.sub, isActive);
  }

  // ============ ENDPOINTS PÚBLICOS PARA CLIENTES ============

  // GET /services/professional/:professionalId - Ver servicios de un profesional
  @Get('professional/:professionalId')
  async getServicesByProfessional(@Param('professionalId') professionalId: string) {
    return this.servicesService.getServicesByProfessional(professionalId);
  }

  // GET /services/category/:category - Buscar servicios por categoría
  @Get('category/:category')
  async getServicesByCategory(@Param('category') category: string) {
    return this.servicesService.getServicesByCategory(category);
  }

  // GET /services/:id - Ver servicio específico
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }
}