import { TestUtil } from '../../TestUtil';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import { Utilisateur } from '../../../src/domain/utilisateur/utilisateur';
var crypto = require('crypto');

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

function getFakeUtilisteur() {
  return {
    id: null,
    passwordHash: '',
    passwordSalt: '',
    failed_login_count: 0,
    prevent_login_before: new Date(),
  };
}

describe('/utilisateurs - Compte utilisateur (API test)', () => {
  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('GET /utilisateurs 403 when not user of ID 1', async () => {
    // GIVEN
    await TestUtil.generateAuthorizationToken('2');

    // WHEN
    const response = await TestUtil.GET('/utilisateurs');

    // THEN
    expect(response.status).toBe(403);
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
    expect(response.body.revenu_fiscal).toEqual(10000);
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
    await TestUtil.generateAuthorizationToken('1');
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
    expect(response.body.utilisateur.revenu_fiscal).toEqual(10000);
    expect(response.body.utilisateur.points).toEqual(0);
    expect(response.body.utilisateur.todo.niveau).toEqual(1);
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
  it('POST /utilisateurs/login - bad password twice then ok, resets login count', async () => {
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
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(response.status).toEqual(200);
    expect(dbUser.failed_login_count).toEqual(0);
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
    expect(response.body.revenu_fiscal).toEqual(10000);
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas without password', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'george@paris.com',
      nom: 'THE NOM',
      prenom: 'THE PRENOM',
      code_postal: '75008',
      revenu_fiscal: 12345,
    });
    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(response.status).toBe(200);
    expect(dbUser.nom).toEqual('THE NOM');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.code_postal).toEqual('75008');
    expect(dbUser.revenu_fiscal).toEqual(12345);
  });
  it('PATCH /utilisateurs/id/profile - update basic profile datas', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      email: 'george@paris.com',
      nom: 'THE NOM',
      prenom: 'THE PRENOM',
      code_postal: '75008',
      mot_de_passe: '123456789012#',
      revenu_fiscal: 12345,
    });
    // THEN
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const fakeUser = getFakeUtilisteur();
    fakeUser.passwordHash = dbUser.passwordHash;
    fakeUser.passwordSalt = dbUser.passwordSalt;
    expect(response.status).toBe(200);
    expect(dbUser.nom).toEqual('THE NOM');
    expect(dbUser.prenom).toEqual('THE PRENOM');
    expect(dbUser.email).toEqual('george@paris.com');
    expect(dbUser.code_postal).toEqual('75008');
    expect(dbUser.revenu_fiscal).toEqual(12345);
    expect(dbUser.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('123456789012#', dbUser.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
  });
  it('PATCH /utilisateurs/id/profile - bad password format', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    // WHEN
    const response = await TestUtil.PATCH(
      '/utilisateurs/utilisateur-id/profile',
    ).send({
      mot_de_passe: 'bad',
    });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Le mot de passe doit contenir au moins un chiffre',
    );
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

  it('POST /utilisateurs/modifier_mot_de_passe - si code ok le mot de passe est modifié, compteur à zero', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: '123456',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(200);

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    const dbUtilisateur = new Utilisateur({
      ...userDB,
      badges: [],
      quizzProfile: null,
      onboardingData: null,
      onboardingResult: null,
      todo: null,
    });
    expect(userDB.failed_checkcode_count).toEqual(0);
    expect(userDB.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('#1234567890HAHA', userDB.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
    expect(dbUtilisateur.sent_email_count).toEqual(0);
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si code ko le mot de passe est PAS modifié', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    const userDB_before = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code ou adresse électronique');

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    expect(userDB.passwordHash).toEqual(userDB_before.passwordHash);
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si code ko 4 fois, blocage', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHA',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Trop d'essais successifs, attendez jusqu'à ",
    );
  });
});
