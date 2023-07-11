import { v4 as uuidv4 } from 'uuid';
import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../db/prisma.service';
import path from 'path';
import fs from 'fs';
import { SuiviAlimentation } from '../../../src/domain/suivi/suiviAlimentation';
import { SuiviRepository } from '../../../src/infrastructure/repository/suivi.repository';
import { Suivi } from '../../../src/domain/suivi/suivi';
import { SuiviTransport } from '../../../src/domain/suivi/suiviTransport';
import { utilisateurs_liste } from '../../../test_data/utilisateurs_liste';
const utilisateurs_content = require('../../../test_data/utilisateurs_content');
const articles = require('../../../test_data/interactions/articles');
const aides = require('../../../test_data/interactions/aides');
const suivis = require('../../../test_data/interactions/suivis');
const suivis_alimentation = require('../../../test_data/suivis_alimentation');
const suivis_transport = require('../../../test_data/suivis_transport');

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
  ) {
    this.quizz_set = {};
    this.loadAllQuizz();
  }

  private quizz_set: Object;

  @Get('testdata/:id')
  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  async GetData(@Param('id') id: string) {
    return utilisateurs_content[id];
  }

  @ApiParam({ name: 'id', enum: utilisateurs_liste })
  @Post('testdata/:id/inject')
  async injectData(@Param('id') id: string) {
    await this.deleteUtilisateur(id);
    await this.upsertUtilisateur(id);
    await this.insertArticlesForUtilisateur(id);
    await this.insertAidesForUtilisateur(id);
    await this.insertSuivisForUtilisateur(id);
    await this.upsertAllQuizzDefinitions();
    await this.insertQuizzForUtilisateur(id);
    await this.insertSuivisAlimentationForUtilisateur(id);
    return utilisateurs_content[id];
  }

  async insertSuivisAlimentationForUtilisateur(utilisateurId: string) {
    const suivis = utilisateurs_content[utilisateurId].suivis;
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
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (articles[interaction.id]) {
        let data = { ...articles[interaction.id], ...interaction };
        data.id = uuidv4();
        data.type = 'article';
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }
  async insertAidesForUtilisateur(utilisateurId: string) {
    const interactions = utilisateurs_content[utilisateurId].interactions;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (aides[interaction.id]) {
        let data = { ...aides[interaction.id], ...interaction };
        data.id = uuidv4();
        data.type = 'aide';
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }
  async insertSuivisForUtilisateur(utilisateurId: string) {
    const interactions = utilisateurs_content[utilisateurId].interactions;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (suivis[interaction.id]) {
        let data = { ...suivis[interaction.id], ...interaction };
        data.id = uuidv4();
        data.type = 'suivi-du-jour';
        data.utilisateurId = utilisateurId;
        await this.prisma.interaction.create({
          data,
        });
      }
    }
  }
  async insertQuizzForUtilisateur(utilisateurId: string) {
    const interactions = utilisateurs_content[utilisateurId].interactions;
    for (let index = 0; index < interactions.length; index++) {
      const interaction = interactions[index];
      if (this.quizz_set[interaction.id]) {
        const quizz = this.quizz_set[interaction.id];
        let data = { ...quizz.interaction, ...interaction };
        data.id = uuidv4();
        data.type = 'quizz';
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
    for (let index = 0; index < quizzIds.length; index++) {
      const quizzId = quizzIds[index];
      const quizz = this.quizz_set[quizzId];
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
  }

  async loadAllQuizz() {
    try {
      const jsonsInDir = fs
        .readdirSync(path.resolve(__dirname, '../../../quizz'))
        .filter((file) => path.extname(file) === '.json');

      jsonsInDir.forEach((file) => {
        const fileData = fs.readFileSync(
          path.join(path.resolve(__dirname, '../../../quizz'), file),
        );
        this.quizz_set[path.basename(file, '.json')] = JSON.parse(
          fileData.toString(),
        );
      });
    } catch (error) {
      // nothing ^^
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
    await this.prisma.utilisateur.deleteMany({
      where: { id: utilisateurId },
    });
  }
  async upsertUtilisateur(utilisateurId: string) {
    const clonedData = { ...utilisateurs_content[utilisateurId] };
    delete clonedData.suivis;
    delete clonedData.interactions;
    await this.prisma.utilisateur.upsert({
      where: {
        id: utilisateurId,
      },
      update: clonedData,
      create: { ...clonedData, id: utilisateurId },
    });
  }
}
