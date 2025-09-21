import { Injectable } from '@nestjs/common';
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
