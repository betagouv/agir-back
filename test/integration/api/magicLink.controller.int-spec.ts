import { App } from '../../../src/domain/app';
import { SourceInscription } from '../../../src/domain/utilisateur/utilisateur';
import { DB, TestUtil } from '../../TestUtil';

describe('/utilisateurs - Magic link - (API test)', () => {
  const OLD_ENV = process.env;
  const USER_CURRENT_VERSION = App.USER_CURRENT_VERSION;

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;
    await TestUtil.deleteAll();
    await TestUtil.generateAuthorizationToken('utilisateur-id');
    process.env.EMAIL_ENABLED = 'false';
  });

  afterAll(async () => {
    await TestUtil.deleteAll();
    process.env = OLD_ENV;
    App.USER_CURRENT_VERSION = USER_CURRENT_VERSION;
    await TestUtil.appclose();
  });

  it(`POST /utilisateurs/send_magic_link - check email incorrecte `, async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'bad_email',
      });
    // THEN
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(
      `Format de l'adresse électronique bad_email incorrect`,
    );
  });
  it(`POST /utilisateurs/send_magic_link - source inconnue `, async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'aaa@bbb.com',
        source_inscription: 'bad',
      });
    // THEN
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(
      `La source d'inscription [bad] est inconnue`,
    );
  });
  it(`POST /utilisateurs/send_magic_link - email absent `, async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({});
    // THEN
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(`Adresse électronique obligatoire`);
  });
  it(`POST /utilisateurs/send_magic_link - génère un magic_link et l'envoie en email, utilisateur créé dans la foulé`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'ww@w.com',
      });
    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'ww@w.com' },
    });

    expect(userDB.source_inscription).toEqual(SourceInscription.magic_link);
    expect(userDB.is_magic_link_user).toEqual(true);
    expect(userDB.active_account).toEqual(false);
    expect(userDB.code.length).toEqual(6);
  });
  it(`POST /utilisateurs/send_magic_link - prend en compte la source`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'ww@w.com',
        source_inscription: SourceInscription.mobile,
      });
    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'ww@w.com' },
    });

    expect(userDB.source_inscription).toEqual(SourceInscription.mobile);
    expect(userDB.is_magic_link_user).toEqual(true);
    expect(userDB.active_account).toEqual(false);
    expect(userDB.code.length).toEqual(6);
  });
  it(`POST /utilisateurs/send_magic_link - 2 génération de magic link successive conserve le meme code`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    // WHEN
    let response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'ww@w.com',
      });
    // THEN
    expect(response.status).toBe(201);

    const code_1 = (
      await TestUtil.prisma.utilisateur.findFirst({
        where: { email: 'ww@w.com' },
      })
    ).code;

    // WHEN
    response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'ww@w.com',
      });
    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'ww@w.com' },
    });

    // THEN
    expect(userDB.code).toEqual(code_1);
  });
  it(`POST /utilisateurs/send_magic_link - après une heure code change`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    // WHEN
    let response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'ww@w.com',
      });
    // THEN
    expect(response.status).toBe(201);

    const code_1 = (
      await TestUtil.prisma.utilisateur.findFirst({
        where: { email: 'ww@w.com' },
      })
    ).code;

    // WHEN
    await TestUtil.prisma.utilisateur.update({
      where: {
        email: 'ww@w.com',
      },
      data: {
        code_generation_time: new Date(Date.now() - 1000 * 60 * 61),
      },
    });

    // WHEN
    response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({
        email: 'ww@w.com',
      });
    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'ww@w.com' },
    });

    // THEN
    expect(userDB.code).not.toEqual(code_1);
  });

  it(`POST /utilisateurs/magic_link_login -  code manquant`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'toto@tutu.com',
      });

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual('Code obligatoire');
  });
  it(`POST /utilisateurs/magic_link_login - email inconnu`, async () => {
    // GIVEN

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'toto@tutu.com',
        code: '123',
      });

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );
  });
  it(`POST /utilisateurs/magic_link_login`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '123',
      });

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual('Mauvais code');
  });
  it(`POST /utilisateurs/magic_link_login - code OK, login OK`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '12345',
      });

    // THEN
    expect(response.status).toBe(201);

    expect(response.body.token.length).toBeGreaterThan(20);
    expect(response.body.utilisateur.id).toEqual('utilisateur-id');

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'email@www.com' },
    });

    expect(userDB.active_account).toEqual(true);
    expect(userDB.force_connexion).toEqual(false);
  });
  it(`POST /utilisateurs/magic_link_login - code OK, login OK, reset force_connexion`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
      force_connexion: true,
      failed_login_count: 2,
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '12345',
      });

    // THEN
    expect(response.status).toBe(201);

    expect(response.body.token.length).toBeGreaterThan(20);
    expect(response.body.utilisateur.id).toEqual('utilisateur-id');

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'email@www.com' },
    });

    expect(userDB.active_account).toEqual(true);
    expect(userDB.force_connexion).toEqual(false);
    expect(userDB.failed_login_count).toEqual(0);
  });
  it(`POST /utilisateurs/magic_link_login - un magic link ne peut pas servir 2 fois après un premier succès`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });
    let response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '12345',
      });
    expect(response.status).toBe(201);

    // WHEN
    response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '12345',
      });

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual(
      `Lien de connexion déjà utilisé ou trop d'essais`,
    );
  });
  it(`POST /utilisateurs/magic_link_login - un mauvais code 3 fois et le code est re-initialisé`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });

    //THEN
    let response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '123',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code');

    response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '123',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code');

    response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '123',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code');

    response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '123',
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `Lien de connexion déjà utilisé ou trop d'essais`,
    );
  });
  it(`POST /utilisateurs/magic_link_login - code expiré (>1h)`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
      code_generation_time: new Date(Date.now() - 1000 * 60 * 61),
    });

    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/magic_link_login')
      .send({
        email: 'email@www.com',
        code: '12345',
      });

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual('Lien de connexion expiré');
  });
  it(`POST /utilisateurs/magic_link - parcours complet : génère un magic_link puis login à l'application avec le magic link`, async () => {
    // GIVEN
    process.env.IS_PROD = 'true';

    await TestUtil.getServer().post('/utilisateurs/send_magic_link').send({
      email: 'ww@w.com',
    });

    const code_1 = (
      await TestUtil.prisma.utilisateur.findFirst({
        where: { email: 'ww@w.com' },
      })
    ).code;

    // WHEN
    const response = await TestUtil.getServer()
      .post(`/utilisateurs/magic_link_login`)
      .send({
        code: code_1,
        email: 'ww@w.com',
      });

    // THEN
    expect(response.status).toBe(201);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'ww@w.com' },
    });

    expect(userDB.active_account).toEqual(true);

    expect(response.body.token.length).toBeGreaterThan(20);
    expect(response.body.utilisateur.email).toEqual('ww@w.com');
    expect(response.body.utilisateur.id.length).toBeGreaterThan(10);
  });
});
