import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { AideAPI } from '../../../src/infrastructure/api/types/aide/AideAPI';
import { DB, TestUtil } from '../../TestUtil';
import { Besoin } from '../../../src/domain/aides/besoin';
import { ProfileUsecase } from '../../../src/usecase/profile.usecase';

describe('Aide (API test)', () => {
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
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
    await thematiqueRepository.upsertThematique(
      2,
      'Climat !!',
      Thematique.climat,
    );
    await thematiqueRepository.upsertThematique(
      5,
      'Logement !!',
      Thematique.logement,
    );
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
  it('GET /aides toutes les aides avec les bonnes meta données', async () => {
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
