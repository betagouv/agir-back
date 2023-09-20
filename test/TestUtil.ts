import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InteractionType } from '../src/domain/interaction/interactionType';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { Thematique } from '../src/domain/thematique';
import { UserQuizzProfile } from '../src/domain/quizz/userQuizzProfile';
import { CMSModel } from '../src/infrastructure/api/types/cms/CMSModels';
import { CMSEvent } from '../src/infrastructure/api/types/cms/CMSEvent';
const request = require('supertest');

export class TestUtil {
  constructor() {}
  public static app: INestApplication;
  public static prisma = new PrismaService();
  public static utilisateur = 'utilisateur';
  public static suivi = 'suivi';

  static getServer() {
    return request(this.app.getHttpServer());
  }

  static async appinit() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    await this.app.init();
    return this.app;
  }
  static async appclose() {
    await this.app.close();
    await this.prisma.$disconnect();
  }

  static async deleteAll() {
    await this.prisma.suivi.deleteMany();
    await this.prisma.interaction.deleteMany();
    await this.prisma.badge.deleteMany();
    await this.prisma.quizzQuestion.deleteMany();
    await this.prisma.quizz.deleteMany();
    await this.prisma.empreinte.deleteMany();
    await this.prisma.questionNGC.deleteMany();
    await this.prisma.utilisateur.deleteMany();
    await this.prisma.situationNGC.deleteMany();
    await this.prisma.interactionDefinition.deleteMany();
    await this.prisma.article.deleteMany();
  }

  static getDate(date: string) {
    return new Date(Date.parse(date));
  }
  static async create(type: string, override?) {
    await this.prisma[type].create({
      data: this[type.concat('Data')](override),
    });
  }
  static CMSWebhookAPIData(override?) {
    return {
      model: CMSModel.article,
      event: 'entry.publish',
      entry: {
        id: 123,
        titre: 'titre',
        sousTitre: 'soustitre',
        rubriques: ['A', 'B'],
        duree: 'pas trop long',
        frequence: 'souvent',
        imageUrl: {
          url: 'https://',
        },
        difficulty: 3,
        points: 20,
        codePostal: '91120',
      },
      ...override,
    };
  }
  static situationNGCData(override?) {
    return {
      id: 'situationNGC-id',
      situation: {
        'transport . voiture . km': 12000,
      },
      created_at: new Date(),
      ...override,
    };
  }
  static questionNGCData(override?) {
    return {
      id: 'questionNGC-id',
      key: '123',
      value: '456',
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  static suiviData(override?) {
    return {
      id: 'suivi-id',
      type: 'alimentation',
      data: {
        a: 1,
        b: 2,
        c: 3,
      },
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  static empreinteData(override?) {
    return {
      id: 'empreinte-id',
      initial: false,
      situationId: 'situationNGC-id',
      bilan: {
        details: {
          divers: 852.8584599753638,
          logement: 1424.3853917865213,
          transport: 2533.9706912924553,
          alimentation: 2033.7441687666667,
          services_societaux: 1553.6358095597056,
        },
        bilan_carbone_annuel: 8398.594521380714,
      },
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  static utilisateurData(override?) {
    return {
      id: 'utilisateur-id',
      name: 'name',
      email: 'yo@truc.com',
      code_postal: '91120',
      quizzLevels: UserQuizzProfile.newLowProfile().getData(),
      ...override,
    };
  }
  static badgeData(override?) {
    return {
      id: 'badge-id',
      type: 'type',
      titre: 'titre',
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  static quizzData(override?) {
    return {
      id: 'quizz-id',
      titre: 'titre',
      ...override,
    };
  }
  static articleData(override?) {
    return {
      id: 'article-id',
      titre: 'titre',
      contenu: '<html>Hello World !!</html>',
      ...override,
    };
  }
  static quizzQuestionData(override?) {
    return {
      id: 'quizzQuestion-id',
      libelle: 'libelle',
      solution: '10',
      propositions: ['1', '5', '10'],
      quizzId: 'quizz-id',
      texte_riche_ok: 'bla bla bla',
      texte_riche_ko: 'bla bla bla',
      ...override,
    };
  }
  static interactionData(override?) {
    return {
      id: 'interaction-id',
      content_id: 'quizz-id',
      type: InteractionType.article,
      titre: 'titre',
      soustitre: 'soustitre',
      thematique_gamification: Thematique.consommation,
      tags: ['quizz', 'nourriture', 'conso'],
      duree: '⏱️ < 1 minute',
      frequence: '🔄 1x/jour',
      image_url: 'imageurl',
      url: 'url',
      seen: 0,
      seen_at: null,
      clicked: false,
      clicked_at: null,
      done: false,
      done_at: null,
      difficulty: 1,
      points: 5,
      score: '0.5',
      quizz_score: 50,
      locked: false,
      pinned_at_position: null,
      raison_lock: 'bla',
      codes_postaux: [],
      scheduled_reset: null,
      day_period: null,
      utilisateurId: 'utilisateur-id',
      ...override,
    };
  }
  static interactionDefinitionData(override?) {
    return {
      id: 'interaction-id',
      content_id: 'quizz-id',
      type: InteractionType.quizz,
      titre: 'titre',
      soustitre: 'soustitre',
      thematique_gamification: Thematique.consommation,
      tags: ['quizz', 'nourriture', 'conso'],
      duree: '⏱️ < 1 minute',
      frequence: '🔄 1x/jour',
      image_url: 'imageurl',
      url: 'url',
      difficulty: 1,
      points: 5,
      score: '0.5',
      locked: false,
      pinned_at_position: null,
      raison_lock: 'bla',
      codes_postaux: [],
      day_period: null,
      ...override,
    };
  }
}
