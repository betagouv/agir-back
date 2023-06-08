import { Test, TestingModule } from '@nestjs/testing';
import { CitoyenController } from '../src/infrastructure/api/citoyen.controller';
import { CitoyenUsecase } from '../src/usecase/citoyen.usecase';

describe('AppController', () => {
  let appController: CitoyenController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CitoyenController],
      providers: [CitoyenUsecase],
    }).compile();

    appController = app.get<CitoyenController>(CitoyenController);
  });

  /**
  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
   */
});
