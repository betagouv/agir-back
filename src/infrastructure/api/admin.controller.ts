import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { GenericControler } from './genericControler';
import { UserMigrationReportAPI } from './types/userMigrationReportAPI';
import { ReferentielUsecase } from '../../usecase/referentiels/referentiel.usecase';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { TodoUsecase } from '../../../src/usecase/todo.usecase';
import { ContactUsecase } from '../../usecase/contact.usecase';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { StatistiqueUsecase } from '../../../src/usecase/stats/statistique.usecase';
import { ArticleStatistiqueUsecase } from '../../../src/usecase/stats/articleStatistique.usecase';
import { DefiStatistiqueUsecase } from '../../../src/usecase/stats/defiStatistique.usecase';
import { QuizStatistiqueUsecase } from '../../usecase/stats/quizStatistique.usecase';
import { KycStatistiqueUsecase } from '../../usecase/stats/kycStatistique.usecase';
import { MissionStatistiqueUsecase } from '../../usecase/stats/missionStatistique.usecase';
import { ThematiqueStatistiqueUsecase } from '../../usecase/stats/thematiqueStatistique.usecase';
import { RechercheServicesUsecase } from '../../usecase/rechercheServices.usecase';
import { App } from '../../domain/app';
import { MailerUsecase } from '../../usecase/mailer.usecase';
import { ValiderPrenomAPI } from './types/utilisateur/validerPrenomsAPI';
import { ApplicationError } from '../applicationError';
import { PrismaService } from '../prisma/prisma.service';
import { MissionUsecase } from '../../usecase/mission.usecase';
import { AdminUsecase } from '../../usecase/admin.usecase';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { PushNotificator } from '../push_notifications/pushNotificator';
import { Connexion_v2_Usecase } from '../../usecase/connexion.usecase';
import { CommunesUsecase } from '../../usecase/communes.usecase';

@Controller()
@ApiTags('Z - Admin')
@ApiBearerAuth()
export class AdminController extends GenericControler {
  constructor(
    private pushNotificator: PushNotificator,
    private migrationUsecase: MigrationUsecase,
    private rechercheServicesUsecase: RechercheServicesUsecase,
    private profileUsecase: ProfileUsecase,
    private serviceUsecase: ServiceUsecase,
    private linkyUsecase: LinkyUsecase,
    private adminUsecase: AdminUsecase,
    private aidesUsecase: AidesUsecase,
    private communesUsecase: CommunesUsecase,
    private referentielUsecase: ReferentielUsecase,
    private todoUsecase: TodoUsecase,
    private contactUsecase: ContactUsecase,
    private statistiqueUsecase: StatistiqueUsecase,
    private articleStatistiqueUsecase: ArticleStatistiqueUsecase,
    private defiStatistiqueUsecase: DefiStatistiqueUsecase,
    private quizStatistiqueUsecase: QuizStatistiqueUsecase,
    private kycStatistiqueUsecase: KycStatistiqueUsecase,
    private missionStatistiqueUsecase: MissionStatistiqueUsecase,
    private missionUsecase: MissionUsecase,
    private thematiqueStatistiqueUsecase: ThematiqueStatistiqueUsecase,
    private mailerUsecase: MailerUsecase,
    private prisma: PrismaService,
    private readonly connexion_v2_Usecase: Connexion_v2_Usecase,
  ) {
    super();
  }

  @Get('error_410_get')
  async error410Get() {
    ApplicationError.throwThatURLIsGone(
      `${App.getBaseURLBack()}/error_410_get`,
    );
  }
  @Post('error_410_post')
  async error410Post() {
    ApplicationError.throwThatURLIsGone(
      `${App.getBaseURLBack()}/error_410_post`,
    );
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
    return await this.missionStatistiqueUsecase.calculStatistique();
  }

