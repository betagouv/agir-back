import { Utilisateur } from '../../../../src/domain/utilisateur/utilisateur';

describe('Objet Utilisateur', () => {
  it('checkPasswordFormat : au moins contenir 1 chiffre', () => {
    // WHEN
    try {
      Utilisateur.checkPasswordFormat('pasdechiffre');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins un chiffre',
      );
    }
  });
  it('checkPasswordFormat : trop court', () => {
    // WHEN
    try {
      Utilisateur.checkPasswordFormat('tropcourt1');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins 12 caractères',
      );
    }
  });
  it('checkPasswordFormat : pas trop court', () => {
    // WHEN
    try {
      Utilisateur.checkPasswordFormat('tropcourt112&');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins 12 caractères',
      );
    }
  });
  it('checkPasswordFormat : caractères spéciaux', () => {
    // WHEN
    try {
      Utilisateur.checkPasswordFormat('pas de caracteres speciaux1');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins un caractère spécial',
      );
    }
  });

  it('setPassword : hash and salt password', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('toto');

    // THEN
    expect(utilisateur.passwordHash.length).toBeGreaterThan(10);
    expect(utilisateur.passwordSalt.length).toBeGreaterThan(10);
  });
  it('checkPassword : OK', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('toto');

    // WHEN
    const result = utilisateur.isPasswordOK('toto');

    // THEN
    expect(result).toEqual(true);
  });
  it('checkPassword : KO', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('toto');

    // WHEN
    const result = utilisateur.isPasswordOK('titi');

    // THEN
    expect(result).toEqual(false);
  });
  it('isLoginLocked : false', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.prevent_login_before = new Date(new Date().getTime() - 10000);

    // WHEN
    const result = utilisateur.isLoginLocked();

    // THEN
    expect(result).toEqual(false);
  });
  it('isLoginLocked : false cause no date', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.prevent_login_before = undefined;

    // WHEN
    const result = utilisateur.isLoginLocked();

    // THEN
    expect(result).toEqual(false);
  });
  it('isLoginLocked : true cause no date', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.prevent_login_before = new Date(new Date().getTime() + 10000);

    // WHEN
    const result = utilisateur.isLoginLocked();

    // THEN
    expect(result).toEqual(true);
  });
  it('failedLogin : increase counter', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.failed_login_count = 0;

    // WHEN
    utilisateur.failedLogin();

    // THEN
    expect(utilisateur.failed_login_count).toEqual(1);
    expect(utilisateur.prevent_login_before).toBeUndefined();
  });
  it('failedLogin : sets block date + 5 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.failed_login_count = 3;

    // WHEN
    utilisateur.failedLogin();

    // THEN
    expect(utilisateur.failed_login_count).toEqual(4);
    expect(
      Math.round(
        (utilisateur.prevent_login_before.getTime() - new Date().getTime()) /
          1000,
      ),
    ).toEqual(300);
  });
  it('failedLogin : 2 times sets block date + 10 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.failed_login_count = 3;

    // WHEN
    utilisateur.failedLogin();
    utilisateur.failedLogin();

    // THEN
    expect(utilisateur.failed_login_count).toEqual(5);
    expect(
      Math.round(
        (utilisateur.prevent_login_before.getTime() - new Date().getTime()) /
          1000,
      ),
    ).toEqual(600);
  });
});
