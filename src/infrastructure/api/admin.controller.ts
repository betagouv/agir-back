import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { CMSUsecase } from '../../../src/usecase/cms.usecase';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { GenericControler } from './genericControler';
import { UserMigrationReportAPI } from './types/userMigrationReportAPI';
import { ReferentielUsecase } from '../../usecase/referentiels/referentiel.usecase';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { TodoUsecase } from '../../../src/usecase/todo.usecase';
import { ContactUsecase } from '../../usecase/contact.usecase';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { StatistiqueUsecase } from '../../../src/usecase/statistique.usecase';
import { ArticleStatistiqueUsecase } from '../../../src/usecase/articleStatistique.usecase';
import { DefiStatistiqueUsecase } from '../../../src/usecase/defiStatistique.usecase';
import { QuizStatistiqueUsecase } from '../../../src/usecase/quizStatistique.usecase';
import { KycStatistiqueUsecase } from '../../../src/usecase/kycStatistique.usecase';
import { ThematiqueStatistiqueUsecase } from '../../../src/usecase/thematiqueStatistique.usecase';
import { UniversStatistiqueUsecase } from '../../../src/usecase/universStatistique.usecase';
import { RechercheServicesUsecase } from '../../usecase/rechercheServices.usecase';
import { App } from '../../domain/app';
import { MailerUsecase } from '../../usecase/mailer.usecase';
import { ValiderPrenomAPI } from './types/utilisateur/validerPrenomsAPI';
import { ApplicationError } from '../applicationError';

class VersionAPI {
  @ApiProperty()
  major: number;
  @ApiProperty()
  minor: number;
  @ApiProperty()
  patch: number;
}

@Controller()
@ApiTags('Z - Admin')
@ApiBearerAuth()
export class AdminController extends GenericControler {
  constructor(
    private migrationUsecase: MigrationUsecase,
    private rechercheServicesUsecase: RechercheServicesUsecase,
    private profileUsecase: ProfileUsecase,
    private serviceUsecase: ServiceUsecase,
    private linkyUsecase: LinkyUsecase,
    private cmsUsecase: CMSUsecase,
    private referentielUsecase: ReferentielUsecase,
    private todoUsecase: TodoUsecase,
    private contactUsecase: ContactUsecase,
    private statistiqueUsecase: StatistiqueUsecase,
    private articleStatistiqueUsecase: ArticleStatistiqueUsecase,
    private defiStatistiqueUsecase: DefiStatistiqueUsecase,
    private quizStatistiqueUsecase: QuizStatistiqueUsecase,
    private kycStatistiqueUsecase: KycStatistiqueUsecase,
    private thematiqueStatistiqueUsecase: ThematiqueStatistiqueUsecase,
    private universStatistiqueUsecase: UniversStatistiqueUsecase,
    private mailerUsecase: MailerUsecase,
  ) {
    super();
  }

  @Get('version')
  @ApiOkResponse({ type: VersionAPI })
  async getVersion(): Promise<VersionAPI> {
    return App.getAppVersion();
  }

  @Get('error_410')
  async error410() {
    ApplicationError.throwThatURLIsGone(`${App.getBaseURLBack()}/error_410`);
  }

  @Delete('admin/utilisateurs/:utilisateurId')
  @ApiOperation({
    summary: "Suppression du compte d'un utilisateur d'id donnée en mode admin",
  })
  async adminDeleteUtilisateurById(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.profileUsecase.deleteUtilisateur(utilisateurId);
  }

  @Post('services/refresh_dynamic_data')
  @ApiOkResponse({ type: [String] })
  async refreshServiceDynamicData(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.serviceUsecase.refreshScheduledServices();
  }

  @Post('services/compute_stats')
  @ApiOkResponse({ type: [String] })
  async compute_stats(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.rechercheServicesUsecase.computeStatsFavoris();
  }

  @Post('services/process_async_service')
  @ApiOkResponse({ type: [String] })
  async processAsyncService(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.serviceUsecase.processAsyncServices();
  }

  @Post('services/clean_linky_data')
  @ApiOkResponse({ type: Object })
  async cleanLinkyData(@Request() req): Promise<object> {
    this.checkCronAPIProtectedEndpoint(req);
    const result = await this.linkyUsecase.cleanLinkyData();

    return { result: `Cleaned ${result} PRMs` };
  }

  @Post('/admin/load_articles_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les articles publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSArticles(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadArticlesFromCMS();
  }

  @Post('/admin/load_univers_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les univers publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSUnivers(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadUniversFromCMS();
  }

  @Post('/admin/load_thematiqueUnivers_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les thematiques_univers publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSThematiqueUnivers(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadThematiquesUniversFromCMS();
  }

