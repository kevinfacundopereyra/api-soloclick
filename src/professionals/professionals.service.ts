/* import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Professional } from './schemas/professional.schema';
import { CreateProfessionalDto } from './dto/create-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectModel('Professional')
    private readonly professionalModel: Model<Professional>,
  ) {}

  async findAll(): Promise<Professional[]> {
    return this.professionalModel.find().exec();
  }

  async create(
    createProfessionalDto: CreateProfessionalDto,
  ): Promise<Professional> {
    const createdProfessional = new this.professionalModel(
      createProfessionalDto,
    );
    return createdProfessional.save();
  }
}
 */

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Professional } from './schemas/professional.schema';
import { CreateProfessionalDto } from './dto/create-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectModel('Professional')
    private readonly professionalModel: Model<Professional>,
  ) {}

  async findAll(): Promise<Professional[]> {
    return this.professionalModel.find().exec();
  }

  async findById(id: string): Promise<Professional> {
    const professional = await this.professionalModel.findById(id);
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }
    return professional;
  }

  async create(createProfessionalDto: CreateProfessionalDto): Promise<Professional> {
    try {
      // Verificar si el email ya existe (si se proporciona)
      if (createProfessionalDto.email) {
        const existingProfessional = await this.professionalModel.findOne({ 
          email: createProfessionalDto.email 
        });
        if (existingProfessional) {
          throw new ConflictException('Email already exists');
        }
      }

      // Asignar automáticamente userType como 'profesional' y appointmentDuration por defecto
      const professionalData = {
        ...createProfessionalDto,
        userType: 'profesional',
        appointmentDuration: createProfessionalDto.appointmentDuration || 60
      };

      const professional = new this.professionalModel(professionalData);
      return await professional.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error creating professional: ' + error.message);
    }
  }

  async update(id: string, updateProfessionalDto: CreateProfessionalDto): Promise<Professional> {
    const updated = await this.professionalModel.findByIdAndUpdate(
      id,
      updateProfessionalDto,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Professional not found');
    }
    return updated;
  }

  async remove(id: string): Promise<Professional> {
    const deleted = await this.professionalModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Professional not found');
    }
    return deleted;
  }
}