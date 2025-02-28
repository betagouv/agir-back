import {
  Action,
  AideExpirationWarning,
  BlockText,
  Conformite,
  FAQ,
  KYC,
  Mission,
  OIDC_STATE,
  Partenaire,
  SituationNGC,
  Thematique as ThematiqueDB,
} from '.prisma/client';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Aide,
  Article,
  Defi,
  DefiStatistique,
  Linky,
  Quizz,
  Service,
  ServiceDefinition,
  UniversStatistique,
  Utilisateur,
} from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeAction } from '../src/domain/actions/typeAction';
import { Besoin } from '../src/domain/aides/besoin';
import { Echelle } from '../src/domain/aides/echelle';
import { CategorieRecherche } from '../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { Categorie } from '../src/domain/contenu/categorie';
import { ContentType } from '../src/domain/contenu/contentType';
import { DefiStatus } from '../src/domain/defis/defi';
import { CelebrationType } from '../src/domain/gamification/celebrations/celebration';
import { Feature } from '../src/domain/gamification/feature';
import { KYCID } from '../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC, Unite } from '../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../src/domain/logement/logement';
import { CanalNotification } from '../src/domain/notification/notificationHistory';
import { DefiHistory_v0 } from '../src/domain/object_store/defi/defiHistory_v0';
import { Gamification_v0 } from '../src/domain/object_store/gamification/gamification_v0';
import { History_v0 } from '../src/domain/object_store/history/history_v0';
import { KYCHistory_v2 } from '../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../src/domain/object_store/logement/logement_v0';
import { NotificationHistory_v0 } from '../src/domain/object_store/notification/NotificationHistory_v0';
import { ThematiqueHistory_v0 } from '../src/domain/object_store/thematique/thematiqueHistory_v0';
import { UnlockedFeatures_v1 } from '../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { Tag } from '../src/domain/scoring/tag';
import { TagUtilisateur } from '../src/domain/scoring/tagUtilisateur';
import { ServiceStatus } from '../src/domain/service/service';
import { Thematique } from '../src/domain/thematique/thematique';
import {
  SourceInscription,
  UtilisateurStatus,
} from '../src/domain/utilisateur/utilisateur';
import { CMSEvent } from '../src/infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../src/infrastructure/api/types/cms/CMSModels';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { PrismaServiceStat } from '../src/infrastructure/prisma/stats/prisma.service.stats';
import { ConformiteRepository } from '../src/infrastructure/repository/conformite.repository';
import { DefiRepository } from '../src/infrastructure/repository/defi.repository';
import { KycRepository } from '../src/infrastructure/repository/kyc.repository';
import { MissionRepository } from '../src/infrastructure/repository/mission.repository';
import { PartenaireRepository } from '../src/infrastructure/repository/partenaire.repository';
import { ThematiqueRepository } from '../src/infrastructure/repository/thematique.repository';

export enum DB {
  CMSWebhookAPI = 'CMSWebhookAPI',
  situationNGC = 'situationNGC',
  utilisateur = 'utilisateur',
  aide = 'aide',
  fAQ = 'fAQ',
  blockText = 'blockText',
  conformite = 'conformite',
  defi = 'defi',
  service = 'service',
  serviceDefinition = 'serviceDefinition',
  thematique = 'thematique',
  linky = 'linky',
  article = 'article',
  partenaire = 'partenaire',
  aideExpirationWarning = 'aideExpirationWarning',
  quizz = 'quizz',
  defiStatistique = 'defiStatistique',
  mission = 'mission',
  kYC = 'kYC',
  universStatistique = 'universStatistique',
  action = 'action',
  OIDC_STATE = 'OIDC_STATE',
}

