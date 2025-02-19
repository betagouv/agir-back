import { KYC } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import {
  TypeReponseQuestionKYC,
  Unite,
} from '../../../src/domain/kyc/questionKYC';
import { Tag } from '../../../src/domain/scoring/tag';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import {
  MosaicKYC_CATALOGUE,
  MosaicKYCDef,
  TypeMosaic,
} from '../../../src/domain/kyc/mosaicKYC';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import {
  KYCHistory_v2,
  QuestionKYC_v2,
} from '../../../src/domain/object_store/kyc/kycHistory_v2';
import { TagUtilisateur } from '../../../src/domain/scoring/tagUtilisateur';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';

const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
  {
    id: KYCMosaicID.TEST_MOSAIC_ID,
    categorie: Categorie.test,
    points: 5,
    titre: 'Titre test',
    type: TypeMosaic.mosaic_boolean,
    question_kyc_codes: [KYCID._1, KYCID._2],
    thematique: Thematique.alimentation,
  },
];
describe('/utilisateurs/id/mosaicsKYC (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const kycRepository = new KycRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('PUT /utilisateurs/id/questionsKYC/bad - MAJ mosaic inconnue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`Question d'id bad inconnue`);
  });
  it('PUT /utilisateurs/id/questionsKYC/id - maj mosaic', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.choix_unique,
      ngc_key: 'a . b . c',
      reponses: [
        { label: 'Oui', code: 'oui' },
        { label: 'Non', code: 'non' },
        { label: 'Je sais pas', code: 'sais_pas' },
      ],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
    });
    await kycRepository.loadDefinitions();
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    ).send({
      reponse_mosaic: [
        { code: '_1', boolean_value: true },
        { code: '_2', boolean_value: false },
      ],
    });

    // THEN
    expect(response.status).toBe(200);

    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.gamification.points).toEqual(15);

    expect(dbUser.kyc_history.getRawAnsweredKYCs()).toHaveLength(2);

    delete dbUser.kyc_history.getRawAnsweredKYCs()[0].last_update;
    delete dbUser.kyc_history.getRawAnsweredKYCs()[1].last_update;

    expect(dbUser.kyc_history.getRawAnsweredKYCs()[0]).toEqual({
      code: '_1',
      question: 'quest 1',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_complexe: [
        {
          code: 'oui',
          label: 'Oui',
          value: undefined,
          selected: true,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'non',
          label: 'Non',
          value: undefined,
          selected: false,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          value: undefined,
          selected: false,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
      ],
      reponse_simple: null,
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      emoji: '🔥',
      unite: Unite.kg,
    });
    expect(dbUser.kyc_history.getRawAnsweredKYCs()[1]).toEqual({
      code: '_2',
      question: 'quest 2',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_complexe: [
        {
          code: 'oui',
          label: 'Oui',
          value: undefined,
          selected: false,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'non',
          label: 'Non',
          value: undefined,
          selected: true,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
        {
          code: 'sais_pas',
          label: 'Je sais pas',
          value: undefined,
          selected: false,
          emoji: undefined,
          image_url: undefined,
          ngc_code: undefined,
          unite: undefined,
        },
      ],
      reponse_simple: null,
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      emoji: '🔥',
      unite: Unite.kg,
    });
  });

  it('PUT /utilisateurs/id/questionsKYC/id - maj mosaic boolean alors que que les question sous jacente sont interger', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      a_supprimer: false,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      thematique: Thematique.alimentation,
      type: TypeReponseQuestionKYC.entier,
      ngc_key: 'a . b . c',
      reponses: [],
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      created_at: undefined,
      updated_at: undefined,
      emoji: '🔥',
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      code: '_2',
    });
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() });
    await kycRepository.loadDefinitions();
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    ).send({
      reponse_mosaic: [
        { code: '_1', boolean_value: true },
        { code: '_2', boolean_value: false },
      ],
    });

    // THEN
    expect(response.status).toBe(200);

    const dbUser = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(dbUser.kyc_history.getRawAnsweredKYCs()).toHaveLength(2);

    delete dbUser.kyc_history.getRawAnsweredKYCs()[0].last_update;
    delete dbUser.kyc_history.getRawAnsweredKYCs()[1].last_update;

    expect(dbUser.kyc_history.getRawAnsweredKYCs()[0]).toEqual({
      code: '_1',
      question: 'quest 1',
      type: 'entier',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_simple: {
        unite: 'kg',
        value: '1',
      },
      reponse_complexe: [],
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      emoji: '🔥',
    });
    expect(dbUser.kyc_history.getRawAnsweredKYCs()[1]).toEqual({
      code: '_2',
      question: 'quest 2',
      type: 'entier',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      a_supprimer: false,
      reponse_simple: {
        unite: 'kg',
        value: '0',
      },
      reponse_complexe: [],
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
      conditions: [],
      unite: Unite.kg,
      emoji: '🔥',
    });
  });

  it('PUT /utilisateurs/id/questionsKYC/id - maj mosaic avec pas de réponses', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    ).send({
      reponse_mosaic: [],
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('072');
  });

  it('PUT /utilisateurs/id/questionsKYC/id - maj mosaic réponses manquantes', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v2() });
    MosaicKYC_CATALOGUE.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    ).send({});

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('072');
  });
});
