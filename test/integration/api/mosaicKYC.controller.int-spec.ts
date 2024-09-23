import { KYC } from '.prisma/client';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { Tag } from '../../../src/domain/scoring/tag';
import { Univers } from '../../../src/domain/univers/univers';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';
import {
  MosaicKYC,
  MosaicKYCDef,
  TypeReponseMosaicKYC,
} from '../../../src/domain/kyc/mosaicKYC';
import { KYCMosaicID } from '../../../src/domain/kyc/KYCMosaicID';

const MOSAIC_CATALOGUE: MosaicKYCDef[] = [
  {
    id: KYCMosaicID.TEST_MOSAIC_ID,
    categorie: Categorie.test,
    points: 10,
    titre: 'Titre test',
    type: TypeReponseMosaicKYC.mosaic_boolean,
    question_kyc_codes: [KYCID._1, KYCID._2],
  },
];
describe('/utilisateurs/id/mosaicsKYC (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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

  it('GET /utilisateurs/id/questionsKYC/id - mosaic avec de questions du catalogue', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
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
      created_at: undefined,
      updated_at: undefined,
    };
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 1,
      question: 'quest 1',
      short_question: 'short 1',
      image_url: 'AAA',
      code: '_1',
    });
    await TestUtil.create(DB.kYC, {
      ...dbKYC,
      id_cms: 2,
      question: 'quest 2',
      short_question: 'short 2',
      image_url: 'BBB',
      code: '_2',
    });
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v0() });

    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.titre).toEqual('Titre test');
    expect(response.body.is_answered).toEqual(false);
    expect(response.body.id).toEqual('TEST_MOSAIC_ID');
    expect(response.body.categorie).toEqual(Categorie.test);
    expect(response.body.points).toEqual(10);
    expect(response.body.type).toEqual(TypeReponseMosaicKYC.mosaic_boolean);
    expect(response.body.reponses).toHaveLength(2);

    expect(response.body.reponses[0].code).toEqual('_1');
    expect(response.body.reponses[0].label).toEqual('short 1');
    expect(response.body.reponses[0].image_url).toEqual('AAA');
    expect(response.body.reponses[0].boolean_value).toEqual(false);

    expect(response.body.reponses[1].code).toEqual('_2');
    expect(response.body.reponses[1].label).toEqual('short 2');
    expect(response.body.reponses[1].image_url).toEqual('BBB');
    expect(response.body.reponses[1].boolean_value).toEqual(false);
  });
  it('GET /utilisateurs/id/questionsKYC/bad - mosaic inconnue', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/bad',
    );

    // THEN
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(`Question d'id bad inconnue`);
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
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
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
      created_at: undefined,
      updated_at: undefined,
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
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v0() });
    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

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

    const dbUser = await utilisateurRepository.getById('utilisateur-id');

    expect(dbUser.kyc_history.answered_questions).toHaveLength(2);
    expect(dbUser.kyc_history.answered_questions[0]).toEqual({
      id: '_1',
      question: 'quest 1',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      reponses: [{ code: 'oui', label: 'Oui' }],
      reponses_possibles: [
        { code: 'oui', label: 'Oui' },
        { code: 'non', label: 'Non' },
        { code: 'sais_pas', label: 'Je sais pas' },
      ],
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      universes: ['alimentation'],
      id_cms: 1,
      short_question: 'short',
      image_url: 'AAA',
    });
    expect(dbUser.kyc_history.answered_questions[1]).toEqual({
      id: '_2',
      question: 'quest 2',
      type: 'choix_unique',
      categorie: 'recommandation',
      points: 20,
      is_NGC: true,
      reponses: [{ code: 'non', label: 'Non' }],
      reponses_possibles: [
        { code: 'oui', label: 'Oui' },
        { code: 'non', label: 'Non' },
        { code: 'sais_pas', label: 'Je sais pas' },
      ],
      ngc_key: 'a . b . c',
      thematique: 'alimentation',
      tags: ['possede_voiture'],
      score: 0,
      universes: ['alimentation'],
      id_cms: 2,
      short_question: 'short',
      image_url: 'AAA',
    });
  });

  it('PUT /utilisateurs/id/questionsKYC/id - maj mosaic avec pas de réponses', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v0() });
    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

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
    await TestUtil.create(DB.utilisateur, { kyc: new KYCHistory_v0() });
    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.PUT(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    ).send({});

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('072');
  });

  it('GET /utilisateurs/id/questionsKYC/id - lecture mosaic avec reponses précédentes', async () => {
    // GIVEN

    const dbKYC: KYC = {
      id_cms: 1,
      categorie: Categorie.recommandation,
      code: '1',
      is_ngc: true,
      points: 20,
      question: 'The question !',
      tags: [Tag.possede_voiture],
      universes: [Univers.alimentation],
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
      created_at: undefined,
      updated_at: undefined,
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

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [KYCMosaicID.TEST_MOSAIC_ID],
      answered_questions: [
        {
          id: '_1',
          question: 'quest 1',
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          reponses: [{ code: 'oui', label: 'Oui' }],
          reponses_possibles: [
            { code: 'oui', label: 'Oui' },
            { code: 'non', label: 'Non' },
            { code: 'sais_pas', label: 'Je sais pas' },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          universes: ['alimentation'],
          id_cms: 1,
          short_question: 'short 1',
          image_url: 'AAA',
        },
        {
          id: '_2',
          question: 'quest 2',
          type: TypeReponseQuestionKYC.choix_unique,
          categorie: Categorie.recommandation,
          points: 20,
          is_NGC: true,
          reponses: [{ code: 'non', label: 'Non' }],
          reponses_possibles: [
            { code: 'oui', label: 'Oui' },
            { code: 'non', label: 'Non' },
            { code: 'sais_pas', label: 'Je sais pas' },
          ],
          ngc_key: 'a . b . c',
          thematique: Thematique.alimentation,
          tags: [Tag.possede_voiture],
          universes: ['alimentation'],
          id_cms: 2,
          short_question: 'short 2',
          image_url: 'BBB',
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { kyc: kyc });

    MosaicKYC.MOSAIC_CATALOGUE = MOSAIC_CATALOGUE;

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/questionsKYC/TEST_MOSAIC_ID',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'TEST_MOSAIC_ID',
      titre: 'Titre test',
      is_answered: true,
      reponses: [
        {
          code: '_1',
          label: 'short 1',
          boolean_value: true,
          image_url: 'AAA',
        },
        {
          code: '_2',
          label: 'short 2',
          boolean_value: false,
          image_url: 'BBB',
        },
      ],
      categorie: 'test',
      points: 10,
      type: 'mosaic_boolean',
    });
  });
});
