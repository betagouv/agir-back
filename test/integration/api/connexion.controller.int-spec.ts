import { DB, TestUtil } from '../../TestUtil';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { KycRepository } from '../../../src/infrastructure/repository/kyc.repository';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { Univers } from '../../../src/domain/univers/univers';
var crypto = require('crypto');

function getFakeUtilisteur() {
  return {
    id: null,
    passwordHash: '',
    passwordSalt: '',
    failed_login_count: 0,
    prevent_login_before: new Date(),
    force_connexion: false,
  };
}

describe('/utilisateurs - Connexion Compte utilisateur (API test)', () => {
  const OLD_ENV = process.env;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.EMAIL_ENABLED = 'false';
  });

  afterAll(async () => {
    process.env = OLD_ENV;
    await TestUtil.appclose();
  });

  it('POST /utilisateurs/login - logs user and return a JWT token, reset force_connexion', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
      parts: null,
      force_connexion: true,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    // THEN
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(response.status).toBe(201);
    expect(response.body.token.length).toBeGreaterThan(20);

    expect(response.body.utilisateur.id).toEqual('utilisateur-id');
    expect(response.body.utilisateur.nom).toEqual('nom');
    expect(response.body.utilisateur.prenom).toEqual('prenom');
    expect(response.body.utilisateur.is_onboarding_done).toEqual(true);
    expect(userDB.force_connexion).toEqual(false);
  });
  it('POST /utilisateurs/login - logs user , onboarding pas done', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
      parts: null,
      force_connexion: true,
      prenom: null,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body.utilisateur.is_onboarding_done).toEqual(false);
  });
  it('POST /utilisateurs/login - login ok même si pas la même casse', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
      parts: null,
      force_connexion: true,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'YO@truc.COM',
      });
    // THEN
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(response.status).toBe(201);
    expect(response.body.utilisateur.id).toEqual('utilisateur-id');
  });
  it('POST /utilisateurs/login - bad password', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
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
    let response = await TestUtil.getServer().post('/utilisateurs').send({
      nom: 'WW',
      prenom: 'Wojtek',
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
      code_postal: '91120',
      commune: 'PALAISEAU',
      //onboardingData: ONBOARDING_1_2_3_4_DATA,
    });
    expect(response.status).toBe(201);

    // WHEN
    response = await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Utilisateur non actif');
  });
  it('POST /utilisateurs/login - bad password twice, failed count = 2', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
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
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
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
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    const dbUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    }); // THEN
    expect(response.status).toEqual(201);
    expect(dbUser.failed_login_count).toEqual(0);
  });
  it('POST /utilisateurs/login - bad password 4 times, blocked account', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
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
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'bademail@truc.com',
      });
    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvaise adresse électronique ou mauvais mot de passe',
    );
  });

  it('POST /utilisateurs/oubli_mot_de_passe - renvoi OK si mail existe pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const response = await TestUtil.POST(
      '/utilisateurs/oubli_mot_de_passe',
    ).send({
      email: 'mailpas@connu.com',
    });
    // THEN
    expect(response.status).toBe(201);
  });
  it('POST /utilisateurs/oubli_mot_de_passe - renvoi KO si 4 demandes de suite', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
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

  it('POST /utilisateurs/modifier_mot_de_passe - si code ok le mot de passe est modifié, compteurs à zero', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.getServer().post('/utilisateurs/login').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: '123456',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.failed_checkcode_count).toEqual(0);
    expect(userDB.passwordHash).toEqual(
      crypto
        .pbkdf2Sync('#1234567890HAHAa', userDB.passwordSalt, 1000, 64, `sha512`)
        .toString(`hex`),
    );
    expect(userDB.sent_email_count).toEqual(0);
    expect(userDB.failed_login_count).toEqual(0);
    expect(userDB.prevent_login_before.getTime()).toBeGreaterThan(
      Date.now() - 200,
    );
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si code ko le mot de passe est PAS modifié', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const userDB_before = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    expect(userDB.passwordHash).toEqual(userDB_before.passwordHash);
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si email ko erreur generique', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    const userDB_before = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: '123456',
        mot_de_passe: '#1234567890HAHAa',
        email: 'bad@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });

    expect(userDB.passwordHash).toEqual(userDB_before.passwordHash);
  });
  it('POST /utilisateurs/modifier_mot_de_passe - si code ko 4 fois, blocage', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/modifier_mot_de_passe')
      .send({
        code: 'bad_code',
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });

    // THEN
    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Trop d'essais successifs, attendez jusqu'à ",
    );
  });

  it(`POST /utilisateurs/id/logout deconnect un utilisateur donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.POST('/utilisateurs/utilisateur-id/logout');
    const userDB = await utilisateurRepository.getById('utilisateur-id');

    // THEN
    expect(response.status).toBe(201);
    expect(userDB.force_connexion).toEqual(true);
  });
  it(`POST /utilisateurs/logout deconnect tous les utilisateurs`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { id: '1', email: 'a' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: 'b' });
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/logout');
    const userDB_1 = await utilisateurRepository.getById('1');
    const userDB_2 = await utilisateurRepository.getById('2');

    // THEN
    expect(response.status).toBe(201);
    expect(userDB_1.email).toEqual('a');
    expect(userDB_1.force_connexion).toEqual(true);
    expect(userDB_2.email).toEqual('b');
    expect(userDB_2.force_connexion).toEqual(true);
  });
});
