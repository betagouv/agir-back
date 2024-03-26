import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { PasswordManager } from '../../../../../src/domain/utilisateur/manager/passwordManager';
import { UtilisateurSecurityRepository } from '../../../../../src/infrastructure/repository/utilisateur/utilisateurSecurity.repository';

const fakeSecurityRepository = new UtilisateurSecurityRepository({
  utilisateur: { update: jest.fn() },
} as any);

const passwordManager = new PasswordManager(fakeSecurityRepository);

describe('Objet PasswordManager', () => {
  it('checkPasswordFormat : au moins contenir 1 chiffre', () => {
    // WHEN
    try {
      PasswordManager.checkPasswordFormat('pasdechiffre');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins un chiffre',
      );
    }
  });
  it('checkPasswordFormat : au moins contenir 1 minuscule', () => {
    // WHEN
    try {
      PasswordManager.checkPasswordFormat('A123456789012#');
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins une minuscule',
      );
    }
  });
  it('checkPasswordFormat : au moins contenir 1 majuscule', () => {
    // WHEN
    try {
      PasswordManager.checkPasswordFormat('a123456789012#');
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins une majuscule',
      );
    }
  });
  it('checkPasswordFormat : trop court', () => {
    // WHEN
    try {
      PasswordManager.checkPasswordFormat('Tropcourt1');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins 12 caractères',
      );
    }
  });
  it('checkPasswordFormat : juste bien', () => {
    // WHEN
    PasswordManager.checkPasswordFormat('Pastropcourt112&');
  });
  it('checkPasswordFormat : caractères spéciaux', () => {
    // WHEN
    try {
      PasswordManager.checkPasswordFormat('Pas de caracteres speciaux1');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins un caractère spécial',
      );
    }
  });

  it('setPassword : hash and salt password', () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    PasswordManager.setUserPassword(utilisateur, 'toto');

    // THEN
    expect(utilisateur.passwordHash.length).toBeGreaterThan(10);
    expect(utilisateur.passwordSalt.length).toBeGreaterThan(10);
  });
  it('checkPassword : OK and returns function result', async () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    PasswordManager.setUserPassword(utilisateur, 'toto');

    // WHEN
    const result = await passwordManager.loginUtilisateur(
      utilisateur,
      'toto',
      () => {
        return 'ok';
      },
    );

    // THEN
    expect(result).toEqual('ok');
  });
  it('checkPassword : KO', async () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    PasswordManager.setUserPassword(utilisateur, 'toto');

    const fonction = jest.fn();
    // WHEN
    try {
      const result = await passwordManager.loginUtilisateur(
        utilisateur,
        'titi',
        fonction,
      );
      fail();
    } catch (error) {
      expect(error.message).toEqual(
        'Mauvaise adresse électronique ou mauvais mot de passe',
      );
    }
    expect(fonction).toHaveBeenCalledTimes(0);
  });

  it('isLoginLocked : not locked yet', async () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    PasswordManager.setUserPassword(utilisateur, 'titi');
    utilisateur.prevent_login_before = new Date(new Date().getTime() - 10000);

    const fonction = jest.fn();
    // WHEN
    try {
      await passwordManager.loginUtilisateur(utilisateur, 'toto', fonction);
      fail();
    } catch (error) {
      expect(error.message).toContain(
        `Mauvaise adresse électronique ou mauvais mot de passe`,
      );
    }
    expect(fonction).toHaveBeenCalledTimes(0);
  });
  it('isLoginLocked : true because date in futur', async () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.prevent_login_before = new Date(new Date().getTime() + 10000);
    const fonction = jest.fn();

    try {
      await passwordManager.loginUtilisateur(utilisateur, 'toto', fonction);
      fail();
    } catch (error) {
      expect(error.message).toContain(
        `Trop d'essais successifs, compte bloqué jusqu'à`,
      );
    }
    expect(fonction).toHaveBeenCalledTimes(0);
  });
  it('failLogin : increase counter', async () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 0;

    try {
      await passwordManager.loginUtilisateur(utilisateur, 'toto', jest.fn());
      fail();
    } catch (error) {}

    // THEN
    expect(utilisateur.failed_login_count).toEqual(1);
  });
  it('failedLogin : sets block date + 5 mins', async () => {
    // GIVEN
    let utilisateur = new Utilisateur();
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 3;

    try {
      await passwordManager.loginUtilisateur(utilisateur, 'toto', jest.fn());
      fail();
    } catch (error) {}

    // THEN
    expect(utilisateur.failed_login_count).toEqual(4);
    expect(
      Math.round(
        (utilisateur.prevent_login_before.getTime() - new Date().getTime()) /
          1000,
      ),
    ).toEqual(300);
  });
});
