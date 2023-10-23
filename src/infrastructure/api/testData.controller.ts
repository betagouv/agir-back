import { v4 as uuidv4 } from 'uuid';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';
import { SuiviRepository } from '../../../src/infrastructure/repository/suivi.repository';
import { QuestionNGCRepository } from '../../../src/infrastructure/repository/questionNGC.repository';
import { Suivi } from '../../../src/domain/suivi/suivi';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { utilisateurs_liste } from '../../../test_data/utilisateurs_liste';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';
import { InteractionDefinitionRepository } from '../repository/interactionDefinition.repository';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
import { Interaction } from '../../../src/domain/interaction/interaction';
import { DifficultyLevel } from '../../../src/domain/difficultyLevel';
import { Thematique } from '../../../src/domain/thematique';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');
const aides = require('../../../test_data/interactions/_aides');
const suivis = require('../../../test_data/interactions/_suivis');
const suivis_alimentation = require('../../../test_data/evenements/suivis_alimentation');
const suivis_transport = require('../../../test_data/evenements/suivis_transport');
const empreintes_utilisateur = require('../../../test_data/evenements/bilans');
const badges_liste = require('../../../test_data/evenements/badges');

export enum TheBoolean {
  true = 'true',
}

export enum TheTypes {
  utilisateur = 'utilisateur',
}

const DUMMY_INTERACTION = {
  titre: 'Titre',
  thematique_gamification: Thematique.climat,
  thematiques: [Thematique.climat, Thematique.logement],
  duree: '⏱️ < 1 minute',
  frequence: 'Une fois',
  image_url:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/240px-The_Blue_Marble_%28remastered%29.jpg',
  difficulty: DifficultyLevel.L1,
  points: 10,
  score: 0.9,
  locked: false,
  codes_postaux: [],
};

