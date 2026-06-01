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
      .populate('services', 'name price duration') // ✅ Datos de los servicios
      .exec();
  }

  async findByClient(clientId: string): Promise<Appointment[]> {
    return this.appointmentModel
      .find({
        user: clientId, // ✅ Buscar por 'user' (que es donde se guarda)
      })
      .populate('professional', 'name specialty city')
      .populate('services', 'name price duration')
      .exec();
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    console.log('🔍 [AppointmentService.create] Iniciando creación de cita');
    console.log('📋 [AppointmentService.create] Datos recibidos:', JSON.stringify(createAppointmentDto, null, 2));
    
    const professional = await this.professionalModel.findById(
      createAppointmentDto.professionalId,
    );
    
    if (!professional) {
      console.error('❌ [AppointmentService.create] Profesional no encontrado:', createAppointmentDto.professionalId);
      throw new NotFoundException('Professional not found');
    }
    
    console.log('✅ [AppointmentService.create] Profesional encontrado:', professional.name, 'Email:', professional.email);

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
      status: 'pending',
    });

    console.log('📝 [AppointmentService.create] Appointment object to save:', {
      user: appointment.user,
      professional: appointment.professional,
      date: appointment.date,
      time: appointment.time,
    });

    console.log('💾 [AppointmentService.create] Guardando cita en BD...');
    const saved = await appointment.save();
    console.log('✅ [AppointmentService.create] Cita guardada:', saved._id);
    console.log('✅ [AppointmentService.create] Usuario en cita guardada:', saved.user);

    // ✅ AGREGAR - Enviar notificaciones mejoradas
    try {
      console.log('📧 [AppointmentService.create] Iniciando envío de notificaciones...');
      
      // Notificación al profesional (SIEMPRE se envía)
      if (professional?.email) {
        console.log('✅ [AppointmentService.create] Professional tiene email:', professional.email);
        console.log('📧 Enviando notificación de nueva cita al profesional...');
        const professionalMessage = `Nueva cita agendada para el ${createAppointmentDto.date} a las ${createAppointmentDto.time}. Cliente: ${saved.user ? 'Usuario registrado' : 'Cliente invitado'}`;
        
        console.log('🔄 [AppointmentService.create] Llamando notifyProfessional...');
        await this.notificationsService.notifyProfessional(
          professional.email,
          professionalMessage,
        );
        console.log('✅ [AppointmentService.create] Email al profesional enviado exitosamente');
      } else {
        console.warn('⚠️ [AppointmentService.create] Professional sin email:', professional?.email);
      }

      // Notificación al cliente registrado (solo si tiene user)
      if (saved.user) {
        console.log('📧 [AppointmentService.create] Buscando datos del usuario:', saved.user);
        const user = await this.userModel.findById(saved.user);
        
        console.log('📋 [AppointmentService.create] Datos del usuario encontrado:', {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          emailField: user?.email || 'NO TIENE EMAIL',
          allKeys: user ? Object.keys(user.toObject ? user.toObject() : user) : 'usuario no encontrado',
        });
        
        if (user?.email) {
          console.log('✅ [AppointmentService.create] Usuario tiene email:', user.email);
          console.log('📧 Enviando confirmación al cliente...');
          await this.notificationsService.notifyUser(
            user.email,
            `Tu cita ha sido agendada para el ${createAppointmentDto.date} a las ${createAppointmentDto.time}. Status: Pendiente de confirmación.`,
          );
          console.log('✅ [AppointmentService.create] Email al usuario enviado exitosamente');
        } else {
          console.warn('⚠️ [AppointmentService.create] Usuario sin email:', user?.email);
          console.warn('⚠️ [AppointmentService.create] Usuario completo:', JSON.stringify(user?.toObject ? user.toObject() : user));
        }
      } else {
        console.warn('⚠️ [AppointmentService.create] Sin usuario asociado a la cita');
      }
    } catch (emailError) {
      console.error('❌ Error enviando notificaciones:', emailError);
      // No fallar la creación de cita por error de email
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

  async updateStatus(
    appointmentId: string,
    newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'scheduled',
  ): Promise<{ success: boolean; appointment?: Appointment; message: string }> {
    try {
      const appointment = await this.appointmentModel.findById(appointmentId);

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found',
        };
      }

      // Actualizar el status
      appointment.status = newStatus;
      const updatedAppointment = await appointment.save();

      // Buscar información del usuario y profesional para notificaciones
      const professional = await this.professionalModel.findById(
        updatedAppointment.professional,
      );

      // ✅ MEJORAR - Enviar notificaciones detalladas según el nuevo status
      try {
        if (updatedAppointment.user) {
          const user = await this.userModel.findById(updatedAppointment.user);
          
          if (user?.email) {
            let message = '';
            const appointmentDate = new Date(updatedAppointment.date).toLocaleDateString();
            const appointmentTime = updatedAppointment.time;
            
            switch (newStatus) {
              case 'confirmed':
                message = `¡Tu cita ha sido confirmada! 📅 Fecha: ${appointmentDate} a las ${appointmentTime}. Te esperamos en la fecha acordada.`;
                console.log('📧 Enviando confirmación al cliente...');
                break;
              case 'cancelled':
                message = `Tu cita del ${appointmentDate} a las ${appointmentTime} ha sido cancelada. Puedes reagendar cuando gustes.`;
                console.log('📧 Enviando notificación de cancelación al cliente...');
                break;
              case 'completed':
                message = `Tu cita del ${appointmentDate} ha sido completada. ¡Gracias por elegirnos! 🎉`;
                console.log('📧 Enviando notificación de cita completada al cliente...');
                break;
              case 'scheduled':
                message = `Tu cita ha sido reagendada para el ${appointmentDate} a las ${appointmentTime}.`;
                console.log('📧 Enviando notificación de reagendamiento al cliente...');
                break;
            }
            
            if (message) {
              await this.notificationsService.notifyUser(user.email, message);
            }
          }
        }
      } catch (emailError) {
        console.error('❌ Error enviando notificación al cliente:', emailError);
        // No fallar la actualización por error de email
      }

      return {
        success: true,
        appointment: updatedAppointment,
        message: `Appointment status updated to ${newStatus}`,
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return {
        success: false,
        message: 'Error updating appointment status',
      };

      
    }
  }
}
