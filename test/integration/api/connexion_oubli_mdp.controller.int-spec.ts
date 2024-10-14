import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Scope } from '../../../src/domain/utilisateur/utilisateur';
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

describe('/utilisateurs - Oubli de mot de passe (API test)', () => {
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

  it('POST /utilisateurs/oubli_mot_de_passe - renvoi OK si mail existe pas', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const response = await TestUtil.getServer()
      .post('/utilisateurs/oubli_mot_de_passe')
      .send({
        email: 'mailpas@connu.com',
      });
    // THEN
    expect(response.status).toBe(201);
  });
  it('POST /utilisateurs/oubli_mot_de_passe - renvoi KO si 4 demandes de suite', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    await TestUtil.getServer().post('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    await TestUtil.getServer().post('/utilisateurs/oubli_mot_de_passe').send({
      email: 'yo@truc.com',
    });
    const response = await TestUtil.getServer()
      .post('/utilisateurs/oubli_mot_de_passe')
      .send({
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
    process.env.OTP_DEV = '123456';

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
    await TestUtil.getServer().post('/utilisateurs/oubli_mot_de_passe').send({
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

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
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
});
