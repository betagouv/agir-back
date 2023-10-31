import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InteractionType } from '../src/domain/interaction/interactionType';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { Thematique } from '../src/domain/thematique';
import { Thematique as ThematiqueOnboarding } from '../src/domain/utilisateur/onboarding/onboarding';
import { UserQuizzProfile } from '../src/domain/quizz/userQuizzProfile';
import { CMSModel } from '../src/infrastructure/api/types/cms/CMSModels';
import { CMSEvent } from '../src/infrastructure/api/types/cms/CMSEvent';
import { Impact } from '../src/domain/utilisateur/onboarding/onboarding';
const request = require('supertest');
import { JwtService } from '@nestjs/jwt';

export class TestUtil {
  constructor() {}
  public static app: INestApplication;
  public static prisma = new PrismaService();
  public static utilisateur = 'utilisateur';
  public static suivi = 'suivi';
  private static SECRET = process.env.INTERNAL_TOKEN_SECRET;
  public static jwtService = new JwtService({
    secret: TestUtil.SECRET,
  });
  public static token;

  static async generateAuthorizationToken(utilisateurId: string) {
    const result = await TestUtil.jwtService.signAsync({ utilisateurId });
    TestUtil.token = result;
  }

  static getServer() {
    return request(this.app.getHttpServer());
  }

  static GET(url: string) {
    return TestUtil.getServer()
      .get(url)
      .set('Authorization', `Bearer ${TestUtil.token}`);
  }
  static PUT(url: string) {
    return TestUtil.getServer()
      .put(url)
      .set('Authorization', `Bearer ${TestUtil.token}`);
  }
  static PATCH(url: string) {
    return TestUtil.getServer()
      .patch(url)
      .set('Authorization', `Bearer ${TestUtil.token}`);
  }
  static DELETE(url: string) {
    return TestUtil.getServer()
      .delete(url)
      .set('Authorization', `Bearer ${TestUtil.token}`);
  }
  static POST(url: string) {
    return TestUtil.getServer()
      .post(url)
      .set('Authorization', `Bearer ${TestUtil.token}`);
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
    await this.prisma.service.deleteMany();
    await this.prisma.serviceDefinition.deleteMany();
    await this.prisma.empreinte.deleteMany();
    await this.prisma.questionNGC.deleteMany();
    await this.prisma.utilisateur.deleteMany();
    await this.prisma.situationNGC.deleteMany();
    await this.prisma.interactionDefinition.deleteMany();
  }

  static getDate(date: string) {
    return new Date(Date.parse(date));
  }
  static async create(type: string, override?) {
    await this.prisma[type].create({
      data: this[type.concat('Data')](override),
    });
  }
  static CMSWebhookAPIData() {
    return {
      model: CMSModel.article,
      event: CMSEvent['entry.publish'],
      entry: {
        id: 123,
        titre: 'titre',
        sousTitre: 'soustitre 222',
        thematique_gamification: { id: 1, titre: 'Alimentation' },
        thematiques: [
          { id: 1, titre: 'Alimentation' },
          { id: 2, titre: 'Climat' },
        ],
        rubriques: ['A', 'B'],
        duree: 'pas trop long',
        frequence: 'souvent',
        imageUrl: {
          formats: {
            thumbnail: { url: 'https://' },
          },
        },
        difficulty: 3,
        points: 20,
        codes_postaux: '91120,75002',
        publishedAt: new Date('2023-09-20T14:42:12.941Z'),
      },
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
      nom: 'nom',
      prenom: 'prenom',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      email: 'yo@truc.com',
      code_postal: '91120',
      revenu_fiscal: 10000,
      active_account: true,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      code: '123456',
      failed_checkcode_count: 0,
      prevent_checkcode_before: new Date(),
      sent_email_count: 0,
      prevent_sendemail_before: new Date(),

      onboardingData: {
        transports: ['voiture', 'pied'],
        avion: 2,
        code_postal: '91120',
        adultes: 2,
        enfants: 1,
        residence: 'maison',
        proprietaire: true,
        superficie: 'superficie_100',
        chauffage: 'bois',
        repas: 'tout',
        consommation: 'raisonnable',
      },
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.tres_eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.transports],
          '3': [ThematiqueOnboarding.logement],
          '4': [ThematiqueOnboarding.consommation],
        },
      },
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
  static serviceData(override?) {
    return {
      id: 'service-id',
      utilisateurId: 'utilisateur-id',
      serviceDefinitionId: 'serviceDefinition-id',
      ...override,
    };
  }
  static serviceDefinitionData(override?) {
    return {
      id: 'serviceDefinition-id',
      titre: 'titre',
      url: 'url',
      is_local: true,
      is_url_externe: true,
      thematiques: ['climat', 'logement'],
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
      thematique_gamification_titre: 'Consommation',
      thematiques: ['climat', 'logement'],
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
      score: 0.5,
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
      thematique_gamification_titre: 'Consommation',
      thematiques: [],
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
