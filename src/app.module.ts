import { Module } from '@nestjs/common';
import { UtilisateurController as UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { UtilisateurRepository } from './infrastructure/repository/utilisateur.repository';
import { PrismaService } from './infrastructure/db/prisma.service';
import { HelloworldController } from './infrastructure/api/helloworld.controller';

@Module({
  imports: [],
  controllers: [UtilisateurController, HelloworldController],
  providers: [UtilisateurUsecase,UtilisateurRepository, PrismaService],
})
export class AppModule {}
