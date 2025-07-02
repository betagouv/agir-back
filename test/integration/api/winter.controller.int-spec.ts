import { TypeAction } from '../../../src/domain/actions/typeAction';
import {
  Chauffage,
  DPE,
  Superficie,
  TypeLogement,
} from '../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../src/domain/object_store/logement/logement_v0';
import { ThematiqueHistory_v0 } from '../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
import { RisquesNaturelsCommunesRepository } from '../../../src/infrastructure/repository/risquesNaturelsCommunes.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('Winter (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  const risquesNaturelsCommunesRepository =
    new RisquesNaturelsCommunesRepository(TestUtil.prisma);

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
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const response = await TestUtil.POST(
      '/utilisateurs/utilisateur-id/winter/inscription_par_adresse',
    ).send({
      nom: 'SMITH',
      adresse: '20 rue de la paix',
      code_postal: '91120',
      code_commune: '91477',
    });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('le service winter est désactivé');
  });
  it('POST /utilisateurs/utilisateur-id/winter/inscription_par_adresse - service mode fake', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
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
      commune: 'PALAISEAU',
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
      commune: 'PALAISEAU',
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
      commune: 'PALAISEAU',
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
      commune: 'PALAISEAU',
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
      commune: 'PALAISEAU',
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
      consommation_totale_euros: 1234567,
      economies_possibles_euros: 3345,
      economies_realisees_euros: 0,
      nombre_actions_associees: 0,
      detail_usages: [
        {
          eur: 130,
          percent: 15,
          type: 'airConditioning',
          couleur: '00809D',
          emoji: '❄️',
        },
        {
          eur: 1000,
          percent: 20,
          type: 'heating',
          couleur: 'F3A26D',
          emoji: '🔥',
        },
        {
          eur: 453,
          percent: 10,
          type: 'appliances',
          couleur: 'FCECDD',
          emoji: '📠',
        },
        {
          eur: 200,
          percent: 7,
          type: 'cooking',
          couleur: 'FF7601',
          emoji: '🍕',
        },
        {
          eur: 220,
          percent: 8,
          type: 'hotWater',
          couleur: 'FCD8CD',
          emoji: '💧',
        },
        {
          eur: 120,
          percent: 5,
          type: 'lighting',
          couleur: 'FEEBF6',
          emoji: '💡',
        },
        {
          eur: 70,
          percent: 5,
          type: 'mobility',
          couleur: 'EBD6FB',
          emoji: '⚡️🚙',
        },
        {
          eur: 42,
          percent: 10,
          type: 'multimedia',
          couleur: '748873',
          emoji: '🎮',
        },
        {
          eur: 987,
          percent: 15,
          type: 'other',
          couleur: 'D1A980',
          emoji: '❓',
        },
        {
          eur: 123,
          percent: 5,
          type: 'swimmingPool',
          couleur: 'E5E0D8',
          emoji: '🏊',
        },
      ],
    });
  });

  it(`GET /utilisateurs/utilisateur-id/winter/consommation : nombre d'actions winter OK`, async () => {
    // GIVEN
    const logement: Logement_v0 = {
      version: 0,
      superficie: Superficie.superficie_150,
      type: TypeLogement.maison,
      code_postal: '91120',
      chauffage: Chauffage.bois,
      commune: 'PALAISEAU',
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
    expect(response.body.economies_realisees_euros).toEqual(33);
  });
});
