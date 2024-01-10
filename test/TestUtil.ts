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
import { ParcoursTodo } from '../src/domain/todo/parcoursTodo';
import {
  TypeReponseQuestionKYC,
  CategorieQuestionKYC,
} from '../src/domain/kyc/questionQYC';

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
    await this.prisma.questionsKYC.deleteMany();
    await this.prisma.interaction.deleteMany();
    await this.prisma.badge.deleteMany();
    await this.prisma.service.deleteMany();
    await this.prisma.groupeAbonnement.deleteMany();
    await this.prisma.groupe.deleteMany();
    await this.prisma.serviceDefinition.deleteMany();
    await this.prisma.empreinte.deleteMany();
    await this.prisma.questionNGC.deleteMany();
    await this.prisma.utilisateur.deleteMany();
    await this.prisma.situationNGC.deleteMany();
    await this.prisma.interactionDefinition.deleteMany();
    await this.prisma.thematique.deleteMany();
    await this.prisma.linky.deleteMany();
    await this.prisma.article.deleteMany();
    await this.prisma.quizz.deleteMany();
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
        rubriques: [
          { id: 1, titre: 'A' },
          { id: 2, titre: 'B' },
        ],
        partenaire: {
          id: 1,
          nom: 'Angers Loire Métropole',
          lien: 'https://www.angersloiremetropole.fr/',
        },
        source: 'La source',
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
  static questionsKYCData(override?) {
    return {
      utilisateurId: 'utilisateur-id',
      data: {
        liste_questions: [
          {
            id: '2',
            question: `Quel est votre sujet principal d'intéret ?`,
            type: TypeReponseQuestionKYC.choix_multiple,
            is_NGC: false,
            categorie: CategorieQuestionKYC.service,
            points: 10,
            reponse: ['Le climat', 'Mon logement'],
            reponses_possibles: [
              'Le climat',
              'Mon logement',
              'Ce que je mange',
            ],
          },
        ],
      },
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

  static articleData(override?) {
    return {
      content_id: '1',
      titre: 'titre',
      soustitre: 'sousTitre',
      source: 'ADEME',
      image_url: 'https://',
      partenaire: 'Angers',
      rubrique_ids: ['3', '4'],
      rubrique_labels: ['r3', 'r4'],
      codes_postaux: ['91120'],
      duree: 'pas long',
      frequence: 'souvent',
      difficulty: 1,
      points: 10,
      thematique_gamification: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
      ...override,
    };
  }
  static quizzData(override?) {
    return {
      content_id: '1',
      titre: 'titre',
      soustitre: 'sousTitre',
      source: 'ADEME',
      image_url: 'https://',
      partenaire: 'Angers',
      rubrique_ids: ['3', '4'],
      rubrique_labels: ['r3', 'r4'],
      codes_postaux: ['91120'],
      duree: 'pas long',
      frequence: 'souvent',
      difficulty: 1,
      points: 10,
      thematique_gamification: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
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
      commune: 'Palaiseau',
      revenu_fiscal: 10000,
      parts: 2,
      abonnement_ter_loire: false,
      prm: null,
      code_departement: null,
      active_account: true,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      code: '123456',
      code_generation_time: new Date(),
      failed_checkcode_count: 0,
      prevent_checkcode_before: new Date(),
      sent_email_count: 0,
      prevent_sendemail_before: new Date(),
      version: 0,
      todo: new ParcoursTodo(),
      gamification: {
        points: 10,
        celebrations: [
          {
            id: 'celebration-id',
            type: 'niveau',
            new_niveau: 2,
            titre: 'the titre',
            reveal: {
              id: 'reveal-id',
              feature: 'aides',
              titre: 'Les aides !',
              description: 'bla',
              url: 'url',
            },
          },
        ],
      },
      unlocked_features: { unlocked_feature_list: ['aides'] },
      history: {
        article_interactions: [
          {
            content_id: '1',
            like_level: 2,
            points_en_poche: true,
            read_date: new Date(123).toISOString(),
          },
        ],
      },
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
      created_at: undefined,
      updated_at: undefined,
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
  static thematiqueData(override?) {
    return {
      id: 'thematique-id',
      id_cms: 1,
      titre: 'titre',
      ...override,
    };
  }
  static serviceData(override?) {
    return {
      id: 'service-id',
      utilisateurId: 'utilisateur-id',
      serviceDefinitionId: 'dummy_live',
      ...override,
    };
  }
  static serviceDefinitionData(override?) {
    return {
      id: 'dummy_live',
      titre: 'titre',
      url: 'url',
      icon_url: 'icon_url',
      image_url: 'image_url',
      is_local: true,
      is_url_externe: true,
      minute_period: 20,
      scheduled_refresh: null,
      dynamic_data: {},
      last_refresh: null,
      description: 'desc',
      sous_description: 'sous desc',
      en_construction: false,
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
      points_en_poche: false,
      score: 0.5,
      quizz_score: 50,
      locked: false,
      pinned_at_position: null,
      raison_lock: 'bla',
      codes_postaux: [],
      scheduled_reset: null,
      day_period: null,
      utilisateurId: 'utilisateur-id',
      like_level: 2,
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

  static groupeData(override?) {
    return {
      id: 'groupe-id',
      name: 'name',
      description: 'description',
      ...override,
    };
  }
  static groupeAbonnementData(override?) {
    return {
      groupeId: 'groupe-id',
      utilisateurId: 'utilisateur-id',
      admin: true,
      ...override,
    };
  }
  static linkyData(override?) {
    return {
      id: 'linky-id',
      prm: 'abc',
      pk_winter: '1234',
      data: [
        {
          time: new Date(),
          value: 100,
          value_at_normal_temperature: 110,
        },
      ],
      ...override,
    };
  }
}
