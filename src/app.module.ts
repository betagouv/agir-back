import { Module } from '@nestjs/common';

import { UtilisateurController } from './infrastructure/api/utilisateur.controller';
import { AuthController } from './infrastructure/api/auth.controller';
import { BilanController } from './infrastructure/api/bilan.controller';
import { AidesController } from './infrastructure/api/aides.controller';
import { InteractionsController } from './infrastructure/api/interactions.controller';
import { TestDataController } from './infrastructure/api/testData.controller';
import { CMSController } from './infrastructure/api/incoming/cms.controller';

import { UtilisateurUsecase } from './usecase/utilisateur.usecase';
import { BilanUsecase } from './usecase/bilan.usecase';
import { AidesUsecase } from './usecase/aides.usecase';
import { InteractionsDefinitionUsecase } from './usecase/cms.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur/utilisateur.repository';
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
import { CommuneRepository } from './infrastructure/repository/commune/commune.repository';
import { CommunesUsecase } from './usecase/communes.usecase';
import { CommunesController } from './infrastructure/api/communes.controller';
import { CodeManager } from '../src/domain/utilisateur/manager/codeManager';
import { UtilisateurSecurityRepository } from './infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { SecurityEmailManager } from './domain/utilisateur/manager/securityEmailManager';
import { PasswordManager } from './domain/utilisateur/manager/passwordManager';
import { ServiceController } from './infrastructure/api/service.controller';
import { ServiceUsecase } from './usecase/service.usecase';
import { ServiceRepository } from './infrastructure/repository/service.repository';
import { TodoController } from './infrastructure/api/todo.controller';
import { TodoUsecase } from './usecase/todo.usecase';
import { GroupeController } from './infrastructure/api/groupe.controller';
import { GroupeUseCase } from './usecase/groupe.usecase';
import { GroupeRepository } from './infrastructure/repository/groupe.repository';
import { ThematiqueRepository } from './infrastructure/repository/thematique.repository';
import { EcoWattServiceManager } from './infrastructure/service/ecowatt/ecoWattServiceManager';
import { WinterController } from './infrastructure/api/incoming/winter.controller';
import { FruitsEtLegumesServiceManager } from './infrastructure/service/fruits/fruitEtLegumesServiceManager';
import { EventUsecase } from './usecase/event.usecase';
import { EventController } from './infrastructure/api/event.controller';
import { GamificationUsecase } from './usecase/gamification.usecase';
import { GamificationController } from './infrastructure/api/gamification.controller';
import { LinkyUsecase } from './usecase/linky.usecase';
import { LinkyController } from './infrastructure/api/linky.controller';
import { LinkyServiceManager } from './infrastructure/service/linky/LinkyServiceManager';
import { LinkyRepository } from './infrastructure/repository/linky.repository';
import { AdminController } from './infrastructure/api/admin.controller';
import { QuestionsKYCController } from './infrastructure/api/questionKYC.controller';
import { QuestionKYCRepository } from './infrastructure/repository/questionKYC.repository';
import { QuestionKYCUsecase } from './usecase/questionKYC.usecase';

const SESSION_LIFETIME = '30 days';

function getControllers(): any[] {
  const controllers = [];
  controllers.push(
    OnboardingController,
    UtilisateurController,
    BilanController,
    AidesController,
    InteractionsController,
    SuiviController,
    SuiviDashboardController,
    QuestionsNGCController,
    CMSController,
    CommunesController,
    ServiceController,
    TodoController,
    GroupeController,
    WinterController,
    EventController,
    GamificationController,
    LinkyController,
    AdminController,
    QuestionsKYCController,
  );
  if (process.env.IS_PROD === 'false') {
    controllers.push(TestDataController);
    controllers.push(AuthController);
  }
  return controllers;
}
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.INTERNAL_TOKEN_SECRET,
      signOptions: { expiresIn: SESSION_LIFETIME },
    }),
  ],
  controllers: getControllers(),
  providers: [
    PrismaService,
    UtilisateurRepository,
    BilanRepository,
    BadgeRepository,
    InteractionRepository,
    SuiviRepository,
    CodeManager,

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
    CommuneRepository,
    CommunesUsecase,
    UtilisateurSecurityRepository,
    SecurityEmailManager,
    PasswordManager,
    ServiceUsecase,
    ServiceRepository,
    TodoUsecase,
    GroupeUseCase,
    GroupeRepository,
    ThematiqueRepository,
    EcoWattServiceManager,
    FruitsEtLegumesServiceManager,
    EventUsecase,
    GamificationUsecase,
    LinkyUsecase,
    LinkyServiceManager,
    LinkyRepository,
    QuestionKYCRepository,
    QuestionKYCUsecase,
  ],
})
export class AppModule {}
