import { KYC } from '@prisma/client';
import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { KYCHistory_v2 } from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { SourceInscription } from '../../../src/domain/utilisateur/utilisateur';
import { HomeBoardAPI } from '../../../src/infrastructure/api/types/thematiques/HomeBoardAPI';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Thematique Board (API test)', () => {
  const OLD_ENV = process.env;
  const kycRepository = new KycRepository(TestUtil.prisma);
  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
  });

  it('GET /thematiques - liste les 4 thematiques principales', async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.getServer().get('/thematiques');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_thematiques).toHaveLength(4);
  });
  it(`GET /thematiques - contenu OK d'une thématique`, async () => {
    // GIVEN
    await TestUtil.create(DB.action, {
      cms_id: '1',
      code: 'c1',
      type_code_id: 'classique_c1',
      type: TypeAction.classique,
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      code: 'c2',
      type_code_id: 'classique_c2',
      type: TypeAction.classique,
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '3',
      code: 'c3',
      type_code_id: 'classique_c3',
      type: TypeAction.classique,
      thematique: Thematique.consommation,
    });

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['91120'],
      thematiques: [Thematique.alimentation, Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['91120'],
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      codes_postaux: ['91120'],
      thematiques: [Thematique.consommation],
    });

    // WHEN
    const response = await TestUtil.getServer().get('/thematiques');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_thematiques[0]).toEqual({
      nombre_actions: 2,
      nombre_aides: 1,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
      thematique: Thematique.alimentation,
    });
  });

  it(`GET /thematiques?code_commmune - filtrage des aides par commune`, async () => {
    // GIVEN
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['91120'],
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['21000'],
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      codes_postaux: ['21800'],
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      '/thematiques?code_commune=21231',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nom_commune).toEqual('Dijon');
    expect(response.body.liste_thematiques[0]).toEqual({
      nombre_actions: 0,
      nombre_aides: 3,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
      thematique: Thematique.alimentation,
    });
  });

  it(`GET /utilisateurs/id/thematiques - filtrage des aides par commune`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'DIJON',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['91120'],
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['21000'],
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      codes_postaux: ['21800'],
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nom_commune).toEqual('Dijon');
    expect(response.body.liste_thematiques[0]).toEqual({
      nombre_actions: 0,
      nombre_aides: 3,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
      thematique: Thematique.alimentation,
    });
  });

  it(`GET /utilisateurs/id/home_board - data standards`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          vue_le: null,
          faite_le: new Date(),
          feedback: null,
          like_level: null,
          liste_questions: [],
          liste_partages: [],
        },
      ],
      liste_thematiques: [],
    };

    await TestUtil.create(DB.compteurActions, {
      code: '1',
      type: TypeAction.classique,
      vues: 1,
      type_code_id: 'classique_1',
      faites: 10,
    });
    await TestUtil.create(DB.compteurActions, {
      code: '2',
      type: TypeAction.bilan,
      vues: 1,
      type_code_id: 'bilan_2',
      faites: 3,
    });
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: thematique_history as any,
    });

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: [],
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['21000'],
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/home_board',
    );

    // THEN
    expect(response.status).toBe(200);
    const body: HomeBoardAPI = response.body;
    expect(body).toEqual({
      bilan_carbone_total_kg: 8719.051817969366,
      est_utilisateur_ngc: false,
      nombre_aides: 2,
      nombre_recettes: 1150,
      nom_commune: 'Dijon',
      pourcentage_alimentation_reco_done: 0,
      pourcentage_bilan_done: 0,
      pourcentage_consommation_reco_done: 0,
      pourcentage_global_reco_done: 0,
      pourcentage_logement_reco_done: 0,
      pourcentage_transport_reco_done: 0,
      total_national_actions_faites: 13,
      total_utilisateur_actions_faites: 1,
    });
  });

  it(`GET /utilisateurs/id/home_board - flag NGC false`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/home_board',
    );

    // THEN
    expect(response.status).toBe(200);
    const body: HomeBoardAPI = response.body;
    expect(body.est_utilisateur_ngc).toEqual(false);
  });

  it(`GET /utilisateurs/id/home_board - flag NGC true`, async () => {
    // GIVEN

    await TestUtil.create(DB.utilisateur, {
      source_inscription: SourceInscription.web_ngc,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/home_board',
    );

    // THEN
    expect(response.status).toBe(200);
    const body: HomeBoardAPI = response.body;
    expect(body.est_utilisateur_ngc).toEqual(true);
  });

  it(`GET /utilisateurs/id/home_board - force onboarding`, async () => {
    // GIVEN
    process.env.FORCE_ONBOARDING = 'true';

    await TestUtil.create(DB.utilisateur, { pseudo: null, prenom: null });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/home_board',
    );

    // THEN
    expect(response.status).toBe(400);
  });

  it(`GET /utilisateurs/id/home_board - avancement bilan carbone`, async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_alimentation_regime,
      question: `YOP`,
      reponses: [
        { code: 'vegetalien', label: 'Vegetalien', ngc_code: null },
        { code: 'vegetarien', label: 'Vegetarien', ngc_code: null },
        { code: 'peu_viande', label: 'Peu de viande', ngc_code: null },
        { code: 'chaque_jour_viande', label: 'Tous les jours', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [],
      answered_questions: [
        {
          code: 'KYC_saison_frequence',
          last_update: undefined,
          id_cms: 21,
          question: `À quelle fréquence mangez-vous de saison ? `,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponse_complexe: [
            {
              label: 'Souvent',
              code: 'souvent',
              ngc_code: '"souvent"',
              value: 'oui',
              selected: true,
            },
            {
              label: 'Jamais',
              code: 'jamais',
              ngc_code: '"bof"',
              selected: false,
            },
            {
              label: 'Parfois',
              code: 'parfois',
              ngc_code: '"burp"',
              selected: false,
            },
          ],
          tags: [],
          ngc_key: 'alimentation . de saison . consommation',
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
          reponse_simple: undefined,
          thematique: Thematique.alimentation,
        },
        {
          code: 'KYC_alimentation_regime',
          id_cms: 1,
          last_update: undefined,
          question: `Votre regime`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponse_complexe: [
            {
              code: 'vegetalien',
              label: 'Vegetalien',
              ngc_code: null,
              selected: true,
            },
            {
              code: 'vegetarien',
              label: 'Vegetarien',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'peu_viande',
              label: 'Peu de viande',
              ngc_code: null,
              selected: false,
            },
            {
              code: 'chaque_jour_viande',
              label: 'Tous les jours',
              ngc_code: null,
              selected: false,
            },
          ],
          tags: [],
          ngc_key: null,
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
          thematique: Thematique.alimentation,
          reponse_simple: undefined,
        },
      ],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 21,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
        { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
        { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
      ],
      tags: [],
      ngc_key: 'alimentation . de saison . consommation',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: { abreviation: 'kg' },
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    await kycRepository.loadCache();

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      kyc: kyc as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/home_board',
    );

    // THEN
    expect(response.status).toBe(200);
    const body: HomeBoardAPI = response.body;
    expect(body).toEqual({
      bilan_carbone_total_kg: 8684.344589438393,
      est_utilisateur_ngc: false,
      nombre_aides: 0,
      nombre_recettes: 1150,
      nom_commune: 'Dijon',
      pourcentage_alimentation_reco_done: 67,
      pourcentage_bilan_done: 18,
      pourcentage_consommation_reco_done: 0,
      pourcentage_global_reco_done: 40,
      pourcentage_logement_reco_done: 0,
      pourcentage_transport_reco_done: 0,
      total_national_actions_faites: 0,
      total_utilisateur_actions_faites: 0,
    });
  });

  it(`GET /utilisateurs/id/home_board - avancement bilan carbone compte aussi les questions skipped`, async () => {
    // GIVEN
    await TestUtil.create(DB.kYC, {
      id_cms: 1,
      code: KYCID.KYC_alimentation_regime,
      question: `YOP`,
      reponses: [
        { code: 'vegetalien', label: 'Vegetalien', ngc_code: null },
        { code: 'vegetarien', label: 'Vegetarien', ngc_code: null },
        { code: 'peu_viande', label: 'Peu de viande', ngc_code: null },
        { code: 'chaque_jour_viande', label: 'Tous les jours', ngc_code: null },
      ],
      type: TypeReponseQuestionKYC.choix_unique,
    });

    const kyc: KYCHistory_v2 = {
      version: 2,
      answered_mosaics: [],
      skipped_mosaics: [],
      skipped_questions: [
        {
          code: 'KYC_saison_frequence',
          last_update: undefined,
          id_cms: 21,
          question: `À quelle fréquence mangez-vous de saison ? `,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: true,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponse_complexe: undefined,
          tags: [],
          ngc_key: 'alimentation . de saison . consommation',
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
          reponse_simple: undefined,
          thematique: Thematique.alimentation,
        },
        {
          code: 'KYC_alimentation_regime',
          id_cms: 1,
          last_update: undefined,
          question: `Votre regime`,
          type: TypeReponseQuestionKYC.choix_unique,
          is_NGC: false,
          a_supprimer: false,
          categorie: Categorie.mission,
          points: 10,
          reponse_complexe: undefined,
          tags: [],
          ngc_key: null,
          image_url: '111',
          short_question: 'short',
          conditions: [],
          unite: { abreviation: 'kg' },
          emoji: '🔥',
          thematique: Thematique.alimentation,
          reponse_simple: undefined,
        },
      ],
      answered_questions: [],
    };

    await TestUtil.create(DB.kYC, {
      code: 'KYC_saison_frequence',
      id_cms: 21,
      question: `À quelle fréquence mangez-vous de saison ? `,
      type: TypeReponseQuestionKYC.choix_unique,
      categorie: Categorie.mission,
      points: 10,
      reponses: [
        { label: 'Souvent', code: 'souvent', ngc_code: '"souvent"' },
        { label: 'Jamais', code: 'jamais', ngc_code: '"bof"' },
        { label: 'Parfois', code: 'parfois', ngc_code: '"burp"' },
      ],
      tags: [],
      ngc_key: 'alimentation . de saison . consommation',
      image_url: '111',
      short_question: 'short',
      conditions: [],
      unite: { abreviation: 'kg' },
      created_at: undefined,
      is_ngc: true,
      a_supprimer: false,
      thematique: 'alimentation',
      updated_at: undefined,
      emoji: '🔥',
    } as KYC);

    await kycRepository.loadCache();

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      kyc: kyc as any,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/home_board',
    );

    // THEN
    expect(response.status).toBe(200);
    const body: HomeBoardAPI = response.body;
    expect(body).toEqual({
      nom_commune: 'Dijon',
      pourcentage_bilan_done: 18,
      bilan_carbone_total_kg: 8719.051817969366,
      total_national_actions_faites: 0,
      pourcentage_alimentation_reco_done: 67,
      pourcentage_consommation_reco_done: 0,
      pourcentage_global_reco_done: 40,
      pourcentage_logement_reco_done: 0,
      pourcentage_transport_reco_done: 0,
      total_utilisateur_actions_faites: 0,
      nombre_aides: 0,
      nombre_recettes: 1150,
      est_utilisateur_ngc: false,
    });
  });
});
