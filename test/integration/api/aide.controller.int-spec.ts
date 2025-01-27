import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Besoin } from '../../../src/domain/aides/besoin';
import { EchelleAide } from '../../../src/domain/aides/echelle';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { History_v0 } from '../../../src/domain/object_store/history/history_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { AideAPI } from '../../../src/infrastructure/api/types/aide/AideAPI';
import {
  AideVeloAPI,
  AidesVeloParTypeAPI,
} from '../../../src/infrastructure/api/types/aide/AidesVeloParTypeAPI';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Aide (API test)', () => {
  const OLD_ENV = process.env;
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('POST /utilisateurs/:utilisateurId/simulerAideVelo aide nationnale sous plafond OK, tranche 1', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { revenu_fiscal: 5000, parts: 1 });
    process.env.MINIATURES_URL = 'http://localhost:3000';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 5000,
    });

    const bonusVelo: AideVeloAPI = {
      libelle: 'Bonus vélo',
      montant: 150,
      plafond: 150,
      description: `Supprimé depuis le 2 décembre 2024.

Cependant, une période transitoire permet de pouvoir continuer de bénéficier du bonus pour tout achat effectué avant le 14 février 2025 inclus (date de facturation).`,
      lien: 'https://www.economie.gouv.fr/particuliers/prime-velo-electrique#',
      collectivite: {
        kind: 'pays',
        value: 'France',
      },
      logo: 'http://localhost:3000/logo_etat_francais.webp',
    };

    const idfMobilites: AideVeloAPI = {
      libelle: 'Île-de-France Mobilités',
      montant: 50,
      plafond: 50,
      description:
        "La région Île-de-France subventionne l'achat d'un vélo électrique à hauteur de 50% et jusqu'à un plafond de 400 €.",
      lien: 'https://www.iledefrance-mobilites.fr/le-reseau/services-de-mobilite/velo/prime-achat-velo',
      collectivite: {
        kind: 'région',
        value: '11',
      },
      logo: 'http://localhost:3000/logo_ile_de_france.webp',
    };

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual<AidesVeloParTypeAPI>({
      'mécanique simple': [bonusVelo],
      électrique: [
        {
          ...bonusVelo,
          montant: 400,
          plafond: 400,
        },
        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un vélo électrique à hauteur de 50% et jusqu'à un plafond de 400 €.",
          montant: 400,
          plafond: 400,
        },
      ],
      cargo: [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un vélo cargo à hauteur de 50% et jusqu'à un plafond de 400 €.",
          montant: 400,
          plafond: 400,
        },
      ],
      'cargo électrique': [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un vélo cargo électrique à hauteur de 50% et jusqu'à un plafond de 600 €.",
          montant: 600,
          plafond: 600,
        },
      ],
      pliant: [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },

        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un vélo pliant à hauteur de 50% et jusqu'à un plafond de 400 €.",
          montant: 400,
          plafond: 400,
        },
      ],
      'pliant électrique': [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un vélo pliant électrique à hauteur de 50% et jusqu'à un plafond de 400 €.",
          montant: 400,
          plafond: 400,
        },
      ],
      motorisation: [
        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un kit de motorisation à hauteur de 50% et jusqu'à un plafond de 200 €.",
          montant: 200,
          plafond: 200,
        },
      ],
      adapté: [
        {
          ...bonusVelo,
          montant: 2000,
          plafond: 2000,
        },
        {
          ...idfMobilites,
          description:
            "La région Île-de-France subventionne l'achat d'un vélo adapté à hauteur de 50% et jusqu'à un plafond de 1 200 €.",
          montant: 1200,
          plafond: 1200,
        },
      ],
    });
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

  it(`POST /utilisateurs/:utilisateurId/simulerAideVelo à Montpellier, aide à l'achat d'un vélo éléctrique uniquement pour vélo d'occasion`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      revenu_fiscal: 10000,
      parts: 1,
      logement: {
        version: 0,
        superficie: Superficie.superficie_150,
        type: TypeLogement.maison,
        code_postal: '34000',
        chauffage: Chauffage.bois,
        commune: 'MONTPELLIER',
        dpe: DPE.B,
        nombre_adultes: 2,
        nombre_enfants: 2,
        plus_de_15_ans: true,
        proprietaire: true,
        code_commune: '34172',
      },
    });

    // WHEN
    const response_neuf = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 1000,
      etat_du_velo: 'neuf',
    });

    // THEN
    expect(response_neuf.status).toBe(201);
    expect(
      response_neuf.body['électrique'].find(
        (a) => a.libelle === 'Montpellier Méditerranée Métropole',
      ),
    ).toBeUndefined();

    // WHEN
    const response_occasion = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/simulerAideVelo',
    ).send({
      prix_du_velo: 1000,
      etat_du_velo: 'occasion',
    });

    // THEN
    expect(response_occasion.status).toBe(201);
    expect(
      response_occasion.body['électrique'].find(
        (a) => a.libelle === 'Montpellier Méditerranée Métropole',
      ),
    ).toBeDefined();
  });

  it('GET /utilisateurs/:utilisateurId/aides', async () => {
    // GIVEN

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadPartenaires();

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
    await TestUtil.create(DB.aide, { partenaire_id: '123' });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);

    const aideBody = response.body.liste_aides[0] as AideAPI;
    expect(aideBody.content_id).toEqual('1');
    expect(aideBody.codes_postaux).toEqual(['91120']);
    expect(aideBody.contenu).toEqual("Contenu de l'aide");
    expect(aideBody.echelle).toEqual(EchelleAide.National);
    expect(aideBody.is_simulateur).toEqual(true);
    expect(aideBody.url_source).toEqual('https://hello');
    expect(aideBody.url_demande).toEqual('https://demande');
    expect(aideBody.partenaire_nom).toEqual('ADEME');
    expect(aideBody.partenaire_url).toEqual('https://ademe.fr');
    expect(aideBody.partenaire_logo_url).toEqual('logo_url');
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
  it('GET /utilisateurs/:utilisateurId/aides aide non visible si expirée', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, { date_expiration: new Date(123) });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(0);
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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);

    const aideBody = response.body.liste_aides[0] as AideAPI;
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
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);

    const aideBody = response.body.liste_aides[0] as AideAPI;
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
      codes_postaux: '21000',
      thematiques: ['climat', 'logement'],
      montant_max: 999,
      codes_departement: '',
      codes_region: '',
      com_agglo: '',
      com_urbaine: '',
      com_com: '',
      metropoles: 'Dijon Métropole',
      echelle: 'National',
      url_source: 'https://hello',
      url_demande: 'https://demande',
    });
    expect(response.body[0].metropoles).toEqual('Dijon Métropole');
    expect(response.body[1].com_agglo).toEqual('CA du Pays de Gex');
    expect(response.body[2].com_agglo).toEqual(
      'CA du Bassin de Bourg-en-Bresse',
    );
    expect(response.body[2].com_com).toEqual(
      `CC Rives de l'Ain - Pays du Cerdon`,
    );
    expect(response.body[3].com_urbaine).toEqual('CU Caen la Mer');
  });
});
