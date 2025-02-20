import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { DB, TestUtil } from '../../TestUtil';

describe('Thematique (API test)', () => {
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
      type: TypeAction.classique,
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      code: 'c2',
      type: TypeAction.classique,
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.action, {
      cms_id: '3',
      code: 'c3',
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
      nombre_aides: 1,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
      thematique: Thematique.alimentation,
    });
  });

  it(`GET /utilisateurs/id/thematiques - filtrage des aides par commune`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });

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
      nombre_aides: 1,
      nombre_recettes: 1150,
      nombre_simulateurs: 0,
      thematique: Thematique.alimentation,
    });
  });
  it(`GET /utilisateurs/id/thematiques/alimentation - detail d'une thematique`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });

    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['21000'],
      thematiques: [Thematique.alimentation],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enchainement_questions_personalisation:
        'ENCHAINEMENT_KYC_bilan_alimentation',
      est_personalisation_necessaire: true,
      thematique: 'alimentation',
      liste_actions_recommandees: [],
    });
  });
});
