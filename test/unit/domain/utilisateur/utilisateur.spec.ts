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
    const result = utilisateur.checkPasswordOK('toto');

    // THEN
    expect(result).toEqual(true);
  });
  it('checkPassword : KO', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('toto');

    // WHEN
    const result = utilisateur.checkPasswordOK('titi');

    // THEN
    expect(result).toEqual(false);
  });
  it('checkCode : OK', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.code = '123456';

    // WHEN
    const result = utilisateur.checkCodeOK('123456');

    // THEN
    expect(result).toEqual(true);
  });
  it('checkCode : KO', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.code = 'toto';

    // WHEN
    const result = utilisateur.checkCodeOK('titi');

    // THEN
    expect(result).toEqual(false);
  });
  it('isCodeLocked : false', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() - 10000,
    );

    // WHEN
    const result = utilisateur.isCodeLocked();

    // THEN
    expect(result).toEqual(false);
  });
  it('isCodeLocked : true because date in futur', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() + 10000,
    );

    // WHEN
    const result = utilisateur.isCodeLocked();

    // THEN
    expect(result).toEqual(true);
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
  it('isLoginLocked : true because date in futur', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.prevent_login_before = new Date(new Date().getTime() + 10000);

    // WHEN
    const result = utilisateur.isLoginLocked();

    // THEN
    expect(result).toEqual(true);
  });
  it('failLogin : increase counter', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 0;

    // WHEN
    utilisateur.checkPasswordOK('bad');

    // THEN
    expect(utilisateur.failed_login_count).toEqual(1);
  });
  it('failedLogin : sets block date + 5 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 3;

    // WHEN
    utilisateur.checkPasswordOK('bad');

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
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 3;

    // WHEN
    utilisateur.checkPasswordOK('bad');
    utilisateur.checkPasswordOK('bad');

    // THEN
    expect(utilisateur.failed_login_count).toEqual(5);
    expect(
      Math.round(
        (utilisateur.prevent_login_before.getTime() - new Date().getTime()) /
          1000,
      ),
    ).toEqual(600);
  });
  it('failCode : increase counter', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 0;

    // WHEN
    utilisateur.checkCodeOK('bad');

    // THEN
    expect(utilisateur.failed_checkcode_count).toEqual(1);
  });
  it('failedCode : sets block date + 5 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 3;

    // WHEN
    utilisateur.checkCodeOK('bad');

    // THEN
    expect(utilisateur.failed_checkcode_count).toEqual(4);
    expect(
      Math.round(
        (utilisateur.prevent_checkcode_before.getTime() -
          new Date().getTime()) /
          1000,
      ),
    ).toEqual(300);
  });
  it('failedCode : 2 times sets block date + 10 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({});
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 3;

    // WHEN
    utilisateur.checkCodeOK('bad');
    utilisateur.checkCodeOK('bad');

    // THEN
    expect(utilisateur.failed_checkcode_count).toEqual(5);
    expect(
      Math.round(
        (utilisateur.prevent_checkcode_before.getTime() -
          new Date().getTime()) /
          1000,
      ),
    ).toEqual(600);
  });
});
