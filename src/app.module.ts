import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { HelloworldController } from './infrastructure/api/helloworld.controller';
import { QuizzController } from './infrastructure/api/quizz.controller';
import { BilanController } from './infrastructure/api/bilan.controller';
import { AidesController } from './infrastructure/api/aides.controller';
import { IntractionsController } from './infrastructure/api/interactions.controller';

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { EvaluerQuizzUsecase } from './usecase/evaluer_quizz.usecase';
import { LireQuizzUsecase } from './usecase/lire_quizz.usecase';
import { BilanUsecase } from './usecase/bilan.usecase';
import { AidesUsecase } from './usecase/aides.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur.repository';
import { CompteurRepository } from './infrastructure/repository/compteur.repository';
import { QuizzRepository } from './infrastructure/repository/quizz.repository';
import { QuizzQuestionRepository } from './infrastructure/repository/quizzQuestion.repository';
import { BadgeRepository } from './infrastructure/repository/badge.repository';
import { BilanRepository } from './infrastructure/repository/bilan.repository';

import { PrismaService } from './infrastructure/db/prisma.service';
import { InteractionsUsecase } from './usecase/interactions.usecase';
import { InteractionRepository } from './infrastructure/repository/interaction.repository';
import { SuiviRepository } from './infrastructure/repository/suivi.repository';
import { SuiviUsecase } from './usecase/suivi.usecase';
import { SuiviController } from './infrastructure/api/suivi.controller';
import { AidesRepository } from './infrastructure/repository/aides.repository';
import { SuiviDashboardController } from './infrastructure/api/suiviDashboard.controller';

@Module({
  imports: [],
  controllers: [
    UtilisateurController,
    HelloworldController,
    QuizzController,
    BilanController,
    AidesController,
    IntractionsController,
    SuiviController,
    SuiviDashboardController,
  ],
  providers: [
    PrismaService,
    UtilisateurRepository,
    QuizzRepository,
    BilanRepository,
    QuizzQuestionRepository,
    CompteurRepository,
    BadgeRepository,
    InteractionRepository,
    SuiviRepository,
    AidesRepository,

    UtilisateurUsecase,
    EvaluerQuizzUsecase,
    LireQuizzUsecase,
    BilanUsecase,
    AidesUsecase,
    InteractionsUsecase,
    SuiviUsecase,
  ],
})
export class AppModule {}
