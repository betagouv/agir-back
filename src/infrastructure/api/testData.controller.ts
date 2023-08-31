import { v4 as uuidv4 } from 'uuid';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import path from 'path';
import fs from 'fs';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';
import { SuiviRepository } from '../../../src/infrastructure/repository/suivi.repository';
import { QuestionNGCRepository } from '../../../src/infrastructure/repository/questionNGC.repository';
import { Suivi } from '../../../src/domain/suivi/suivi';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { utilisateurs_liste } from '../../../test_data/utilisateurs_liste';
import { InteractionDefinition } from '../../../src/domain/interaction/interactionDefinition';
import { InteractionDefinitionRepository } from '../repository/interactionDefinition.repository';
import { InteractionType } from '../../../src/domain/interaction/interactionType';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');
const articles = require('../../../test_data/interactions/_articles-externes');
const aides = require('../../../test_data/interactions/_aides');
const suivis = require('../../../test_data/interactions/_suivis');
const suivis_alimentation = require('../../../test_data/evenements/suivis_alimentation');
const suivis_transport = require('../../../test_data/evenements/suivis_transport');
const empreintes_utilisateur = require('../../../test_data/evenements/bilans');
const badges_liste = require('../../../test_data/evenements/badges');

const articles_internes_path =
  '../../../test_data/interactions/articles-internes';

const quizz_path = '../../../test_data/interactions/quizz';

export enum TheBoolean {
  true = 'true',
}

export enum TheTypes {
  utilisateur = 'utilisateur',
}

@Controller()
@ApiTags('TestData')
export class TestDataController {
  constructor(
    private prisma: PrismaService,
    private suiviRepository: SuiviRepository,
    private questionNGCRepository: QuestionNGCRepository,
    private interactionDefinitionRepository: InteractionDefinitionRepository,
  ) {
    this.quizz_set = {};
    this.article_contents = {};
    this.article_definitions = {};
  }

  private quizz_set: Object;
  private article_contents: Object;
  private article_definitions: Object;

  @Get('testdata/:id')
  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  async GetData(@Param('id') id: string) {
    return utilisateurs_content[id] || {};
  }

  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  @Post('testdata/:id/inject')
  async injectData(@Param('id') inputId: string): Promise<string> {
    await this.loadAllQuizz();
    await this.loadAllArticlesContents();
    await this.loadAllArticlesDefinitions();
    await this.upsertAllQuizzDefinitions();
    await this.upsertAllArticleContents();
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
    await this.insertInnerArticlesForUtilisateur(utilisateurId);
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
    await this.insertInteractionsWithTypeFromObject(
      articles,
      InteractionType.article,
    );
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (articles[interaction.id]) {
        let data = { ...articles[interaction.id], ...interaction };
        data.id = uuidv4();
        data.type = InteractionType.article;
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }
  async insertInnerArticlesForUtilisateur(utilisateurId: string) {
    await this.insertInteractionsWithTypeFromObject(
      this.article_definitions,
      InteractionType.article,
    );
    const interactions = utilisateurs_content[utilisateurId].interactions;
    if (!interactions) return;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (this.article_definitions[interaction.id]) {
        let data = {
          ...this.article_definitions[interaction.id],
          ...interaction,
        };
        data.id = uuidv4();
        data.type = InteractionType.article;
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
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
      if (this.quizz_set[interaction.id]) {
        const quizz = this.quizz_set[interaction.id];
        let data = { ...quizz.interaction, ...interaction };
        data.id = uuidv4();
        data.type = InteractionType.quizz;
        data.content_id = interaction.id;
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }

  async upsertAllQuizzDefinitions() {
    const quizzIds = Object.keys(this.quizz_set);
    const quizzInterationCompilation = {};
    for (let index = 0; index < quizzIds.length; index++) {
      const quizzId = quizzIds[index];
      const quizz = this.quizz_set[quizzId];
      quizzInterationCompilation[quizzId] = {
        ...this.quizz_set[quizzId].interaction,
        content_id: quizzId,
      };
      await this.prisma.quizz.upsert({
        where: {
          id: quizzId,
        },
        update: { titre: quizz.titre },
        create: { titre: quizz.titre, id: quizzId },
      });
      for (let index2 = 0; index2 < quizz.questions.length; index2++) {
        const question = quizz.questions[index2];
        const questionID = quizzId.concat(`_${index2}`);
        await this.prisma.quizzQuestion.upsert({
          where: {
            id: questionID,
          },
          update: { ...question, ordre: index2 + 1 },
          create: {
            ...question,
            id: questionID,
            quizzId: quizzId,
            ordre: index2 + 1,
          },
        });
      }
    }
    await this.insertInteractionsWithTypeFromObject(
      quizzInterationCompilation,
      InteractionType.quizz,
    );
  }
  async upsertAllArticleContents() {
    const articleIds = Object.keys(this.article_contents);
    for (let index = 0; index < articleIds.length; index++) {
      const articleId = articleIds[index];
      const article_def = this.article_definitions[articleId];
      article_def.content_id = articleId;
      await this.prisma.article.upsert({
        where: {
          id: articleId,
        },
        update: {
          titre: article_def.titre,
          contenu: this.article_contents[articleId],
        },
        create: {
          titre: article_def.titre,
          id: articleId,
          contenu: this.article_contents[articleId],
        },
      });
    }
  }

  async loadAllQuizz() {
    let current_file;
    try {
      const jsonsInDir = fs
        .readdirSync(path.resolve(__dirname, quizz_path))
        .filter((file) => path.extname(file) === '.json');

      for (let index = 0; index < jsonsInDir.length; index++) {
        current_file = jsonsInDir[index];
        const fileData = fs.readFileSync(
          path.join(path.resolve(__dirname, quizz_path), current_file),
        );
        this.quizz_set[path.basename(current_file, '.json')] = JSON.parse(
          fileData.toString(),
        );
      }
    } catch (error) {
      throw new BadRequestException(
        error.message.concat(` for file : ${current_file}`),
      );
    }
  }

  async loadAllArticlesContents() {
    let current_file;
    try {
      const htmlsInDir = fs
        .readdirSync(path.resolve(__dirname, articles_internes_path))
        .filter((file) => path.extname(file) === '.html');

      for (let index = 0; index < htmlsInDir.length; index++) {
        current_file = htmlsInDir[index];
        const fileData = fs.readFileSync(
          path.join(
            path.resolve(__dirname, articles_internes_path),
            current_file,
          ),
        );
        this.article_contents[path.basename(current_file, '.html')] =
          fileData.toString();
      }
    } catch (error) {
      throw new BadRequestException(
        error.message.concat(` for file : ${current_file}`),
      );
    }
  }
  async loadAllArticlesDefinitions() {
    let current_file;
    try {
      const jsonsInDir = fs
        .readdirSync(path.resolve(__dirname, articles_internes_path))
        .filter((file) => path.extname(file) === '.json');

      for (let index = 0; index < jsonsInDir.length; index++) {
        current_file = jsonsInDir[index];
        const fileData = fs.readFileSync(
          path.join(
            path.resolve(__dirname, articles_internes_path),
            current_file,
          ),
        );
        let article_def = JSON.parse(fileData.toString());
        article_def.content_id = path.basename(current_file, '.json');
        this.article_definitions[article_def.content_id] = article_def;
      }
    } catch (error) {
      throw new BadRequestException(
        error.message.concat(` for file : ${current_file}`),
      );
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
      await this.interactionDefinitionRepository.createOrUpdateInteractionDefinition(
        intractionDefinition,
      );
    }
  }
}
