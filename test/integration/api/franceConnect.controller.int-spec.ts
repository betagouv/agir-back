import { App } from '../../../src/domain/app';
import {
  Scope,
  SourceInscription,
} from '../../../src/domain/utilisateur/utilisateur';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { DB, TestUtil } from '../../TestUtil';

describe('/france_connect - (API test)', () => {
  const OLD_ENV = process.env;
  const USER_CURRENT_VERSION = App.USER_CURRENT_VERSION;
  const utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

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

  it(`GET /login_france_connect stock source souscription et id de situation NGC`, async () => {
    // GIVEN
    process.env.OIDC_URL_AUTH = 'https://fc_auth.com';
    process.env.OIDC_CLIENT_ID = 'client_id_123';
    process.env.OIDC_URL_LOGIN_CALLBACK = 'https://jagis/callback';

    await TestUtil.create(DB.situationNGC, {
      id: '123456789012345678901234567890123456',
      situation: { a: 6666 },
    });

    // WHEN
    const reponse = await TestUtil.getServer().get(
      '/login_france_connect?situation_ngc_id=123456789012345678901234567890123456&source_inscription=mobile',
    );

    // THEN
    expect(reponse.status).toBe(302);
    const states = await TestUtil.prisma.oIDC_STATE.findMany();
    expect(states).toHaveLength(1);
    const state = states[0];
    expect(state.situation_ngc_id).toEqual(
      '123456789012345678901234567890123456',
    );
    expect(state.source_inscription).toEqual('mobile');

    expect(reponse.headers['location']).toEqual(
      `https://fc_auth.com/?response_type=code&client_id=client_id_123&redirect_uri=https%3A%2F%2Fjagis%2Fcallback&scope=openid+email+given_name+family_name+birthdate&acr_values=eidas1&state=${state.state}&nonce=${state.nonce}`,
    );
  });
  it(`GET /login_france_connect missing source`, async () => {
    // GIVEN
    process.env.OIDC_URL_AUTH = 'https://fc_auth.com';
    process.env.OIDC_CLIENT_ID = 'client_id_123';
    process.env.OIDC_URL_LOGIN_CALLBACK = 'https://jagis/callback';

    await TestUtil.create(DB.situationNGC, {
      id: '123456789012345678901234567890123456',
      situation: { a: 6666 },
    });

    // WHEN
    const reponse = await TestUtil.getServer().get(
      '/login_france_connect?situation_ngc_id=123456789012345678901234567890123456',
    );

    // THEN
    expect(reponse.status).toBe(302);
    const states = await TestUtil.prisma.oIDC_STATE.findMany();
    expect(states[0].source_inscription).toEqual(SourceInscription.inconnue);
  });

  it(`GET /login_france_connect bad source`, async () => {
    // GIVEN
    process.env.OIDC_URL_AUTH = 'https://fc_auth.com';
    process.env.OIDC_CLIENT_ID = 'client_id_123';
    process.env.OIDC_URL_LOGIN_CALLBACK = 'https://jagis/callback';

    await TestUtil.create(DB.situationNGC, {
      id: '123456789012345678901234567890123456',
      situation: { a: 6666 },
    });

    // WHEN
    const reponse = await TestUtil.getServer().get(
      '/login_france_connect?situation_ngc_id=123456789012345678901234567890123456&source_inscription=bad',
    );

    // THEN
    expect(reponse.status).toBe(302);
    const states = await TestUtil.prisma.oIDC_STATE.findMany();
    expect(states[0].source_inscription).toEqual(SourceInscription.inconnue);
  });

  it(`POST /utilisateurs/id/logout deconnect un utilisateur donné`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    // WHEN
    const response = await TestUtil.POST('/utilisateurs/utilisateur-id/logout');
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // THEN
    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(userDB.force_connexion).toEqual(true);
  });
  it(`POST /utilisateurs/id/logout deconnect un utilisateur france connecté`, async () => {
    // GIVEN
    process.env.OIDC_URL_LOGOUT_CALLBACK = '/logout-callback';
    process.env.BASE_URL_FRONT = 'http://localhost:3000';
    process.env.OIDC_URL_LOGOUT =
      'https://fcp.integ01.dev-franceconnect.fr/api/v1/logout';

    await TestUtil.create(DB.utilisateur);
    await TestUtil.create(DB.OIDC_STATE);

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/utilisateur-id/logout');
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // THEN
    expect(response.status).toBe(201);
    expect(response.body.france_connect_logout_url).toContain(
      'https://fcp.integ01.dev-franceconnect.fr/api/v1/logout?id_token_hint=456&state=',
    );
    expect(response.body.france_connect_logout_url).toContain(
      '&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flogout-callback',
    );
    expect(userDB.force_connexion).toEqual(true);
  });
  it(`POST /utilisateurs/logout deconnect tous les utilisateurs`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { id: '1', email: 'a' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: 'b' });
    TestUtil.token = process.env.CRON_API_KEY;

    // WHEN
    const response = await TestUtil.POST('/utilisateurs/logout');
    const userDB_1 = await utilisateurRepository.getById('1', [Scope.ALL]);
    const userDB_2 = await utilisateurRepository.getById('2', [Scope.ALL]);

    // THEN
    expect(response.status).toBe(201);
    expect(userDB_1.email).toEqual('a');
    expect(userDB_1.force_connexion).toEqual(true);
    expect(userDB_2.email).toEqual('b');
    expect(userDB_2.force_connexion).toEqual(true);
  });
});
