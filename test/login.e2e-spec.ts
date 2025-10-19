import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('Login con credenciales correctas(e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/login (credenciales correctas)', async () => {
    const data = {
      email: 'test@test.com',
      password: 'test',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data);
    expect(200);

    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');
  });

  it('POST /auth/login (credenciales incorrectas)', async () => {
    const data = {
      email: 'secret@example.com',
      password: 'wrongpass',
    };

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data);
    expect(401);

    console.log(res.body);
    expect(res.body).toHaveProperty('access_token');
    expect(typeof res.body.access_token).toBe('string');
  });

  afterAll(async () => {
    await app.close();
  });
});
