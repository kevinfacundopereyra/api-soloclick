import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      token: 'fake-jwt-token', // Aquí iría tu lógica de JWT
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}

export default AuthService;