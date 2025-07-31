import {
  Action,
  AideExpirationWarning,
  BlockText,
  CompteurActions,
  Conformite,
  FAQ,
  KYC,
  Mission,
  OIDC_STATE,
  Partenaire,
  RisquesNaturelsCommunes,
  Selection as SelectionDB,
  SituationNGC,
  Tag as TagDB,
  Thematique as ThematiqueDB,
} from '.prisma/client';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Aide,
  Article,
  Quizz,
  Service,
  ServiceDefinition,
  Utilisateur,
} from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeAction } from '../src/domain/actions/typeAction';
import { Besoin } from '../src/domain/aides/besoin';
import { Echelle } from '../src/domain/aides/echelle';
import {
  CategorieRecherche,
  SousCategorieRecherche,
} from '../src/domain/bibliotheque_services/recherche/categorieRecherche';
import { Categorie } from '../src/domain/contenu/categorie';
import { ContentType } from '../src/domain/contenu/contentType';
import { KYCID } from '../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../src/domain/logement/logement';
import { CanalNotification } from '../src/domain/notification/notificationHistory';
import { CacheBilanCarbone_v0 } from '../src/domain/object_store/bilan/cacheBilanCarbone_v0';
import { Gamification_v0 } from '../src/domain/object_store/gamification/gamification_v0';
import { History_v0 } from '../src/domain/object_store/history/history_v0';
import { KYCHistory_v2 } from '../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../src/domain/object_store/logement/logement_v0';
import { NotificationHistory_v0 } from '../src/domain/object_store/notification/NotificationHistory_v0';
import { ProfileRecommandationUtilisateur_v0 } from '../src/domain/object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import { ThematiqueHistory_v0 } from '../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Tag_v2 } from '../src/domain/scoring/system_v2/Tag_v2';
import { Tag } from '../src/domain/scoring/tag';
import { ServiceStatus } from '../src/domain/service/service';
import { Thematique } from '../src/domain/thematique/thematique';
import {
  GlobalUserVersion,
  ModeInscription,
  SourceInscription,
  UtilisateurStatus,
} from '../src/domain/utilisateur/utilisateur';
import { CMSEvent } from '../src/infrastructure/api/types/cms/CMSEvent';
import { CMSModel } from '../src/infrastructure/api/types/cms/CMSModels';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
import { PrismaServiceStat } from '../src/infrastructure/prisma/stats/prisma.service.stats';
import { ActionRepository } from '../src/infrastructure/repository/action.repository';
import { AideRepository } from '../src/infrastructure/repository/aide.repository';
import { ArticleRepository } from '../src/infrastructure/repository/article.repository';
import { BlockTextRepository } from '../src/infrastructure/repository/blockText.repository';
import { CompteurActionsRepository } from '../src/infrastructure/repository/compteurActions.repository';
import { ConformiteRepository } from '../src/infrastructure/repository/conformite.repository';
import { FAQRepository } from '../src/infrastructure/repository/faq.repository';
import { KycRepository } from '../src/infrastructure/repository/kyc.repository';
import { PartenaireRepository } from '../src/infrastructure/repository/partenaire.repository';
import { QuizzRepository } from '../src/infrastructure/repository/quizz.repository';
import { RisquesNaturelsCommunesRepository } from '../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { SelectionRepository } from '../src/infrastructure/repository/selection.repository';
import { ServiceFavorisStatistiqueRepository } from '../src/infrastructure/repository/serviceFavorisStatistique.repository';
import { TagRepository } from '../src/infrastructure/repository/tag.repository';
import { ThematiqueRepository } from '../src/infrastructure/repository/thematique.repository';

export enum DB {
  CMSWebhookAPI = 'CMSWebhookAPI',
  situationNGC = 'situationNGC',
  utilisateur = 'utilisateur',
  aide = 'aide',
  fAQ = 'fAQ',
  blockText = 'blockText',
  tag = 'tag',
  selection = 'selection',
  conformite = 'conformite',
  service = 'service',
  serviceDefinition = 'serviceDefinition',
  thematique = 'thematique',
  article = 'article',
  partenaire = 'partenaire',
  aideExpirationWarning = 'aideExpirationWarning',
  quizz = 'quizz',
  compteurActions = 'compteurActions',
  mission = 'mission',
  kYC = 'kYC',
  action = 'action',
  OIDC_STATE = 'OIDC_STATE',
  risquesNaturelsCommunes = 'risquesNaturelsCommunes',
}

