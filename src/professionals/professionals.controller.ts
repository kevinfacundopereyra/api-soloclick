import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get()
  findAll() {
    return this.professionalsService.findAll();
  }

  @Get('by-specialty/:specialty')
  findBySpecialty(@Param('specialty') specialty: string) {
    return this.professionalsService.findBySpecialty(specialty);
  }

  @Get('by-modality/:modality')
  findByModality(@Param('modality') modality: 'local' | 'home') {
    return this.professionalsService.findByModality(modality);
  }

  @Get('filter/:specialty/:modality')
  findBySpecialtyAndModality(
    @Param('specialty') specialty: string,
    @Param('modality') modality: 'local' | 'home'
  ) {
    return this.professionalsService.findBySpecialtyAndModality(specialty, modality);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionalsService.findById(id);
  }

  @Post()
  create(@Body() createProfessionalDto: CreateProfessionalDto) {
    return this.professionalsService.create(createProfessionalDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProfessionalDto: CreateProfessionalDto,
  ) {
    return this.professionalsService.update(id, updateProfessionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professionalsService.remove(id);
  }

  // GET /professionals/profile - Obtener perfil del profesional logueado
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.professionalsService.getProfile(req.user.sub);
  }

  // PUT /professionals/profile - Completar/actualizar perfil
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.professionalsService.updateProfile(
      req.user.sub,
      updateProfileDto,
    );
  }

  // POST /professionals/upload-images - Subir imágenes
  @Post('upload-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@Request() req, @UploadedFiles() files) {
    return this.professionalsService.uploadProfileImages(req.user.sub, files);
  }

  // POST /professionals/login - Login específico para profesionales
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    const professional = await this.professionalsService.findByEmail(
      loginDto.email,
    );

    if (!professional || professional.password !== loginDto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        sub: professional._id,
        name: professional.name,
        userType: professional.userType,
        email: professional.email,
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' },
    );

    return {
      user: professional,
      token,
    };
  }
}
