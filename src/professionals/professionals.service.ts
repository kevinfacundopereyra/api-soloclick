import { Injectable } from '@nestjs/common';
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
