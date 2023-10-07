import {
  Impact,
  Thematique,
} from '../../../src/domain/utilisateur/onboardingData';
import { TestUtil } from '../../TestUtil';

const ONBOARDING_1_2_3_4_DATA = {
  transports: ['voiture', 'pied'],
  avion: 1,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'tres_grand',
  chauffage: 'bois',
  repas: 'viande',
  consommation: 'jamais',
};
const ONBOARDING_3_3_4_4_DATA = {
  transports: ['voiture', 'pied'],
  avion: 1,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'grand',
  chauffage: 'gaz',
  repas: 'tout',
  consommation: 'shopping',
};
const ONBOARDING_1_3_4_4_DATA = {
  transports: ['pied'],
  avion: 0,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'grand',
  chauffage: 'gaz',
  repas: 'tout',
  consommation: 'shopping',
};
const ONBOARDING_1_1_2_3_DATA = {
  transports: ['voiture', 'pied'],
  avion: 1,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'grand',
  chauffage: 'bois',
  repas: 'vegan',
  consommation: 'jamais',
};
const ONBOARDING_1_1_2_2_DATA = {
  transports: ['moto', 'velo'],
  avion: 0,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'grand',
  chauffage: 'bois',
  repas: 'vegan',
  consommation: 'jamais',
};
const ONBOARDING_1_1_1_1_DATA = {
  transports: ['velo'],
  avion: 0,
  code_postal: '91120',
  adultes: 2,
  enfants: 2,
  residence: 'maison',
  proprietaire: false,
  superficie: 'petit',
  chauffage: 'bois',
  repas: 'vegan',
  consommation: 'jamais',
};

const ONBOARDING_RES_1111 = {
  ventilation_par_thematiques: {
    alimentation: Impact.tres_faible,
    transports: Impact.tres_faible,
    logement: Impact.tres_faible,
    consommation: Impact.tres_faible,
  },
  ventilation_par_impacts: {
    '1': [
      Thematique.alimentation,
      Thematique.transports,
      Thematique.logement,
      Thematique.consommation,
    ],
    '2': [],
    '3': [],
    '4': [],
  },
};
const ONBOARDING_RES_3344 = {
  ventilation_par_thematiques: {
    alimentation: Impact.eleve,
    transports: Impact.eleve,
    logement: Impact.tres_eleve,
    consommation: Impact.tres_eleve,
  },
  ventilation_par_impacts: {
    '1': [],
    '2': [],
    '3': [Thematique.alimentation, Thematique.transports],
    '4': [Thematique.logement, Thematique.consommation],
  },
};
const ONBOARDING_RES_1234 = {
  ventilation_par_thematiques: {
    alimentation: Impact.tres_eleve,
    transports: Impact.eleve,
    logement: Impact.faible,
    consommation: Impact.tres_faible,
  },
  ventilation_par_impacts: {
    '1': [Thematique.consommation],
    '2': [Thematique.logement],
    '3': [Thematique.transports],
    '4': [Thematique.alimentation],
  },
};
const ONBOARDING_RES_4444 = {
  ventilation_par_thematiques: {
    alimentation: Impact.tres_eleve,
    transports: Impact.tres_eleve,
    logement: Impact.tres_eleve,
    consommation: Impact.tres_eleve,
  },
  ventilation_par_impacts: {
    '1': [],
    '2': [],
    '3': [],
    '4': [
      Thematique.logement,
      Thematique.consommation,
      Thematique.alimentation,
      Thematique.transports,
    ],
  },
};

