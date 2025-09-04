import { TypeAction } from '../../../src/domain/actions/typeAction';
import { Selection } from '../../../src/domain/contenu/selection';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { ActionRepository } from '../../../src/infrastructure/repository/action.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Winter (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const actionRepository = new ActionRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    await TestUtil.appclose();
    process.env = OLD_ENV;
  });

  it('POST /utilisateurs/utilisateur-id/winter/inscription_par_adresse - service non actif', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '20',
      rue: 'rue de la paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/winter/inscription_par_adresse',
    ).send({
      nom: 'SMITH',
      adresse: '20 rue de la paix',
      code_postal: '91120',
      code_commune: '91477',
      rue: 'Rue de la paix',
      numero_rue: '20',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('le service winter est désactivé');
  });
  it('POST /utilisateurs/utilisateur-id/winter/inscription_par_adresse - service mode fake', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      latitude: 48,
      longitude: 2,
      numero_rue: '20',
      rue: 'rue de la paix',
      code_commune: '91477',
      score_risques_adresse: undefined,
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/winter/inscription_par_adresse',
    )
      .set('user-agent', `TheChrome`)
      .set('X-Forwarded-For', `MyIP`)
      .send({
        nom: 'SMITH',
        adresse: '20 rue de la paix',
        code_postal: '91120',
        code_commune: '91477',
        rue: 'Rue de la paix',
        numero_rue: '20',
      });

    // THEN
    expect(response.status).toBe(201);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user.logement.prm).toEqual('12345678901234');
    const consent = (await TestUtil.prisma.linkyConsentement.findMany())[0];

    expect(consent.ip_address).toEqual('MyIP');
    expect(consent.email).toEqual('yo@truc.com');
    expect(consent.user_agent).toEqual('TheChrome');
  });
  it('DELETE /utilisateurs/utilisateur-id/winter/ supprime le PRM et la souscription', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: '12345678901234',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    process.env.WINTER_API_ENABLED = 'fake';

    await TestUtil.prisma.linkyConsentement.create({
      data: {
        date_consentement: new Date(),
        date_fin_consentement: new Date(),
        email: 'AA',
        id: '123',
        nom: 'RGKJZG',
        prm: '12345',
        texte_signature: 'BLABLA',
        utilisateurId: 'utilisateur-id',
        ip_address: '1234556677',
        user_agent: 'chrome',
        created_at: undefined,
        updated_at: undefined,
      },
    });

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/winter',
    );

    // THEN
    expect(response.status).toBe(200);

    const user = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    expect(user.logement.prm).toEqual(undefined);
    const consent = await TestUtil.prisma.linkyConsentement.findMany();

    expect(consent).toHaveLength(1);
  });
  it('DELETE /utilisateurs/utilisateur-id/winter/ erreur si service pas actif', async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: '12345678901234',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    process.env.WINTER_API_ENABLED = 'false';

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/winter',
    );

    // THEN
    expect(response.status).toBe(400);
  });

  it(`DELETE /utilisateurs/utilisateur-id/winter/ pas d'erreur si pas de PRM`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    process.env.WINTER_API_ENABLED = 'false';

    // WHEN
    const response = await TestUtil.DELETE(
      '/utilisateurs/utilisateur-id/winter',
    );

    // THEN
    expect(response.status).toBe(200);
  });
  it(`GET /utilisateurs/utilisateur-id/winter/consommation : erreur si pas de PRM déclaré`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: undefined,
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/winter/consommation',
    );

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Pas de décomposition disponible car pas de soucription Winter (par adresse ou PRM)',
    );
  });

  it(`GET /utilisateurs/utilisateur-id/winter/consommation : decomposition OK`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: undefined,
      score_risques_adresse: undefined,
      prm: '12345',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    await TestUtil.create(DB.utilisateur, { logement: logement as any });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/winter/consommation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      consommation_totale_euros: 1234,
      consommation_totale_kwh: 3690,
      economies_possibles_euros: 3345,
      economies_realisees_euros: 0,
      nombre_actions_associees: 0,
      detail_usages: [
        {
          eur: 1000,
          percent: 29.8,
          type: 'heating',
          couleur: 'FF9239',
          emoji: '🔥',
        },
        {
          eur: 987,
          percent: 29.5,
          type: 'other',
          couleur: '77F2B2',
          emoji: '✳️',
        },
        {
          eur: 453,
          percent: 13.5,
          type: 'appliances',
          couleur: 'AEF372',
          emoji: '🧺',
        },
        {
          eur: 220,
          percent: 6.5,
          type: 'hotWater',
          couleur: '98CCFF',
          emoji: '🛁',
        },
        {
          eur: 200,
          percent: 5.9,
          type: 'cooking',
          couleur: 'A8C6E5',
          emoji: '🍳',
        },
        {
          eur: 130,
          percent: 3.8,
          type: 'airConditioning',
          couleur: '007592',
          emoji: '❄️',
        },
        {
          eur: 123,
          percent: 3.6,
          type: 'swimmingPool',
          couleur: '5574F2',
          emoji: '🏊',
        },
        {
          eur: 120,
          percent: 3.5,
          type: 'lighting',
          couleur: 'FFC739',
          emoji: '💡',
        },
        {
          eur: 70,
          percent: 2,
          type: 'mobility',
          couleur: 'CB9F75',
          emoji: '🚙',
        },
        {
          eur: 42,
          percent: 1.2,
          type: 'multimedia',
          couleur: 'C1BEFF',
          emoji: '📺',
        },
      ],
    });
  });

  it(`GET /utilisateurs/utilisateur-id/winter/consommation : nombre d'actions winter pas faites OK`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: '12345',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    const them: ThematiqueHistory_v0 = {
      codes_actions_exclues: [],
      liste_actions_utilisateur: [],
      liste_thematiques: [],
      recommandations_winter: [
        {
          action: {
            code: '123',
            type: TypeAction.classique,
          },
          montant_economies_euros: 23,
        },
        {
          action: {
            code: '456',
            type: TypeAction.classique,
          },
          montant_economies_euros: 10,
        },
      ],
      version: 0,
    };

    await TestUtil.create(DB.action, {
      cms_id: '1',
      type_code_id: 'classique_123',
      code: '123',
      type: TypeAction.classique,
      selections: [Selection.actions_watt_watchers],
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      type_code_id: 'classique_456',
      code: '456',
      type: TypeAction.classique,
      selections: [Selection.actions_watt_watchers],
    });

    await actionRepository.loadCache();

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: them as any,
    });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/winter/consommation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nombre_actions_associees).toEqual(2);
    expect(response.body.economies_realisees_euros).toEqual(0);
  });
  it(`GET /utilisateurs/utilisateur-id/winter/consommation : nombre d'actions winter faites OK`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '21000',
      chauffage: Chauffage.bois,
      latitude: undefined,
      longitude: undefined,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      dpe: DPE.B,
      nombre_adultes: 2,
      nombre_enfants: 2,
      plus_de_15_ans: true,
      proprietaire: true,
      code_commune: '21231',
      score_risques_adresse: undefined,
      prm: '12345',
      est_prm_obsolete: false,
      est_prm_par_adresse: false,
      liste_adresses_recentes: [],
    };
    const them: ThematiqueHistory_v0 = {
      codes_actions_exclues: [],
      liste_actions_utilisateur: [
        {
          action: { code: '123', type: TypeAction.classique },
          faite_le: new Date(3),
          vue_le: new Date(2),
          feedback: null,
          like_level: null,
          liste_partages: [],
          liste_questions: [],
        },
        {
          action: { code: '456', type: TypeAction.classique },
          faite_le: new Date(3),
          vue_le: new Date(2),
          feedback: null,
          like_level: null,
          liste_partages: [],
          liste_questions: [],
        },
      ],
      liste_thematiques: [],
      recommandations_winter: [
        {
          action: {
            code: '123',
            type: TypeAction.classique,
          },
          montant_economies_euros: 23,
        },
        {
          action: {
            code: '456',
            type: TypeAction.classique,
          },
          montant_economies_euros: 10,
        },
      ],
      version: 0,
    };

    await TestUtil.create(DB.action, {
      cms_id: '1',
      type_code_id: 'classique_123',
      code: '123',
      type: TypeAction.classique,
      selections: [Selection.actions_watt_watchers],
    });
    await TestUtil.create(DB.action, {
      cms_id: '2',
      type_code_id: 'classique_456',
      code: '456',
      type: TypeAction.classique,
      selections: [Selection.actions_watt_watchers],
    });

    await actionRepository.loadCache();

    await TestUtil.create(DB.utilisateur, {
      logement: logement as any,
      thematique_history: them as any,
    });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.GET(
      '/utilisateurs/utilisateur-id/winter/consommation',
    );

    // THEN
    expect(response.status).toBe(200);
    expect(response.body.nombre_actions_associees).toEqual(0);
    expect(response.body.economies_realisees_euros).toEqual(33);
  });

  it(`POST /admin/delete_orphan_prms - suppression d'un PRM auprès de winter si utilisateur supprimé`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.prisma.linkyConsentement.create({
      data: {
        id: '1',
        date_consentement: new Date(1),
        date_fin_consentement: new Date(2),
        email: 'a@b.com',
        nom: 'NOM',
        prm: '12345',
        texte_signature: 'haha',
        utilisateurId: '123',
        created_at: undefined,
        updated_at: undefined,
        ip_address: '127.0.0.1',
        user_agent: 'chrome',
        unsubscribed_prm: false,
      },
    });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.POST('/admin/delete_orphan_prms');

    // THEN
    expect(response.status).toBe(201);

    expect(response.body).toEqual([
      'deleted orphan PRM [12345] for deleted user [123]',
    ]);
  });
  it(`POST /admin/delete_orphan_prms - non suppression d'un PRM auprès de winter si utilisateur existe`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.create(DB.utilisateur, { id: '123' });
    await TestUtil.prisma.linkyConsentement.create({
      data: {
        id: '1',
        date_consentement: new Date(1),
        date_fin_consentement: new Date(2),
        email: 'a@b.com',
        nom: 'NOM',
        prm: '12345',
        texte_signature: 'haha',
        utilisateurId: '123',
        created_at: undefined,
        updated_at: undefined,
        ip_address: '127.0.0.1',
        user_agent: 'chrome',
        unsubscribed_prm: false,
      },
    });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.POST('/admin/delete_orphan_prms');

    // THEN
    expect(response.status).toBe(201);

    expect(response.body).toEqual([]);
  });
  it(`POST /admin/delete_orphan_prms - non suppression d'un PRM auprès de winter si suppression deja realisee`, async () => {
    // GIVEN
    TestUtil.token = process.env.CRON_API_KEY;
    await TestUtil.prisma.linkyConsentement.create({
      data: {
        id: '1',
        date_consentement: new Date(1),
        date_fin_consentement: new Date(2),
        email: 'a@b.com',
        nom: 'NOM',
        prm: '12345',
        texte_signature: 'haha',
        utilisateurId: '123',
        created_at: undefined,
        updated_at: undefined,
        ip_address: '127.0.0.1',
        user_agent: 'chrome',
        unsubscribed_prm: true,
      },
    });

    process.env.WINTER_API_ENABLED = 'fake';

    // WHEN
    const response = await TestUtil.POST('/admin/delete_orphan_prms');

    // THEN
    expect(response.status).toBe(201);

    expect(response.body).toEqual([]);
  });
});
