import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LinkyUsecase } from './usecase/linky.usecase';
import { ReferentielUsecase } from './usecase/referentiels/referentiel.usecase';
import { StatistiqueUsecase } from './usecase/stats/statistique.usecase';
import { ArticleStatistiqueUsecase } from './usecase/stats/articleStatistique.usecase';
import { DefiStatistiqueUsecase } from './usecase/stats/defiStatistique.usecase';
import { KycStatistiqueUsecase } from './usecase/stats/kycStatistique.usecase';
import { QuizStatistiqueUsecase } from './usecase/stats/quizStatistique.usecase';
import { ThematiqueStatistiqueUsecase } from './usecase/stats/thematiqueStatistique.usecase';
import { MissionStatistiqueUsecase } from './usecase/stats/missionStatistique.usecase';
import { BilanCarboneUsecase } from './usecase/bilanCarbone.usecase';
import { RechercheServicesUsecase } from './usecase/rechercheServices.usecase';
import { ProfileUsecase } from './usecase/profile.usecase';
import { MailerUsecase } from './usecase/mailer.usecase';
import { ContactUsecase } from './usecase/contact.usecase';
import { ServiceUsecase } from './usecase/service.usecase';
import { AidesUsecase } from './usecase/aides.usecase';

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
    case 'all_defi_statistique':
      start_time = Date.now();
      console.log(`START all_defi_statistique ${start_time}`);
      await application.get(StatistiqueUsecase).calculStatistiqueDefis();
      console.log(
        `STOP all_defi_statistique after ${Date.now() - start_time} ms`,
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
    case 'defi_statistique':
      start_time = Date.now();
      console.log(`START defi_statistique ${start_time}`);
      await application.get(DefiStatistiqueUsecase).calculStatistique();
      console.log(`STOP defi_statistique after ${Date.now() - start_time} ms`);
      break;
    case 'quizz_statistique':
      start_time = Date.now();
      console.log(`START quizz_statistique ${start_time}`);
      await application.get(QuizStatistiqueUsecase).calculStatistique();
      console.log(`STOP quizz_statistique after ${Date.now() - start_time} ms`);
      break;
    case 'kyc_statistique':
      start_time = Date.now();
      console.log(`START kyc_statistique ${start_time}`);
      await application.get(KycStatistiqueUsecase).calculStatistique();
      console.log(`STOP kyc_statistique after ${Date.now() - start_time} ms`);
      break;
    case 'thematique_statistique':
      start_time = Date.now();
      console.log(`START thematique_statistique ${start_time}`);
      await application.get(MissionStatistiqueUsecase).calculStatistique();
      console.log(
        `STOP thematique_statistique after ${Date.now() - start_time} ms`,
      );
      break;
    case 'univers_statistique':
      start_time = Date.now();
      console.log(`START univers_statistique ${start_time}`);
      await application.get(ThematiqueStatistiqueUsecase).calculStatistique();
      console.log(
        `STOP univers_statistique after ${Date.now() - start_time} ms`,
      );
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
        .get(BilanCarboneUsecase)
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
        .get(MailerUsecase)
        .envoyerEmailsAutomatiques();
      console.log(
        `STOP send_notifications after ${Date.now() - start_time} ms`,
      );
      console.log(result_email);
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
        .get(MailerUsecase)
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
    default:
      console.log('Command not found');
      process.exit(1);
  }

  await application.close();
  process.exit(0);
}

bootstrap();
