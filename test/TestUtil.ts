import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';
//import { PrismaService as PrismaService_STATS } from '../src/infrastructure/prisma/stats/prisma.service.stats';
import { Thematique } from '../src/domain/contenu/thematique';
import {
  Consommation,
  Repas,
  ThematiqueOnboarding as ThematiqueOnboarding,
} from '../src/domain/onboarding/onboarding';
import { CMSModel } from '../src/infrastructure/api/types/cms/CMSModels';
import { CMSEvent } from '../src/infrastructure/api/types/cms/CMSEvent';
import { Impact } from '../src/domain/onboarding/onboarding';
const request = require('supertest');
import { JwtService } from '@nestjs/jwt';
import { ParcoursTodo } from '../src/domain/todo/parcoursTodo';
import { TypeReponseQuestionKYC } from '../src/domain/kyc/questionKYC';
import { ThematiqueRepository } from '../src/infrastructure/repository/thematique.repository';
import { Feature } from '../src/domain/gamification/feature';
import { UnlockedFeatures_v1 } from '../src/domain/object_store/unlockedFeatures/unlockedFeatures_v1';
import { ParcoursTodo_v0 } from '../src/domain/object_store/parcoursTodo/parcoursTodo_v0';
import { History_v0 } from '../src/domain/object_store/history/history_v0';
import { Gamification_v0 } from '../src/domain/object_store/gamification/gamification_v0';
import { CelebrationType } from '../src/domain/gamification/celebrations/celebration';
import { Onboarding_v0 } from '../src/domain/object_store/Onboarding/onboarding_v0';
import { OnboardingResult_v0 } from '../src/domain/object_store/onboardingResult/onboardingResult_v0';
import { KYCHistory_v0 } from '../src/domain/object_store/kyc/kycHistory_v0';
import { Equipements_v0 } from '../src/domain/object_store/equipement/equipement_v0';
import {
  Consommation100km,
  VehiculeType,
  VoitureCarburant,
  VoitureGabarit,
} from '../src/domain/equipements/vehicule';
import { Logement_v0 } from '../src/domain/object_store/logement/logement_v0';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../src/domain/logement/logement';
import {
  Empreinte,
  SituationNGC,
  Suivi,
  Univers as UniversDB,
  ThematiqueUnivers as ThematiqueUniversDB,
  Mission,
  KYC,
} from '.prisma/client';
import {
  Aide,
  Article,
  Defi,
  DefiStatistique,
  Groupe,
  GroupeAbonnement,
  Linky,
  Quizz,
  Service,
  ServiceDefinition,
  UniversStatistique,
  Utilisateur,
} from '@prisma/client';
import { ServiceStatus } from '../src/domain/service/service';
import { TransportQuotidien } from '../src/domain/transport/transport';
import { Transport_v0 } from '../src/domain/object_store/transport/transport_v0';
import { DefiHistory_v0 } from '../src/domain/object_store/defi/defiHistory_v0';
import { DefiStatus } from '../src/domain/defis/defi';
import { TagUtilisateur } from '../src/domain/scoring/tagUtilisateur';
import { Besoin } from '../src/domain/aides/besoin';
import { Univers } from '../src/domain/univers/univers';
import { ThematiqueUnivers } from '../src/domain/univers/thematiqueUnivers';
import { ContentType } from '../src/domain/contenu/contentType';
import { Tag } from '../src/domain/scoring/tag';
import { KYCID } from '../src/domain/kyc/KYCID';
import { Categorie } from '../src/domain/contenu/categorie';

export enum DB {
  CMSWebhookAPI = 'CMSWebhookAPI',
  situationNGC = 'situationNGC',
  suivi = 'suivi',
  utilisateur = 'utilisateur',
  aide = 'aide',
  defi = 'defi',
  empreinte = 'empreinte',
  service = 'service',
  groupeAbonnement = 'groupeAbonnement',
  groupe = 'groupe',
  serviceDefinition = 'serviceDefinition',
  thematique = 'thematique',
  univers = 'univers',
  thematiqueUnivers = 'thematiqueUnivers',
  linky = 'linky',
  article = 'article',
  quizz = 'quizz',
  defiStatistique = 'defiStatistique',
  mission = 'mission',
  kYC = 'kYC',
  universStatistique = 'universStatistique',
}
export class TestUtil {
  private static TYPE_DATA_MAP: Record<DB, Function> = {
    CMSWebhookAPI: TestUtil.CMSWebhookAPIData,
    situationNGC: TestUtil.situationNGCData,
    suivi: TestUtil.suiviData,
    utilisateur: TestUtil.utilisateurData,
    aide: TestUtil.aideData,
    defi: TestUtil.defiData,
    empreinte: TestUtil.empreinteData,
    service: TestUtil.serviceData,
    groupeAbonnement: TestUtil.groupeAbonnementData,
    groupe: TestUtil.groupeData,
    serviceDefinition: TestUtil.serviceDefinitionData,
    thematique: TestUtil.thematiqueData,
    linky: TestUtil.linkyData,
    article: TestUtil.articleData,
    quizz: TestUtil.quizzData,
    univers: TestUtil.universData,
    thematiqueUnivers: TestUtil.thematiqueUniversData,
    defiStatistique: TestUtil.defiStatistiqueData,
    mission: TestUtil.missionData,
    kYC: TestUtil.kycData,
    universStatistique: TestUtil.universStatistiqueData,
  };

