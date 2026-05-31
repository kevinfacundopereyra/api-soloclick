import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Debería registrar un nuevo usuario', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@user.com',
      password: 'Test123!',
      phone: '1234567890',
      userType: 'client'
    };

    return supertest(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe(userData.email);
      });
  });

  it('Debería hacer login como usuario', async () => {
    const loginData = {
      email: 'test@user.com',
      password: 'Test123!'
    };

    return supertest(app.getHttpServer())
      .post('/api/auth/login')
      .send(loginData)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});