export class TestUtil {
  private static TYPE_DATA_MAP = {
    CMSWebhookAPI: TestUtil.CMSWebhookAPIData,
    situationNGC: TestUtil.situationNGCData,
    utilisateur: TestUtil.utilisateurData,
    aide: TestUtil.aideData,
    conformite: TestUtil.conformiteData,
    action: TestUtil.actionData,
    service: TestUtil.serviceData,
    serviceDefinition: TestUtil.serviceDefinitionData,
    thematique: TestUtil.thematiqueData,
    article: TestUtil.articleData,
    partenaire: TestUtil.partenaireData,
    fAQ: TestUtil.fAQData,
    compteurActions: TestUtil.compteurActionsData,
    blockText: TestUtil.blockTextData,
    tag: TestUtil.tagData,
    selection: TestUtil.selectionData,
    aideExpirationWarning: TestUtil.aideExpirationWarningData,
    quizz: TestUtil.quizzData,
    mission: TestUtil.missionData,
    kYC: TestUtil.kycData,
    OIDC_STATE: TestUtil.OIDC_STATEData,
    risquesNaturelsCommunes: TestUtil.risquesNaturelsCommunesData,
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
    await this.prisma.article.deleteMany();
    await this.prisma.quizz.deleteMany();
    await this.prisma.aide.deleteMany();
    await this.prisma.action.deleteMany();
    await this.prisma.linkyConsentement.deleteMany();
    await this.prisma.mission.deleteMany();
    await this.prisma.kYC.deleteMany();
    await this.prisma.servicesFavorisStatistique.deleteMany();
    await this.prisma.bilanCarboneStatistique.deleteMany();
    await this.prisma.partenaire.deleteMany();
    await this.prisma.aideExpirationWarning.deleteMany();
    await this.prisma.conformite.deleteMany();
    await this.prisma.communesAndEPCI.deleteMany();
    await this.prisma.oIDC_STATE.deleteMany();
    await this.prisma.fAQ.deleteMany();
    await this.prisma.compteurActions.deleteMany();
    await this.prisma.blockText.deleteMany();
    await this.prisma.servicesFavorisStatistique.deleteMany();
    await this.prisma.risquesNaturelsCommunes.deleteMany();
    await this.prisma.tag.deleteMany();
    await this.prisma.selection.deleteMany();

    await this.prisma_stats.utilisateurCopy.deleteMany();
    await this.prisma_stats.kYCCopy.deleteMany();
    await this.prisma_stats.actionCopy.deleteMany();
    await this.prisma_stats.aideCopy.deleteMany();
    await this.prisma_stats.articleCopy.deleteMany();
    await this.prisma_stats.quizzCopy.deleteMany();
    await this.prisma_stats.bilanCarbone.deleteMany();
    await this.prisma_stats.questionsUtilisateur.deleteMany();
    await this.prisma_stats.notifications.deleteMany();
    await this.prisma_stats.visites.deleteMany();

    ActionRepository.resetCache();
    ArticleRepository.resetCache();
    BlockTextRepository.resetCache();
    CompteurActionsRepository.resetCache();
    ConformiteRepository.resetCache();
    FAQRepository.resetCache();
    KycRepository.resetCache();
    PartenaireRepository.resetCache();
    ServiceFavorisStatistiqueRepository.resetCache();
    ThematiqueRepository.resetCache();
    AideRepository.resetCache();
    QuizzRepository.resetCache();
    RisquesNaturelsCommunesRepository.resetCache();
    TagRepository.resetCache();
    SelectionRepository.resetCache();
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
  static situationNGCData(override?: Partial<SituationNGC>): SituationNGC {
    return {
      id: 'situationNGC-id',
      situation: {
        'transport . voiture . km': 12000,
      },
      utilisateurId: '123',
      updated_at: undefined,
      created_at: undefined,
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
      partenaires_supp_ids: [],
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
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],
      est_gratuit: false,
      VISIBLE_PROD: true,
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

  static actionData(override?: Partial<Action>): Action {
    return {
      type_code_id: 'classique_code_fonct',
      cms_id: '111',
      titre: '**The titre**',
      titre_recherche: 'The titre',
      sous_titre: 'Sous titre',
      consigne: 'consigne',
      label_compteur: 'label_compteur',
      code: 'code_fonct',
      besoins: [],
      comment: 'Astuces',
      quizz_felicitations: 'bien',
      pourquoi: 'En quelques mots',
      kyc_codes: [],
      faq_ids: [],
      lvo_action: CategorieRecherche.emprunter,
      lvo_objet: 'chaussure',
      quizz_ids: [],
      articles_ids: [],
      recette_categorie: CategorieRecherche.dinde_volaille,
      recette_sous_categorie: SousCategorieRecherche.sans_cuisson,
      pdcn_categorie: CategorieRecherche.zero_dechet,
      type: TypeAction.classique,
      thematique: Thematique.consommation,
      tags_a_exclure_v2: [],
      tags_a_inclure_v2: [],
      sources: [],
      created_at: undefined,
      updated_at: undefined,
      VISIBLE_PROD: true,
      emoji: '🔥',
      external_id: undefined,
      partenaire_id: undefined,
      selections: [],
      ...override,
    };
  }

  static OIDC_STATEData(override?: Partial<OIDC_STATE>): OIDC_STATE {
    return {
      state: '123',
      idtoken: '456',
      utilisateurId: 'utilisateur-id',
      nonce: '789',
      situation_ngc_id: '94cfcd83-487c-4e7a-b944-d38165eb36e5',
      source_inscription: SourceInscription.mobile,
      referer: undefined,
      referer_keyword: undefined,
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
      unite: { abreviation: 'euro' },
      emoji: '🎉',
      conditions: [],

      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }

  static utilisateurData(override?: Partial<Utilisateur>): Utilisateur {
    const cache_bilan_carbone: CacheBilanCarbone_v0 = {
      version: 0,
      alimentation_kg: undefined,
      consommation_kg: undefined,
      transport_kg: undefined,
      logement_kg: undefined,
      total_kg: undefined,
      updated_at: undefined,
      est_bilan_complet: false,
      forcer_calcul_stats: false,
    };

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],
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
          unite: { abreviation: 'euro' },
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
      liste_actions_utilisateur: [],
      liste_thematiques: [],
      codes_actions_exclues: [],
      recommandations_winter: [],
    };

    const gamification: Gamification_v0 = {
      version: 0,
      points: 10,
      popup_reset_vue: false,
      badges: [],
    };

    const recommandation: ProfileRecommandationUtilisateur_v0 = {
      version: 0,
      liste_tags_actifs: [],
    };

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };

    return {
      id: 'utilisateur-id',
      nom: 'nom',
      prenom: 'prenom',
      annee_naissance: 1979,
      mois_naissance: 3,
      jour_naissance: 24,
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
      history: history as any,
      created_at: undefined,
      updated_at: undefined,
      kyc: kyc as any,
      logement: logement as any,
      tag_ponderation_set: {},
      force_connexion: false,
      derniere_activite: null,
      bilbiotheque_services: {},
      db_version: 0,
      points_classement: 0,
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
      brevo_update_disabled: false,
      mobile_token: null,
      mobile_token_updated_at: null,
      code_commune_classement: null,
      france_connect_sub: null,
      external_stat_id: null,
      pseudo: 'pseudo',
      cache_bilan_carbone: cache_bilan_carbone as any,
      global_user_version: GlobalUserVersion.V2,
      activity_dates_log: [],
      recommandation: recommandation as any,
      mode_inscription: ModeInscription.france_connect,
      referer: undefined,
      referer_keyword: undefined,
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
      code_commune: '001',
      code_epci: '002',
      echelle: Echelle.National,
      liste_communes_calculees: [],
      code_departement: undefined,
      code_region: undefined,
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
  static compteurActionsData(
    override?: Partial<CompteurActions>,
  ): CompteurActions {
    return {
      code: 'code',
      type: TypeAction.classique,
      type_code_id: 'classique_code',
      faites: 0,
      vues: 0,
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
  static tagData(override?: Partial<TagDB>): TagDB {
    return {
      id_cms: '123',
      boost: undefined,
      ponderation: undefined,
      description: 'desc',
      label_explication: 'explication',
      tag: Tag_v2.a_un_jardin,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static selectionData(override?: Partial<SelectionDB>): SelectionDB {
    return {
      id_cms: '123',
      code: '456',
      description: 'desc',
      titre: 'titre',
      image_url: 'url',
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static risquesNaturelsCommunesData(
    override?: Partial<RisquesNaturelsCommunes>,
  ): RisquesNaturelsCommunes {
    return {
      code_commune: '12345',
      nom_commune: 'city',
      nombre_cat_nat: 44,
      pourcentage_inondation: 10,
      pourcentage_secheresse: 20,
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
      contenu: 'un long article',
      sources: [{ label: 'label', url: 'url' }],
      tags_a_exclure_v2: [],
      tags_a_inclure_v2: [],
      VISIBLE_PROD: true,
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: [],

      ...override,
    };
  }
  /**
   * Create KYC questions for logement (used to test Mes Aides Reno API)
   */
  static createKYCLogement(): Promise<void[]> {
    return Promise.all([
      TestUtil.create(DB.kYC, {
        id_cms: 1,
        code: KYCID.KYC_proprietaire,
        type: TypeReponseQuestionKYC.choix_unique,
        reponses: [
          { code: 'oui', label: 'Oui' },
          { code: 'non', label: 'Non' },
        ],
      }),
      TestUtil.create(DB.kYC, {
        id_cms: 2,
        code: KYCID.KYC_DPE,
        type: TypeReponseQuestionKYC.choix_unique,
        reponses: [
          { code: 'A', label: 'A' },
          { code: 'B', label: 'B' },
          { code: 'C', label: 'C' },
          { code: 'D', label: 'D' },
          { code: 'E', label: 'E' },
          { code: 'F', label: 'F' },
          { code: 'G', label: 'G' },
        ],
      }),
      TestUtil.create(DB.kYC, {
        id_cms: 3,
        code: KYCID.KYC_logement_age,
        type: TypeReponseQuestionKYC.entier,
      }),
      TestUtil.create(DB.kYC, {
        id_cms: 4,
        code: KYCID.KYC006,
        type: TypeReponseQuestionKYC.choix_unique,
        reponses: [
          { code: 'moins_15', label: 'Moins de 15 ans (neuf ou récent)' },
          { code: 'plus_15', label: 'Plus de 15 ans' },
        ],
      }),
      TestUtil.create(DB.kYC, {
        id_cms: 5,
        code: KYCID.KYC_menage,
        type: TypeReponseQuestionKYC.entier,
      }),
      TestUtil.create(DB.kYC, {
        id_cms: 6,
        code: KYCID.KYC_type_logement,
        type: TypeReponseQuestionKYC.choix_unique,
        reponses: [
          { code: 'type_appartement', label: 'Appartement' },
          { code: 'type_maison', label: 'Maison' },
        ],
      }),
      TestUtil.create(DB.kYC, {
        id_cms: 7,
        code: KYCID.KYC_superficie,
        type: TypeReponseQuestionKYC.entier,
      }),
    ]);
  }

  static CODE_COMMUNE_FROM_PARTENAIRE = [
    '91477',
    '21231',
    '21166',
    '21617',
    '21171',
    '21515',
    '21278',
    '21355',
    '21540',
    '21390',
    '21452',
    '21485',
    '21481',
    '21605',
    '21263',
    '21003',
    '21223',
    '21473',
    '21315',
    '21105',
    '21106',
    '21370',
    '21192',
    '21270',
  ];
}
