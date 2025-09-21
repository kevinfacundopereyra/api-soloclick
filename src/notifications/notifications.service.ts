import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // O el servicio que uses
      auth: {
        user: 'solo.click.project@gmail.com',
        pass: 'ozwo lway ljnq vikh',
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: 'TU_EMAIL@gmail.com',
      to,
      subject,
      text,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async notifyUser(email: string, message: string) {
    await this.sendEmail(email, 'Reserva confirmada', message);
  }

  async notifyProfessional(email: string, message: string) {
    await this.sendEmail(email, 'Nueva reserva agendada', message);
  }
}