import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { AuthController } from './infrastructure/api/auth.controller';
import { BilanController } from './infrastructure/api/bilan.controller';
import { AidesController } from './infrastructure/api/aides.controller';
import { IntractionsController } from './infrastructure/api/interactions.controller';
import { TestDataController } from './infrastructure/api/testData.controller';
import { CMSController } from './infrastructure/api/cms.controller';

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { BilanUsecase } from './usecase/bilan.usecase';
import { AidesUsecase } from './usecase/aides.usecase';
import { InteractionsDefinitionUsecase } from './usecase/interactionsDefinition.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur.repository';
import { BadgeRepository } from './infrastructure/repository/badge.repository';
import { BilanRepository } from './infrastructure/repository/bilan.repository';

import { PrismaService } from './infrastructure/prisma/prisma.service';
import { InteractionsUsecase } from './usecase/interactions.usecase';
import { InteractionRepository } from './infrastructure/repository/interaction.repository';
import { SuiviRepository } from './infrastructure/repository/suivi.repository';
import { SuiviUsecase } from './usecase/suivi.usecase';
import { SuiviController } from './infrastructure/api/suivi.controller';
import { AidesVeloRepository } from './infrastructure/repository/aidesVelo.repository';
import { AidesRetrofitRepository } from './infrastructure/repository/aidesRetrofit.repository';
import { SuiviDashboardController } from './infrastructure/api/suiviDashboard.controller';
import { OIDCStateRepository } from '../src/infrastructure/repository/oidcState.repository';
import { InteractionDefinitionRepository } from '../src/infrastructure/repository/interactionDefinition.repository';

import { JwtModule } from '@nestjs/jwt';
import { OidcService } from '../src/infrastructure/auth/oidc.service';
import { NGCCalculator } from './infrastructure/ngc/NGCCalculator';
import { QuestionNGCUsecase } from './usecase/questionNGC.usecase';
import { QuestionNGCRepository } from './infrastructure/repository/questionNGC.repository';
import { QuestionsNGCController } from './infrastructure/api/questionNGC.controller';
import { EmailSender } from './infrastructure/email/emailSender';
import { OnboardingUsecase } from './usecase/onboarding.usecase';
import { OnboardingController } from './infrastructure/api/onboarding.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.INTERNAL_TOKEN_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [
    OnboardingController,
    UtilisateurController,
    AuthController,
    BilanController,
    AidesController,
    IntractionsController,
    SuiviController,
    SuiviDashboardController,
    TestDataController,
    QuestionsNGCController,
    CMSController,
  ],
  providers: [
    PrismaService,
    UtilisateurRepository,
    BilanRepository,
    BadgeRepository,
    InteractionRepository,
    SuiviRepository,

    OIDCStateRepository,
    OidcService,
    NGCCalculator,
    QuestionNGCRepository,
    InteractionDefinitionRepository,
    AidesRetrofitRepository,
    AidesVeloRepository,
    UtilisateurUsecase,
    BilanUsecase,
    AidesUsecase,
    InteractionsUsecase,
    SuiviUsecase,
    QuestionNGCUsecase,
    InteractionsDefinitionUsecase,
    EmailSender,
    OnboardingUsecase,
  ],
})
export class AppModule {}
