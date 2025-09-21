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
