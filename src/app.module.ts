import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { AuthController } from './infrastructure/api/auth.controller';
import { QuizzController } from './infrastructure/api/quizz.controller';
import { BilanController } from './infrastructure/api/bilan.controller';
import { AidesController } from './infrastructure/api/aides.controller';
import { IntractionsController } from './infrastructure/api/interactions.controller';
import { TestDataController } from './infrastructure/api/testData.controller';

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { EvaluerQuizzUsecase } from './usecase/evaluer_quizz.usecase';
import { LireQuizzUsecase } from './usecase/lire_quizz.usecase';
import { BilanUsecase } from './usecase/bilan.usecase';
import { AidesUsecase } from './usecase/aides.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur.repository';
import { QuizzRepository } from './infrastructure/repository/quizz.repository';
import { BadgeRepository } from './infrastructure/repository/badge.repository';
import { BilanRepository } from './infrastructure/repository/bilan.repository';

import { PrismaService } from './infrastructure/prisma/prisma.service';
import { InteractionsUsecase } from './usecase/interactions.usecase';
import { InteractionRepository } from './infrastructure/repository/interaction.repository';
import { SuiviRepository } from './infrastructure/repository/suivi.repository';
import { SuiviUsecase } from './usecase/suivi.usecase';
import { SuiviController } from './infrastructure/api/suivi.controller';
import { AidesRepository } from './infrastructure/repository/aides.repository';
import { SuiviDashboardController } from './infrastructure/api/suiviDashboard.controller';
import { OIDCStateRepository } from '../src/infrastructure/repository/oidcState.repository';

import { JwtModule } from '@nestjs/jwt';
import { OidcService } from '../src/infrastructure/auth/oidc.service';
import { NGCCalculator } from './infrastructure/ngc/NGCCalculator';
import { QuestionNGCUsecase } from './usecase/questionNGC.usecase';
import { QuestionNGCRepository } from './infrastructure/repository/questionNGC.repository';
import { QuestionsNGCController } from './infrastructure/api/questionNGC.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.INTERNAL_TOKEN_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [
    UtilisateurController,
    AuthController,
    QuizzController,
    BilanController,
    AidesController,
    IntractionsController,
    SuiviController,
    SuiviDashboardController,
    TestDataController,
    QuestionsNGCController,
  ],
  providers: [
    PrismaService,
    UtilisateurRepository,
    QuizzRepository,
    BilanRepository,
    BadgeRepository,
    InteractionRepository,
    SuiviRepository,
    AidesRepository,
    OIDCStateRepository,
    OidcService,
    NGCCalculator,
    QuestionNGCRepository,  

    UtilisateurUsecase,
    EvaluerQuizzUsecase,
    LireQuizzUsecase,
    BilanUsecase,
    AidesUsecase,
    InteractionsUsecase,
    SuiviUsecase,
    QuestionNGCUsecase,
  ],
})
export class AppModule {}
