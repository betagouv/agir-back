import { Besoin } from '../../../src/domain/aides/besoin';
import { Echelle } from '../../../src/domain/aides/echelle';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { History_v0 } from '../../../src/domain/object_store/history/history_v0';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { Thematique } from '../../../src/domain/thematique/thematique';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { AideAPI } from '../../../src/infrastructure/api/types/aide/AideAPI';
import { AideRepository } from '../../../src/infrastructure/repository/aide.repository';
import { BlockTextRepository } from '../../../src/infrastructure/repository/blockText.repository';
import { PartenaireRepository } from '../../../src/infrastructure/repository/partenaire.repository';
import { ThematiqueRepository } from '../../../src/infrastructure/repository/thematique.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Aide (API test)', () => {
  const OLD_ENV = process.env;
  let thematiqueRepository = new ThematiqueRepository(TestUtil.prisma);
  let blockTextRepository = new BlockTextRepository(TestUtil.prisma);
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const partenaireRepository = new PartenaireRepository(TestUtil.prisma);
  const aideRepository = new AideRepository(TestUtil.prisma);

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

  it('GET /utilisateurs/:utilisateurId/aides', async () => {
    // GIVEN

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();

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
    await thematiqueRepository.loadCache();
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, { partenaires_supp_ids: ['123'] });

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
    expect(aideBody.echelle).toEqual(Echelle.National);
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
    expect(aideBody.est_gratuit).toEqual(false);
  });

  it(`GET /utilisateurs/:utilisateurId/aides n'affiche pas une aide en PROD`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    await partenaireRepository.loadCache();

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, { content_id: '1', VISIBLE_PROD: true });
    await TestUtil.create(DB.aide, { content_id: '2', VISIBLE_PROD: false });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);

    expect(response.body.liste_aides[0].content_id).toEqual('1');
  });
  it(`GET /utilisateurs/:utilisateurId/aides n'affiche pas une aide en DEV`, async () => {
    // GIVEN
    process.env.IS_PROD = 'false';

    await partenaireRepository.loadCache();

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, { content_id: '1', VISIBLE_PROD: true });
    await TestUtil.create(DB.aide, { content_id: '2', VISIBLE_PROD: false });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(2);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par code commune via partenaires `, async () => {
    // GIVEN
    process.env.ADMIN_IDS = 'utilisateur-id';

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'Palaiseau',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: ['91477'],
      codes_postaux: ['21000'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par code commune via partenaires niveau CA`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'Palaiseau',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: ['91477'],
      codes_postaux: ['21000'],
      echelle: Echelle["Communauté d'agglomération"],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par code commune via partenaires niveau CU`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'Palaiseau',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: ['91477'],
      codes_postaux: ['21000'],
      echelle: Echelle['Communauté urbaine'],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par code commune via partenaires  - sauf si CA_CU_CC, no match`, async () => {
    // GIVEN
    process.env.ADMIN_IDS = 'utilisateur-id';

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: ['91477'],
      codes_postaux: ['21000'],
      echelle: Echelle.Métropole,
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(0);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par code commune via partenaires - sauf si CA_CU_CC, match`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: ['91477'],
      codes_postaux: ['21000'],
      echelle: Echelle["Communauté d'agglomération"],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par departement via partenaires`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: ['21'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par region via partenaires`, async () => {
    // GIVEN

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: ['27'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par departement via partenaires si ADMIN - no match`, async () => {
    // GIVEN
    process.env.ADMIN_IDS = 'utilisateur-id';

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: ['22'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(0);
  });

  it(`GET /utilisateurs/:utilisateurId/aides filtrage par region via partenaires si ADMIN - no match`, async () => {
    // GIVEN
    process.env.ADMIN_IDS = 'utilisateur-id';

    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.appartement,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      commune: 'Dijon',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: false,
      proprietaire: false,
      latitude: undefined,
      longitude: undefined,
      numero_rue: undefined,
      rue: undefined,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: undefined,
    };

    await TestUtil.create(DB.utilisateur, { logement: logement as any });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_commune_from_partenaire: [],
      codes_departement_from_partenaire: [],
      codes_region_from_partenaire: ['11'],
      codes_postaux: [],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(0);
  });

  it(`GET /utilisateurs/:utilisateurId/aides/id consultation d'une aide à partir de son ID, non connecté`, async () => {
    // GIVEN

    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();
    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();

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
    await thematiqueRepository.loadCache();
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      partenaires_supp_ids: ['123'],
      content_id: '45',
      contenu: 'ksqjfhqsjf {block_123} dfjksqmlmfjq',
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.getServer().get('/aides/45');

    // THEN
    expect(response.status).toBe(200);

    const aideBody = response.body as AideAPI;
    expect(aideBody.content_id).toEqual('45');
    expect(aideBody.codes_postaux).toEqual(['91120']);
    expect(aideBody.contenu).toEqual('ksqjfhqsjf the texte dfjksqmlmfjq');
    expect(aideBody.echelle).toEqual(Echelle.National);
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
    expect(aideBody.est_gratuit).toEqual(false);
  });

  it(`GET /utilisateurs/:utilisateurId/aides remplace un block de texte dans une aide`, async () => {
    // GIVEN

    await TestUtil.create(DB.blockText, {
      code: 'block_123',
      id_cms: '1',
      titre: 'haha',
      texte: 'the texte',
    });

    await blockTextRepository.loadCache();

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      partenaires_supp_ids: ['123'],
      contenu: 'ksqjfhqsjf {block_123} dfjksqmlmfjq',
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(1);

    const aideBody = response.body.liste_aides[0] as AideAPI;
    expect(aideBody.contenu).toEqual('ksqjfhqsjf the texte dfjksqmlmfjq');
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

  it('GET /utilisateurs/:utilisateurId/aides filtre par code postal les CC', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['11111'],
      echelle: Echelle['Communauté de communes'],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      codes_postaux: ['22222'],
      echelle: Echelle['Communauté de communes'],
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

  it('GET /utilisateurs/:utilisateurId/aides filtre par thematique simple', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: [],
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      thematiques: [Thematique.logement, Thematique.consommation],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2?thematique=logement',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(2);
  });
  it('GET /utilisateurs/:utilisateurId/aides filtre par thematique multiple', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: [],
      thematiques: [Thematique.alimentation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '2',
      thematiques: [Thematique.logement],
    });
    await TestUtil.create(DB.aide, {
      content_id: '3',
      thematiques: [Thematique.logement, Thematique.consommation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '4',
      thematiques: [Thematique.consommation],
    });
    await TestUtil.create(DB.aide, {
      content_id: '5',
      thematiques: [Thematique.climat],
    });
    await TestUtil.create(DB.aide, {
      content_id: '6',
      thematiques: [Thematique.loisir],
    });

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides_v2?thematique=logement&thematique=climat',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.liste_aides).toHaveLength(3);
  });
  it('GET /utilisateurs/:utilisateurId/aides indique si aide cliquée / demandée / vue', async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [
        {
          content_id: '1',
          clicked_demande: true,
          clicked_infos: false,
          vue_at: new Date(1),
          est_connue_utilisateur: false,
          sera_sollicitee_utilisateur: false,
          feedback: null,
          like_level: null,
        },
        {
          content_id: '2',
          clicked_demande: false,
          clicked_infos: true,
          vue_at: new Date(2),
          est_connue_utilisateur: false,
          sera_sollicitee_utilisateur: false,
          feedback: null,
          like_level: null,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, {
      logement: { code_postal: '22222' },
      history: history as any,
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
    expect(aideBody.deja_vue_le).toEqual('1970-01-01T00:00:00.001Z');
  });
  it(`POST /utilisateurs/:utilisateurId/aides/id/vu_infos marque l'aide comme cliqué sur le lien d'infos `, async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: undefined,
    });
    await aideRepository.loadCache();

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
  it(`POST /utilisateurs/:utilisateurId/aides/id/consulter marque l'aide comme vue`, async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: undefined,
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/consulter',
    );

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.history.aide_interactions).toHaveLength(1);
    expect(
      userDB.history.aide_interactions[0].vue_at.getTime(),
    ).toBeGreaterThan(Date.now() - 100);
  });
  it(`POST /utilisateurs/:utilisateurId/aides/id/vu_demande marque l'aide comme cliqué sur le lien demande `, async () => {
    // GIVEN
    process.env.CRON_API_KEY = TestUtil.token;
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [],
    };
    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: undefined,
    });
    await aideRepository.loadCache();

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
    expect(response.body.couverture_aides_ok).toEqual(true);
  });
  it('GET /utilisateurs/:utilisateurId/aides_v2 info de couvertur false', async () => {
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
    expect(response.body.couverture_aides_ok).toEqual(false);
  });

  it('GET /aides/id_cms récupère une aide unique en mode non connecté', async () => {
    // GIVEN
    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'], // metropole
      partenaires_supp_ids: ['123'],
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.getServer().get('/aides/1');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content_id: '1',
      titre: 'titreA',
      contenu: "Contenu de l'aide",
      derniere_maj: null,
      url_simulateur: '/aides/velo',
      url_source: 'https://hello',
      url_demande: 'https://demande',
      is_simulateur: true,
      codes_postaux: ['21000'],
      thematiques: ['climat', 'logement'],
      thematiques_label: ['climat', 'logement'],
      montant_max: 999,
      besoin_desc: 'Acheter un vélo',
      besoin: 'acheter_velo',
      partenaire_logo_url: 'logo_url',
      partenaire_nom: 'ADEME',
      partenaire_url: 'https://ademe.fr',
      echelle: 'National',
      est_gratuit: false,
    });
  });

  it(`GET /aides/id_cms récupère une aide unique d'un utilisateur donnée`, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [
        {
          content_id: '1',
          clicked_demande: true,
          clicked_infos: false,
          vue_at: new Date(1),
          est_connue_utilisateur: true,
          sera_sollicitee_utilisateur: false,
          feedback: 'good',
          like_level: 3,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { history: history as any });
    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'], // metropole
      partenaires_supp_ids: ['123'],
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides/1');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      content_id: '1',
      titre: 'titreA',
      contenu: "Contenu de l'aide",
      derniere_maj: null,
      url_simulateur: '/aides/velo',
      url_source: 'https://hello',
      url_demande: 'https://demande',
      is_simulateur: true,
      codes_postaux: ['21000'],
      thematiques: ['climat', 'logement'],
      thematiques_label: ['climat', 'logement'],
      montant_max: 999,
      besoin_desc: 'Acheter un vélo',
      besoin: 'acheter_velo',
      partenaire_logo_url: 'logo_url',
      partenaire_nom: 'ADEME',
      partenaire_url: 'https://ademe.fr',
      echelle: 'National',
      est_gratuit: false,
      clicked_demande: true,
      clicked_infos: false,
      like_level: 3,
      deja_vue_le: '1970-01-01T00:00:00.001Z',
    });
  });

  it(`GET /aides/id_cms consulter une aide positionne la date de vue`, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      article_interactions: [],
      quizz_interactions: [],
      aide_interactions: [
        {
          content_id: '1',
          clicked_demande: false,
          clicked_infos: false,
          vue_at: undefined,
          est_connue_utilisateur: false,
          sera_sollicitee_utilisateur: false,
          feedback: null,
          like_level: null,
        },
      ],
    };
    await TestUtil.create(DB.utilisateur, { history: history as any });
    await TestUtil.create(DB.partenaire);
    await partenaireRepository.loadCache();

    await TestUtil.create(DB.aide, {
      content_id: '1',
      codes_postaux: ['21000'], // metropole
      partenaires_supp_ids: ['123'],
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/aides/1');

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.deja_vue_le).toEqual(undefined);

    // WHEN
    const response_2 = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/aides/1',
    );

    // THEN
    expect(response_2.status).toBe(200);
    expect(response_2.body.deja_vue_le).not.toBeNull();
    expect(new Date(response_2.body.deja_vue_le).getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });

  it(`POST /utilisateurs/:utilisateurId/aides/:aideId/feedback - pousse un feedback pour une aide jamais vue`, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [],
      article_interactions: [],
      quizz_interactions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/feedback',
    ).send({
      like_level: 2,
      feedback: 'pas si mal',
      est_connue_utilisateur: false,
      sera_sollicitee_utilisateur: true,
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const aideDB = userDB.history.getAideInteractionByIdCms('1');
    expect(aideDB).toEqual({
      clicked_demande: false,
      clicked_infos: false,
      content_id: '1',
      est_connue_utilisateur: false,
      feedback: 'pas si mal',
      sera_sollicitee_utilisateur: true,
      vue_at: undefined,
      like_level: 2,
    });
  });
  it(`POST /utilisateurs/:utilisateurId/aides/:aideId/feedback - pousse un feedback pour une aide deja vue`, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [
        {
          content_id: '1',
          clicked_demande: true,
          clicked_infos: true,
          est_connue_utilisateur: null,
          sera_sollicitee_utilisateur: null,
          feedback: null,
          like_level: null,
          vue_at: new Date(1),
        },
      ],
      article_interactions: [],
      quizz_interactions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/feedback',
    ).send({
      like_level: 2,
      feedback: 'pas si mal',
      est_connue_utilisateur: true,
      sera_sollicitee_utilisateur: true,
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const aideDB = userDB.history.getAideInteractionByIdCms('1');
    expect(aideDB).toEqual({
      clicked_demande: true,
      clicked_infos: true,
      content_id: '1',
      est_connue_utilisateur: true,
      feedback: 'pas si mal',
      sera_sollicitee_utilisateur: true,
      vue_at: new Date(1),
      like_level: 2,
    });
  });

  it(`POST /utilisateurs/:utilisateurId/aides/:aideId/feedback - pousse juste le like`, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [
        {
          content_id: '1',
          clicked_demande: true,
          clicked_infos: true,
          est_connue_utilisateur: null,
          sera_sollicitee_utilisateur: null,
          feedback: null,
          like_level: null,
          vue_at: new Date(1),
        },
      ],
      article_interactions: [],
      quizz_interactions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/feedback',
    ).send({
      like_level: 3,
    });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    const aideDB = userDB.history.getAideInteractionByIdCms('1');
    expect(aideDB).toEqual({
      content_id: '1',
      vue_at: new Date(1),
      clicked_demande: true,
      clicked_infos: true,
      est_connue_utilisateur: null,
      feedback: null,
      like_level: 3,
      sera_sollicitee_utilisateur: null,
    });
  });
  it(`POST /utilisateurs/:utilisateurId/aides/:aideId/feedback - bad boolean`, async () => {
    // GIVEN
    const history: History_v0 = {
      version: 0,
      aide_interactions: [],
      article_interactions: [],
      quizz_interactions: [],
    };

    await TestUtil.create(DB.utilisateur, {
      history: history as any,
    });
    await TestUtil.create(DB.aide, {
      content_id: '1',
    });
    await aideRepository.loadCache();

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/aides/1/feedback',
    ).send({
      est_connue_utilisateur: 'bad',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `L'attribut [est_connue_utilisateur] n'est pas de type boolean, reçu [bad]`,
    );
  });
});
