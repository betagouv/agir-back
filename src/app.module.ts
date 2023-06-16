import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { DashboardController } from './infrastructure/api/dashboard.controller';
import { HelloworldController } from './infrastructure/api/helloworld.controller';
import { CompteurController } from './infrastructure/api/compteur.controller';
<<<<<<< HEAD
import { QuizzController } from './infrastructure/api/quizz.controller';
=======
import { SimulationController } from './infrastructure/api/simulation.controller';
<<<<<<< HEAD
>>>>>>> 13a41d2 (add retrofit publicode exemple and bilan ngc exemple)
=======
import { AidesController } from './infrastructure/api/aides.controller';
>>>>>>> 04595f8 (WIP: clean code, remove engine file)

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { GenerateDashboardUsecase } from './usecase/generate_dashboard.usecase';
import { CompteurUsecase } from './usecase/compteur.usecase';
<<<<<<< HEAD
import { EvaluerQuizzUsecase } from './usecase/evaluer_quizz.usecase';
import { LireQuizzUsecase } from './usecase/lire_quizz.usecase';
import { SimulationUsecase } from './usecase/bilan.usecase';
=======
import { BilanUsecase } from './usecase/bilan.usecase';
import { AidesUsecase } from './usecase/aides.usecase';
>>>>>>> 04595f8 (WIP: clean code, remove engine file)

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
    SimulationController,
    AidesController,
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
    LireQuizzUsecase,
    BilanUsecase,
    AidesUsecase,
  ],
})
export class AppModule {}
