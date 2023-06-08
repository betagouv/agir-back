import { Test, TestingModule } from '@nestjs/testing';
import { CitoyenRepository } from '../src/infrastructure/repository/citoyen.repository';
import { HelloworldController } from '../src/infrastructure/api/helloworld.controller';
import { CitoyenUsecase } from '../src/usecase/citoyen.usecase';
import { PrismaService } from '../src/infrastructure/db/prisma.service';

describe('AppController', () => {
  let appController: HelloworldController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HelloworldController],
      providers: [CitoyenUsecase, CitoyenRepository, PrismaService],
    }).compile();

    appController = app.get<HelloworldController>(HelloworldController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
