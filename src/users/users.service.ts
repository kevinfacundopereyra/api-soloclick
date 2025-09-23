import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    //Agregar JwtService al constructor (23-09-Brian)
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(createUserDto: any): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }

  async remove(id: string): Promise<User> {
    const deleted = await this.userModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return deleted;
  }

  async registerUser(dto: CreateUserDto) {
  const newUser = new this.userModel(dto);
  await newUser.save();

  const payload = { sub: newUser._id, email: newUser.email };

  return {
    token: this.jwtService.sign(payload),
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  };
}
  
}
