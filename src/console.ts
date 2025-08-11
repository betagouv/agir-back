import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ActionUsecase } from './usecase/actions.usecase';
import { AidesUsecase } from './usecase/aides.usecase';
import { ArticlesUsecase } from './usecase/articles.usecase';
import { CMSDataHelperUsecase } from './usecase/CMSDataHelper.usecase';
import { CommunesUsecase } from './usecase/communes.usecase';
import { ContactUsecase } from './usecase/contact.usecase';
import { NotificationEmailUsecase } from './usecase/notificationEmail.usecase';
import { NotificationMobileUsecase } from './usecase/notificationMobile.usecase';
import { RechercheServicesUsecase } from './usecase/rechercheServices.usecase';
import { RecommandationUsecase } from './usecase/recommandation.usecase';
import { ReferentielUsecase } from './usecase/referentiels/referentiel.usecase';
import { ServiceUsecase } from './usecase/service.usecase';
import { DuplicateBDDForStatsUsecase } from './usecase/stats/new/duplicateBDD.usecase';

export const appCommands: Record<
  string,
  (app: INestApplicationContext, ...args: string[]) => Promise<any>
> = {
  upsert_service_definitions: async (app) => {
    return await app.get(ReferentielUsecase).upsertServicesDefinitions();
  },
  service_statistique: async (app) => {
    return await app.get(RechercheServicesUsecase).computeStatsFavoris();
  },
  all_bilan_carbone: async (app) => {
    return await app
      .get(DuplicateBDDForStatsUsecase)
      .computeBilanTousUtilisateurs();
  },
  update_user_couverture: async (app) => {
    return await app.get(AidesUsecase).updateAllUserCouvertureAides();
  },
  send_notifications: async (app) => {
    return await app.get(NotificationEmailUsecase).envoyerEmailsAutomatiques();
  },
  send_notifications_mobile: async (app) => {
    return await app
      .get(NotificationMobileUsecase)
      .envoyerNotificationsMobileAutomatiques();
  },
  create_brevo_contacts: async (app) => {
    return await app.get(ContactUsecase).createMissingContacts();
  },
  update_brevo_contacts: async (app) => {
    return await app.get(ContactUsecase).batchUpdate();
  },
  process_async_service: async (app) => {
    return await app.get(ServiceUsecase).processAsyncServices();
  },
  send_welcomes: async (app) => {
    return await app.get(NotificationEmailUsecase).envoyerEmailsWelcome();
  },
  aide_expired_soon: async (app) => {
    return await app.get(AidesUsecase).reportAideSoonExpired();
  },
  aide_expired_soon_emails: async (app) => {
    return await app.get(AidesUsecase).envoyerEmailsAideExpiration();
  },
  load_communes_and_epci: async (app) => {
    return await app.get(CommunesUsecase).loadAllEpciAndCOmmunes();
  },
  dump_utilisateur_copy_for_stats: async (app) => {
    return await app.get(DuplicateBDDForStatsUsecase).duplicateUtilisateur();
  },
  dump_utilisateur_notif_copy_for_stats: async (app) => {
    return await app
      .get(DuplicateBDDForStatsUsecase)
      .duplicateUtilisateurNotifications();
  },
  dump_utilisateur_visites_copy_for_stats: async (app) => {
    return await app
      .get(DuplicateBDDForStatsUsecase)
      .duplicateUtilisateurVistes();
  },
  dump_utilisateur_question_for_stats: async (app) => {
    return await app
      .get(DuplicateBDDForStatsUsecase)
      .duplicateQuestionsUtilisateur();
  },
  dump_kyc_copy_for_stats: async (app) => {
    return await app.get(DuplicateBDDForStatsUsecase).duplicateKYC();
  },
  dump_action_copy_for_stats: async (app) => {
    return await app.get(DuplicateBDDForStatsUsecase).duplicateAction();
  },
  dump_article_copy_for_stats: async (app) => {
    return await app.get(DuplicateBDDForStatsUsecase).duplicateArticle();
  },
  dump_aides_copy_for_stats: async (app) => {
    return await app.get(DuplicateBDDForStatsUsecase).duplicateAides();
  },
  dump_quizz_copy_for_stats: async (app) => {
    return await app.get(DuplicateBDDForStatsUsecase).duplicateQuizz();
  },
  dump_perso_copy_for_stats: async (app) => {
    return await app
      .get(DuplicateBDDForStatsUsecase)
      .duplicatePersonnalisation();
  },
  refresh_action_stats: async (app) => {
    return await app.get(ActionUsecase).updateActionStats();
  },
  cms_migrate_sources_article: async (app, arg: string) => {
    return await app
      .get(CMSDataHelperUsecase)
      .migrateSourceVersListeSourcesSurArticles(arg);
  },
  cms_migrate_echelle_aides: async (app, arg: string) => {
    return await app.get(CMSDataHelperUsecase).migrateEchelleAides(arg);
  },
  cms_migrate_aides_partenaires: async (app, arg: string) => {
    return await app
      .get(CMSDataHelperUsecase)
      .migrateMultiPartenairesAides(arg);
  },
  cms_clean_actions_export: async (app, arg: string) => {
    return await app.get(CMSDataHelperUsecase).cleanActionExport(arg);
  },
  refresh_all_user_tags: async (app) => {
    return await app.get(RecommandationUsecase).refreshAllUserTags();
  },
  compute_all_aides_communes_from_partenaires: async (app) => {
    return await app.get(AidesUsecase).updateAllPartenairesCodes();
  },
  compute_all_articles_communes_from_partenaires: async (app) => {
    return await app.get(ArticlesUsecase).updateAllPartenairesCodes();
  },
};

async function bootstrap() {
  const application = await NestFactory.createApplicationContext(AppModule);

  const command = process.argv[2];
  if (command in appCommands) {
    let start_time = Date.now();

    console.log(`START ${command} ${start_time}`);
    const args = process.argv.slice(3);
    const res = await appCommands[command](application, ...args);
    console.log(`STOP ${command} after ${Date.now() - start_time} ms`);
    console.log('Result:', res);

    await application.close();
    process.exit(0);
  } else {
    console.log('Command not found');
    process.exit(1);
  }
}

bootstrap();
