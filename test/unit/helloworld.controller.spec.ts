import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateurRepository } from '../../src/infrastructure/repository/utilisateur.repository';
import { HelloworldController } from '../../src/infrastructure/api/helloworld.controller';
import { UtilisateurUsecase } from '../../src/usecase/utilisateur.usecase';
import { PrismaService } from '../../src/infrastructure/db/prisma.service';

describe('AppController', () => {
  let appController: HelloworldController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HelloworldController],
      providers: [UtilisateurUsecase, UtilisateurRepository, PrismaService],
    }).compile();

    appController = app.get<HelloworldController>(HelloworldController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