@Controller()
@ApiTags('TestData')
export class TestDataController {
  constructor(
    private prisma: PrismaService,
    private suiviRepository: SuiviRepository,
    private questionNGCRepository: QuestionNGCRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
  ) {}

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
    await this.upsertUtilisateur(utilisateurId);
    await this.insertArticlesForUtilisateur(utilisateurId);
    await this.insertAidesForUtilisateur(utilisateurId);
    await this.insertSuivisForUtilisateur(utilisateurId);
    await this.insertQuizzForUtilisateur(utilisateurId);
    await this.insertSuivisAlimentationForUtilisateur(utilisateurId);
    await this.insertEmpreintesForUtilisateur(utilisateurId);
    await this.insertBadgesForUtilisateur(utilisateurId);
    await this.insertQuestionsNGCForUtilisateur(utilisateurId);
    return utilisateurs_content[utilisateurId];
  }

  async insertSuivisAlimentationForUtilisateur(utilisateurId: string) {
    const suivis = utilisateurs_content[utilisateurId].suivis;
    if (!suivis) return;
    for (let index = 0; index < suivis.length; index++) {
      const suiviId = suivis[index];
      let suiviToCreate: Suivi;
      if (suivis_alimentation[suiviId]) {
        suiviToCreate = new SuiviAlimentation(
          new Date(Date.parse(suivis_alimentation[suiviId].date)),
        );
        suiviToCreate.injectValuesFromObject(suivis_alimentation[suiviId]);
      } else if (suivis_transport[suiviId]) {
        suiviToCreate = new SuiviTransport(
          new Date(Date.parse(suivis_transport[suiviId].date)),
        );
        suiviToCreate.injectValuesFromObject(suivis_transport[suiviId]);
      }
      suiviToCreate.calculImpacts();
      await this.suiviRepository.createSuivi(suiviToCreate, utilisateurId);
    }
  }
  async insertArticlesForUtilisateur(utilisateurId: string) {
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;

    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (interaction.cms_type === 'article') {
        let interactionToCreate: Interaction;
        let interDef =
          await this.interactionDefinitionRepository.getByTypeAndContentId(
            InteractionType.article,
            interaction.cms_id.toString(),
          );
        if (interDef === null) {
          interactionToCreate = new Interaction(DUMMY_INTERACTION);
          interactionToCreate.type = InteractionType.article;
          interactionToCreate.content_id = interaction.cms_id.toString();
          interactionToCreate.titre = 'Article CMS manquant : '.concat(
            interaction.cms_id,
          );
        } else {
          interactionToCreate = new Interaction(interDef);
        }
        interactionToCreate = { ...interactionToCreate, ...interaction };
        delete interactionToCreate['cms_type'];
        delete interactionToCreate['cms_id'];
        interactionToCreate.id = uuidv4();
        interactionToCreate.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data: interactionToCreate,
        });
      }
    }
  }
  async insertBadgesForUtilisateur(utilisateurId: string) {
    const badges = utilisateurs_content[utilisateurId].badges;
    if (!badges) return;
    for (let index = 0; index < badges.length; index++) {
      const badgeId = badges[index];
      if (badges_liste[badgeId]) {
        let data = {
          id: uuidv4(),
          titre: badges_liste[badgeId].titre,
          type: badges_liste[badgeId].type,
          created_at: new Date(Date.parse(badges_liste[badgeId].date)),
          utilisateurId: utilisateurId,
        };
        await this.prisma.badge.create({
          data,
        });
      }
    }
  }
  async insertEmpreintesForUtilisateur(utilisateurId: string) {
    const empreintes = utilisateurs_content[utilisateurId].bilans;
    if (!empreintes) return;
    for (let index = 0; index < empreintes.length; index++) {
      const empreinteId = empreintes[index];
      const empreinte = empreintes_utilisateur[empreinteId];
      if (empreinte) {
        const situationId = uuidv4();
        await this.prisma.situationNGC.create({
          data: {
            id: situationId,
            situation: empreinte.situation,
          },
        });
        let data = {
          ...empreinte,
          created_at: new Date(Date.parse(empreinte.date)),
          id: uuidv4(),
          utilisateurId,
          situationId,
          date: undefined,
          situation: undefined,
        };
        await this.prisma.empreinte.create({
          data,
        });
      }
    }
  }
  async insertQuestionsNGCForUtilisateur(utilisateurId: string) {
    const questionsNGC = utilisateurs_content[utilisateurId].questionsNGC;
    if (questionsNGC) {
      const keyList = Object.keys(questionsNGC);
      for (let index = 0; index < keyList.length; index++) {
        const key = keyList[index];
        await this.questionNGCRepository.saveOrUpdateQuestion(
          utilisateurId,
          key,
          questionsNGC[key],
        );
      }
    }
  }
  async insertAidesForUtilisateur(utilisateurId: string) {
    await this.insertInteractionsWithTypeFromObject(
      aides,
      InteractionType.aide,
    );
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (aides[interaction.id]) {
        let data = { ...aides[interaction.id], ...interaction };
        data.id = uuidv4();
        data.type = InteractionType.aide;
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }
  async insertSuivisForUtilisateur(utilisateurId: string) {
    await this.insertInteractionsWithTypeFromObject(
      suivis,
      InteractionType.suivi_du_jour,
    );
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (suivis[interaction.id]) {
        let data = { ...suivis[interaction.id], ...interaction };
        data.id = uuidv4();
        data.type = InteractionType.suivi_du_jour;
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }
  async insertQuizzForUtilisateur(utilisateurId: string) {
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;

    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (interaction.cms_type === 'quizz') {
        let interactionToCreate: Interaction;
        let interDef =
          await this.interactionDefinitionRepository.getByTypeAndContentId(
            InteractionType.quizz,
            interaction.cms_id.toString(),
          );
        if (interDef === null) {
          interactionToCreate = new Interaction(DUMMY_INTERACTION);
          interactionToCreate.type = InteractionType.quizz;
          interactionToCreate.content_id = interaction.cms_id.toString();
          interactionToCreate.titre = 'Quizz CMS manquant : '.concat(
            interaction.cms_id,
          );
        } else {
          interactionToCreate = new Interaction(interDef);
        }
        interactionToCreate = { ...interactionToCreate, ...interaction };
        delete interactionToCreate['cms_type'];
        delete interactionToCreate['cms_id'];
        interactionToCreate.id = uuidv4();
        interactionToCreate.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data: interactionToCreate,
        });
      }
    }
  }

  async deleteUtilisateur(utilisateurId: string) {
    await this.prisma.suivi.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.interaction.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.empreinte.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.badge.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.questionNGC.deleteMany({
      where: {
        utilisateurId,
      },
    });
    await this.prisma.utilisateur.deleteMany({
      where: { id: utilisateurId },
    });
  }
  async upsertUtilisateur(utilisateurId: string) {
    const clonedData = { ...utilisateurs_content[utilisateurId] };
    delete clonedData.suivis;
    delete clonedData.interactions;
    delete clonedData.bilans;
    delete clonedData.badges;
    delete clonedData.questionsNGC;

    PasswordManager.setUserPassword(clonedData, clonedData.mot_de_passe);
    delete clonedData.mot_de_passe;

    await this.prisma.utilisateur.upsert({
      where: {
        id: utilisateurId,
      },
      update: clonedData,
      create: { ...clonedData, id: utilisateurId },
    });
  }
  private async insertInteractionsWithTypeFromObject(
    theObject: object,
    type: InteractionType,
  ) {
    const keyList = Object.keys(theObject);
    for (let index = 0; index < keyList.length; index++) {
      const key = keyList[index];
      const intractionDefinition = theObject[key] as InteractionDefinition;
      intractionDefinition.id = key;
      intractionDefinition.type = type;
      await this.interactionDefinitionRepository.createOrUpdateBasedOnId(
        intractionDefinition,
      );
    }
  }
}