export class TestUtil {
  private static TYPE_DATA_MAP = {
    CMSWebhookAPI: TestUtil.CMSWebhookAPIData,
    situationNGC: TestUtil.situationNGCData,
    utilisateur: TestUtil.utilisateurData,
    aide: TestUtil.aideData,
    conformite: TestUtil.conformiteData,
    defi: TestUtil.defiData,
    action: TestUtil.actionData,
    service: TestUtil.serviceData,
    serviceDefinition: TestUtil.serviceDefinitionData,
    thematique: TestUtil.thematiqueData,
    linky: TestUtil.linkyData,
    article: TestUtil.articleData,
    partenaire: TestUtil.partenaireData,
    fAQ: TestUtil.fAQData,
    blockText: TestUtil.blockTextData,
    aideExpirationWarning: TestUtil.aideExpirationWarningData,
    quizz: TestUtil.quizzData,
    defiStatistique: TestUtil.defiStatistiqueData,
    mission: TestUtil.missionData,
    kYC: TestUtil.kycData,
    universStatistique: TestUtil.universStatistiqueData,
    OIDC_STATE: TestUtil.OIDC_STATEData,
  };

  constructor() {}
  public static ok_appclose = true;
  public static app: INestApplication;
  public static prisma = new PrismaService();
  public static prisma_stats = new PrismaServiceStat();
  public static utilisateur = 'utilisateur';
  public static SECRET = '123456789012345678901234567890';
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

  static getSitutationIdFromRedirectURL(url: string): string {
    let situtation_id = url.split('=')[1];
    return situtation_id.substring(0, situtation_id.indexOf('&'));
  }

  static async appinit() {
    if (TestUtil.app === undefined) {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      TestUtil.app = moduleFixture.createNestApplication();
      await TestUtil.app.init();
    }
  }
  static async appclose() {
    if (TestUtil.ok_appclose) {
      await this.app.close();
      await this.prisma.$disconnect();
    }
  }

  static async deleteAll() {
    await this.prisma.service.deleteMany();
    await this.prisma.serviceDefinition.deleteMany();
    await this.prisma.utilisateur.deleteMany();
    await this.prisma.situationNGC.deleteMany();
    await this.prisma.thematique.deleteMany();
    await this.prisma.linky.deleteMany();
    await this.prisma.article.deleteMany();
    await this.prisma.quizz.deleteMany();
    await this.prisma.aide.deleteMany();
    await this.prisma.defi.deleteMany();
    await this.prisma.action.deleteMany();
    await this.prisma.linkyConsentement.deleteMany();
    await this.prisma.statistique.deleteMany();
    await this.prisma.articleStatistique.deleteMany();
    await this.prisma.defiStatistique.deleteMany();
    await this.prisma.quizStatistique.deleteMany();
    await this.prisma.kycStatistique.deleteMany();
    await this.prisma.mission.deleteMany();
    await this.prisma.kYC.deleteMany();
    await this.prisma.thematiqueStatistique.deleteMany();
    await this.prisma.universStatistique.deleteMany();
    await this.prisma.servicesFavorisStatistique.deleteMany();
    await this.prisma.bilanCarboneStatistique.deleteMany();
    await this.prisma.partenaire.deleteMany();
    await this.prisma.aideExpirationWarning.deleteMany();
    await this.prisma.conformite.deleteMany();
    await this.prisma.communesAndEPCI.deleteMany();
    await this.prisma.oIDC_STATE.deleteMany();
    await this.prisma.fAQ.deleteMany();
    await this.prisma.blockText.deleteMany();

    await this.prisma_stats.testTable.deleteMany();
    await this.prisma_stats.utilisateurCopy.deleteMany();

    ThematiqueRepository.resetCache();
    DefiRepository.resetCache();
    KycRepository.resetCache();
    MissionRepository.resetCache();
    PartenaireRepository.resetCache();
    ConformiteRepository.resetCache();
  }

  static getDate(date: string) {
    return new Date(Date.parse(date));
  }

