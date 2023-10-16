import { Utilisateur } from '../../../src/domain/utilisateur/utilisateur';
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

  it('GET /utilisateurs?nom=bob - when missing nom', async () => {
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs?nom=bob');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('GET /utilisateurs?nom=george - by nom when present', async () => {
    // GIVEN
    await TestUtil.prisma.utilisateur.createMany({
      data: [
        { id: '1', nom: 'bob' },
        { id: '2', nom: 'george' },
      ],
    });
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs?nom=george');
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
    await TestUtil.create('badge');
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
    expect(response.body.badges[0].titre).toEqual('titre');
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
        { id: '1', nom: 'bob' },
        { id: '2', nom: 'george' },
      ],
    });
    // WHEN
    const response = await TestUtil.getServer().get('/utilisateurs');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('POST /utilisateurs/login - logs user and return a JWT token', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('#1234567890HAHA');

    await TestUtil.create('utilisateur', {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });
    await TestUtil.create('badge');

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    // THEN
    expect(response.status).toBe(200);
    expect(response.body.token.length).toBeGreaterThan(20);
    expect(response.body.utilisateur.id).toEqual('utilisateur-id');
    expect(response.body.utilisateur.nom).toEqual('nom');
    expect(response.body.utilisateur.prenom).toEqual('prenom');
    expect(response.body.utilisateur.code_postal).toEqual('91120');
    expect(response.body.utilisateur.points).toEqual(0);
    expect(response.body.utilisateur.badges[0].titre).toEqual('titre');
    expect(response.body.utilisateur.quizzProfile).toEqual({
      alimentation: { level: 1, isCompleted: false },
      transport: { level: 1, isCompleted: false },
      logement: { level: 1, isCompleted: false },
      consommation: { level: 1, isCompleted: false },
      climat: { level: 1, isCompleted: false },
      dechet: { level: 1, isCompleted: false },
      loisir: { level: 1, isCompleted: false },
    });
  });
  it('POST /utilisateurs/login - bad password', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('#1234567890HAHA');

    await TestUtil.create('utilisateur', {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#bad password',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvais email ou mauvais mot de passe',
    );
    expect(dbUser.failed_login_count).toEqual(1);
  });
  it('POST /utilisateurs/login - bad email', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('#1234567890HAHA');

    await TestUtil.create('utilisateur', {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHA',
        email: 'bademail@truc.com',
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvais email ou mauvais mot de passe',
    );
  });
  it('POST /utilisateurs - create new utilisateur with given all data', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'mon mail',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(response.status).toBe(201);
    expect(response.headers['location']).toContain(user.id);
    expect(user.nom).toEqual('WW');
    expect(user.prenom).toEqual('Wojtek');
    expect(user.email).toEqual('mon mail');
    expect(user.passwordHash.length).toBeGreaterThan(20);
    expect(user.passwordSalt.length).toBeGreaterThan(20);
    expect(user.onboardingData).toStrictEqual(ONBOARDING_1_2_3_4_DATA);
    expect(user.onboardingResult).toStrictEqual(ONBOARDING_RES_1234);
  });
  it('POST /utilisateurs - bad password', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: 'to use',
      email: 'mon mail',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Le mot de passe doit contenir au moins un chiffre',
    );
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
    expect(response.body.phrase).toEqual(
      `<strong>Comme 1 utilisateur sur 2, vos impacts sont forts ou très forts dans 2 thématiques.</strong> Pour vous il s'agit des thématiques <strong>transports et alimentation</strong>.`,
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
    expect(response.body.phrase).toEqual(
      `<strong>Comme 6 utilisateurs sur 10, vos impacts sont forts ou très forts dans au moins une thématique</strong>. Pour vous il s'agit de la thématique <strong>transports</strong>.`,
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
    expect(response.body.phrase).toEqual(
      `<strong>Comme 1 utilisateur sur 3, vos impacts sont faibles ou très faibles dans l'ensemble des thématiques</strong>. Vous faîtes partie des utilisateurs les plus sobres, bravo !`,
    );
  });
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_2 v1 (null)', async () => {
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
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_2 v2', async () => {
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
    expect(response.body.phrase_2).toEqual({
      pourcent: 50,
      phrase: `des utilisateurs parviennent à avoir moins d'impacts environnement en matière de transports.`,
    });
  });
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_2 v2.bis', async () => {
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
    expect(response.body.phrase_2).toEqual({
      pourcent: 25,
      phrase: `des utilisateurs parviennent à avoir moins d'impacts environnement en matière de transports. Pas facile, mais les solutions ne manquent pas.`,
    });
  });
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v1 (null)', async () => {
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
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v2 - N3= 3', async () => {
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
    expect(response.body.phrase_3).toEqual({
      pourcent: 80,
      phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de transports. Vous avez des bonnes pratiques à partager !`,
    });
  });
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v3 - N3=2', async () => {
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
    expect(response.body.phrase_3).toEqual({
      pourcent: 60,
      phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de consommation et de logement. Vous avez des bonnes pratiques à partager !`,
    });
  });
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v3 - N3=1', async () => {
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
    expect(response.body.phrase_3).toEqual({
      pourcent: 75,
      phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de alimentation, consommation et de logement. Vous avez des bonnes pratiques à partager !`,
    });
  });
  it.skip('POST /utilisateurs/evaluate-onboarding - evaluates onboarding data - phrase_3 v3 - N3=0', async () => {
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
    expect(response.body.phrase_3).toEqual({
      pourcent: 25,
      phrase: `des utilisateurs ont des impacts supérieurs au vôtre en matière de alimentation, transports, logement et de consommation. Vous avez des bonnes pratiques à partager !`,
    });
  });
  it('POST /utilisateurs - erreur 400 quand email existant', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { email: 'yo@truc.com' });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
        onboardingData: { deladata: 'une valeur' },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Adresse email yo@truc.com déjà existante',
    );
  });
  it('POST /utilisateurs - error when bad value in onboarding data', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
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
    expect(dbUser.nom).toEqual('THE NOM');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.code_postal).toEqual('75008');
  });
});