  @Post('/admin/load_missions_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les missions publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSMissions(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadMissionsFromCMS();
  }
  @Post('/admin/load_kycs_from_cms')
  @ApiOperation({
    summary: 'Upsert toutes les KYCs publiées du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllKYCMissions(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadKYCFromCMS();
  }
  @Post('/admin/load_defi_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les défis publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSDefis(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadDefisFromCMS();
  }

  @Post('/admin/load_quizzes_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les quizz publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSquizzes(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadQuizzFromCMS();
  }

  @Post('/admin/load_aides_from_cms')
  @ApiOperation({
    summary: 'Upsert toures les aides publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSaides(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.cmsUsecase.loadAidesFromCMS();
  }

  @Post('/admin/upsert_service_definitions')
  @ApiOperation({
    summary:
      'Upsert toutes les définitions de services à partir du fichier service_catalogue.ts',
  })
  async upsertAllServices(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.referentielUsecase.upsertServicesDefinitions();
  }

  @Post('/admin/migrate_users')
  @ApiOperation({
    summary: `monte la version de tous les utlisateurs éligibles à migration jusqu'à la version cible courante de l'application`,
  })
  @ApiOkResponse({ type: [UserMigrationReportAPI] })
  async migrateUsers(@Request() req): Promise<UserMigrationReportAPI[]> {
    this.checkCronAPIProtectedEndpoint(req);
    const result = await this.migrationUsecase.migrateUsers();
    return result.map((elem) => UserMigrationReportAPI.mapToAPI(elem));
  }
  @Post('/admin/lock_user_migration')
  @ApiOperation({
    summary: `Bloque la capacité de migrer des utilisateurs, pour des besoins de tests contrôlés`,
  })
  async lockUsers(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    await this.migrationUsecase.lockUserMigration();
  }
  @Post('/admin/unlock_user_migration')
  @ApiOperation({
    summary: `Active la capacité de migrer des utilisateurs`,
  })
  async unlockUsers(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    await this.migrationUsecase.unlockUserMigration();
  }

  @Post('/admin/unsubscribe_oprhan_prms')
  @ApiOperation({
    summary: `Dé inscrit les prms orphelins (suite à suppression de comptes)`,
  })
  async unsubscribe_oprhan_prms(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.linkyUsecase.unsubscribeOrphanPRMs();
  }

  @Post('/admin/upgrade_user_todo')
  @ApiOperation({
    summary: `enrichit la TODO des utilisateurs si besoin`,
  })
  @ApiOkResponse({ type: [String] })
  async upgrade_user_todo(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.todoUsecase.updateAllUsersTodo();
  }

  @Post('admin/contacts/synchronize')
  @ApiOperation({
    summary: "Synchronise les contacts de l'application avec ceux de Brevo ",
  })
  async SynchronizeContacts(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.contactUsecase.batchUpdate();
  }

  @Post('/admin/statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des utilisateurs`,
  })
  async calcul_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.statistiqueUsecase.calculStatistiqueDefis();
  }

  @Post('/admin/article-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des articles`,
  })
  async calcul_article_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.articleStatistiqueUsecase.calculStatistique();
  }

  @Post('/admin/defi-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des défis`,
  })
  async calcul_defi_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.defiStatistiqueUsecase.calculStatistique();
  }

  @Post('/admin/quiz-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des quiz`,
  })
  async calcul_quiz_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.quizStatistiqueUsecase.calculStatistique();
  }

  @Post('/admin/kyc-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des kyc`,
  })
  async calcul_kyc_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.kycStatistiqueUsecase.calculStatistique();
  }

  @Post('/admin/thematique-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des thématiques`,
  })
  async calcul_thematique_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.thematiqueStatistiqueUsecase.calculStatistique();
  }

  @Post('/admin/univers-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des univers`,
  })
  async calcul_univers_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.universStatistiqueUsecase.calculStatistique();
  }
  @Get('/admin/prenoms_a_valider')
  @ApiOperation({
    summary: `Liste les utilisateurs ayant un prenom à valider`,
  })
  async getPrenomsAValider(
    @Request() req,
  ): Promise<{ id: string; prenom: string }[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.listPrenomsAValider();
  }

  @Post('/admin/valider_prenoms')
  @ApiOperation({
    summary: `valide la liste de prenoms argument`,
  })
  @ApiBody({
    type: [ValiderPrenomAPI],
  })
  async validerPrenoms(@Request() req, @Body() body: ValiderPrenomAPI[]) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.validerPrenoms(body);
  }

  @Post('/admin/lister_onboarding_a_5_quetions_done')
  @ApiOperation({
    summary: `Liste les users qui ont un onboarding à 5 questions réalisé`,
  })
  async lister5question(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.liste5questOnboarding();
  }

  @Post('/admin/send_all_emails_as_test/:utilisateurId')
  @ApiOperation({
    summary: `Tente d'envoyer tous les templates de mail à un utilisateur donné, sans maj de l'historique de notification. Utile pour recetter les templates de mail`,
  })
  async send_all_emails_as_test(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.mailerUsecase.sendAllMailsToUserAsTest(utilisateurId);
  }
}
