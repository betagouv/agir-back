import { DB, TestUtil } from '../../TestUtil';
import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { UtilisateurStatus } from '../../../src/domain/utilisateur/utilisateur';
import { KYCHistory_v0 } from '../../../src/domain/object_store/kyc/kycHistory_v0';
import { Categorie } from '../../../src/domain/contenu/categorie';
import { Thematique } from '../../../src/domain/contenu/thematique';
import { KYCID } from '../../../src/domain/kyc/KYCID';
import { TypeReponseQuestionKYC } from '../../../src/domain/kyc/questionKYC';
import { Univers } from '../../../src/domain/univers/univers';

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

  it(`POST /utilisateurs/login_v2_code -s onboarding ok si KYC_preference renseignée`, async () => {
    // GIVEN
    process.env.OTP_DEV = '123456';

    const utilisateur = getFakeUtilisteur();
    PasswordManager.setUserPassword(utilisateur, '#1234567890HAHAa');

    const kyc: KYCHistory_v0 = {
      version: 0,
      answered_mosaics: [],
      answered_questions: [
        {
          id: KYCID.KYC_preference,
          id_cms: 1,
          question: `Quel est votre sujet principal d'intéret ?`,
          type: TypeReponseQuestionKYC.choix_multiple,
          is_NGC: false,
          categorie: Categorie.test,
          points: 10,
          reponses: [{ label: 'Le climat', code: Thematique.climat }],
          reponses_possibles: [
            { label: 'Le climat', code: Thematique.climat },
            { label: 'Mon logement', code: Thematique.logement },
            { label: 'Ce que je mange', code: Thematique.alimentation },
          ],
          tags: [],
          universes: [Univers.climat],
          short_question: 'short',
          image_url: 'AAA',
        },
      ],
    };

    await TestUtil.create(DB.utilisateur, {
      passwordHash: utilisateur.passwordHash,
      passwordSalt: utilisateur.passwordSalt,
      active_account: true,
      parts: null,
      force_connexion: true,
      kyc: kyc,
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
    expect(response.status).toBe(201);
    expect(response.body.utilisateur.is_onboarding_done).toEqual(true);
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
