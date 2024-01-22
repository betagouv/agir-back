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
import { InteractionRepository } from '../repository/interaction.repository';
import { OnboardingUsecase } from '../../../src/usecase/onboarding.usecase';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');
const _aides = require('../../../test_data/_aides');
const _suivis = require('../../../test_data/_suivis');
const _services = require('../../../test_data/_services');
const suivis_alimentation = require('../../../test_data/evenements/suivis_alimentation');
const suivis_transport = require('../../../test_data/evenements/suivis_transport');
const empreintes_utilisateur = require('../../../test_data/evenements/bilans');
const badges_liste = require('../../../test_data/evenements/badges');
import axios from 'axios';
import { ParcoursTodo } from '../../../src/domain/todo/parcoursTodo';
import { CMSThematiqueAPI } from './types/cms/CMSThematiqueAPI';
import { LinkyRepository } from '../repository/linky.repository';
import { LinkyData } from '../../../src/domain/linky/linkyData';
import { ServiceStatus } from '../../../src/domain/service/service';

export enum TheBoolean {
  true = 'true',
}

export enum TheTypes {
  utilisateur = 'utilisateur',
}

const DUMMY_INTERACTION_DEF = {
  titre: 'Titre',
  soustitre: 'Sous titre',
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
  content_id: null,
  type: null,
  tags: [],
  url: null,
  thematique_gamification_titre: 'Climat',
  pinned_at_position: undefined,
  raison_lock: undefined,
  day_period: undefined,
  created_at: undefined,
  updated_at: undefined,
  id: undefined,
};

@Controller()
@ApiTags('TestData')
export class TestDataController {
  constructor(
    private prisma: PrismaService,
    private suiviRepository: SuiviRepository,
    private questionNGCRepository: QuestionNGCRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
    private interactionRepository: InteractionRepository,
    private linkyRepository: LinkyRepository,
    private onboardingUsecase: OnboardingUsecase,
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
    await this.upsertServicesDefinitions();
    await this.injectCMSDataFromProd(utilisateurId);
    if (utilisateurs_content[utilisateurId].interactions) {
      await this.insertArticlesForUtilisateur(utilisateurId);
      await this.insertAidesForUtilisateur(utilisateurId);
      await this.insertQuizzForUtilisateur(utilisateurId);
      await this.insertSuivisForUtilisateur(utilisateurId);
    } else {
      await this.onboardingUsecase.initUtilisateurInteractionSet(utilisateurId);
    }
    await this.insertServicesForUtilisateur(utilisateurId);
    await this.insertLinkyDataForUtilisateur(utilisateurId);
    await this.insertSuivisAlimentationForUtilisateur(utilisateurId);
    await this.insertEmpreintesForUtilisateur(utilisateurId);
    await this.insertBadgesForUtilisateur(utilisateurId);
    await this.insertQuestionsNGCForUtilisateur(utilisateurId);
    return utilisateurs_content[utilisateurId];
  }
  async injectCMSDataFromProd(utilisateurId: string) {
    if (process.env.BASE_URL.includes('localhost')) {
      const articles = await this.callCMSForType('articles');
      const quizzes = await this.callCMSForType('quizzes');

      for (let index = 0; index < articles.length; index++) {
        const article = articles[index];
        const interactionToCreate =
          Interaction.newDefaultInteractionFromDefinition(
            DUMMY_INTERACTION_DEF,
          );
        interactionToCreate.type = InteractionType.article;
        interactionToCreate.content_id = article.id;
        interactionToCreate.titre = 'Article CMS manquant : '.concat(
          article.id,
        );
        interactionToCreate.id = uuidv4();
        interactionToCreate.difficulty = article.difficulty;
        interactionToCreate.thematiques = article.thematiques as Thematique[];
        interactionToCreate.utilisateurId = utilisateurId;
        await this.interactionRepository.insertInteractionForUtilisateur(
          utilisateurId,
          interactionToCreate,
        );
      }

      for (let index = 0; index < quizzes.length; index++) {
        const quizz = quizzes[index];
        const interactionToCreate =
          Interaction.newDefaultInteractionFromDefinition(
            DUMMY_INTERACTION_DEF,
          );
        interactionToCreate.type = InteractionType.quizz;
        interactionToCreate.content_id = quizz.id;
        interactionToCreate.titre = 'Quizz CMS manquant : '.concat(quizz.id);
        interactionToCreate.id = uuidv4();
        interactionToCreate.utilisateurId = utilisateurId;
        interactionToCreate.difficulty = quizz.difficulty;
        interactionToCreate.thematiques = quizz.thematiques as Thematique[];
        await this.interactionRepository.insertInteractionForUtilisateur(
          utilisateurId,
          interactionToCreate,
        );
      }
    }
  }