  static async create<K extends keyof typeof TestUtil.TYPE_DATA_MAP>(
    type: K,
    override?: // NOTE: Assumes function has only one parameter
    Parameters<(typeof TestUtil.TYPE_DATA_MAP)[K]>[0],
  ) {
    await this.prisma[type as string].create({
      data: (TestUtil.TYPE_DATA_MAP[type as DB] as Function)(override),
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
        thematique_principale: {
          id: 1,
          titre: 'Alimentation',
          code: Thematique.alimentation,
        },
        thematiques: [
          { id: 1, titre: 'Alimentation', code: Thematique.alimentation },
          { id: 2, titre: 'Climat', code: Thematique.climat },
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
  static situationNGCData(override?): SituationNGC {
    return {
      id: 'situationNGC-id',
      situation: {
        'transport . voiture . km': 12000,
      },
      created_at: new Date(),
      ...override,
    };
  }

  static quizzData(override?: Partial<Quizz>): Quizz {
    return {
      content_id: '1',
      article_id: undefined,
      questions: undefined,
      titre: 'titreA',
      soustitre: 'sousTitre',
      source: 'ADEME',
      image_url: 'https://',
      partenaire_id: undefined,
      tags_utilisateur: [],
      rubrique_ids: ['3', '4'],
      rubrique_labels: ['r3', 'r4'],
      codes_postaux: [],
      duree: 'pas long',
      frequence: 'souvent',
      difficulty: 1,
      points: 10,
      thematique_principale: Thematique.climat,
      thematiques: [Thematique.climat, Thematique.logement],
      created_at: undefined,
      updated_at: undefined,
      categorie: Categorie.recommandation,
      mois: [],
      ...override,
    };
  }

  static aideData(override?: Partial<Aide>): Aide {
    return {
      content_id: '1',
      titre: 'titreA',
      date_expiration: null,
      derniere_maj: null,
      partenaire_id: undefined,
      codes_postaux: ['91120'],
      thematiques: [Thematique.climat, Thematique.logement],
      contenu: "Contenu de l'aide",
      is_simulateur: true,
      montant_max: 999,
      url_simulateur: '/aides/velo',
      created_at: undefined,
      updated_at: undefined,
      besoin: Besoin.acheter_velo,
      besoin_desc: 'Acheter un vélo',
      include_codes_commune: [],
      exclude_codes_commune: [],
      codes_departement: [],
      codes_region: [],
      echelle: Echelle.National,
      url_source: 'https://hello',
      url_demande: 'https://demande',
      est_gratuit: false,
      ...override,
    };
  }
  static conformiteData(override?: Partial<Conformite>): Conformite {
    return {
      id_cms: '1',
      titre: 'titreA',
      contenu: 'content',
      code: 'code',
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static defiData(override?: Partial<Defi>): Defi {
    return {
      content_id: '123',
      titre: 'titreA',
      astuces: 'astucesss',
      pourquoi: 'pfpaf',
      points: 5,
      sous_titre: 'ssss',
      tags: [TagUtilisateur.appetence_cafe],
      thematique: Thematique.consommation,
      created_at: undefined,
      updated_at: undefined,
      categorie: Categorie.recommandation,
      mois: [],
      conditions: [],
      impact_kg_co2: 5,
      ...override,
    };
  }
  static actionData(override?: Partial<Action>): Action {
    return {
      type_code_id: 'classique_code_fonct',
      cms_id: '111',
      titre: 'The titre',
      sous_titre: 'Sous titre',
      code: 'code_fonct',
      besoins: [],
      comment: 'Astuces',
      quizz_felicitations: 'bien',
      pourquoi: 'En quelques mots',
      kyc_ids: [],
      faq_ids: [],
      lvo_action: CategorieRecherche.emprunter,
      lvo_objet: 'chaussure',
      quizz_ids: [],
      recette_categorie: CategorieRecherche.dinde_volaille,
      type: TypeAction.classique,
      thematique: Thematique.consommation,
      tags_excluants: [],
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }

  static OIDC_STATEData(override?: Partial<OIDC_STATE>): OIDC_STATE {
    return {
      state: '123',
      idtoken: '456',
      utilisateurId: 'utilisateur-id',
      nonce: '789',
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }

  static missionData(override?: Partial<Mission>): Mission {
    return {
      id_cms: 1,
      est_visible: true,
      est_examen: false,
      thematique: Thematique.alimentation,
      code: 'code',
      image_url: 'https://theimage',
      titre: 'the title',
      introduction: 'une introduction',
      is_first: false,
      objectifs: [
        {
          titre: 'obj 1',
          content_id: '1',
          type: ContentType.kyc,
          points: 10,
          id_cms: 1,
        },
        {
          titre: 'obj 2',
          content_id: '2',
          type: ContentType.article,
          points: 25,
          id_cms: 2,
        },
      ],
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }

  static kycData(override?: Partial<KYC>): KYC {
    return {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: KYCID.KYC001,
      is_ngc: false,
      a_supprimer: false,
      points: 10,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_multiple,
      ngc_key: 'a . b . c',
      reponses: [
        {
          code: 'c123',
          reponse: 'la reponse D',
        },
        { label: 'Le climat', code: Thematique.climat },
        { label: 'Mon logement', code: Thematique.logement },
        { label: 'Ce que je mange', code: Thematique.alimentation },
      ],
      short_question: 'short',
      image_url: 'URL',
      unite: Unite.euro,
      emoji: '🎉',
      conditions: [],

      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }

  static utilisateurData(override?: Partial<Utilisateur>): Utilisateur {
    const unlocked: UnlockedFeatures_v1 = {
      version: 1,
      unlocked_features: [Feature.aides, Feature.defis],
    };

    const defis: DefiHistory_v0 = {
      version: 0,
      defis: [
        {
          id: '001',
          points: 10,
          tags: [],
          titre: 'titre',
          thematique: Thematique.transport,
          astuces: 'ASTUCE',
          date_acceptation: null,
          pourquoi: 'POURQUOI',
          sous_titre: 'SOUS TITRE',
          status: DefiStatus.todo,
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
          sont_points_en_poche: false,
          impact_kg_co2: 5,
        },
      ],
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      answered_questions: [
        {
          code: KYCID._2,
          last_update: undefined,
          id_cms: 2,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.test,
          points: 10,
          reponse_complexe: [
            {
              label: 'Le climat',
              code: Thematique.climat,
              ngc_code: '123',
              selected: true,
            },
            {
              label: 'Mon logement',
              code: Thematique.logement,
              selected: true,
              ngc_code: '123',
            },
          ],
          tags: [],
          short_question: 'short',
          image_url: 'URL',
          conditions: [],
          unite: Unite.euro,
          emoji: '🎉',
          ngc_key: '1223',
          thematique: Thematique.climat,
          reponse_simple: undefined,
        },
      ],
    };

    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [],
    };

    const notifications: NotificationHistory_v0 = {
      version: 0,
      sent_notifications: [],
      enabled_canals: [CanalNotification.email, CanalNotification.mobile],
    };

    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_tags_excluants: [],
      liste_thematiques: [],
      liste_actions_vues: [],
    };

    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      celebrations: [
        {
          id: 'celebration-id',
          type: CelebrationType.niveau,
          new_niveau: 2,
          titre: 'the titre',
          reveal: {
            id: 'reveal-id',
            feature: Feature.aides,
            titre: 'Les aides !',
            description: 'bla',
          },
        },
      ],
    };

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
    };

    return {
      id: 'utilisateur-id',
      nom: 'nom',
      prenom: 'prenom',
      annee_naissance: 1979,
      passwordHash: 'hash',
      passwordSalt: 'salt',
      email: 'yo@truc.com',
      revenu_fiscal: 10000,
      parts: 2 as any,
      abonnement_ter_loire: false,
      active_account: true,
      failed_login_count: 0,
      prevent_login_before: new Date(),
      code: null,
      code_generation_time: new Date(),
      failed_checkcode_count: 0,
      prevent_checkcode_before: new Date(),
      sent_email_count: 0,
      prevent_sendemail_before: new Date(),
      version: 0,
      migration_enabled: false,
      gamification: gamification as any,
      unlocked_features: unlocked as any,
      history: history as any,
      created_at: undefined,
      updated_at: undefined,
      kyc: kyc as any,
      defis: defis as any,
      logement: logement as any,
      tag_ponderation_set: {},
      force_connexion: false,
      derniere_activite: null,
      missions: {},
      bilbiotheque_services: {},
      db_version: 0,
      is_magic_link_user: false,
      points_classement: 0,
      code_postal_classement: null,
      commune_classement: null,
      rank: null,
      rank_commune: null,
      status: UtilisateurStatus.default,
      couverture_aides_ok: false,
      source_inscription: SourceInscription.web,
      unsubscribe_mail_token: null,
      notification_history: notifications as any,
      thematique_history: thematique_history as any,
      est_valide_pour_classement: true,
      brevo_created_at: null,
      brevo_updated_at: null,
      mobile_token: null,
      mobile_token_updated_at: null,
      code_commune: null,
      france_connect_sub: null,
      external_stat_id: null,
      ...override,
    };
  }
  static thematiqueData(override?: Partial<ThematiqueDB>): ThematiqueDB {
    return {
      code: Thematique.alimentation,
      titre: 'titre',
      id_cms: 1,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static partenaireData(override?: Partial<Partenaire>): Partenaire {
    return {
      content_id: '123',
      image_url: 'logo_url',
      nom: 'ADEME',
      url: 'https://ademe.fr',
      echelle: Echelle.National,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static fAQData(override?: Partial<FAQ>): FAQ {
    return {
      id_cms: '123',
      question: 'question',
      reponse: 'reponse',
      thematique: Thematique.transport,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static blockTextData(override?: Partial<BlockText>): BlockText {
    return {
      id_cms: '123',
      code: '456',
      titre: 'titre',
      texte: 'texte',
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static aideExpirationWarningData(
    override?: Partial<AideExpirationWarning>,
  ): AideExpirationWarning {
    return {
      aide_cms_id: '123',
      expired: false,
      expired_sent: false,
      last_month: false,
      last_month_sent: false,
      last_week: false,
      last_week_sent: false,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static serviceData(override?: Partial<Service>): Service {
    return {
      id: 'service-id',
      utilisateurId: 'utilisateur-id',
      serviceDefinitionId: 'dummy_live',
      configuration: {},
      status: ServiceStatus.CREATED,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static serviceDefinitionData(
    override?: Partial<ServiceDefinition>,
  ): ServiceDefinition {
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
      parametrage_requis: true,
      thematiques: ['climat', 'logement'],
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static linkyData(override?: Partial<Linky>): Linky {
    return {
      prm: 'abc',
      winter_pk: '123',
      utilisateurId: 'utilisateur-id',
      data: [
        {
          date: new Date(123),
          day_value: 100,
          value_cumulee: null,
        },
        {
          date: new Date(456),
          day_value: 110,
          value_cumulee: null,
        },
      ] as any,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static articleData(override?: Partial<Article>): Article {
    return {
      content_id: 'contentId',
      titre: 'Titre de mon article',
      soustitre: 'Sous titre de mon article',
      derniere_maj: null,
      source: undefined,
      image_url: undefined,
      partenaire_id: undefined,
      tags_utilisateur: [],
      rubrique_ids: [],
      rubrique_labels: [],
      codes_postaux: [],
      duree: undefined,
      frequence: undefined,
      difficulty: 1,
      points: 10,
      thematiques: ['logement'],
      thematique_principale: 'logement',
      created_at: new Date(),
      updated_at: new Date(),
      categorie: Categorie.recommandation,
      mois: [],
      include_codes_commune: [],
      exclude_codes_commune: [],
      codes_departement: [],
      codes_region: [],
      echelle: Echelle.National,
      tag_article: 'composter',
      contenu: 'un long article',
      sources: [{ label: 'label', url: 'url' }],
      ...override,
    };
  }
  static defiStatistiqueData(
    override?: Partial<DefiStatistique>,
  ): DefiStatistique {
    return {
      content_id: 'contentId',
      titre: 'Titre de mon article',
      nombre_defis_abandonnes: 0,
      nombre_defis_en_cours: 0,
      nombre_defis_pas_envie: 0,
      nombre_defis_realises: 0,
      raisons_defi_pas_envie: [],
      raisons_defi_abandonne: [],
      created_at: new Date(),
      updated_at: new Date(),
      ...override,
    };
  }
  static universStatistiqueData(
    override?: Partial<UniversStatistique>,
  ): UniversStatistique {
    return {
      universId: 'universId',
      titre: 'Titre de mon article',
      completion_pourcentage_1_20: 0,
      completion_pourcentage_21_40: 0,
      completion_pourcentage_41_60: 0,
      completion_pourcentage_61_80: 0,
      completion_pourcentage_81_99: 0,
      completion_pourcentage_100: 0,
      created_at: new Date(),
      updated_at: new Date(),
      ...override,
    };
  }
}
