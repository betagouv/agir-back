import { DB, TestUtil } from '../../TestUtil';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { UtilisateurStatus } from '../../../src/domain/utilisateur/utilisateur';
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

describe('/utilisateurs - Connexion V2 Compte utilisateur (API test)', () => {
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

  it('POST /utilisateurs/login_v2 - envoi un code da validation', async () => {
    // GIVEN
    process.env.OTP_DEV = '123456';

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
      .post('/utilisateurs/login_v2')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    // THEN
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(response.status).toBe(201);
    expect(response.body).toEqual({});

    expect(userDB.code).toEqual('123456');
    expect(userDB.status).toEqual(UtilisateurStatus.connexion_etape_1);
    expect(userDB.failed_checkcode_count).toEqual(0);
    expect(userDB.prevent_checkcode_before.getTime()).toBeLessThanOrEqual(
      Date.now(),
    );
  });

  it(`POST /utilisateurs/login_v2_code - valide le code et connecte l'utilisateur après une demande de login`, async () => {
    // GIVEN
    process.env.OTP_DEV = '123456';

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
    let response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({});

    // WHEN
    response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: '123456',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(201);
    expect(response.body.token.length).toBeGreaterThan(20);

    expect(response.body.utilisateur.id).toEqual('utilisateur-id');
    expect(response.body.utilisateur.nom).toEqual('nom');
    expect(response.body.utilisateur.prenom).toEqual('prenom');

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.status).toEqual(UtilisateurStatus.default);
  });
  it(`POST /utilisateurs/login_v2_code - mauvais code de validation`, async () => {
    // GIVEN
    process.env.OTP_DEV = '123456';

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
    let response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({});

    // WHEN
    response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: 'bad code',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.status).toEqual(UtilisateurStatus.connexion_etape_1);
  });
  it(`POST /utilisateurs/login_v2_code - 4 mauvais code de validation`, async () => {
    // GIVEN
    process.env.OTP_DEV = '123456';

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
    let response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
      .send({
        mot_de_passe: '#1234567890HAHAa',
        email: 'yo@truc.com',
      });
    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({});

    // WHEN
    response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: 'bad code',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(400);
    response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: 'bad code',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(400);
    response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: 'bad code',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );
    response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: 'bad code',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(400);
    expect(response.body.message.includes(`Trop d'essais successifs`)).toEqual(
      true,
    );

    const userDB = await utilisateurRepository.getById('utilisateur-id');
    expect(userDB.failed_checkcode_count).toEqual(4);
  });

  it(`POST /utilisateurs/login_v2_code - un code de modif de mot de passe ne permet pas de passer la connexion`, async () => {
    // GIVEN
    process.env.OTP_DEV = '123456';

    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
      parts: null,
      force_connexion: true,
    });

    // GIVEN - génère aussi un code 123456
    await TestUtil.getServer().post('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2_code')
      .send({
        code: '123456',
        email: 'yo@truc.com',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );
  });

  it('POST /utilisateurs/login_v2 - bad password', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
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
  it('POST /utilisateurs/login_v2 - utilisateur non actif', async () => {
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
    response = await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#1234567890HAHAa',
      email: 'w@w.com',
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toEqual('Utilisateur non actif');
  });
  it('POST /utilisateurs/login_v2 - bad password twice, failed count = 2', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
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
  it('POST /utilisateurs/login_v2 - bad password twice then ok, resets login count', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
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
  it('POST /utilisateurs/login_v2 - bad password 4 times, blocked account', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/login_v2').send({
      mot_de_passe: '#bad password',
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
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
  it('POST /utilisateurs/login_v2 - bad email', async () => {
    // GIVEN
    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/login_v2')
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
});
