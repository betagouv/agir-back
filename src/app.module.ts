import { Module } from '@nestjs/common';

import { AuthController } from './infrastructure/api/auth.controller';
import { BilanController } from './infrastructure/api/bilan.controller';
import { AidesController } from './infrastructure/api/aides.controller';
import { TestDataController } from './infrastructure/api/testData.controller';
import { CMSController } from './infrastructure/api/incoming/cms.controller';

import { BilanUsecase } from './usecase/bilan.usecase';
import { AidesUsecase } from './usecase/aides.usecase';
import { CMSUsecase } from './usecase/cms.usecase';

import { UtilisateurRepository } from './infrastructure/repository/utilisateur/utilisateur.repository';
import { BilanRepository } from './infrastructure/repository/bilan.repository';

import { PrismaService } from './infrastructure/prisma/prisma.service';
import { AidesVeloRepository } from './infrastructure/repository/aidesVelo.repository';
import { AidesRetrofitRepository } from './infrastructure/repository/aidesRetrofit.repository';
import { OIDCStateRepository } from '../src/infrastructure/repository/oidcState.repository';

import { JwtModule } from '@nestjs/jwt';
import { OidcService } from '../src/infrastructure/auth/oidc.service';
import { NGCCalculator } from './infrastructure/ngc/NGCCalculator';
import { EmailSender } from './infrastructure/email/emailSender';
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
import { QuestionKYCUsecase } from './usecase/questionKYC.usecase';
import { ArticleRepository } from './infrastructure/repository/article.repository';
import { QuizzRepository } from './infrastructure/repository/quizz.repository';
import { ContactUsecase } from './usecase/contact.usecase';
import { ContactSynchro } from './infrastructure/contact/contactSynchro';
import { RecommandationsController } from './infrastructure/api/recommandations.controller';
import { RecommandationUsecase } from './usecase/recommandation.usecase';
import { MigrationUsecase } from './usecase/migration.usescase';
import { ReferentielUsecase } from './usecase/referentiel/referentiel.usecase';
import { App } from './domain/app';
import { BibliothequeController } from './infrastructure/api/bibliotheque.controller';
import { BibliothequeUsecase } from './usecase/bibliotheque.usecase';
import { LinkyAPIConnector } from './infrastructure/service/linky/LinkyAPIConnector';
import { LinkyEmailer } from './infrastructure/service/linky/LinkyEmailer';
import { InscriptionController } from './infrastructure/api/inscription.controller';
import { AideRepository } from './infrastructure/repository/aide.repository';
import { DefisController } from './infrastructure/api/defis.controller';
import { DefisUsecase } from './usecase/defis.usecase';
import { DefiRepository } from './infrastructure/repository/defi.repository';
import { LinkyConsentRepository } from './infrastructure/repository/linkyConsent.repository';
import { StatistiqueUsecase } from './usecase/statistique.usecase';
import { StatistiqueRepository } from './infrastructure/repository/statitstique.repository';
import { ArticleStatistiqueUsecase } from './usecase/articleStatistique.usecase';
import { ArticleStatistiqueRepository } from './infrastructure/repository/articleStatistique.repository';
import { UniversController } from './infrastructure/api/univers.controller';
import { UniversUsecase } from './usecase/univers.usecase';
import { DefiStatistiqueUsecase } from './usecase/defiStatistique.usecase';
import { DefiStatistiqueRepository } from './infrastructure/repository/defiStatistique.repository';
import { MissionUsecase } from './usecase/mission.usecase';
import { MissionController } from './infrastructure/api/mission.controller';
import { QuizStatistiqueUsecase } from './usecase/quizStatistique.usecase';
import { QuizStatistiqueRepository } from './infrastructure/repository/quizStatistique.repository';
import { KycStatistiqueUsecase } from './usecase/kycStatistique.usecase';
import { KycStatistiqueRepository } from './infrastructure/repository/kycStatistique.repository';
import { MissionRepository } from './infrastructure/repository/mission.repository';
import { KycRepository } from './infrastructure/repository/kyc.repository';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThematiqueStatistiqueUsecase } from './usecase/thematiqueStatistique.usecase';
import { ThematiqueStatistiqueRepository } from './infrastructure/repository/thematiqueStatistique.repository';
import { UniversStatistiqueUsecase } from './usecase/universStatistique.usecase';
import { UniversStatistiqueRepository } from './infrastructure/repository/universStatistique.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { Personnalisator } from './infrastructure/personnalisation/personnalisator';
import { RechecheServicesController } from './infrastructure/api/rechercheServices.controller';
import { RechercheServicesUsecase } from './usecase/rechercheServices.usecase';
import { RechercheServiceManager } from './domain/bibliotheque_services/recherche/rechercheServiceManager';
import { PresDeChezNousRepository } from './infrastructure/repository/services_recherche/pres_de_chez_nous/presDeChezNous.repository';
import { AddressesRepository } from './infrastructure/repository/services_recherche/addresses.repository';
import { ServiceFavorisStatistiqueRepository } from './infrastructure/repository/serviceFavorisStatistique.repository';
import { FruitsLegumesRepository } from './infrastructure/repository/services_recherche/fruitsLegumes.repository';
import { RecettesRepository } from './infrastructure/repository/services_recherche/recettes/recettes.repository';
import { BilanCarboneStatistiqueRepository } from './infrastructure/repository/bilanCarboneStatistique.repository';
import { BilanCarboneController } from './infrastructure/api/bilanCarbone.controller';
import { BilanCarboneUsecase } from './usecase/bilanCarbone.usecase';
import { PreviewController } from './infrastructure/api/preview.controller';
import { UtilisateurBoardRepository } from './infrastructure/repository/utilisateurBoard.repository';
import { MagicLinkUsecase } from './usecase/magicLink.usecase';
import { MagicLinkController } from './infrastructure/api/magicLink.controller';
import { ImpactTransportsRepository } from './infrastructure/repository/services_recherche/impactTransport.repository';
import { DistancesRepository } from './infrastructure/repository/services_recherche/distances.repository';
import { ConnexionController } from './infrastructure/api/connexion.controller';
import { Inscription_v2_Usecase } from './usecase/inscription.usecase';
import { ProfileUsecase } from './usecase/profile.usecase';
import { ProfileController } from './infrastructure/api/profile.controller';
import { Connexion_v2_Usecase } from './usecase/connexion.usecase';
import { EmailTemplateRepository } from './infrastructure/email/emailTemplate.repository';
import { MailerUsecase } from './usecase/mailer.usecase';
import { NotificationsController } from './infrastructure/api/notifications.controller';
import { PrismaServiceStat } from './infrastructure/prisma/stats/prisma.service.stats';

