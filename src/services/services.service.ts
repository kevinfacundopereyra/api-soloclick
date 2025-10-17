import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<Service>,
  ) {}

  // GET /services/my-services - Servicios del profesional logueado
  async getMyServices(professionalId: string): Promise<Service[]> {
    try {
      return await this.serviceModel.find({ professionalId }).exec();
    } catch (error) {
      throw new BadRequestException('Error retrieving services');
    }
  }

  // POST /services - Crear nuevo servicio
  async create(professionalId: string, createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const serviceData = {
        ...createServiceDto,
        professionalId,
        isActive: createServiceDto.isActive ?? true,
      };

      const service = new this.serviceModel(serviceData);
      return await service.save();
    } catch (error) {
      throw new BadRequestException('Error creating service: ' + error.message);
    }
  }

  // PUT /services/:id - Actualizar servicio
  async update(id: string, professionalId: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    try {
      const service = await this.serviceModel.findOneAndUpdate(
        { _id: id, professionalId }, // Solo puede actualizar sus propios servicios
        updateServiceDto,
        { new: true }
      );

      if (!service) {
        throw new NotFoundException('Service not found or not authorized');
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating service: ' + error.message);
    }
  }

  // DELETE /services/:id - Eliminar servicio
  async remove(id: string, professionalId: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findOneAndDelete({
        _id: id,
        professionalId
      });

      if (!service) {
        throw new NotFoundException('Service not found or not authorized');
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting service: ' + error.message);
    }
  }

  // PATCH /services/:id/status - Cambiar estado activo/inactivo
  async updateStatus(id: string, professionalId: string, isActive: boolean): Promise<Service> {
    try {
      const service = await this.serviceModel.findOneAndUpdate(
        { _id: id, professionalId },
        { isActive },
        { new: true }
      );

      if (!service) {
        throw new NotFoundException('Service not found or not authorized');
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating service status: ' + error.message);
    }
  }

  // GET /services/professional/:professionalId - Para clientes (ver servicios de un profesional)
  async getServicesByProfessional(professionalId: string): Promise<Service[]> {
    try {
      return await this.serviceModel.find({ 
        professionalId, 
        isActive: true 
      }).exec();
    } catch (error) {
      throw new BadRequestException('Error retrieving professional services');
    }
  }

  // GET /services/category/:category - Para clientes (buscar por categoría)
  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      return await this.serviceModel.find({ 
        category, 
        isActive: true 
      }).populate('professionalId', 'name email city specialty').exec();
    } catch (error) {
      throw new BadRequestException('Error retrieving services by category');
    }
  }

  // GET /services/:id - Para clientes (ver servicio específico)
  async findById(id: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findOne({ 
        _id: id, 
        isActive: true 
      }).populate('professionalId', 'name email phone city specialty').exec();

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving service');
    }
  }
}