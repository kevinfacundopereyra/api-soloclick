/* import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
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

  describe('Registro de Usuario', () => {
    it('debería registrar un nuevo usuario con datos válidos', async () => {
      const userData = {
        name: 'Test User',
        email: testUserEmail,
        password: 'Test123!',
        phone: '1234567890'
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUserEmail);
      expect(response.body).toHaveProperty('token');
    });

    it('debería rechazar registro con email duplicado', async () => {
      const userData = {
        name: 'Duplicate User',
        email: testUserEmail,
        password: 'Test123!',
        phone: '1234567890'
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(409); // Conflict
    });
  });

  describe('Login de Usuario', () => {
    it('debería hacer login con credenciales correctas', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'Test123!'
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('debería rechazar login con contraseña incorrecta', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'WrongPass123!'
      };

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('Registro de Profesional', () => {
    it('debería registrar un nuevo profesional con datos válidos', async () => {
      const professionalData = {
        name: 'Test Professional',
        email: testProfessionalEmail,
        password: 'Prof123!',
        phone: '0987654321',
        city: 'Test City',
        specialty: 'Test Specialty',
        locations: ['Test Location']
      };

      const response = await request(app.getHttpServer())
        .post('/professionals')
        .send(professionalData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('professional');
      expect(response.body.professional).toHaveProperty('email', testProfessionalEmail);
      expect(response.body).toHaveProperty('token');
    });

    it('debería rechazar registro con datos incompletos', async () => {
      const invalidData = {
        name: 'Incomplete Professional',
        email: 'incomplete@test.com'
        // Faltan campos requeridos
      };

      await request(app.getHttpServer())
        .post('/professionals')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Login de Profesional', () => {
    it('debería hacer login con credenciales correctas', async () => {
      const loginData = {
        email: testProfessionalEmail,
        password: 'Prof123!'
      };

      const response = await request(app.getHttpServer())
        .post('/professionals/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user'); // Devuelve como 'user' para mantener consistencia
      expect(response.body).toHaveProperty('token');
    });

    it('debería rechazar login con email inexistente', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'AnyPass123!'
      };

      await request(app.getHttpServer())
        .post('/professionals/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('Validación de Token', () => {
    let userToken: string;

    beforeAll(async () => {
      // Obtener un token válido primero
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'Test123!'
        });
      
      userToken = loginResponse.body.token;
    });

    it('debería acceder a ruta protegida con token válido', async () => {
      await request(app.getHttpServer())
        .get('/users/profile') // O cualquier otra ruta protegida
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('debería rechazar acceso sin token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });

    it('debería rechazar token inválido', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  afterAll(async () => {
    // Limpiar datos de test
    if (userModel) await userModel.deleteMany({});
    if (professionalModel) await professionalModel.deleteMany({});
    await app.close();
  });
}); */