import {
  Impact,
  Thematique,
} from '../../../src/domain/utilisateur/onboardingData';
import { TestUtil } from '../../TestUtil';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';

const ONBOARDING_1_2_3_4_DATA = {
  transports: ['voiture', 'pied'],
  avion: 1,
  code_postal: '91120',
  adultes: 2,
  enfants: 1,
  residence: 'maison',
  proprietaire: true,
  superficie: 'superficie_150',
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
  superficie: 'superficie_100',
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
  superficie: 'superficie_100',
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
  superficie: 'superficie_100',
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
  superficie: 'superficie_100',
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
  superficie: 'superficie_35',
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

function getFakeUtilisteur() {
  return {
    passwordHash: '',
    passwordSalt: '',
    failed_login_count: 0,
    prevent_login_before: new Date(),
  };
}

describe('/utilisateurs (API test)', () => {
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

  it('GET /utilisateurs?nom=bob - when missing nom', async () => {
    // WHEN
    const response = await TestUtil.GET('/utilisateurs?nom=bob');
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
    const response = await TestUtil.GET('/utilisateurs?nom=george');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toEqual('2');
  });

  it('GET /utilisateurs/id - when missing', async () => {
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
    // THEN
    expect(response.status).toBe(404);
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
    const response = await TestUtil.DELETE('/utilisateurs/utilisateur-id');

    // THEN
    expect(response.status).toBe(200);
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(dbUser).toBeNull();
  });
  it('GET /utilisateurs/id - 401 si pas de token', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.getServer().get(
      '/utilisateurs/utilisateur-id',
    );
    // THEN
    expect(response.status).toBe(401);
  });
  it('GET /utilisateurs/id - ok si token', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
    /*.set(
        'Authorization',
        `Bearer ${await TestUtil.createNewInnerAppToken('utilisateur-id')}`,
      )*/
    // THEN
    expect(response.status).toBe(200);
  });
  it('GET /utilisateurs/id - 403 si on accede à la ressource d un autre', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { email: '1' });
    await TestUtil.create('utilisateur', { id: 'autre-id', email: '2' });
    const response = await TestUtil.GET('/utilisateurs/autre-id');
    expect(response.status).toBe(403);
    expect(response.body.code).toEqual('002');
    expect(response.body.message).toEqual(
      'Vous ne pouvez pas accéder à ces données',
    );
  });
  it('GET /utilisateurs/id - when present', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { failed_login_count: 2 });
    await TestUtil.create('badge');
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
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
    expect(response.body.failed_login_count).toEqual(undefined);
    expect(response.body.prevent_login_before).toEqual(undefined);
  });
  it('GET /utilisateurs/id - list 1 badge', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.create('badge');
    // WHEN
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
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
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id');
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
    const response = await TestUtil.GET('/utilisateurs');
    // THEN
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  it('POST /utilisateurs/login - logs user and return a JWT token', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create('utilisateur', {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
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
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

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
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
    expect(dbUser.failed_login_count).toEqual(1);
  });
  it('POST /utilisateurs/login - utilisateur non actif', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHA',
        email: 'monmail@truc.com',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Utilisateur non actif');
  });
  it('POST /utilisateurs/login - bad password twice, failed count = 2', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create('utilisateur', {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#bad password',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(dbUser.failed_login_count).toEqual(3);
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
  });
  it('POST /utilisateurs/login - bad password 4 times, blocked account', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

    await TestUtil.create('utilisateur', {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#bad password',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // THEN
    expect(response.body.message).toContain(
      `Trop d'essais successifs, compte bloqué jusqu'à`,
    );
    expect(dbUser.failed_login_count).toEqual(4); // le compteur reste bloqué sur 4
    expect(dbUser.prevent_login_before.getTime()).toBeGreaterThan(
      new Date().getTime(),
    );
  });
  it('POST /utilisateurs/login - bad email', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHA');

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
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
  });
  it('POST /utilisateurs - create new utilisateur with given all data', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    const user = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(response.status).toBe(201);
    expect(response.headers['location']).toContain('monmail@truc.com');
    expect(user.nom).toEqual('WW');
    expect(user.prenom).toEqual('Wojtek');
    expect(user.email).toEqual('monmail@truc.com');
    expect(user.passwordHash.length).toBeGreaterThan(20);
    expect(user.passwordSalt.length).toBeGreaterThan(20);
    expect(user.onboardingData).toStrictEqual(ONBOARDING_1_2_3_4_DATA);
    expect(user.onboardingResult).toStrictEqual(ONBOARDING_RES_1234);
    expect(user.code).toHaveLength(6);
    expect(user.failed_checkcode_count).toEqual(0);
    expect(user.prevent_checkcode_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
    expect(user.sent_code_count).toEqual(1);
    expect(user.prevent_sendcode_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
  });
  it('POST /utilisateurs - bad password', async () => {
    // WHEN
    const response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: 'to use',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Le mot de passe doit contenir au moins un chiffre',
    );
  });
  it('POST /utilisateurs/renvoyer_code - resend code ok for first time, counter + 1', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    expect(userDB.sent_code_count).toEqual(2);
  });
  it('POST /utilisateurs/email/renvoyer_code - resend code 4 times => error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });
    await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/renvoyer_code')
      .send({ email: 'monmail@truc.com' });

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(response.status).toBe(400);

    expect(userDB.sent_code_count).toEqual(3);
    expect(userDB.prevent_sendcode_before.getTime()).toBeGreaterThan(
      Date.now(),
    );
  });
  it('POST /utilisateurs/valider - validate proper code OK, active user as outcome', async () => {
    // GIVEN
    await TestUtil.create('interactionDefinition');
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
        code: '123456',
      });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    const userDB_interactions = await TestUtil.prisma.interaction.findMany();

    expect(userDB.active_account).toEqual(true);
    expect(userDB_interactions).toHaveLength(1);
    expect(userDB_interactions[0].utilisateurId).toEqual(userDB.id);
  });
  it('POST /utilisateurs/valider - validate 2 times , already active account error', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: '123456',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
        code: '123456',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Ce compte est déjà actif');
  });
  it('POST /utilisateurs/valider - bad code increase counter', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
        code: 'bad',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code ou adresse électronique');

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });
    expect(userDB.active_account).toEqual(false);
    expect(userDB.failed_checkcode_count).toEqual(1);
  });
  it('POST /utilisateurs/valider - bad code 4 times, blocked account', async () => {
    // GIVEN
    await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHA',
      email: 'monmail@truc.com',
      onboardingData: ONBOARDING_1_2_3_4_DATA,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: 'bad',
    });
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: 'bad',
    });
    await TestUtil.getServer().post('/utilisateurs/valider').send({
      email: 'monmail@truc.com',
      code: 'bad',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/valider')
      .send({
        email: 'monmail@truc.com',
        code: 'bad',
      });

    const dbUser = await TestUtil.prisma.utilisateur.findFirst({
      where: { nom: 'WW' },
    });

    // THEN
    expect(response.body.message).toContain(
      `Trop d'essais successifs, compte bloqué jusqu'à`,
    );
    expect(dbUser.failed_checkcode_count).toEqual(4); // le compteur reste bloqué sur 4
    expect(dbUser.prevent_checkcode_before.getTime()).toBeGreaterThan(
      new Date().getTime(),
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
      'Adresse électronique yo@truc.com déjà existante',
    );
  });
  it('POST /utilisateurs - email au mauvais format', async () => {
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs')
      .send({
        nom: 'WW',
        prenom: 'Wojtek',
        mot_de_passe: '#1234567890HAHA',
        email: 'yotruc.com',
        onboardingData: { deladata: 'une valeur' },
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      `Format de l'adresse électronique yotruc.com incorrect`,
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
    const response = await TestUtil.GET('/utilisateurs/utilisateur-id/profile');
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
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'george@paris.com',
      nom: 'THE NOM',
      prenom: 'THE PRENOM',
      code_postal: '75008',
      mot_de_passe: '1234',
    });
    // WHEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    const fakeUser = getFakeUtilisteur();
    fakeUser.passwordHash = dbUser.passwordHash;
    fakeUser.passwordSalt = dbUser.passwordSalt;
    expect(response.status).toBe(200);
    expect(dbUser.nom).toEqual('THE NOM');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.code_postal).toEqual('75008');
    expect(
      PasswordManager.checkUserPasswordOKAndChangeState(fakeUser, '1234'),
    ).toEqual(true);
  });
  it('POST /utilisateurs/oubli_mot_de_passe - renvoi OK si mail existe pas', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    const response = await TestUtil.POST(
      '/utilisateurs/oubli_mot_de_passe',
    ).send({
      email: 'mailpas@connu.com',
    });
    // THEN
    expect(response.status).toBe(200);
  });
  it('POST /utilisateurs/oubli_mot_de_passe - renvoi KO si 4 demandes de suite', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.POST('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    await TestUtil.POST('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    await TestUtil.POST('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    const response = await TestUtil.POST(
      '/utilisateurs/oubli_mot_de_passe',
    ).send({
      email: 'yo@truc.com',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Trop d'essais successifs, attendez jusqu'à ",
    );
  });
});
