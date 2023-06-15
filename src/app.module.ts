import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { DashboardController } from './infrastructure/api/dashboard.controller';
import { HelloworldController } from './infrastructure/api/helloworld.controller';
import { CompteurController } from './infrastructure/api/compteur.controller';
import { QuizzController } from './infrastructure/api/quizz.controller';

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { GenerateDashboardUsecase } from './usecase/generate_dashboard.usecase';
import { CompteurUsecase } from './usecase/compteur.usecase';
import { EvaluerQuizzUsecase } from './usecase/evaluer_quizz.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur.repository';
import { CompteurRepository } from './infrastructure/repository/compteur.repository';
import { QuizzRepository } from './infrastructure/repository/quizz.repository';
import { QuizzQuestionRepository } from './infrastructure/repository/quizzQuestion.repository';
import { PrismaService } from './infrastructure/db/prisma.service';

@Module({
  imports: [],
  controllers: [
    UtilisateurController,
    HelloworldController,
    DashboardController,
    CompteurController,
    QuizzController,
  ],
  providers: [
    PrismaService,
    UtilisateurRepository,
    QuizzRepository,
    QuizzQuestionRepository,
    CompteurRepository,
    GenerateDashboardUsecase,
    CompteurUsecase,
    UtilisateurUsecase,
    EvaluerQuizzUsecase,
  ],
})
export class AppModule {}
