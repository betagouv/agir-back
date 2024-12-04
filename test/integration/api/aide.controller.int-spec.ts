import { NB_VELO_TYPES } from '../../../src/domain/aides/aideVelo';
import { Besoin } from '../../../src/domain/aides/besoin';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { History_v0 } from '../../../src/domain/object_store/history/history_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { AideAPI } from '../../../src/infrastructure/api/types/aide/AideAPI';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Aide (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
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

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sous plafond OK, tranche 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { revenu_fiscal: 5000, parts: 1 });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(Object.keys(response.body)).toHaveLength(NB_VELO_TYPES);
    expect(response.body['électrique'][0].libelle).toEqual('Bonus vélo');
    expect(response.body['électrique'][0].description).toEqual(
      'Nouveau bonus vélo électrique applicable à partir du 14 février 2024.\n',
    );
    expect(response.body['électrique'][0].montant).toEqual(40);
  });

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sur plafond OK, tranche 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { revenu_fiscal: 5000, parts: 1 });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['électrique'][0].libelle).toEqual('Bonus vélo');
    expect(response.body['électrique'][0].montant).toEqual(400);
  });
  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sur plafond OK, tranche 2', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { revenu_fiscal: 10000, parts: 1 });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['électrique'][0].libelle).toEqual('Bonus vélo');
    expect(response.body['électrique'][0].montant).toEqual(300);
  });
  it(`POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sur plafond OK, au dela tranche 2, pas d'aide`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { revenu_fiscal: 20000, parts: 1 });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 100000,
    });

    // THEN
    expect(response.status).toBe(201);
    expect(response.body['électrique'][0].libelle).toEqual(
      'Île-de-France Mobilités',
    );
  });
  it('GET /utilisateurs/:utilisateurId/aides', async () => {
    // GIVEN
    await thematiqueRepository.upsert({
      code: Thematique.climat,
      titre: 'Climat !!',
      id_cms: 2,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.upsert({
      code: Thematique.logement,
      titre: 'Logement !!',
      id_cms: 5,
      emoji: '🔥',
      image_url: 'https://img',
      label: 'the label',
    });
    await thematiqueRepository.loadThematiques();
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide);

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    const aideBody = response.body[0] as AideAPI;
    expect(aideBody.content_id).toEqual('1');
    expect(aideBody.codes_postaux).toEqual(['91120']);
    expect(aideBody.contenu).toEqual("Contenu de l'aide");
    expect(aideBody.is_simulateur).toEqual(true);
    expect(aideBody.url_source).toEqual('https://hello');
    expect(aideBody.url_demande).toEqual('https://demande');
    expect(aideBody.montant_max).toEqual(999);
    expect(aideBody.thematiques).toEqual([
      Thematique.climat,
      Thematique.logement,
    ]);
    expect(aideBody.thematiques_label).toEqual(['Climat !!', 'Logement !!']);
    expect(aideBody.titre).toEqual('titreA');
    expect(aideBody.url_simulateur).toEqual('/aides/velo');
    expect(aideBody.besoin).toEqual(Besoin.acheter_velo);
    expect(aideBody.besoin_desc).toEqual('Acheter un vélo');
  });
  it('GET /utilisateurs/:utilisateurId/aides filtre par code postal', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['11111'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['22222'],
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    const aideBody = response.body[0] as AideAPI;
    expect(aideBody.content_id).toEqual('2');
  });
  it('GET /utilisateurs/:utilisateurId/aides indique si aide cliquée / demandée', async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [
        { content_id: '1', clicked_demande: true, clicked_infos: false },
        { content_id: '2', clicked_demande: false, clicked_infos: true },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
      history: history,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: undefined,
    });

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);

    const aideBody = response.body[0] as AideAPI;
    expect(aideBody.clicked_infos).toEqual(false);
    expect(aideBody.clicked_demande).toEqual(true);
  });
  it(`POST /utilisateurs/:utilisateurId/aides/id/vu_infos marque l'aide comme cliqué sur le lien d'infos `, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      history: history,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: undefined,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/vu_infos',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.aide_interactions).toHaveLength(1);
    expect(userDB.history.aide_interactions[0]).toEqual({
      clicked_demande: false,
      clicked_infos: true,
      content_id: '1',
    });
  });
  it(`POST /utilisateurs/:utilisateurId/aides/id/vu_demande marque l'aide comme cliqué sur le lien demande `, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      history: history,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: undefined,
    });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/vu_demande',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.aide_interactions).toHaveLength(1);
    expect(userDB.history.aide_interactions[0]).toEqual({
      clicked_demande: true,
      clicked_infos: false,
      content_id: '1',
    });
  });
  it(`POST /utilisateurs/:utilisateurId/aides/id/vu_demande aide 404`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/vu_demande',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it(`POST /utilisateurs/:utilisateurId/aides/id/vu_infos aide 404`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {});

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/vu_infos',
    );

    // THEN
    expect(response.status).toBe(404);
  });
  it('GET /utilisateurs/:utilisateurId/aides_v2 info de couvertur true', async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;

    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['11111'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['22222'],
    });
    await TestUtil.POST('/utilisateurs/update_user_couverture');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
    expect(response.body.couverture_aides_ok).toEqual(true);
  });
  it('GET /utilisateurs/:utilisateurId/aides_v2 info de couvertur true', async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;

    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: [],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: [],
    });
    await TestUtil.POST('/utilisateurs/update_user_couverture');

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(2);
    expect(response.body.couverture_aides_ok).toEqual(false);
  });
  it('GET /aides toutes les aides avec les bonnes meta données en mode export', async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'], // metropole
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['01170'], // CA
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      codes_postaux: ['01160'], // CC
    });
    await TestUtil.create(DB.aide, {
      content_id: '4',
      codes_postaux: ['14280'], // CU
    });

    // WHEN
    const response = await TestUtil.GET('/aides');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(4);
    expect(response.body[0]).toEqual({
      content_id: '1',
      titre: 'titreA',
      contenu: "Contenu de l'aide",
      codes_postaux: ['21000'],
      thematiques: ['climat', 'logement'],
      montant_max: 999,
      codes_departement: [],
      codes_region: [],
      com_agglo: [],
      com_urbaine: [],
      com_com: [],
      metropoles: ['Dijon Métropole'],
      echelle: 'National',
      url_source: 'https://hello',
      url_demande: 'https://demande',
    });
    expect(response.body[0].metropoles).toEqual(['Dijon Métropole']);
    expect(response.body[1].com_agglo).toEqual(['CA du Pays de Gex']);
    expect(response.body[2].com_agglo).toEqual([
      'CA du Bassin de Bourg-en-Bresse',
    ]);
    expect(response.body[2].com_com).toEqual([
      `CC Rives de l'Ain - Pays du Cerdon`,
    ]);
    expect(response.body[3].com_urbaine).toEqual(['CU Caen la Mer']);
  });
});
