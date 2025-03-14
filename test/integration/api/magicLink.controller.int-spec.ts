import { App } from '../../../src/domain/app';
import { DB, TestUtil } from '../../TestUtil';

describe.skip('/utilisateurs - Magic link - (API test)', () => {
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
  it(`POST /utilisateurs/send_magic_link - email absent `, async () => {
    // GIVEN
    // WHEN
    const response = await TestUtil.getServer()
      .post('/utilisateurs/send_magic_link')
      .send({});
    // THEN
    expect(response.status).toEqual(400);
    expect(response.body.message).toEqual(`Email obligatoire`);
  });
  it(`POST /utilisateurs/send_magic_link - génère un magic_link et l'envoie en email, utilisateur créé dans la foulé`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
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

    expect(userDB.is_magic_link_user).toEqual(true);
    expect(userDB.active_account).toEqual(false);
    expect(userDB.code.length).toEqual(6);
  });
  it(`POST /utilisateurs/send_magic_link - 2 génération de magic link successive conserve le meme code`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
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
    process.env.USER_CURRENT_VERSION = '9';
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

  it(`GET /utilisateurs/:email/login -  code manquant`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
    process.env.IS_PROD = 'true';

    // WHEN
    const response = await TestUtil.getServer().get(
      `/utilisateurs/toto@tutu.com/login`,
    );

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual('Code obligatoire');
  });
  it(`GET /utilisateurs/:email/login - email inconnu`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';

    // WHEN
    const response = await TestUtil.getServer().get(
      `/utilisateurs/toto@tutu.com/login?code=123`,
    );

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual(
      'Mauvais code, code expiré, ou mauvaise adresse électronique',
    );
  });
  it(`GET /utilisateurs/:email/login - mauvais code`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=123`,
    );

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual('Mauvais code');
  });
  it(`GET /utilisateurs/:email/login - code OK, login OK`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=12345`,
    );

    // THEN
    expect(response.status).toBe(200);

    expect(response.body.token.length).toBeGreaterThan(20);
    expect(response.body.utilisateur.id).toEqual('utilisateur-id');

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'email@www.com' },
    });

    expect(userDB.active_account).toEqual(true);
  });
  it(`GET /utilisateurs/:email/login - un magic link ne peut pas servir 2 fois après un premier succès`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });
    let response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=12345`,
    );
    expect(response.status).toBe(200);

    // WHEN
    response = await TestUtil.GET(
      `/utilisateurs/email@www.com/login?code=12345`,
    );

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual(
      `Lien de connexion déjà utilisé ou trop d'essais`,
    );
  });
  it(`GET /utilisateurs/:email/login - un mauvais code 3 fois et le code est re-initialisé`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
    });

    //THEN
    let response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=123`,
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code');

    response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=123`,
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code');

    response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=123`,
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Mauvais code');

    response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=123`,
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      `Lien de connexion déjà utilisé ou trop d'essais`,
    );
  });
  it(`GET /utilisateurs/:email/login - code expiré (>1h)`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
    await TestUtil.create(DB.utilisateur, {
      email: 'email@www.com',
      code: '12345',
      code_generation_time: new Date(Date.now() - 1000 * 60 * 61),
    });

    // WHEN
    const response = await TestUtil.getServer().get(
      `/utilisateurs/email@www.com/login?code=12345`,
    );

    // THEN
    expect(response.status).toBe(400);

    expect(response.body.message).toEqual('Lien de connexion expiré');
  });
  it(`POST /utilisateurs/magic_link - parcours complet : génère un magic_link puis login à l'application avec le magic link`, async () => {
    // GIVEN
    process.env.USER_CURRENT_VERSION = '9';
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
    const response = await TestUtil.getServer().get(
      `/utilisateurs/ww@w.com/login?code=${code_1}`,
    );

    // THEN
    expect(response.status).toBe(200);

    const userDB = await TestUtil.prisma.utilisateur.findFirst({
      where: { email: 'ww@w.com' },
    });

    expect(userDB.active_account).toEqual(true);

    expect(response.body.token.length).toBeGreaterThan(20);

    expect(response.body.utilisateur.id.length).toBeGreaterThan(10);
    expect(response.body.utilisateur.nom).toEqual('NOM');
    expect(response.body.utilisateur.prenom).toEqual('PRENOM');
  });
});