  constructor() {}
  public static app: INestApplication;
  public static prisma = new PrismaService();
  //  public static prisma_stats = new PrismaService_STATS();
  public static utilisateur = 'utilisateur';
  public static suivi = 'suivi';
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
    await this.prisma.service.deleteMany();
    await this.prisma.groupeAbonnement.deleteMany();
    await this.prisma.groupe.deleteMany();
    await this.prisma.serviceDefinition.deleteMany();
    await this.prisma.empreinte.deleteMany();
    await this.prisma.utilisateur.deleteMany();
    await this.prisma.situationNGC.deleteMany();
    await this.prisma.thematique.deleteMany();
    await this.prisma.linky.deleteMany();
    await this.prisma.article.deleteMany();
    await this.prisma.quizz.deleteMany();
    await this.prisma.aide.deleteMany();
    await this.prisma.defi.deleteMany();
    await this.prisma.linkyConsentement.deleteMany();
    await this.prisma.statistique.deleteMany();
    await this.prisma.articleStatistique.deleteMany();
    await this.prisma.defiStatistique.deleteMany();
    await this.prisma.univers.deleteMany();
    await this.prisma.thematiqueUnivers.deleteMany();
    await this.prisma.quizStatistique.deleteMany();
    await this.prisma.kycStatistique.deleteMany();
    await this.prisma.mission.deleteMany();
    await this.prisma.kYC.deleteMany();
    await this.prisma.fileAttente.deleteMany();
    await this.prisma.thematiqueStatistique.deleteMany();
    await this.prisma.universStatistique.deleteMany();
    await this.prisma.servicesFavorisStatistique.deleteMany();
    await this.prisma.bilanCarboneStatistique.deleteMany();

