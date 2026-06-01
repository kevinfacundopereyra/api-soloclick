import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter;

  constructor() {
    const emailUser = process.env.EMAIL_USER || 'solo.click.project@gmail.com';
    const emailPass = process.env.EMAIL_PASSWORD || 'ozwo lway ljnq vikh';
    
    console.log('📧 Inicializando servicio de correo con:', emailUser);
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
      const emailUser = process.env.EMAIL_USER || 'solo.click.project@gmail.com';
      
      const mailOptions = {
        from: emailUser,
        to,
        subject,
        text,
        html: html || text, // Si no hay HTML, usa el texto
      };
      
      console.log('📤 Enviando correo a:', to);
      console.log('📤 Asunto:', subject);
      
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Correo enviado exitosamente:', result.response);
      return result;
    } catch (error) {
      console.error('❌ Error al enviar correo:', error);
      throw error;
    }
  }

  async notifyUser(email: string, message: string) {
    console.log('👤 Notificando a usuario:', email);
    await this.sendEmail(email, 'Reserva confirmada', message);
  }

  async notifyProfessional(email: string, message: string) {
    console.log('👨‍💼 Notificando a profesional:', email);
    await this.sendEmail(email, 'Nueva reserva agendada', message);
  }

  async sendAppointmentConfirmation(to: string, appointmentDetails: {
    professionalName: string;
    serviceName: string;
    date: string;
    time: string;
    total: number;
  }) {
    const htmlContent = `
      <h2>¡Tu reserva ha sido confirmada!</h2>
      <p>Detalles de tu cita:</p>
      <ul>
        <li><strong>Profesional:</strong> ${appointmentDetails.professionalName}</li>
        <li><strong>Servicio:</strong> ${appointmentDetails.serviceName}</li>
        <li><strong>Fecha:</strong> ${appointmentDetails.date}</li>
        <li><strong>Hora:</strong> ${appointmentDetails.time}</li>
        <li><strong>Total:</strong> $${appointmentDetails.total}</li>
      </ul>
      <p>Gracias por usar SoloClick.</p>
    `;
    
    const textContent = `
      ¡Tu reserva ha sido confirmada!
      Profesional: ${appointmentDetails.professionalName}
      Servicio: ${appointmentDetails.serviceName}
      Fecha: ${appointmentDetails.date}
      Hora: ${appointmentDetails.time}
      Total: $${appointmentDetails.total}
    `;
    
    await this.sendEmail(to, 'Reserva confirmada', textContent, htmlContent);
  }
}