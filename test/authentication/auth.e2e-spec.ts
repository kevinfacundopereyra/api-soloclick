import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../src/app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('Autenticación (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<any>;
  let professionalModel: Model<any>;
  let testUserEmail: string;
  let testProfessionalEmail: string;

  beforeAll(async () => {
    testUserEmail = `user.${Date.now()}@test.com`;
    testProfessionalEmail = `prof.${Date.now()}@test.com`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userModel = moduleFixture.get(getModelToken('User'));
    professionalModel = moduleFixture.get(getModelToken('Professional'));
  });

  beforeEach(async () => {
    // Limpiar datos de test anteriores
    if (userModel) await userModel.deleteMany({});
    if (professionalModel) await professionalModel.deleteMany({});
  });

  describe('Registro y Login de Usuario', () => {
    const userData = {
      name: 'Test User',
      email: 'test@user.com',
      password: 'Test123!',
      phone: '1234567890',
      userType: 'client'
    };

    it('debería registrar un nuevo usuario', async () => {
      const response = await supertest(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('debería rechazar registro con email duplicado', async () => {
      // Primer registro
      await supertest(app.getHttpServer())
        .post('/users')
        .send(userData);

      // Intentar registrar el mismo email
      const response = await supertest(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
    });

    it('debería hacer login exitoso', async () => {
      // Primero registrar
      await supertest(app.getHttpServer())
        .post('/users')
        .send(userData);

      // Luego intentar login
      const response = await supertest(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
    });
  });

  describe('Registro y Login de Profesional', () => {
    const professionalData = {
      name: 'Test Professional',
      email: 'test@professional.com',
      password: 'Prof123!',
      phone: '0987654321',
      city: 'Test City',
      specialty: 'Test Specialty',
      locations: ['Test Location'],
      userType: 'professional'
    };

    it('debería registrar un nuevo profesional', async () => {
      const response = await supertest(app.getHttpServer())
        .post('/professionals')
        .send(professionalData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.professional).toHaveProperty('email', professionalData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('debería validar campos requeridos en registro', async () => {
      const invalidData = {
        name: 'Incomplete Professional',
        email: 'incomplete@test.com'
      };

      const response = await supertest(app.getHttpServer())
        .post('/professionals')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('debería hacer login exitoso como profesional', async () => {
      // Primero registrar
      await supertest(app.getHttpServer())
        .post('/professionals')
        .send(professionalData);

      // Luego intentar login
      const response = await supertest(app.getHttpServer())
        .post('/professionals/login')
        .send({
          email: professionalData.email,
          password: professionalData.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', professionalData.email);
    });
  });

  describe('Validación de Token y Rutas Protegidas', () => {
    let authToken: string;

    beforeAll(async () => {
      // Registrar un profesional y obtener token
      const response = await supertest(app.getHttpServer())
        .post('/professionals')
        .send({
          name: 'Auth Test Professional',
          email: 'auth@test.com',
          password: 'Auth123!',
          phone: '1122334455',
          city: 'Test City',
          specialty: 'Test Specialty',
          locations: ['Test Location']
        });

      authToken = response.body.token;
    });

    it('debería acceder a ruta protegida con token válido', async () => {
      await supertest(app.getHttpServer())
        .get('/professionals/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('debería rechazar acceso sin token', async () => {
      await supertest(app.getHttpServer())
        .get('/professionals/profile')
        .expect(401);
    });

    it('debería rechazar token inválido', async () => {
      await supertest(app.getHttpServer())
        .get('/professionals/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});