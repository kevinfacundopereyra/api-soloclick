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

import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    createProfessionalDto: CreateProfessionalDto,
  ): Promise<Professional> {
    try {
      // Crear un objeto con los valores por defecto
      const professionalData = {
        ...createProfessionalDto,
        userType: createProfessionalDto.userType || 'profesional',
        appointmentDuration: createProfessionalDto.appointmentDuration || 60, // 60 minutos por defecto
      };

      const professional = new this.professionalModel(professionalData);
      return professional.save();
    } catch (error) {
      console.error('Error en create professional:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Professional | null> {
    return this.professionalModel.findOne({ email }).exec();
  }

  async update(
    id: string,
    updateProfessionalDto: CreateProfessionalDto,
  ): Promise<Professional> {
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
