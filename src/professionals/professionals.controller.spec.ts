import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionalsController } from './professionals.controller';

describe('ProfessionalsController', () => {
  let controller: ProfessionalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionalsController],
    }).compile();

    controller = module.get<ProfessionalsController>(ProfessionalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