describe('/utilisateurs (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs?name=bob - when missing name', async () => {
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs?name=bob');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs?name=george - by name when present', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs?name=george',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('2');
  });

  it('GET /utilisateurs/id - when missing', async () => {
    // THEN
    return TestUtil.getServer().get('/utilisateurs/1').expect(404);
  });
  it('DELETE /utilisateurs/id', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('suivi');
    await TestUtil.create('situationNGC');
    await TestUtil.create('empreinte');
    await TestUtil.create('questionNGC');
    await TestUtil.create('badge');
    await TestUtil.create('interaction');
    // WHEN
    const response = await TestUtil.getServer().delete(
      '/utilisateurs/utilisateur-id',
    );

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUser).toBeNull();
  });
  it('GET /utilisateurs/id - when present', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // WHEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual('utilisateur-id');
    expect(response.body.name).toEqual('name');
    expect(response.body.nom).toEqual('nom');
    expect(response.body.prenom).toEqual('prenom');
    expect(response.body.code_postal).toEqual('91120');
    expect(response.body.points).toEqual(0);
    expect(response.body.quizzProfile).toEqual({
      alimentation: { level: 1, isCompleted: false },
      transport: { level: 1, isCompleted: false },
      logement: { level: 1, isCompleted: false },
      consommation: { level: 1, isCompleted: false },
      climat: { level: 1, isCompleted: false },
      dechet: { level: 1, isCompleted: false },
      loisir: { level: 1, isCompleted: false },
    });
    expect(response.body.created_at).toEqual(dbUser.created_at.toISOString());
  });
  it('GET /utilisateurs/id - list 1 badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.badges).toHaveLength(1);
    expect(response.body.badges[0].titre).toEqual('titre');
    expect(response.body.badges[0].created_at).toBeDefined();
  });
  it('GET /utilisateurs/id - list 2 badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    await TestUtil.create('badge', { id: '2', type: 'type2', titre: 'titre2' });
    // WHEN
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.badges).toHaveLength(2);
  });

  it('GET /utilisateurs - list all 2', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', name: 'bob' },
        { id: '2', name: 'george' },
      ],
    });
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('POST /utilisateurs - create new utilisateur with given all data', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      name: 'george',
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: 'to use',
      email: 'mon mail',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { name: 'george' },
    });
    expect(response.status).toBe(201);
    expect(response.headers['location']).toContain(user.id);
    expect(user.nom).toEqual('WW');
    expect(user.prenom).toEqual('Wojtek');
    expect(user.email).toEqual('mon mail');
    expect(user.passwordHash).toEqual('to use');
    expect(user.onboardingData).toStrictEqual(ONBOARDING_1_2_3_4_DATA);
    expect(user.onboardingResult).toStrictEqual(ONBOARDING_RES_1234);
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data to compute impact', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_2_3_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.transports).toEqual(3);
    expect(response.body.alimentation).toEqual(4);
    expect(response.body.logement).toEqual(2);
    expect(response.body.consommation).toEqual(1);
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_1 v1', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.consommation, Thematique.logement],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create('utilisateur', {
      id: '6',
      email: '6',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.logement],
          '3': [Thematique.consommation],
          '4': [],
        },
      },
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_2_3_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_1).toEqual(
      `50% des utilisateurs ont, comme vous, des impacts forts ou très forts dans 2 thématiques. Dans votre cas, il s'agit des thématiques : transports,alimentation`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_1 v2', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.consommation, Thematique.logement],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create('utilisateur', {
      id: '6',
      email: '6',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.logement],
          '3': [Thematique.consommation],
          '4': [],
        },
      },
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_3_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_1).toEqual(
      `66% des utilisateurs ont, comme vous, des impacts forts ou très forts dans au moins une thématique. Dans votre cas, il s'agit de la thématique : transports`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_1 v3', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      // cas onboarding vide pour anciens utilisateurs, ou ceux qui on pas onboardé
      id: '4',
      email: '4',
      onboardingResult: {},
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.consommation, Thematique.logement],
          '3': [],
          '4': [],
        },
      },
    });
    await TestUtil.create('utilisateur', {
      id: '6',
      email: '6',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.tres_faible,
          logement: Impact.faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [Thematique.alimentation, Thematique.transports],
          '2': [Thematique.logement],
          '3': [Thematique.consommation],
          '4': [],
        },
      },
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_2_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_1).toEqual(
      `33% des utilisateurs ont, comme vous, des impacts faibles ou très faibles dans l'ensemble des thématiques. vous faîtes partie des utilisateurs les plus sobres, bravo !`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_2 v1 (null)', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_1_1_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_2).toEqual(null);
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_2 v2', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', {
      id: '3',
      email: '3',
      onboardingResult: ONBOARDING_RES_1111,
    });
    await TestUtil.create('utilisateur', {
      id: '4',
      email: '4',
      onboardingResult: ONBOARDING_RES_1111,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_2_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_2).toEqual(
      `50% des utilisateurs parviennent à avoir moins d'impacts environnement en matière de transports.`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_2 v2.bis', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    await TestUtil.create('utilisateur', {
      id: '4',
      email: '4',
      onboardingResult: ONBOARDING_RES_1111,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_2_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_2).toEqual(
      `25% des utilisateurs parviennent à avoir moins d'impacts environnement en matière de transports. Pas facile, mais les solutions ne manquent pas.`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v1 (null)', async () => {
    // WHEN
    await TestUtil.create('utilisateur', { id: '1', email: '1' });
    await TestUtil.create('utilisateur', { id: '2', email: '2' });
    await TestUtil.create('utilisateur', { id: '3', email: '3' });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_3_3_4_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_3).toEqual(null);
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v2 - N3= 3', async () => {
    // WHEN
    await TestUtil.create('utilisateur', {
      id: '1',
      email: '1',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '2',
      email: '2',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '3',
      email: '3',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '4',
      email: '4',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: ONBOARDING_RES_1111,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_3_4_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_3).toEqual(
      `80% des utilisateurs ont des impacts supérieurs au vôtre en matière de transports. Vous avez des bonnes pratiques à partager !`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v3 - N3=2', async () => {
    // WHEN
    await TestUtil.create('utilisateur', {
      id: '1',
      email: '1',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '2',
      email: '2',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '3',
      email: '3',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '4',
      email: '4',
      onboardingResult: ONBOARDING_RES_1111,
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: ONBOARDING_RES_1111,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_2_3_4_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_3).toEqual(
      `60% des utilisateurs ont des impacts supérieurs au vôtre en matière de consommation et de logement. Vous avez des bonnes pratiques à partager !`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v3 - N3=1', async () => {
    // WHEN
    await TestUtil.create('utilisateur', {
      id: '1',
      email: '1',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '2',
      email: '2',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '3',
      email: '3',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: ONBOARDING_RES_1111,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_2_3_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_3).toEqual(
      `75% des utilisateurs ont des impacts supérieurs au vôtre en matière de alimentation, consommation et de logement. Vous avez des bonnes pratiques à partager !`,
    );
  });
  it('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v3 - N3=0', async () => {
    // WHEN
    await TestUtil.create('utilisateur', {
      id: '1',
      email: '1',
      onboardingResult: ONBOARDING_RES_4444,
    });
    await TestUtil.create('utilisateur', {
      id: '2',
      email: '2',
      onboardingResult: ONBOARDING_RES_1111,
    });
    await TestUtil.create('utilisateur', {
      id: '3',
      email: '3',
      onboardingResult: ONBOARDING_RES_1111,
    });
    await TestUtil.create('utilisateur', {
      id: '5',
      email: '5',
      onboardingResult: ONBOARDING_RES_1111,
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/evaluate-onboarding')
      .send(ONBOARDING_1_1_1_1_DATA);
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.phrase_3).toEqual(
      `25% des utilisateurs ont des impacts supérieurs au vôtre en matière de alimentation, transports, logement et de consommation. Vous avez des bonnes pratiques à partager !`,
    );
  });
  it('POST /utilisateurs - erreur 400 quand email existant', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { email: 'yo@truc.com' });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        name: 'george',
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: 'to use',
        email: 'yo@truc.com',
        onboardingData: { deladata: 'une valeur' },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Adresse [yo@truc.com]email deja existante',
    );
  });
  it('POST /utilisateurs - error when bad value in onboarding data', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        name: 'george',
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: 'to use',
        email: 'mon mail',
        onboardingData: { residence: 'mauvaise valeur' },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Valeur residence [mauvaise valeur] inconnue',
    );
  });
  it('GET /utilisateurs/id/profile - read basic profile datas', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id/profile',
    );
    // WHEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.name).toEqual('name');
    expect(response.body.nom).toEqual('nom');
    expect(response.body.prenom).toEqual('prenom');
    expect(response.body.email).toEqual('yo@truc.com');
    expect(response.body.code_postal).toEqual('91120');
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer()
      .patch('/utilisateurs/utilisateur-id/profile')
      .send({
        name: 'George 4',
        email: 'george@paris.com',
        nom: 'THE NOM',
        prenom: 'THE PRENOM',
        code_postal: '75008',
      });
    // WHEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(response.status).toBe(200);
    expect(dbUser.name).toEqual('George 4');
    expect(dbUser.nom).toEqual('THE NOM');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.code_postal).toEqual('75008');
  });
});
