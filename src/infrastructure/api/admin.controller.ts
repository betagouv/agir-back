import {
  Controller,
  Post,
  Headers,
  ForbiddenException,
  Res,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceUsecase } from '../../../src/usecase/service.usecase';
import { CMSUsecase } from '../../../src/usecase/cms.usecase';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { GenericControler } from './genericControler';
import { UserMigrationReportAPI } from './types/userMigrationReportAPI';
import { ReferentielUsecase } from '../../../src/usecase/referentiel/referentiel.usecase';
import { LinkyUsecase } from '../../../src/usecase/linky.usecase';
import { TodoUsecase } from '../../../src/usecase/todo.usecase';
import { ContactUsecase } from '../../usecase/contact.usecase';

@Controller()
@ApiBearerAuth()
@ApiTags('Admin')
export class AdminController extends GenericControler {
  constructor(
    private migrationUsecase: MigrationUsecase,
    private serviceUsecase: ServiceUsecase,
    private linkyUsecase: LinkyUsecase,
    private cmsUsecase: CMSUsecase,
    private referentielUsecase: ReferentielUsecase,
    private todoUsecase: TodoUsecase,
    private contactUsecase: ContactUsecase,
  ) {
    super();
  }

  @Post('services/refresh_dynamic_data')
  @ApiOkResponse({ type: [String] })
  async refreshServiceDynamicData(
    @Res() res: Response,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    const result = await this.serviceUsecase.refreshScheduledServices();
    res.status(HttpStatus.OK).json(result).send();
  }

  @Post('services/process_async_service')
  @ApiOkResponse({ type: [String] })
  async processAsyncService(
    @Res() res: Response,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    const result = await this.serviceUsecase.processAsyncServices();
    res.status(HttpStatus.OK).json(result).send();
  }

  @Post('services/clean_linky_data')
  @ApiOkResponse({ type: [String] })
  async cleanLinkyData(
    @Res() res: Response,
    @Headers('Authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    const result = await this.linkyUsecase.cleanLinkyData();

    res.status(HttpStatus.OK).json(`Cleaned ${result} PRMs`).send();
  }

  @Post('/admin/load_articles_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les articles publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSArticles(
    @Headers('Authorization') authorization: string,
  ): Promise<string[]> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    return await this.cmsUsecase.loadArticlesFromCMS();
  }

  @Post('/admin/load_quizzes_from_cms')
  @ApiOperation({
    summary: 'Upsert tous les quizz publiés du CMS',
  })
  @ApiOkResponse({ type: [String] })
  async upsertAllCMSquizzes(
    @Headers('Authorization') authorization: string,
  ): Promise<string[]> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    return await this.cmsUsecase.loadQuizzFromCMS();
  }

  @Post('/admin/upsert_service_definitions')
  @ApiOperation({
    summary:
      'Upsert toutes les définitions de services à partir du fichier /test_data/_services.ts',
  })
  async upsertAllServices(@Headers('Authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    await this.referentielUsecase.upsertServicesDefinitions();
  }

  @Post('/admin/upsert_ponderations')
  @ApiOperation({
    summary:
      'Upsert toutes les valeurs de pondération systeme pour les recommandation (tel que les rubriques pour les aricles et quizz)',
  })
  async upsertAllPonderations(@Headers('Authorization') authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    await this.referentielUsecase.upsertPonderations();
  }

  @Post('/admin/migrate_users')
  @ApiOperation({
    summary: `monte la version de tous les utlisateurs éligibles à migration jusqu'à la version cible courante de l'application`,
  })
  @ApiOkResponse({ type: [UserMigrationReportAPI] })
  async migrateUsers(
    @Headers('Authorization') authorization: string,
  ): Promise<UserMigrationReportAPI[]> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    const result = await this.migrationUsecase.migrateUsers();
    return result.map((elem) => UserMigrationReportAPI.mapToAPI(elem));
  }
  @Post('/admin/lock_user_migration')
  @ApiOperation({
    summary: `Bloque la capacité de migrer des utilisateurs, pour des besoins de tests contrôlés`,
  })
  async lockUsers(
    @Headers('Authorization') authorization: string,
  ): Promise<any> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    await this.migrationUsecase.lockUserMigration();
  }
  @Post('/admin/unlock_user_migration')
  @ApiOperation({
    summary: `Active la capacité de migrer des utilisateurs`,
  })
  async unlockUsers(
    @Headers('Authorization') authorization: string,
  ): Promise<any> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    await this.migrationUsecase.unlockUserMigration();
  }

  @Post('/admin/upgrade_user_todo')
  @ApiOperation({
    summary: `enrichit la TODO des utilisateurs si besoin`,
  })
  @ApiOkResponse({ type: [String] })
  async upgrade_user_todo(
    @Headers('Authorization') authorization: string,
  ): Promise<string[]> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }
    return await this.todoUsecase.updateAllUsersTodo();
  }

  @Post('admin/contacts/synchronize')
  @ApiOperation({
    summary: "Synchronise les contacts de l'application avec ceux de Brevo ",
  })
  // TODO : ajouter des tests de l'API ?
  async SynchronizeContacts(
    @Headers('Authorization') authorization: string,
  ): Promise<void> {
    if (!authorization) {
      throw new UnauthorizedException('CRON API KEY manquante');
    }
    if (!authorization.endsWith(process.env.CRON_API_KEY)) {
      throw new ForbiddenException('CRON API KEY incorrecte');
    }

    await this.contactUsecase.batchUpdate();
  }
}
