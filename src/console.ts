import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ActionUsecase } from './usecase/actions.usecase';
import { AidesUsecase } from './usecase/aides.usecase';
import { CMSDataHelperUsecase } from './usecase/CMSDataHelper.usecase';
import { CommunesUsecase } from './usecase/communes.usecase';
import { ContactUsecase } from './usecase/contact.usecase';
import { LinkyUsecase } from './usecase/linky.usecase';
import { NotificationEmailUsecase } from './usecase/notificationEmail.usecase';
import { NotificationMobileUsecase } from './usecase/notificationMobile.usecase';
import { ProfileUsecase } from './usecase/profile.usecase';
import { RechercheServicesUsecase } from './usecase/rechercheServices.usecase';
import { ReferentielUsecase } from './usecase/referentiels/referentiel.usecase';
import { ServiceUsecase } from './usecase/service.usecase';
import { ArticleStatistiqueUsecase } from './usecase/stats/articleStatistique.usecase';
import { KycStatistiqueUsecase } from './usecase/stats/kycStatistique.usecase';
import { DuplicateBDDForStatsUsecase } from './usecase/stats/new/duplicateBDD.usecase';

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];
  let start_time;
  switch (command) {
    case 'clean_linky_data':
      start_time = Date.now();
      console.log(`START clean_linky_data ${start_time}`);
      const result = await application.get(LinkyUsecase).cleanLinkyData();
      console.log(`STOP clean_linky_data after ${Date.now() - start_time} ms`);
      console.log(`Cleaned ${result} PRMs`);
      break;
    case 'upsert_service_definitions':
      start_time = Date.now();
      console.log(`START upsert_service_definitions ${start_time}`);
      await application.get(ReferentielUsecase).upsertServicesDefinitions();
      console.log(
        `STOP upsert_service_definitions after ${Date.now() - start_time}  ms`,
      );
      break;
    case 'unsubscribe_oprhan_prms':
      start_time = Date.now();
      console.log(`START unsubscribe_oprhan_prms ${start_time}`);
      await application.get(LinkyUsecase).unsubscribeOrphanPRMs();
      console.log(
        `STOP unsubscribe_oprhan_prms after ${Date.now() - start_time}  ms`,
      );
      break;
    case 'article_statistique':
      start_time = Date.now();
      console.log(`START article_statistique ${start_time}`);
      await application.get(ArticleStatistiqueUsecase).calculStatistique();
      console.log(
        `STOP article_statistique after ${Date.now() - start_time} ms`,
      );
      break;
    case 'kyc_statistique':
      start_time = Date.now();
      console.log(`START kyc_statistique ${start_time}`);
      await application.get(KycStatistiqueUsecase).calculStatistique();
      console.log(`STOP kyc_statistique after ${Date.now() - start_time} ms`);
      break;
    case 'service_statistique':
      start_time = Date.now();
      console.log(`START service_statistique ${start_time}`);
      const result_serv = await application
        .get(RechercheServicesUsecase)
        .computeStatsFavoris();
      console.log(
        `STOP service_statistique after ${Date.now() - start_time} ms`,
      );
      console.log(result_serv);
      break;
    case 'all_bilan_carbone':
      start_time = Date.now();
      console.log(`START all_bilan_carbone ${start_time}`);
      const result_bilan = await application
        .get(DuplicateBDDForStatsUsecase)
        .computeBilanTousUtilisateurs();
      console.log(`STOP all_bilan_carbone after ${Date.now() - start_time} ms`);
      console.log(result_bilan);
      break;
    case 'update_user_couverture':
      start_time = Date.now();
      console.log(`START update_user_couverture ${start_time}`);
      const result_couv = await application
        .get(ProfileUsecase)
        .updateAllUserCouvertureAides();
      console.log(
        `STOP update_user_couverture after ${Date.now() - start_time} ms`,
      );
      console.log(result_couv);
      break;
    case 'send_notifications':
      start_time = Date.now();
      console.log(`START send_notifications ${start_time}`);
      const result_email = await application
        .get(NotificationEmailUsecase)
        .envoyerEmailsAutomatiques();
      console.log(
        `STOP send_notifications after ${Date.now() - start_time} ms`,
      );
      console.log(result_email);
      break;
    case 'send_notifications_mobile':
      start_time = Date.now();
      console.log(`START send_notifications_mobile ${start_time}`);
      const result_mobile = await application
        .get(NotificationMobileUsecase)
        .envoyerNotificationsMobileAutomatiques();
      console.log(
        `STOP send_notifications_mobile after ${Date.now() - start_time} ms`,
      );
      console.log(result_mobile);
      break;
    case 'create_brevo_contacts':
      start_time = Date.now();
      console.log(`START create_brevo_contacts ${start_time}`);
      const result_crea_brevo = await application
        .get(ContactUsecase)
        .createMissingContacts();
      console.log(
        `STOP create_brevo_contacts after ${Date.now() - start_time} ms`,
      );
      console.log(result_crea_brevo);
      break;
    case 'process_async_service':
      start_time = Date.now();
      console.log(`START process_async_service ${start_time}`);
      const result_process_async_service = await application
        .get(ServiceUsecase)
        .processAsyncServices();
      console.log(
        `STOP process_async_service after ${Date.now() - start_time} ms`,
      );
      console.log(result_process_async_service);
      break;
    case 'send_welcomes':
      start_time = Date.now();
      console.log(`START send_welcomes ${start_time}`);
      const result_send_welcomes = await application
        .get(NotificationEmailUsecase)
        .envoyerEmailsWelcome();
      console.log(`STOP send_welcomes after ${Date.now() - start_time} ms`);
      console.log(result_send_welcomes);
      break;
    case 'aide_expired_soon':
      start_time = Date.now();
      console.log(`START aide_expired_soon ${start_time}`);
      const result_aide_expired_soon = await application
        .get(AidesUsecase)
        .reportAideSoonExpired();
      console.log(`STOP aide_expired_soon after ${Date.now() - start_time} ms`);
      console.log(result_aide_expired_soon);
      break;
    case 'aide_expired_soon_emails':
      start_time = Date.now();
      console.log(`START aide_expired_soon_emails ${start_time}`);
      const result_aide_expired_soon_emails = await application
        .get(AidesUsecase)
        .envoyerEmailsAideExpiration();
      console.log(
        `STOP aide_expired_soon_emails after ${Date.now() - start_time} ms`,
      );
      console.log(result_aide_expired_soon_emails);
      break;
    case 'load_communes_and_epci':
      start_time = Date.now();
      console.log(`START load_communes_and_epci ${start_time}`);
      await application.get(CommunesUsecase).loadAllEpciAndCOmmunes();
      console.log(
        `STOP load_communes_and_epci after ${Date.now() - start_time} ms`,
      );
      break;
    case 'dump_utilisateur_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_utilisateur_copy_for_stats ${start_time}`);
      await application.get(DuplicateBDDForStatsUsecase).duplicateUtilisateur();
      console.log(
        `STOP dump_utilisateur_copy_for_stats after ${
          Date.now() - start_time
        } ms`,
      );
      break;

    case 'dump_kyc_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_kyc_copy_for_stats ${start_time}`);
      await application.get(DuplicateBDDForStatsUsecase).duplicateKYC();
      console.log(
        `STOP dump_kyc_copy_for_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'dump_action_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_action_copy_for_stats ${start_time}`);
      await application.get(DuplicateBDDForStatsUsecase).duplicateAction();
      console.log(
        `STOP dump_action_copy_for_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'dump_article_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_article_copy_for_stats ${start_time}`);
      await application.get(DuplicateBDDForStatsUsecase).duplicateArticle();
      console.log(
        `STOP dump_article_copy_for_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'dump_aides_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_aides_copy_for_stats ${start_time}`);
      await application.get(DuplicateBDDForStatsUsecase).duplicateAides();
      console.log(
        `STOP dump_aides_copy_for_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'dump_quizz_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_quizz_copy_for_stats ${start_time}`);
      await application.get(DuplicateBDDForStatsUsecase).duplicateQuizz();
      console.log(
        `STOP dump_quizz_copy_for_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'dump_perso_copy_for_stats':
      start_time = Date.now();
      console.log(`START dump_perso_copy_for_stats ${start_time}`);
      await application
        .get(DuplicateBDDForStatsUsecase)
        .duplicatePersonnalisation();
      console.log(
        `STOP dump_perso_copy_for_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'refresh_action_stats':
      start_time = Date.now();
      console.log(`START refresh_action_stats ${start_time}`);
      await application.get(ActionUsecase).updateActionStats();
      console.log(
        `STOP refresh_action_stats after ${Date.now() - start_time} ms`,
      );
      break;

    case 'cms_migrate_sources_article':
      await application
        .get(CMSDataHelperUsecase)
        .migrateSourceVersListeSourcesSurArticles(process.argv[3]);
      break;

    case 'cms_migrate_aides_partenaires':
      await application
        .get(CMSDataHelperUsecase)
        .migrateMultiPartenairesAides(process.argv[3]);
      break;

    case 'compute_all_aides_communes_from_partenaires':
      console.log(
        `START compute_all_aides_communes_from_partenaires ${start_time}`,
      );
      await application.get(AidesUsecase).updatesAllAidesCommunes();
      console.log(
        `STOP compute_all_aides_communes_from_partenaires after ${
          Date.now() - start_time
        } ms`,
      );
      break;

    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();
