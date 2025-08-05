import { Categorie } from '../../src/domain/contenu/categorie';
import { KYCHistory } from '../../src/domain/kyc/kycHistory';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../src/domain/kyc/QuestionKYCData';
import {
  Logement,
  ScoreRisquesAdresse,
} from '../../src/domain/logement/logement';
import { NiveauRisqueLogement } from '../../src/domain/logement/NiveauRisque';
import { KycToTags_v2 } from '../../src/domain/scoring/system_v2/kycToTagsV2';
import { ProfileRecommandationUtilisateur } from '../../src/domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../src/domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../src/domain/thematique/thematique';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { RisquesNaturelsCommunesRepository } from '../../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { TestUtil } from '../TestUtil';

describe('KycToTags_v2', () => {
  const communeRepository = new CommuneRepository(TestUtil.prisma);
  const risquesNaturelsCommunesRepository =
    new RisquesNaturelsCommunesRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it(`refreshTagState : aucune data, pas d'erreur`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([]);
  });

  it(`refreshTagState : Gère correctement le tag outre mer`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    logement.code_commune = '97418';

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_peri_urbaine,
      Tag_v2.habite_en_outre_mer,
    ]);
  });

  describe(`refreshTagState : Gère correctement le tag urbain`, () => {
    test('pour les communes urbaines', async () => {
      // GIVEN
      const profile = new ProfileRecommandationUtilisateur();
      const logement = new Logement();
      const translator = new KycToTags_v2(
        new KYCHistory(),
        logement,
        communeRepository,
        risquesNaturelsCommunesRepository,
      );

      logement.code_commune = '21231';

      // WHEN
      translator.refreshTagState_v2(profile);

      // THEN
      expect(profile.getListeTagsActifs()).toEqual([
        Tag_v2.habite_zone_urbaine,
        Tag_v2.habite_en_metropole,
      ]);
    });

    test.todo('pour les communes avec arrondissements');
  });

  it(`refreshTagState : Gère correctement les risques à l'adresse`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    logement.code_commune = undefined;
    logement.score_risques_adresse = new ScoreRisquesAdresse({
      argile: NiveauRisqueLogement.faible,
      inondation: NiveauRisqueLogement.fort,
      radon: NiveauRisqueLogement.faible,
      secheresse: NiveauRisqueLogement.moyen,
      submersion: NiveauRisqueLogement.tres_fort,
      tempete: NiveauRisqueLogement.inconnu,
      seisme: NiveauRisqueLogement.nul,
    });

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.risque_adresse_inondation,
      Tag_v2.risque_adresse_secheresse,
      Tag_v2.risque_adresse_submersion,
    ]);
  });
  it(`refreshTagState : COmmune à risque commune`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    logement.code_commune = '21231';
    await risquesNaturelsCommunesRepository.upsert({
      code_commune: '21231',
      nom_commune: 'Dijon',
      nombre_cat_nat: 12,
      pourcentage_risque_innondation: 30,
      pourcentage_risque_secheresse: 60,
    });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_urbaine,
      Tag_v2.habite_en_metropole,
      Tag_v2.risque_commune_catnat,
      Tag_v2.risque_commune_inondation,
      Tag_v2.risque_commune_argile,
    ]);
  });
  it(`refreshTagState : COmmune sans risque`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    logement.code_commune = '21231';
    await risquesNaturelsCommunesRepository.upsert({
      code_commune: '21231',
      nom_commune: 'Dijon',
      nombre_cat_nat: 5,
      pourcentage_risque_innondation: 15,
      pourcentage_risque_secheresse: 30,
    });
    await risquesNaturelsCommunesRepository.loadCache();

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_urbaine,
      Tag_v2.habite_en_metropole,
      Tag_v2.risque_commune_inondation,
    ]);
  });
  it(`refreshTagState : Gère correctement le tag rural`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    logement.code_commune = '21134';

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_rurale,
      Tag_v2.habite_en_metropole,
    ]);
  });
  it(`refreshTagState : Gère correctement le tag peri urbain`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    logement.code_commune = '21133';

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_peri_urbaine,
      Tag_v2.habite_en_metropole,
    ]);
  });
  it(`refreshTagState-V2 : Gère correctement le proprio via mapping AUTO - cas KYC unique oui / non`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_proprietaire,
            type: TypeReponseQuestionKYC.choix_unique,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: [
              {
                code: 'oui',
                label: 'Oui',
                selected: true,
              },
              {
                code: 'non',
                label: 'Non',
                selected: false,
              },
              {
                code: 'autre',
                label: 'Autre',
                selected: false,
              },
            ],
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.est_proprietaire]);
  });

  it(`refreshTagState-V2 : Gère correctement le proprio via mapping AUTO - cas KYC choix multiple`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_transport_voiture_motorisation,
            type: TypeReponseQuestionKYC.choix_multiple,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: [
              {
                code: 'thermique',
                label: 'Thermique',
                selected: false,
              },
              {
                code: 'hybride_rechargeable',
                label: 'Hybride rechargeable',
                selected: false,
              },
              {
                code: 'hybride_non_rechargeable',
                label: 'Hybride non rechargeable',
                selected: true,
              },
              {
                code: 'electrique',
                label: 'Electrique',
                selected: false,
              },
            ],
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.a_une_voiture_thermique,
    ]);
  });
  it(`refreshTagState-V2 : Gère correctement le proprio via mapping AUTO - cas KYC à zéro`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_nbr_plats_viande_rouge,
            type: TypeReponseQuestionKYC.entier,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: undefined,
            reponse_simple: {
              value: '0',
            },
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.ne_mange_pas_de_viande_rouge,
    ]);
  });

  it(`refreshTagState-V2 : Gère correctement le comparaison numerique`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_menage,
            type: TypeReponseQuestionKYC.entier,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Combien dans le ménage',
            reponse_complexe: undefined,
            reponse_simple: {
              value: '1',
            },
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.ne_vit_pas_en_famille,
    ]);
  });

  it(`refreshTagState-V2 : Gère correctement le comparaison numerique, cas supérieu`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_menage,
            type: TypeReponseQuestionKYC.entier,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Combien dans le ménage',
            reponse_complexe: undefined,
            reponse_simple: {
              value: '3',
            },
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.vit_en_famille]);
  });

  it(`refreshTagState-V2 : Gère correctement le proprio via mapping AUTO - KYC multiple multi options`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_saison_frequence,
            type: TypeReponseQuestionKYC.choix_multiple,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: [
              {
                code: 'jamais',
                label: 'Jamais',
                selected: false,
              },
              {
                code: 'toujours',
                label: 'Toujours',
                selected: true,
              },
              {
                code: 'parfois',
                label: 'Parfois',
                selected: false,
              },
            ],
            reponse_simple: undefined,
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.mange_de_saison]);
  });

  it(`refreshTagState-V2 : Gère correctement le proprio via mapping AUTO - cas KYC double zéro`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_nbr_plats_viande_rouge,
            type: TypeReponseQuestionKYC.entier,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: undefined,
            reponse_simple: {
              value: '0',
            },
          },
          {
            id_cms: 1,
            code: KYCID.KYC_nbr_plats_viande_blanche,
            type: TypeReponseQuestionKYC.entier,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: undefined,
            reponse_simple: {
              value: '0',
            },
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.ne_mange_pas_de_viande_rouge,
      Tag_v2.ne_mange_pas_de_viande,
    ]);
  });

  it(`refreshTagState-V2 : Gère correctement le proprio via mapping AUTO - KYC multiple distribution`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();

    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory({
        answered_mosaics: [],
        skipped_mosaics: [],
        skipped_questions: [],
        version: 2,
        answered_questions: [
          {
            id_cms: 1,
            code: KYCID.KYC_preference,
            type: TypeReponseQuestionKYC.choix_multiple,
            categorie: Categorie.recommandation,
            points: 0,
            is_NGC: false,
            tags: [],
            thematique: Thematique.logement,
            last_update: new Date(),
            conditions: undefined,
            question: 'Est proprio ?',
            reponse_complexe: [
              {
                code: 'alimentation',
                label: 'A',
                selected: false,
              },
              {
                code: 'transport',
                label: 'T',
                selected: true,
              },
              {
                code: 'logement',
                label: 'L',
                selected: false,
              },
            ],
            reponse_simple: undefined,
          },
        ],
      }),
      logement,
      communeRepository,
      risquesNaturelsCommunesRepository,
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.appetence_thematique_transport,
    ]);
  });

  it(`generate_dependency_report : generation OK`, async () => {
    // GIVEN

    // WHEN
    const result = KycToTags_v2.generate_dependency_report();

    // THEN
    expect(Array.from(result.get(KYCID.KYC_proprietaire))).toEqual([
      Tag_v2.est_proprietaire,
      Tag_v2.n_est_pas_proprietaire,
    ]);
  });
});
