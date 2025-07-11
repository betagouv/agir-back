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
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { App } from '../../domain/app';
import { EmailNotification } from '../../domain/notification/notificationHistory';
import { PushNotificationMessage } from '../../domain/notification/pushNotificationMessage';
import { ActionUsecase } from '../../usecase/actions.usecase';
import { AdminUsecase } from '../../usecase/admin.usecase';
import { AidesUsecase } from '../../usecase/aides.usecase';
import { BilanCarboneUsecase } from '../../usecase/bilanCarbone.usecase';
import { CommunesUsecase } from '../../usecase/communes.usecase';
import { Connexion_v2_Usecase } from '../../usecase/connexion.usecase';
import { ContactUsecase } from '../../usecase/contact.usecase';
import { NotificationEmailUsecase } from '../../usecase/notificationEmail.usecase';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { RechercheServicesUsecase } from '../../usecase/rechercheServices.usecase';
import { ReferentielUsecase } from '../../usecase/referentiels/referentiel.usecase';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificator } from '../push_notifications/pushNotificator';
import { GenericControler } from './genericControler';
import { AideExportAPI } from './types/aide/AideExportAPI';
import { UserMigrationReportAPI } from './types/userMigrationReportAPI';
import { ValiderPseudoAPI } from './types/utilisateur/validerPrenomsAPI';

export class VersionAPI {
  @ApiProperty() version: string;
}
export class CheckVersionAPI {
  @ApiProperty() compatible: boolean;
}

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
    private adminUsecase: AdminUsecase,
    private aidesUsecase: AidesUsecase,
    private communesUsecase: CommunesUsecase,
    private actionUsecase: ActionUsecase,
    private referentielUsecase: ReferentielUsecase,
    private contactUsecase: ContactUsecase,
    private mailerUsecase: NotificationEmailUsecase,
    private bilanCarboneUsecase: BilanCarboneUsecase,
    private prisma: PrismaService,
    private readonly connexion_v2_Usecase: Connexion_v2_Usecase,
  ) {
    super();
  }

  @Post('admin/forcer_calcul_stats_carbone')
  async forceCalculStatsCarbone(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.bilanCarboneUsecase.flagToutUtilisateurForcerCaclculStatsBilan();
  }

  @Get('check_version/:version')
  @ApiOkResponse({ type: CheckVersionAPI })
  async check_version(
    @Param('version') version: string,
  ): Promise<CheckVersionAPI> {
    return { compatible: version === App.getBackCurrentVersion() };
  }

  @Get('version')
  @ApiOkResponse({ type: VersionAPI })
  async get_version(): Promise<VersionAPI> {
    return { version: App.getBackCurrentVersion() };
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

  @Post('admin/re_inject_situations_NGC')
  @ApiOkResponse({ type: [String] })
  async re_inject_situations_NGC(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.bilanCarboneUsecase.reInjecterSituationsNGC();
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

  @Post('admin/contacts/synchronize')
  @ApiOperation({
    summary: "Synchronise les contacts de l'application avec ceux de Brevo ",
  })
  async SynchronizeContacts(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.contactUsecase.batchUpdate();
  }
  /*
  @Post('admin/update_all_communes_risques')
  @ApiOperation({
    summary:
      'Calcul pour tous les utilisateur les risques commune quand absents',
  })
  async update_all_communes_risques(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.updateAllCommuneRisques();
  }
    */

  @Post('/admin/compute_all_aides_communes_from_partenaires')
  @ApiOperation({
    summary: `Calcul les codes communes de chaque aide fonction des partenaires associés`,
  })
  async compute_all_aides_communes_from_partenaires(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.aidesUsecase.updatesAllAidesCommunes();
  }

  @Get('/admin/prenoms_a_valider')
  @ApiOperation({
    summary: `Liste les utilisateurs ayant un prenom à valider`,
  })
  async getPrenomsAValider(
    @Request() req,
  ): Promise<{ id: string; pseudo: string }[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.listPseudosAValider();
  }

  @Post('/admin/valider_prenoms')
  @ApiOperation({
    summary: `valide la liste de prenoms argument`,
  })
  @ApiBody({
    type: [ValiderPseudoAPI],
  })
  async validerPrenoms(@Request() req, @Body() body: ValiderPseudoAPI[]) {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.profileUsecase.validerPseudos(body);
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

  @Post('/admin/send_one_email_as_test/:utilisateurId/:type')
  @ApiOperation({
    summary: `Tente d'envoyer un template de mail à un utilisateur donné, sans maj de l'historique de notification. Utile pour recetter les templates de mail`,
  })
  @ApiParam({
    name: 'type',
    enum: EmailNotification,
    required: true,
    description: `type de notif email`,
  })
  async send_one_email_as_test(
    @Request() req,
    @Param('utilisateurId') utilisateurId: string,
    @Param('type') type: string,
  ): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.mailerUsecase.sendOneMailToUserAsTest(
      utilisateurId,
      type,
    );
  }

  @Post('/admin/create_brevo_contacts')
  @ApiOperation({
    summary: `crée les contacts manquants dans Brevo`,
  })
  async create_brevo_contacts(@Request() req): Promise<string[]> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.contactUsecase.createMissingContacts();
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

  @Post('/admin/refresh_action_stats')
  @ApiOperation({
    summary: `recalcule les stats de vues et réalisaiton des actions`,
  })
  async refresh_action_stats(@Request() req) {
    this.checkCronAPIProtectedEndpoint(req);
    await this.actionUsecase.updateActionStats();
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
    const message = new PushNotificationMessage({
      title: titre,
      body: 'test de test',
      image_url: 'https://dummyimage.com/600x400/000/fff',
      data: {
        page_type: 'quiz',
        page_id: '110',
      },
      token: token,
    });
    await this.pushNotificator.pushMessage(message);
  }

  @ApiOkResponse({ type: [AideExportAPI] })
  @ApiOperation({
    summary:
      "Export l'ensemble du catalogue d'aides avec les tagging METRO-CA-CC-CU",
  })
  @Get('aides_export')
  async getCatalogueAidesComplet(@Request() req): Promise<AideExportAPI[]> {
    this.checkCronAPIProtectedEndpoint(req);
    const aides = await this.adminUsecase.exportAides();
    return aides.map((elem) => AideExportAPI.mapToAPI(elem));
  }

  @Get('/admin/liste_questions_utilisateur')
  @ApiOperation({
    summary: `listes les questions qui ont été posée par les utilisateurs`,
  })
  async listeQuesitons(@Request() req): Promise<any> {
    this.checkCronAPIProtectedEndpoint(req);
    return await this.actionUsecase.getAllQuestions();
  }
}
