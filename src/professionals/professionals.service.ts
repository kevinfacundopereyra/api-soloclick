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

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Professional } from './schemas/professional.schema';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectModel('Professional')
    private readonly professionalModel: Model<Professional>,
  ) {}

  async findAll(): Promise<Professional[]> {
    return this.professionalModel.find().exec();
  }

  async findByEmail(email: string): Promise<Professional | null> {
    try {
      return await this.professionalModel.findOne({ email }).exec();
    } catch (error) {
      throw new BadRequestException('Error finding professional by email');
    }
  }

  async findById(id: string): Promise<Professional> {
    const professional = await this.professionalModel.findById(id);
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }
    return professional;
  }

  // 09/10 Brian para filtrar profesionales por especialidad
  async findBySpecialty(specialty: string): Promise<Professional[]> {
    const professionals = await this.professionalModel.find({ specialty });
    if (!professionals || professionals.length === 0) {
      throw new NotFoundException('No professionals found for the given specialty');
    }
    return professionals;
  }

  // 15/10 Filtrar profesionales por modalidad (local/home)
  async findByModality(modality: 'local' | 'home'): Promise<Professional[]> {
    const professionals = await this.professionalModel.find({ modality });
    if (!professionals || professionals.length === 0) {
      throw new NotFoundException('No professionals found for the given modality');
    }
    return professionals;
  }

  // 15/10 Filtrar profesionales por especialidad y modalidad
  async findBySpecialtyAndModality(specialty: string, modality: 'local' | 'home'): Promise<Professional[]> {
    const professionals = await this.professionalModel.find({ specialty, modality });
    if (!professionals || professionals.length === 0) {
      throw new NotFoundException('No professionals found for the given specialty and modality');
    }
    return professionals;
  }

  async create(
    createProfessionalDto: CreateProfessionalDto,
  ): Promise<{ professional: Professional; token: string }> {
    try {
      // Verificar si el email ya existe (si se proporciona)
      if (createProfessionalDto.email) {
        const existingProfessional = await this.professionalModel.findOne({
          email: createProfessionalDto.email,
        });
        if (existingProfessional) {
          throw new ConflictException('Email already exists');
        }
      }

      // Asignar automáticamente userType como 'profesional' y appointmentDuration por defecto
      const professionalData = {
        ...createProfessionalDto,
        userType: 'profesional',
        appointmentDuration: createProfessionalDto.appointmentDuration || 60,
      };

      const professional = new this.professionalModel(professionalData);
      const savedProfessional = await professional.save();

      // Generar token JWT después del registro exitoso
      const token = jwt.sign(
        {
          sub: savedProfessional._id,
          name: savedProfessional.name,
          userType: savedProfessional.userType,
          email: savedProfessional.email,
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1d' },
      );

      return { professional: savedProfessional, token };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        'Error creating professional: ' + error.message,
      );
    }
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

  // Método para obtener el perfil del profesional logueado
  async getProfile(id: string): Promise<Professional> {
    try {
      const professional = await this.professionalModel.findById(id);
      if (!professional) {
        throw new NotFoundException('Professional not found');
      }
      return professional;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error retrieving profile');
    }
  }

  // Método para actualizar el perfil del profesional
  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<Professional> {
    try {
      const updateData: any = {};
      
      // Actualizar campos directos del perfil
      if (updateProfileDto.description !== undefined) {
        updateData.description = updateProfileDto.description;
      }
      if (updateProfileDto.address !== undefined) {
        updateData.address = updateProfileDto.address;
      }
      if (updateProfileDto.workingHours) {
        updateData.workingHours = updateProfileDto.workingHours;
      }
      if (updateProfileDto.images) {
        updateData.images = updateProfileDto.images;
      }

      // Verificar si el perfil está completo
      const professional = await this.professionalModel.findById(id);
      if (professional) {
        const isComplete = !!(
          (updateProfileDto.description || professional.description) &&
          (updateProfileDto.address || professional.address) &&
          (updateProfileDto.workingHours || professional.workingHours)
        );
        updateData.profileCompleted = isComplete;
      }

      const updated = await this.professionalModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!updated) {
        throw new NotFoundException('Professional not found');
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating profile: ' + error.message);
    }
  }

  // Método para subir imágenes al perfil
  async uploadProfileImages(id: string, files: any[]): Promise<Professional> {
    try {
      // Aquí deberías implementar la lógica para subir archivos
      // Por ahora, simularemos que los archivos se suben y devolvemos URLs
      const imageUrls = files.map(file => `/uploads/${file.filename}`);

      const updated = await this.professionalModel.findByIdAndUpdate(
        id,
        { 
          $push: { images: { $each: imageUrls } }
        },
        { new: true }
      );

      if (!updated) {
        throw new NotFoundException('Professional not found');
      }

      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error uploading images: ' + error.message);
    }
  }
}