const SESSION_LIFETIME = '30 days';

function getControllers(): any[] {
  const controllers = [];
  controllers.push(
    ProfileController,
    ConnexionController,
    AidesController,
    CMSController,
    CommunesController,
    ServiceController,
    TodoController,
    WinterController,
    EventController,
    GamificationController,
    LinkyController,
    AdminController,
    QuestionsKYCController,
    RecommandationsController,
    BibliothequeController,
    InscriptionController,
    DefisController,
    UniversController,
    MissionController,
    RechecheServicesController,
    BilanCarboneController,
    PreviewController,
    NotificationsController,
  );
  if (!App.isProd()) {
    controllers.push(TestDataController);
    controllers.push(AuthController);
    controllers.push(BilanController);
    controllers.push(MagicLinkController);
  }
  return controllers;
}
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 1000 * 60 * 60 * 24,
        limit: 10000,
      },
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.INTERNAL_TOKEN_SECRET,
      signOptions: { expiresIn: SESSION_LIFETIME },
    }),
  ],
  controllers: getControllers(),
  providers: [
    PrismaService,
    PrismaServiceStat,
    UtilisateurRepository,
    BilanRepository,
    CodeManager,
    OIDCStateRepository,
    OidcService,
    NGCCalculator,
    AidesRetrofitRepository,
    AidesVeloRepository,
    ProfileUsecase,
    BilanUsecase,
    AidesUsecase,
    CMSUsecase,
    EmailSender,
    CommuneRepository,
    CommunesUsecase,
    UtilisateurSecurityRepository,
    SecurityEmailManager,
    PasswordManager,
    ServiceUsecase,
    ServiceRepository,
    TodoUsecase,
    ThematiqueRepository,
    EcoWattServiceManager,
    FruitsEtLegumesServiceManager,
    EventUsecase,
    GamificationUsecase,
    LinkyUsecase,
    LinkyServiceManager,
    LinkyRepository,
    QuestionKYCUsecase,
    ArticleRepository,
    QuizzRepository,
    RecommandationUsecase,
    ContactUsecase,
    ContactSynchro,
    MigrationUsecase,
    ReferentielUsecase,
    BibliothequeUsecase,
    LinkyAPIConnector,
    LinkyEmailer,
    Inscription_v2_Usecase,
    AideRepository,
    DefiRepository,
    DefisUsecase,
    LinkyConsentRepository,
    StatistiqueUsecase,
    StatistiqueRepository,
    ArticleStatistiqueUsecase,
    ArticleStatistiqueRepository,
    UniversUsecase,
    DefiStatistiqueUsecase,
    DefiStatistiqueRepository,
    MissionUsecase,
    QuizStatistiqueUsecase,
    QuizStatistiqueRepository,
    KycStatistiqueUsecase,
    KycStatistiqueRepository,
    MissionRepository,
    KycRepository,
    ThematiqueStatistiqueUsecase,
    ThematiqueStatistiqueRepository,
    UniversStatistiqueUsecase,
    UniversStatistiqueRepository,
    Personnalisator,
    RechercheServicesUsecase,
    RechercheServiceManager,
    PresDeChezNousRepository,
    AddressesRepository,
    ServiceFavorisStatistiqueRepository,
    FruitsLegumesRepository,
    RecettesRepository,
    BilanCarboneStatistiqueRepository,
    BilanCarboneUsecase,
    UtilisateurBoardRepository,
    MagicLinkUsecase,
    ImpactTransportsRepository,
    DistancesRepository,
    Connexion_v2_Usecase,
    EmailTemplateRepository,
    MailerUsecase,
  ],
})
export class AppModule {}
