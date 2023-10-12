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
    console.log(utilisateur.passwordSalt);
    console.log(utilisateur.passwordHash);
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
});
