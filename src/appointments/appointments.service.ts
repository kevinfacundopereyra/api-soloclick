/* import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }

  async create(createAppointmentDto: any): Promise<Appointment> {
    const createdAppointmentDto = new this.appointmentModel(
      createAppointmentDto,
    );
    return createdAppointmentDto.save();
  }
 }
 */

/* 
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';
import { Professional } from '../professionals/schemas/professional.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('Professional')
    private readonly professionalModel: Model<Professional>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const professional = await this.professionalModel.findById(
      createAppointmentDto.professional,
    );

    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    const appointment = new this.appointmentModel({
      ...createAppointmentDto,
      duration: professional.appointmentDuration, // 👈 ya queda guardada
    });

    return appointment.save();
  }
 }
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';
import { Professional } from '../professionals/schemas/professional.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('Professional')
    private readonly professionalModel: Model<Professional>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const professional = await this.professionalModel.findById(createAppointmentDto.professional);
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    // Calcular inicio y fin de la cita
    const startDate = new Date(createAppointmentDto.date);
    const endDate = new Date(startDate.getTime() + professional.appointmentDuration * 60000);

    // Verificar si hay superposición de citas
    const overlapping = await this.appointmentModel.findOne({
      professional: createAppointmentDto.professional,
      $or: [
        {
          date: { $lt: endDate },
          $expr: {
            $gte: [
              { $add: ['$date', professional.appointmentDuration * 60000] },
              startDate,
            ],
          },
        },
      ],
    });

    if (overlapping) {
      throw new ConflictException('El profesional ya tiene una cita en ese horario');
    }

    const appointment = new this.appointmentModel({
      ...createAppointmentDto,
      duration: professional.appointmentDuration,
    });

    return appointment.save();
  }

  async remove(id: string): Promise<Appointment> {
    const deleted = await this.appointmentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Appointment not found');
    }
    return deleted;
  }

  async findByProfessional(professionalId: string): Promise<Appointment[]> {
    return this.appointmentModel.find({ professional: professionalId }).exec();
  }
}