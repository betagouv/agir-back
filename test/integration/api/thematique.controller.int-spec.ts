import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Echelle } from '../../../src/domain/aides/echelle';
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
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
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
      echelle: Echelle.Commune,
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
    expect(response.body.liste_actions_recommandees[0].deja_vue).toEqual(false);
    expect(
      response.body.liste_actions_recommandees[0].nombre_aides_disponibles,
    ).toEqual(1);
    expect(response.body.liste_actions_recommandees[0].titre).toEqual(
      'The titre',
    );
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - action flaguée déjà vue OK`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [{ code: '123', type: TypeAction.classique }],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '123',
      besoins: ['composter'],
      thematique: Thematique.alimentation,
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
    expect(response.body.liste_actions_recommandees[0].deja_vue).toEqual(true);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - max 6 actions proposées`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 10; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(6);
  });
  it(`GET /utilisateurs/id/thematiques/alimentation - 3 actions si que 3 actions en base`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 3; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(3);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '3' },
    ]);
  });

  it(`GET /utilisateurs/id/thematiques/alimentation - ne propose que celles dans le bloc proposition`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '6' },
          ],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 10; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/thematiques/alimentation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_actions_recommandees).toHaveLength(3);
    expect(response.body.liste_actions_recommandees[0].code).toEqual('1');
    expect(response.body.liste_actions_recommandees[1].code).toEqual('3');
    expect(response.body.liste_actions_recommandees[2].code).toEqual('6');
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/1 supprime la seul action proposable`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [{ type: TypeAction.classique, code: '1' }],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    await TestUtil.create(DB.action, {
      code: '1',
      cms_id: '1',
      type_code_id: 'classique_1',
      thematique: Thematique.alimentation,
    });

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/1',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toEqual([]);
    expect(
      user.thematique_history.plusDeSuggestionsDispo(Thematique.alimentation),
    ).toEqual(true);
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action à une position la remplace par une nouvelle`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 10; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/3',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '7' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
    expect(
      user.thematique_history.plusDeSuggestionsDispo(Thematique.alimentation),
    ).toEqual(false);
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/3 supprime une action, shift car plus de nouvelles`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 6; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/3',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
    expect(
      user.thematique_history.plusDeSuggestionsDispo(Thematique.alimentation),
    ).toEqual(false);
  });
  it(`DELETE /utilisateurs/id/thematiques/alimentation/actions/7 supprime une action hors de la liste de propositions`, async () => {
    // GIVEN
    const thematique_history: ThematiqueHistory_v0 = {
      version: 0,
      liste_actions_vues: [],

      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { type: TypeAction.classique, code: '1' },
            { type: TypeAction.classique, code: '2' },
            { type: TypeAction.classique, code: '3' },
            { type: TypeAction.classique, code: '4' },
            { type: TypeAction.classique, code: '5' },
            { type: TypeAction.classique, code: '6' },
          ],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      code_commune: '21231',
      thematique_history: thematique_history as any,
    });
    for (let index = 1; index <= 7; index++) {
      await TestUtil.create(DB.action, {
        type_code_id: 'classique_' + index,
        code: index.toString(),
        cms_id: index.toString(),
        thematique: Thematique.alimentation,
      });
    }

    await actionRepository.onApplicationBootstrap();

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/thematiques/alimentation/actions/classique/7',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(
      user.thematique_history.getActionsProposees(Thematique.alimentation),
    ).toStrictEqual([
      { type: TypeAction.classique, code: '1' },
      { type: TypeAction.classique, code: '2' },
      { type: TypeAction.classique, code: '3' },
      { type: TypeAction.classique, code: '4' },
      { type: TypeAction.classique, code: '5' },
      { type: TypeAction.classique, code: '6' },
    ]);
    expect(
      user.thematique_history.getActionsExclues(Thematique.alimentation),
    ).toStrictEqual([{ type: TypeAction.classique, code: '7' }]);
    expect(
      user.thematique_history.plusDeSuggestionsDispo(Thematique.alimentation),
    ).toEqual(false);
  });
});
