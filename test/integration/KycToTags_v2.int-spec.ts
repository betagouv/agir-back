import { Categorie } from '../../src/domain/contenu/categorie';
import { KYCHistory } from '../../src/domain/kyc/kycHistory';
import { KYCID } from '../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../src/domain/kyc/QuestionKYCData';
import { KycToTags_v2 } from '../../src/domain/kyc/synchro/kycToTagsV2';
import { Logement } from '../../src/domain/logement/logement';
import { ProfileRecommandationUtilisateur } from '../../src/domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../src/domain/scoring/system_v2/Tag_v2';
import { Thematique } from '../../src/domain/thematique/thematique';
import { CommuneRepository } from '../../src/infrastructure/repository/commune/commune.repository';
import { TestUtil } from '../TestUtil';

describe('KycToTags_v2', () => {
  const communeRepository = new CommuneRepository(TestUtil.prisma);

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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([]);
  });
  it(`refreshTagState : Gère correctement le tag urbain`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
    );

    logement.code_commune = '21231';

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.habite_zone_urbaine]);
  });
  it(`refreshTagState : Gère correctement le tag rural`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
    );

    logement.code_commune = '97126';

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([Tag_v2.habite_zone_rurale]);
  });
  it(`refreshTagState : Gère correctement le tag peri urbain`, async () => {
    // GIVEN
    const profile = new ProfileRecommandationUtilisateur();
    const logement = new Logement();
    const translator = new KycToTags_v2(
      new KYCHistory(),
      logement,
      communeRepository,
    );

    logement.code_commune = '97132';

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      Tag_v2.habite_zone_peri_urbaine,
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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual(['est_proprietaire']);
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
                code: 'hybride',
                label: 'Hybride',
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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual(['a_une_voiture_thermique']);
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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      'ne_mange_pas_de_viande_rouge',
    ]);
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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual(['mange_de_saison']);
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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      'ne_mange_pas_de_viande_rouge',
      'ne_mange_pas_de_viande',
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
    );

    // WHEN
    translator.refreshTagState_v2(profile);

    // THEN
    expect(profile.getListeTagsActifs()).toEqual([
      'appetence_thematique_transport',
    ]);
  });

  it(`generate_dependency_report : generation OK`, async () => {
    // GIVEN

    // WHEN
    const result = KycToTags_v2.generate_dependency_report();

    // THEN
    console.log(result.get(KYCID.KYC_proprietaire));
    expect(Array.from(result.get(KYCID.KYC_proprietaire))).toEqual([
      'est_proprietaire',
      'n_est_pas_proprietaire',
    ]);
  });
});
