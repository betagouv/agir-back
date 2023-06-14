import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { DashboardController } from './infrastructure/api/dashboard.controller';
import { HelloworldController } from './infrastructure/api/helloworld.controller';

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { GenerateDashboardUsecase } from './usecase/generate_dashboard.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur.repository';
import { PrismaService } from './infrastructure/db/prisma.service';

@Module({
  imports: [],
  controllers: [UtilisateurController, HelloworldController, DashboardController],
  providers: [UtilisateurUsecase,UtilisateurRepository, PrismaService, GenerateDashboardUsecase],
})
export class AppModule {}
