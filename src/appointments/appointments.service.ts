import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './schemas/appointment.schema';
import { Professional } from '../professionals/schemas/professional.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/schemas/user.schema'; // Si tienes modelo de usuario

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('Professional')
    private readonly professionalModel: Model<Professional>,
    @InjectModel('User')
    private readonly userModel: Model<User>, // Si tienes modelo de usuario
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel
      .find()
      .populate('professional', 'name specialty city') // ✅ Datos del profesional
      .populate('services', 'name price duration')     // ✅ Datos de los servicios
      .exec();
  }

  async findByClient(clientId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({
        clientId: clientId, // o client: clientId según tu modelo
      })
      .populate('professional', 'name specialty city')
      .populate('services', 'name price duration')
      .exec();
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const professional = await this.professionalModel.findById(
      createAppointmentDto.professionalId,
    );
    if (!professional) {
      throw new NotFoundException('Professional not found');
    }

    // Verificar si hay superposición de citas en la misma fecha
    const appointmentDate = new Date(createAppointmentDto.date);
    const [hours, minutes] = createAppointmentDto.time.split(':').map(Number);
    const appointmentTime = hours * 60 + minutes; // Convertir a minutos
    const endTime = appointmentTime + createAppointmentDto.totalDuration;

    const overlapping = await this.appointmentModel.findOne({
      professional: createAppointmentDto.professionalId,
      date: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      $expr: {
        $let: {
          vars: {
            existingTime: {
              $add: [
                { $multiply: [{ $toInt: { $substr: ['$time', 0, 2] } }, 60] },
                { $toInt: { $substr: ['$time', 3, 2] } },
              ],
            },
            existingEndTime: {
              $add: [
                {
                  $add: [
                    {
                      $multiply: [{ $toInt: { $substr: ['$time', 0, 2] } }, 60],
                    },
                    { $toInt: { $substr: ['$time', 3, 2] } },
                  ],
                },
                '$totalDuration',
              ],
            },
          },
          in: {
            $or: [
              {
                $and: [
                  { $lte: ['$$existingTime', appointmentTime] },
                  { $gt: ['$$existingEndTime', appointmentTime] },
                ],
              },
              {
                $and: [
                  { $lt: ['$$existingTime', endTime] },
                  { $gte: ['$$existingEndTime', endTime] },
                ],
              },
              {
                $and: [
                  { $gte: ['$$existingTime', appointmentTime] },
                  { $lte: ['$$existingEndTime', endTime] },
                ],
              },
            ],
          },
        },
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'El profesional ya tiene una cita en ese horario',
      );
    }

    const appointment = new this.appointmentModel({
      user: createAppointmentDto.user,
      professional: createAppointmentDto.professionalId,
      services: createAppointmentDto.services,
      date: new Date(createAppointmentDto.date), // Solo la fecha
      time: createAppointmentDto.time, // La hora por separado
      totalPrice: createAppointmentDto.totalPrice,
      totalDuration: createAppointmentDto.totalDuration,
      notes: createAppointmentDto.notes,
      status: 'scheduled',
    });

    const saved = await appointment.save();

    // Buscar emails para notificaciones
    if (saved.user) {
      const user = await this.userModel.findById(saved.user);
      if (user?.email) {
        await this.notificationsService.notifyUser(
          user.email,
          'Tu cita fue agendada correctamente.',
        );
      }
    }

    if (professional?.email) {
      await this.notificationsService.notifyProfessional(
        professional.email,
        'Tienes una nueva cita agendada.',
      );
    }

    return saved;
  }

  async remove(id: string): Promise<Appointment> {
    const deleted = await this.appointmentModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Appointment not found');
    }
    return deleted;
  }

  async findByProfessional(professionalId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({ professional: professionalId })
      .populate('professional', 'name specialty city')
      .populate('services', 'name price duration')
      .exec();
  }
}