  @Post('/admin/univers-statistique')
  @ApiOperation({
    summary: `Calcul des statistiques de l'ensemble des univers`,
  })
  async calcul_univers_statistique(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.thematiqueStatistiqueUsecase.calculStatistique();
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

  @Post('/admin/create_brevo_contacts')
  @ApiOperation({
    summary: `crée les contacts manquants dans Brevo`,
  })
  async create_brevo_contacts(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.contactUsecase.createMissingContacts();
  }

  @Get('/admin/liste_user_with_mission_done')
  @ApiOperation({
    summary: `liste tous les utilisateurs ayant terminés une certaine mission`,
  })
  @ApiQuery({
    name: 'code_mission',
    type: String,
    required: true,
    description: `Code de la mission`,
  })
  async listeUserMissionDone(
    @Request() req,
    @Query('code_mission') code_mission: string,
  ): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.missionUsecase.listUsersWithMissionDoneByCode(
      code_mission,
    );
  }

  @Get('/admin/:utilisateurId/raw_sql_user')
  @ApiOperation({
    summary: `extrait un utilisateur au format brut BDD`,
  })
  async get_raw_sql_user(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
  ): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
    });
  }
  @Post('/admin/:utilisateurId/raw_sql_user')
  @ApiOperation({
    summary: `inject un utilisateur via un format brut BDD, set un mot de passe par défaut`,
  })
  @ApiBody({
    type: Object,
    description: `format SQL brut de l'utilisateut à injecter`,
  })
  async post_raw_sql_user(@Request() req, @Body() body: any): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);

    const new_id = uuidv4();
    const new_email = `${new_id}@agir.dev`;

    await this.prisma.utilisateur.create({
      data: {
        ...body,
        id: new_id,
        email: new_email,
        unsubscribe_mail_token: undefined,
        passwordSalt: 'dc19d1a68c672b3116533d2dfa117c95',
        passwordHash:
          '900730fe39880b6eaca391a5f4858e4de0600aea058fd6fe1215167ddaaa6260571699f563d012fd9789c015a4eae9f82dd20d42736ef96130060734b73a2743',
      },
    });
    return { id: new_id, email: new_email };
  }

  @Get('/admin/utilisateur_avec_voiture')
  @ApiOperation({
    summary: `listes les utilisateurs avec voiture et qque infos`,
  })
  async get_user_with_car(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.adminUsecase.selectUserAvecVoiture();
  }

  @Post('/admin/aide_expired_soon')
  @ApiOperation({
    summary: `Flags les aides qui vont bientôt expirer`,
  })
  async flagAideExpiration(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.aidesUsecase.reportAideSoonExpired();
  }
  @Post('/admin/aide_expired_soon_emails')
  @ApiOperation({
    summary: `Envoie les emails pour les aides falguées comme bientôt expirées`,
  })
  async emailsAideExpiration(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.aidesUsecase.envoyerEmailsAideExpiration();
  }

  @Post('utilisateurs/logout')
  @ApiOperation({
    summary: `Déconnecte TOUS LES UTILISATEURS`,
  })
  async disconnectAll(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.connexion_v2_Usecase.logout_all_users();
  }

  @Post('/admin/load_communes_epci')
  @ApiOperation({
    summary: `Charge en base le référentiel de communes et EPCI`,
  })
  async load_communes_epci(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.communesUsecase.loadAllEpciAndCOmmunes();
  }

  @Post('/admin/test_push_mobile')
  @ApiOperation({
    summary: `Envoie les emails pour les aides falguées comme bientôt expirées`,
  })
  @ApiQuery({
    name: 'token',
    type: String,
    required: false,
    description: `Token pour cibler le destinataire du message`,
  })
  async testPushNotif(
    @Request() req,
    @Query('titre') titre: string,
    @Query('token') token?: string,
  ) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.pushNotificator.pushMessage(
      titre,
      'test de test',
      'https://dummyimage.com/600x400/000/fff',
      {
        page_type: 'quiz',
        page_id: '110',
      },
      token,
    );
  }
}
