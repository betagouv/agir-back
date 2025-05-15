import { PasswordManager } from '../../../src/domain/utilisateur/manager/passwordManager';
import {
  GlobalUserVersion,
  Scope,
  SourceInscription,
} from '../../../src/domain/utilisateur/utilisateur';
import { OIDCStateRepository } from '../../../src/infrastructure/repository/oidcState.repository';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { UtilisateurSecurityRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { FranceConnectUsecase } from '../../../src/usecase/franceConnect.usecase';
import { DB, TestUtil } from '../../TestUtil';

describe('FranceConnectUsecase', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);
  let utilisateurSecurityRepository = new UtilisateurSecurityRepository(
    TestUtil.prisma,
  );
  let passwordManager = new PasswordManager(utilisateurSecurityRepository);
  let oIDCStateRepository = new OIDCStateRepository(TestUtil.prisma);
  let tokenRepository = {
    createNewAppToken: jest.fn(),
  };
  let bilanCarboneUseCase = {};

  let oidcService = {
    getAccessAndIdTokens: jest.fn(),
    decodeIdToken: jest.fn(),
    getUserInfoByAccessToken: jest.fn(),
  };

  let franceConnectUsecase = new FranceConnectUsecase(
    utilisateurRepository,
    oidcService as any,
    passwordManager,
    oIDCStateRepository,
    tokenRepository as any,
    bilanCarboneUseCase as any,
  );

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    oidcService.getAccessAndIdTokens.mockReset();
    oidcService.decodeIdToken.mockReset();
    oidcService.getUserInfoByAccessToken.mockReset();
    tokenRepository.createNewAppToken.mockReset();
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('connecterOuInscrire : creation de compte OK', async () => {
    // GIVEN
    await TestUtil.create(DB.OIDC_STATE, {
      state: 'state_123',
      nonce: 'nonce_123',
      idtoken: null,
      utilisateurId: null,
      situation_ngc_id: null,
    });

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_123',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    const result = await franceConnectUsecase.connecterOuInscrire(
      'state_123',
      'code_123"',
    );

    // THEN
    expect(result.token).toEqual('the_app_token');
    expect(result.utilisateur.email).toEqual('user@dev.com');
    expect(result.utilisateur.jour_naissance).toEqual(24);
    expect(result.utilisateur.mois_naissance).toEqual(8);
    expect(result.utilisateur.annee_naissance).toEqual(1962);
    expect(result.utilisateur.nom).toEqual('SMITH');
    expect(result.utilisateur.prenom).toEqual('George');
    expect(result.utilisateur.france_connect_sub).toEqual('sub');
    expect(result.utilisateur.source_inscription).toEqual(
      SourceInscription.france_connect,
    );
  });

  it(`connecterOuInscrire : reconciliation compte V1 OK, même si diff date naissance`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'user@dev.com',
      jour_naissance: 13,
      mois_naissance: 3,
      annee_naissance: 1979,
      global_user_version: GlobalUserVersion.V1,
      nom: 'toto',
      prenom: 'tutu',
    });
    await TestUtil.create(DB.OIDC_STATE, {
      state: 'state_123',
      nonce: 'nonce_123',
      idtoken: null,
      utilisateurId: null,
      situation_ngc_id: null,
    });

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_123',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    const result = await franceConnectUsecase.connecterOuInscrire(
      'state_123',
      'code_123"',
    );

    // THEN
    expect(result.token).toEqual('the_app_token');
    expect(result.utilisateur.jour_naissance).toEqual(24);
    expect(result.utilisateur.mois_naissance).toEqual(8);
    expect(result.utilisateur.annee_naissance).toEqual(1962);
    expect(result.utilisateur.nom).toEqual('SMITH');
    expect(result.utilisateur.prenom).toEqual('George');
    expect(result.utilisateur.source_inscription).toEqual(
      SourceInscription.web,
    );
    expect(result.utilisateur.france_connect_sub).toEqual('sub');
  });

  it(`connecterOuInscrire : reconciliation compte V2 OK, même  date naissance`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'user@dev.com',
      jour_naissance: 24,
      mois_naissance: 8,
      annee_naissance: 1962,
      global_user_version: GlobalUserVersion.V2,
      nom: 'toto',
      prenom: 'tutu',
    });
    await TestUtil.create(DB.OIDC_STATE, {
      state: 'state_123',
      nonce: 'nonce_123',
      idtoken: null,
      utilisateurId: null,
      situation_ngc_id: null,
    });

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_123',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    const result = await franceConnectUsecase.connecterOuInscrire(
      'state_123',
      'code_123"',
    );

    // THEN
    expect(result.token).toEqual('the_app_token');
    expect(result.utilisateur.jour_naissance).toEqual(24);
    expect(result.utilisateur.mois_naissance).toEqual(8);
    expect(result.utilisateur.annee_naissance).toEqual(1962);
    expect(result.utilisateur.nom).toEqual('SMITH');
    expect(result.utilisateur.prenom).toEqual('George');
    expect(result.utilisateur.source_inscription).toEqual(
      SourceInscription.web,
    );
    expect(result.utilisateur.france_connect_sub).toEqual('sub');
  });

  it(`connecterOuInscrire : reconciliation compte V2 KO, diff date naissance`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'user@dev.com',
      jour_naissance: 13,
      mois_naissance: 7,
      annee_naissance: 1979,
      global_user_version: GlobalUserVersion.V2,
      nom: 'toto',
      prenom: 'tutu',
    });
    await TestUtil.create(DB.OIDC_STATE, {
      state: 'state_123',
      nonce: 'nonce_123',
      idtoken: null,
      utilisateurId: null,
      situation_ngc_id: null,
    });

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_123',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    try {
      await franceConnectUsecase.connecterOuInscrire('state_123', 'code_123"');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        `Un compte existant dans j'agis n'a pas pu être rapproché, erreur de connexion`,
      );
    }

    // THEN
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.jour_naissance).toEqual(13);
    expect(userDB.mois_naissance).toEqual(7);
    expect(userDB.annee_naissance).toEqual(1979);
    expect(userDB.nom).toEqual('toto');
    expect(userDB.prenom).toEqual('tutu');
    expect(userDB.france_connect_sub).toEqual(null);
  });

  it(`connecterOuInscrire : reconciliation compte OK par sub uniquement`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      email: 'user123@dev.com',
      jour_naissance: 13,
      mois_naissance: 7,
      annee_naissance: 1979,
      global_user_version: GlobalUserVersion.V2,
      nom: 'toto',
      prenom: 'tutu',
      france_connect_sub: 'sub_123',
    });
    await TestUtil.create(DB.OIDC_STATE, {
      state: 'state_123',
      nonce: 'nonce_123',
      idtoken: null,
      utilisateurId: null,
      situation_ngc_id: null,
    });

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub_123',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_123',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub_123',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    const result = await franceConnectUsecase.connecterOuInscrire(
      'state_123',
      'code_123"',
    );

    // THEN
    expect(result.token).toEqual('the_app_token');
    expect(result.utilisateur.jour_naissance).toEqual(24);
    expect(result.utilisateur.mois_naissance).toEqual(8);
    expect(result.utilisateur.annee_naissance).toEqual(1962);
    expect(result.utilisateur.nom).toEqual('SMITH');
    expect(result.utilisateur.prenom).toEqual('George');
    expect(result.utilisateur.source_inscription).toEqual(
      SourceInscription.web,
    );
    expect(result.utilisateur.france_connect_sub).toEqual('sub_123');

    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);
    expect(userDB.jour_naissance).toEqual(24);
    expect(userDB.mois_naissance).toEqual(8);
    expect(userDB.annee_naissance).toEqual(1962);
    expect(userDB.nom).toEqual('SMITH');
    expect(userDB.prenom).toEqual('George');
    expect(userDB.france_connect_sub).toEqual('sub_123');
  });

  it(`connecterOuInscrire : echec pas de state en BDD`, async () => {
    // GIVEN

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_123',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    try {
      await franceConnectUsecase.connecterOuInscrire('state_123', 'code_123"');
    } catch (error) {
      // THEN
      expect(error.message_tech).toEqual(
        `FranceConnect : state manquant en base de donnée : state_123`,
      );
    }

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findMany();
    expect(userDB).toHaveLength(0);
  });

  it(`connecterOuInscrire : mismatch nonce`, async () => {
    // GIVEN
    await TestUtil.create(DB.OIDC_STATE, {
      state: 'state_123',
      nonce: 'nonce_123',
      idtoken: null,
      utilisateurId: null,
      situation_ngc_id: null,
    });

    oidcService.getAccessAndIdTokens.mockImplementation(() => {
      return { access_token: 'access_123', id_token: 'id_token_123' };
    });
    oidcService.decodeIdToken.mockImplementation(() => {
      return {
        sub: 'sub',
        auth_time: 123,
        acr: 'eidas1',
        nonce: 'nonce_456',
        at_hash: 'hash',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });

    oidcService.getUserInfoByAccessToken.mockImplementation(() => {
      return {
        sub: 'sub',
        email: 'user@dev.com',
        given_name: 'George',
        given_name_array: ['George'],
        family_name: 'SMITH',
        birthdate: '1962-08-24',
        aud: 'aud',
        exp: 1740645729,
        iat: 1740645669,
        iss: 'iss',
      };
    });
    tokenRepository.createNewAppToken.mockImplementation(() => {
      return 'the_app_token';
    });

    // WHEN
    try {
      await franceConnectUsecase.connecterOuInscrire('state_123', 'code_123"');
    } catch (error) {
      // THEN
      expect(error.message_tech).toEqual(
        `FranceConnect : mismatch sur NONCE => sent[nonce_123] VS received[nonce_456]`,
      );
    }

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findMany();
    expect(userDB).toHaveLength(0);
  });
});