    ThematiqueRepository.resetAllRefs();
  }

  static getDate(date: string) {
    return new Date(Date.parse(date));
  }

  static async create(type: DB, override?) {
    await this.prisma[type].create({
      data: TestUtil.TYPE_DATA_MAP[type](override),
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
        thematique_principale: { id: 1, titre: 'Alimentation' },
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
  static suiviData(override?): Suivi {
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

  static quizzData(override?: Partial<Quizz>): Quizz {
    return {
      content_id: '1',
      titre: 'titreA',
      soustitre: 'sousTitre',
      source: 'ADEME',
      image_url: 'https://',
      partenaire: 'Angers',
      tags_utilisateur: [],
      rubrique_ids: ['3', '4'],
      rubrique_labels: ['r3', 'r4'],
      codes_postaux: ['91120'],
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
      universes: [Univers.alimentation],
      thematiquesUnivers: [ThematiqueUnivers.manger_local],
      created_at: undefined,
      updated_at: undefined,
      categorie: Categorie.recommandation,
      mois: [],
      conditions: [],
      ...override,
    };
  }

  static missionData(override?: Partial<Mission>): Mission {
    return {
      id_cms: 1,
      thematique_univers: ThematiqueUnivers.cereales,
      est_visible: true,
      objectifs: [
        {
          titre: 'obj 1',
          content_id: '_1',
          type: ContentType.kyc,
          points: 10,
        },
        {
          titre: 'obj 2',
          content_id: '1',
          type: ContentType.article,
          points: 25,
        },
      ],
      prochaines_thematiques: [
        ThematiqueUnivers.manger_local,
        ThematiqueUnivers.dechets_compost,
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
      points: 10,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
      thematique: Thematique.climat,
      type: TypeReponseQuestionKYC.choix_multiple,
      reponses: [
        {
          code: 'c123',
          reponse: 'la reponse D',
        },
      ],
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }

  static empreinteData(override?): Empreinte {
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
  static utilisateurData(override?): Utilisateur {
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
          universes: [Univers.climat],
          accessible: false,
          motif: 'bidon',
          categorie: Categorie.recommandation,
          mois: [],
          conditions: [],
        },
      ],
    };

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_questions: [
        {
          id: KYCID._2,
          id_cms: 2,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
          ],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
          ],
          tags: [],
          universes: [Univers.climat],
        },
      ],
    };
    const todo: ParcoursTodo_v0 = ParcoursTodo_v0.serialise(new ParcoursTodo());

    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
    };

    const equipements: Equipements_v0 = {
      version: 0,
      vehicules: [
        {
          nom: 'titine',
          carburant: VoitureCarburant.E85,
          a_plus_de_10_ans: true,
          est_en_autopartage: false,
          conso_100_km: Consommation100km.entre_5_10L,
          gabarit: VoitureGabarit.berline,
          type: VehiculeType.voiture,
        },
      ],
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

    const transport: Transport_v0 = {
      version: 0,
      avions_par_an: 2,
      transports_quotidiens: [
        TransportQuotidien.velo,
        TransportQuotidien.voiture,
      ],
    };
    /*
    const onboarding: Onboarding_v0 = {
      version: 0,
      transports: [TransportQuotidien.voiture, TransportQuotidien.pied],
      avion: 2,
      code_postal: '91120',
      adultes: 2,
      enfants: 1,
      residence: TypeLogement.maison,
      proprietaire: true,
      superficie: Superficie.superficie_100,
      chauffage: Chauffage.bois,
      repas: Repas.tout,
      consommation: Consommation.raisonnable,
      commune: 'PALAISEAU',
    };

    const onboardingRes: OnboardingResult_v0 = {
      version: 0,
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
    };
    */

    return {
      id: 'utilisateur-id',
      nom: 'nom',
      prenom: 'prenom',
      annee_naissance: 1979,
      passwordHash: 'hash',
      passwordSalt: 'salt',
      email: 'yo@truc.com',
      revenu_fiscal: 10000,
      parts: 2,
      abonnement_ter_loire: false,
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
      migration_enabled: false,
      todo: todo,
      gamification: gamification,
      unlocked_features: unlocked,
      history: history,
      /*
      onboardingData: onboarding,
      onboardingResult: onboardingRes,
      */
      onboardingData: {} as any,
      onboardingResult: {} as any,
      created_at: undefined,
      updated_at: undefined,
      kyc: kyc,
      defis: defis,
      equipements: equipements,
      logement: logement,
      transport: transport,
      tag_ponderation_set: {},
      force_connexion: false,
      derniere_activite: null,
      missions: {},
      bilbiotheque_services: {},
      db_version: 0,
      ...override,
    };
  }
  static thematiqueData(override?): Thematique {
    return {
      id: 'thematique-id',
      id_cms: 1,
      titre: 'titre',
      ...override,
    };
  }
  static universData(override?: Partial<UniversDB>): UniversDB {
    return {
      id_cms: 1,
      label: 'Le Climat !',
      code: Univers.climat,
      image_url: 'https://',
      is_locked: false,
      created_at: undefined,
      updated_at: undefined,
      ...override,
    };
  }
  static thematiqueUniversData(
    override?: Partial<ThematiqueUniversDB>,
  ): ThematiqueUniversDB {
    return {
      id_cms: 1,
      label: `C'est bon les céréales`,
      code: ThematiqueUnivers.cereales,
      image_url: 'https://',
      univers_parent: Univers.climat,
      created_at: undefined,
      updated_at: undefined,
      niveau: 0,
      famille_id_cms: 1,
      famille_ordre: 0,
      ...override,
    };
  }
  static serviceData(override?): Service {
    return {
      id: 'service-id',
      utilisateurId: 'utilisateur-id',
      serviceDefinitionId: 'dummy_live',
      configuration: {},
      status: ServiceStatus.CREATED,
      ...override,
    };
  }
  static serviceDefinitionData(override?): ServiceDefinition {
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
      ...override,
    };
  }
  static groupeData(override?): Groupe {
    return {
      id: 'groupe-id',
      name: 'name',
      description: 'description',
      ...override,
    };
  }
  static groupeAbonnementData(override?): GroupeAbonnement {
    return {
      groupeId: 'groupe-id',
      utilisateurId: 'utilisateur-id',
      admin: true,
      ...override,
    };
  }
  static linkyData(override?): Linky {
    return {
      prm: 'abc',
      winter_pk: '123',
      utilisateurId: 'utilisateur-id',
      data: [
        {
          time: new Date(123),
          value: 100,
          value_at_normal_temperature: 110,
        },
        {
          time: new Date(456),
          value: 110,
          value_at_normal_temperature: 120,
        },
      ],
      ...override,
    };
  }
  static articleData(override?: Partial<Article>): Article {
    return {
      content_id: 'contentId',
      titre: 'Titre de mon article',
      soustitre: 'Sous titre de mon article',
      source: undefined,
      image_url: undefined,
      partenaire: undefined,
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
