import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import { MigrationUsecase } from '../../../src/usecase/migration.usescase';
import { utilisateurs_liste } from '../../../test_data/utilisateurs_liste';
import { App } from '../../domain/app';
import { Thematique } from '../../domain/thematique/thematique';
import { Scope } from '../../domain/utilisateur/utilisateur';
import { ProfileUsecase } from '../../usecase/profile.usecase';
import { ApplicationError } from '../applicationError';
import { BrevoRepository } from '../contact/brevoRepository';
import { PrismaService } from '../prisma/prisma.service';
import { UtilisateurRepository } from '../repository/utilisateur/utilisateur.repository';
import { GenericControler } from './genericControler';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');

@Controller()
@ApiTags('TestData')
@ApiBearerAuth()
export class TestDataController extends GenericControler {
  constructor(
    private prisma: PrismaService,
    private migrationUsecase: MigrationUsecase,
    public contactSynchro: BrevoRepository,
    private utilisateurRepository2: UtilisateurRepository,
    private profileUsecase: ProfileUsecase,
  ) {
    super();
  }

  @Post('reset_single_user/:id')
  @ApiOperation({
    summary: 'Reset un user au sens application V2',
  })
  @ApiParam({
    name: 'id',
    description: `identifiant technique de l'utilisateur`,
  })
  async resetV2(@Param('id') inputId: string) {
    const user = await this.utilisateurRepository2.getById(inputId, [
      Scope.ALL,
    ]);
    if (!user) {
      ApplicationError.throwUserNotFound(inputId);
    }
    user.resetPourLancementNational();

    await this.utilisateurRepository2.updateUtilisateur(user);
  }

  @Get('user_reco_profile/:utilisateurId')
  async getRecoProfile(@Param('utilisateurId') utilisateurId: string) {
    const user = await this.utilisateurRepository2.getById(utilisateurId, [
      Scope.ALL,
    ]);
    if (!user) {
      ApplicationError.throwUserNotFound(utilisateurId);
    }
    return {
      prenom: user.prenom,
      nom: user.nom,
      pseudo: user.pseudo,
      date_naissance: user.annee_naissance
        ? '' +
          user.jour_naissance +
          '-' +
          user.mois_naissance +
          '-' +
          user.annee_naissance
        : null,
      tags_ponderation: user.tag_ponderation_set,
      tags_actifs: user.recommandation.getListeTagsActifs(),
      personnalisations_dones: {
        alimentation: user.thematique_history.isPersonnalisationDoneOnce(
          Thematique.alimentation,
        ),
        transport: user.thematique_history.isPersonnalisationDoneOnce(
          Thematique.transport,
        ),
        logement: user.thematique_history.isPersonnalisationDoneOnce(
          Thematique.logement,
        ),
        consommation: user.thematique_history.isPersonnalisationDoneOnce(
          Thematique.consommation,
        ),
      },
      action_rejetees: {
        all: user.thematique_history.getAllTypeCodeActionsExclues(),
      },
    };
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
    return utilisateurs_content[utilisateurId];
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
    clonedData.version = App.currentUserSystemVersion();

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
