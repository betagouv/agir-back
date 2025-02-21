import { TypeAction } from '../../../src/domain/actions/typeAction';
import { EchelleAide } from '../../../src/domain/aides/echelle';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Thematique (API test)', () => {
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);

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

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enchainement_questions_personnalisation:
        'ENCHAINEMENT_KYC_bilan_alimentation',
      est_personnalisation_necessaire: true,
      thematique: 'alimentation',
      liste_actions_recommandees: [],
    });
  });
  it(`GET /utilisateurs/id/thematiques/alimentation - personnalisation done`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_personnalisations_done: [Thematique.alimentation],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      enchainement_questions_personnalisation:
        'ENCHAINEMENT_KYC_bilan_alimentation',
      est_personnalisation_necessaire: false,
      thematique: 'alimentation',
      liste_actions_recommandees: [],
    });
  });
  it(`POST /utilisateurs/id/thematiques/alimentation/personnaliation_ok - API set l'état de perso`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { code_commune: '21231' });

    // THEN
    const user_before = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user_before.thematique_history.isPersonnalisationDone(
        Thematique.alimentation,
      ),
    ).toEqual(false);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/personnalisation_ok',
    );

    // THEN
    expect(response.status).toBe(201);

    const user_after = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user_after.thematique_history.isPersonnalisationDone(
        Thematique.alimentation,
      ),
    ).toEqual(true);
  });
  it(`POST /utilisateurs/id/thematiques/alimentation/personnalisation_ok - API set l'état de perso`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_personnalisations_done: [Thematique.alimentation],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/reset_personnalisation',
    );

    // THEN
    expect(response.status).toBe(201);

    const user_after = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user_after.thematique_history.isPersonnalisationDone(
        Thematique.alimentation,
      ),
    ).toEqual(false);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - detail d'une thematique avec liste d'action si perso done`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_personnalisations_done: [Thematique.alimentation],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      besoins: ['composter'],
      thematique: Thematique.alimentation,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      besoin: 'composter',
      partenaire_id: '123',
      echelle: EchelleAide.Commune,
      codes_postaux: ['21000'],
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(1);
    expect(response.body.liste_actions_recommandees[0].code).toEqual('123');
    expect(
      response.body.liste_actions_recommandees[0].nombre_aides_disponibles,
    ).toEqual(1);
    expect(response.body.liste_actions_recommandees[0].titre).toEqual(
      'The titre',
    );
  });
});