  private async callCMSForType(
    type: string,
  ): Promise<{ id: string; difficulty: number; thematiques: string[] }[]> {
    let response = null;
    const URL = process.env.CMS_URL.concat(
      '/',
      type,
      '?pagination[start]=0&pagination[limit]=100&populate[0]=thematiques',
    );
    console.log(URL);
    try {
      response = await axios.get(URL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CMS_API_KEY}`,
        },
      });
    } catch (error) {
      if (error.response.status != 401) {
        console.log(error.message);
      }
      throw new Error(error.response.status);
    }
    console.log(response.data.data[0]);
    return response.data.data.map((element) => {
      return {
        id: element.id.toString(),
        difficulty: element.attributes.difficulty,
        thematiques: CMSThematiqueAPI.getThematiqueList(
          element.attributes.thematiques.data,
        ),
      };
    });
  }

  async upsertServicesDefinitions() {
    const keyList = Object.keys(_services);
    for (let index = 0; index < keyList.length; index++) {
      const serviceId = keyList[index];
      const service = _services[serviceId];
      const data = { ...service };
      data.id = serviceId;
      delete data.configuration;
      await this.prisma.serviceDefinition.upsert({
        where: {
          id: serviceId,
        },
        update: data,
        create: data,
      });
    }
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
          interactionToCreate = Interaction.newDefaultInteractionFromDefinition(
            DUMMY_INTERACTION_DEF,
          );
          interactionToCreate.type = InteractionType.article;
          interactionToCreate.content_id = interaction.cms_id.toString();
          interactionToCreate.titre = 'Article CMS manquant : '.concat(
            interaction.cms_id,
          );
        } else {
          interactionToCreate =
            Interaction.newDefaultInteractionFromDefinition(interDef);
        }
        interactionToCreate = { ...interactionToCreate, ...interaction };
        delete interactionToCreate['cms_type'];
        delete interactionToCreate['cms_id'];
        interactionToCreate.id = uuidv4();
        interactionToCreate.utilisateurId = utilisateurId;
        await this.interactionRepository.insertInteractionForUtilisateur(
          utilisateurId,
          interactionToCreate,
        );
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
  async insertServicesForUtilisateur(utilisateurId: string) {
    const services = utilisateurs_content[utilisateurId].services;
    if (!services) return;
    for (let index = 0; index < services.length; index++) {
      const serviceId = services[index];
      if (_services[serviceId]) {
        let data = {
          id: uuidv4(),
          utilisateurId: utilisateurId,
          serviceDefinitionId: serviceId,
          status: ServiceStatus.LIVE,
          configuration: _services[serviceId].configuration
            ? _services[serviceId].configuration
            : {},
        };
        await this.prisma.service.create({
          data,
        });
      }
    }
  }
  async insertLinkyDataForUtilisateur(utilisateurId: string) {
    const linky = utilisateurs_content[utilisateurId].linky;
    if (!linky) return;
    const linkyData = new LinkyData({
      prm: linky.prm,
      serie: linky.data,
    });
    this.linkyRepository.upsertData(linkyData);
  }

  async insertAidesForUtilisateur(utilisateurId: string) {
    await this.insertInteractionsWithTypeFromObject(
      _aides,
      InteractionType.aide,
    );
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (_aides[interaction.id]) {
        let data = { ..._aides[interaction.id], ...interaction };
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
      _suivis,
      InteractionType.suivi_du_jour,
    );
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (_suivis[interaction.id]) {
        let data = { ..._suivis[interaction.id], ...interaction };
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
          interactionToCreate = Interaction.newDefaultInteractionFromDefinition(
            DUMMY_INTERACTION_DEF,
          );
          interactionToCreate.type = InteractionType.quizz;
          interactionToCreate.content_id = interaction.cms_id.toString();
          interactionToCreate.titre = 'Quizz CMS manquant : '.concat(
            interaction.cms_id,
          );
        } else {
          interactionToCreate =
            Interaction.newDefaultInteractionFromDefinition(interDef);
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
    await this.prisma.service.deleteMany({
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
    await this.prisma.questionsKYC.deleteMany({
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
    delete clonedData.services;
    delete clonedData.questionsNGC;
    delete clonedData.linky;

    if (!clonedData.todo) {
      clonedData.todo = new ParcoursTodo();
    }

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
