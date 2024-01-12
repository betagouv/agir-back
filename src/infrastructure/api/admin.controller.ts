import {
  Controller,
  Post,
  Request,
  Headers,
  UseGuards,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { AuthGuard } from '../auth/guard';
import { PrismaService } from '../prisma/prisma.service';
const _services = require('../../../test_data/_services');
import { GenericControler } from './genericControler';
import { UserMigrationReportAPI } from './types/userMigrationReportAPI';

@Controller()
@ApiBearerAuth()
@ApiTags('Admin')
export class AdminController extends GenericControler {
  constructor(
    private prisma: PrismaService,
    private migrationUsecase: MigrationUsecase,
  ) {
    super();
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
    await this.upsertServicesDefinitions();
  }

  async upsertServicesDefinitions() {
    const keyList = Object.keys(_services);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = _services[serviceId];
      const data = { ...service };
      data.id = serviceId;
      await this.prisma.serviceDefinition.upsert({
        where: {
          id: serviceId,
        },
        update: data,
        create: data,
      });
    }
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
  @UseGuards(AuthGuard)
  async lockUsers(
    @Headers('Authorization') authorization: string,
    @Request() req,
  ): Promise<any> {
    this.checkCallerIsAdmin(req);
    await this.migrationUsecase.lockUserMigration();
  }
  @Post('/admin/unlock_user_migration')
  @ApiOperation({
    summary: `Active la capacité de migrer des utilisateurs`,
  })
  @UseGuards(AuthGuard)
  async unlockUsers(
    @Headers('Authorization') authorization: string,
    @Request() req,
  ): Promise<any> {
    this.checkCallerIsAdmin(req);
    await this.migrationUsecase.unlockUserMigration();
  }
}
