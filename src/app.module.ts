import { Module } from '@nestjs/common';

import { AidesController } from './infrastructure/api/aides.controller';
import { FranceConnectController } from './infrastructure/api/france_connect.controller';
import { CMSController } from './infrastructure/api/incoming/cms.controller';
import { TestDataController } from './infrastructure/api/testData.controller';

import { AidesUsecase } from './usecase/aides.usecase';
import { CMSWebhookUsecase } from './usecase/cms.webhook.usecase';
import { ImportNGCUsecase } from './usecase/importNGC.usecase';
import { MesAidesRenoUsecase } from './usecase/mesAidesReno.usecase';

import { SituationNGCRepository } from './infrastructure/repository/situationNGC.repository';
import { UtilisateurRepository } from './infrastructure/repository/utilisateur/utilisateur.repository';

import { OIDCStateRepository } from '../src/infrastructure/repository/oidcState.repository';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { AidesRetrofitRepository } from './infrastructure/repository/aidesRetrofit.repository';
import { AidesVeloRepository } from './infrastructure/repository/aidesVelo.repository';

import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CodeManager } from '../src/domain/utilisateur/manager/codeManager';
import { App } from './domain/app';
import { RechercheServiceManager } from './domain/bibliotheque_services/recherche/rechercheServiceManager';
import { PasswordManager } from './domain/utilisateur/manager/passwordManager';
import { SecurityEmailManager } from './domain/utilisateur/manager/securityEmailManager';
import { ActionsController } from './infrastructure/api/actions.controller';
import { AdminController } from './infrastructure/api/admin.controller';
import { AidesVeloController } from './infrastructure/api/aidesVelo.controller';
import { AsciiPreviewController } from './infrastructure/api/ascii.preview.controller';
import { BibliothequeController } from './infrastructure/api/bibliotheque.controller';
import { BilanCarboneController } from './infrastructure/api/bilanCarbone.controller';
import { CmsPreviewController } from './infrastructure/api/cms.preview.controller';
import { CommunesController } from './infrastructure/api/communes.controller';
import { ConformiteController } from './infrastructure/api/conformite.controller';
import { ConnexionController } from './infrastructure/api/connexion.controller';
import { EventController } from './infrastructure/api/event.controller';
import { GamificationController } from './infrastructure/api/gamification.controller';
import { GoneController } from './infrastructure/api/gone.controller';
import { InscriptionController } from './infrastructure/api/inscription.controller';
import { LoadCMSController } from './infrastructure/api/loadCMS.controller';
import { MagicLinkController } from './infrastructure/api/magicLink.controller';
import { MesAidesRenoController } from './infrastructure/api/mesAidesReno.controller';
import { NotificationsController } from './infrastructure/api/notifications.controller';
import { ProfileController } from './infrastructure/api/profile.controller';
import { QuestionsKYCController } from './infrastructure/api/questionKYC.controller';
import { QuestionsKYCEnchainementController } from './infrastructure/api/questionKYCEnchainement.controller';
import { RechecheServicesController } from './infrastructure/api/rechercheServices.controller';
import { RecoProfileController } from './infrastructure/api/reco_profile.controller';
import { RecommandationsController } from './infrastructure/api/recommandations.controller';
import { RisqesController } from './infrastructure/api/risques.controller';
import { ServiceController } from './infrastructure/api/service.controller';
import { SimulateurVoitureController } from './infrastructure/api/simulateurVoiture.controller';
import { SyntheseController } from './infrastructure/api/synthese.controller';
import { Synthese_v2Controller } from './infrastructure/api/synthese_v2.controller';
import { ThematiqueController } from './infrastructure/api/thematique.controller';
import { WinterController } from './infrastructure/api/winter.controller';
import { OidcService } from './infrastructure/auth/oidc.service';
import { BrevoRepository } from './infrastructure/contact/brevoRepository';
import { EmailSender } from './infrastructure/email/emailSender';
import { EmailTemplateRepository } from './infrastructure/email/emailTemplate.repository';
import { NGCCalculator } from './infrastructure/ngc/NGCCalculator';
import { Personnalisator } from './infrastructure/personnalisation/personnalisator';
import { PrismaServiceStat } from './infrastructure/prisma/stats/prisma.service.stats';
import { PushNotificationTemplateRepository } from './infrastructure/push_notifications/pushNotificationTemplate.repository';
import { PushNotificator } from './infrastructure/push_notifications/pushNotificator';
import { ActionRepository } from './infrastructure/repository/action.repository';
import { AideRepository } from './infrastructure/repository/aide.repository';
import { AideExpirationWarningRepository } from './infrastructure/repository/aideExpirationWarning.repository';
import { ArticleRepository } from './infrastructure/repository/article.repository';
import { BilanCarboneStatistiqueRepository } from './infrastructure/repository/bilanCarboneStatistique.repository';
import { BlockTextRepository } from './infrastructure/repository/blockText.repository';
import { CommuneRepository } from './infrastructure/repository/commune/commune.repository';
import { CompteurActionsRepository } from './infrastructure/repository/compteurActions.repository';
import { ConformiteRepository } from './infrastructure/repository/conformite.repository';
import { FAQRepository } from './infrastructure/repository/faq.repository';
import { KycRepository } from './infrastructure/repository/kyc.repository';
import { LinkyConsentRepository } from './infrastructure/repository/linkyConsent.repository';
import { PartenaireRepository } from './infrastructure/repository/partenaire.repository';
import { QuizzRepository } from './infrastructure/repository/quizz.repository';
import { RisquesNaturelsCommunesRepository } from './infrastructure/repository/risquesNaturelsCommunes.repository';
import { ServiceRepository } from './infrastructure/repository/service.repository';
import { ServiceFavorisStatistiqueRepository } from './infrastructure/repository/serviceFavorisStatistique.repository';
import { AddressesRepository } from './infrastructure/repository/services_recherche/addresses.repository';
import { DistancesRepository } from './infrastructure/repository/services_recherche/distances.repository';
import { FruitsLegumesRepository } from './infrastructure/repository/services_recherche/fruitsLegumes.repository';
import { ImpactTransportsRepository } from './infrastructure/repository/services_recherche/impactTransport.repository';
import { LongueVieObjetsRepository } from './infrastructure/repository/services_recherche/lvo/LongueVieObjets.repository';
import { MaifRepository } from './infrastructure/repository/services_recherche/maif/maif.repository';
import { MaifAPIClient } from './infrastructure/repository/services_recherche/maif/maifAPIClient';
import { PresDeChezNousRepository } from './infrastructure/repository/services_recherche/pres_de_chez_nous/presDeChezNous.repository';
import { RecettesRepository } from './infrastructure/repository/services_recherche/recettes/recettes.repository';
import { SimulateurVoitureRepository } from './infrastructure/repository/simulateurVoiture.repository';
import { SousThematiqueRepository } from './infrastructure/repository/sousThematique.repository';
import { StatistiqueExternalRepository } from './infrastructure/repository/statitstique.external.repository';
import { TagRepository } from './infrastructure/repository/tag.repository';
import { ThematiqueRepository } from './infrastructure/repository/thematique.repository';
import { TokenRepository } from './infrastructure/repository/token.repository';
import { UtilisateurSecurityRepository } from './infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { UtilisateurBoardRepository } from './infrastructure/repository/utilisateurBoard.repository';
import { WinterRepository } from './infrastructure/repository/winter/winter.repository';
import { WinterAPIClient } from './infrastructure/repository/winter/winterAPIClient';
import { FruitsEtLegumesServiceManager } from './infrastructure/service/fruits/fruitEtLegumesServiceManager';
import { ActionUsecase } from './usecase/actions.usecase';
import { AdminUsecase } from './usecase/admin.usecase';
import { AidesVeloUsecase } from './usecase/aidesVelo.usecase';
import { BibliothequeUsecase } from './usecase/bibliotheque.usecase';
import { BilanCarboneUsecase } from './usecase/bilanCarbone.usecase';
import { CMSImportUsecase } from './usecase/cms.import.usecase';
import { CMSDataHelperUsecase } from './usecase/CMSDataHelper.usecase';
import { CmsPreviewUsecase } from './usecase/cmsPreview.usecase';
import { CommunesUsecase } from './usecase/communes.usecase';
import { ConformiteUsecase } from './usecase/conformite.usecase';
import { Connexion_v2_Usecase } from './usecase/connexion.usecase';
import { ContactUsecase } from './usecase/contact.usecase';
import { EventUsecase } from './usecase/event.usecase';
import { FranceConnectUsecase } from './usecase/franceConnect.usecase';
import { GamificationUsecase } from './usecase/gamification.usecase';
import { InscriptionUsecase } from './usecase/inscription.usecase';
import { MagicLinkUsecase } from './usecase/magicLink.usecase';
import { MigrationUsecase } from './usecase/migration.usescase';
import { NotificationEmailUsecase } from './usecase/notificationEmail.usecase';
import { NotificationMobileUsecase } from './usecase/notificationMobile.usecase';
import { ProfileUsecase } from './usecase/profile.usecase';
import { QuestionKYCUsecase } from './usecase/questionKYC.usecase';
import { QuestionKYCEnchainementUsecase } from './usecase/questionKYCEnchainement.usecase';
import { RechercheServicesUsecase } from './usecase/rechercheServices.usecase';
import { RecommandationUsecase } from './usecase/recommandation.usecase';
import { NewServiceCatalogue } from './usecase/referentiels/newServiceCatalogue';
import { ReferentielUsecase } from './usecase/referentiels/referentiel.usecase';
import { RisquesUsecase } from './usecase/risques.usecase';
import { ServiceUsecase } from './usecase/service.usecase';
import { SimulateurVoitureUsecase } from './usecase/simulateurVoiture.usecase';
import { DuplicateBDDForStatsUsecase } from './usecase/stats/new/duplicateBDD.usecase';
import { ThematiqueUsecase } from './usecase/thematique.usecase';
import { ThematiqueBoardUsecase } from './usecase/thematiqueBoard.usecase';
import { WinterUsecase } from './usecase/winter.usecase';

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
    EventController,
    GamificationController,
    AdminController,
    QuestionsKYCController,
    RecommandationsController,
    BibliothequeController,
    InscriptionController,
    ThematiqueController,
    RechecheServicesController,
    BilanCarboneController,
    NotificationsController,
    LoadCMSController,
    SyntheseController,
    GoneController,
    ConformiteController,
    Synthese_v2Controller,
    ActionsController,
    SimulateurVoitureController,
    AidesVeloController,
    QuestionsKYCEnchainementController,
    FranceConnectController,
    MesAidesRenoController,
    RisqesController,
    MagicLinkController,
    WinterController,
  );
  if (!App.isProd()) {
    controllers.push(AsciiPreviewController);
    controllers.push(TestDataController);
    controllers.push(CmsPreviewController);
    controllers.push(RecoProfileController);
  }
  return controllers;
}
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
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
    SituationNGCRepository,
    CodeManager,
    OIDCStateRepository,
    OidcService,
    NGCCalculator,
    AidesRetrofitRepository,
    AidesVeloRepository,
    ProfileUsecase,
    ImportNGCUsecase,
    AidesUsecase,
    CMSWebhookUsecase,
    CMSImportUsecase,
    EmailSender,
    CommuneRepository,
    CommunesUsecase,
    UtilisateurSecurityRepository,
    SecurityEmailManager,
    PasswordManager,
    ServiceUsecase,
    ServiceRepository,
    ThematiqueRepository,
    FruitsEtLegumesServiceManager,
    EventUsecase,
    GamificationUsecase,
    QuestionKYCUsecase,
    ArticleRepository,
    QuizzRepository,
    RecommandationUsecase,
    ContactUsecase,
    BrevoRepository,
    MigrationUsecase,
    ReferentielUsecase,
    BibliothequeUsecase,
    InscriptionUsecase,
    AideRepository,
    LinkyConsentRepository,
    KycRepository,
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
    NotificationEmailUsecase,
    LongueVieObjetsRepository,
    NewServiceCatalogue,
    PartenaireRepository,
    ConformiteRepository,
    ConformiteUsecase,
    AdminUsecase,
    AideExpirationWarningRepository,
    PushNotificator,
    ActionRepository,
    ActionUsecase,
    FranceConnectUsecase,
    TokenRepository,
    ThematiqueUsecase,
    ThematiqueBoardUsecase,
    SimulateurVoitureUsecase,
    SimulateurVoitureRepository,
    FAQRepository,
    BlockTextRepository,
    AidesVeloUsecase,
    DuplicateBDDForStatsUsecase,
    StatistiqueExternalRepository,
    CompteurActionsRepository,
    CmsPreviewUsecase,
    PushNotificationTemplateRepository,
    NotificationMobileUsecase,
    CMSDataHelperUsecase,
    QuestionKYCEnchainementUsecase,
    MesAidesRenoUsecase,
    MaifRepository,
    MaifAPIClient,
    RisquesNaturelsCommunesRepository,
    RisquesUsecase,
    TagRepository,
    WinterUsecase,
    WinterAPIClient,
    WinterRepository,
    SousThematiqueRepository,
  ],
})
export class AppModule {}
