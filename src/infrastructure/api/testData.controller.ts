import { v4 as uuidv4 } from 'uuid';
import { Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceStat } from '../prisma/stats/prisma.service.stats';
import { utilisateurs_liste } from '../../../test_data/utilisateurs_liste';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');
const _linky_data = require('../../../test_data/PRM_thermo_pas_sensible');
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { LinkyRepository } from '../repository/linky.repository';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { Contact } from '../contact/contact';
import { BrevoRepository } from '../contact/brevoRepository';
import { GenericControler } from './genericControler';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { Scope } from '../../domain/utilisateur/utilisateur';

@Controller()
@ApiTags('TestData')
@ApiBearerAuth()
export class TestDataController extends GenericControler {
  constructor(
    private prisma: PrismaService,
    private prismaStats: PrismaServiceStat,
    private linkyRepository: LinkyRepository,
    private migrationUsecase: MigrationUsecase,
    public contactSynchro: BrevoRepository,
    private utilisateurRepository2: UtilisateurRepository,
    private profileUsecase: ProfileUsecase,
  ) {
    super();
  }

  @Get('stats')
  async test_stats() {
    return await this.prismaStats.testTable.findMany();
  }

  @Get('testdata/:id')
  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  async GetData(@Param('id') id: string) {
    return utilisateurs_content[id] || {};
  }

  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  @Post('testdata/:id/inject')
  async injectData(@Param('id') inputId: string): Promise<string> {
    if (inputId === 'ALL_USERS') {
      for (const utilisateurId in utilisateurs_liste) {
        await this.injectUserId(utilisateurId);
      }
      return 'OK';
    } else {
      return await this.injectUserId(inputId);
    }
  }

  async injectUserId(utilisateurId: string): Promise<string> {
    if (!utilisateurs_content[utilisateurId]) return '{}';
    await this.deleteUtilisateur(utilisateurId);
    await this.insertUtilisateur(utilisateurId);
    await this.insertLinkyDataForUtilisateur(utilisateurId);
    return utilisateurs_content[utilisateurId];
  }

  async insertLinkyDataForUtilisateur(utilisateurId: string) {
    const linky = utilisateurs_content[utilisateurId].linky;
    if (!linky) return;
    await this.linkyRepository.upsertLinkyEntry(
      linky.prm,
      linky.winterpk,
      utilisateurId,
    );
    await this.linkyRepository.upsertDataForPRM(linky.prm, _linky_data);
  }

  async deleteUtilisateur(utilisateurId: string) {
    await this.prisma.service.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.utilisateur.deleteMany({
      where: { id: utilisateurId },
    });
  }
  async insertUtilisateur(utilisateurId: string) {
    const user = await this.utilisateurRepository2.getById(utilisateurId, [
      Scope.ALL,
    ]);
    if (user) {
      await this.profileUsecase.deleteUtilisateur(utilisateurId);
    }

    const clonedData = { ...utilisateurs_content[utilisateurId] };
    delete clonedData.interactions;
    delete clonedData.bilans;
    delete clonedData.services;
    delete clonedData.questionsNGC;
    delete clonedData.linky;

    if (!clonedData.todo) {
      clonedData.todo = new ParcoursTodo();
    }

    clonedData.unsubscribe_mail_token = crypto.randomUUID();

    PasswordManager.setUserPassword(clonedData, clonedData.mot_de_passe);
    delete clonedData.mot_de_passe;

    await this.prisma.utilisateur.upsert({
      where: {
        id: utilisateurId,
      },
      update: clonedData,
      create: { ...clonedData, id: utilisateurId },
    });

    await this.migrationUsecase.migrateUsers();

    const utilisatateur = await this.utilisateurRepository2.getById(
      utilisateurId,
      [Scope.ALL],
    );
    utilisatateur.recomputeRecoTags();
    await this.utilisateurRepository2.updateUtilisateur(utilisatateur);
  }
}
