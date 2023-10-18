import { OnboardingResult } from '../../../../../src/domain/utilisateur/onboardingResult';
import { OnboardingData } from '../../../../../src/domain/utilisateur/onboardingData';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { PasswordManager } from '../../../../../src/domain/utilisateur/manager/passwordManager';

const UTILISATEUR = {
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom',
  onboardingData: new OnboardingData({}),
  onboardingResult: new OnboardingResult(new OnboardingData({})),
  code_postal: '12345',
  points: 0,
  quizzProfile: null,
  created_at: new Date(),
  badges: [],

  passwordHash: 'passwordHash',
  passwordSalt: 'passwordSalt',
  failed_login_count: 0,
  prevent_login_before: new Date(),
  code: '123456',
  active_account: true,
  failed_checkcode_count: 0,
  prevent_checkcode_before: new Date(),
  sent_code_count: 0,
  prevent_sendcode_before: new Date(),
};
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
  it('checkPasswordFormat : trop court', () => {
    // WHEN
    try {
      PasswordManager.checkPasswordFormat('tropcourt1');
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
      PasswordManager.checkPasswordFormat('tropcourt112&');
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
      PasswordManager.checkPasswordFormat('pas de caracteres speciaux1');
    } catch (error) {
      // THEN
      expect(error.message).toEqual(
        'Le mot de passe doit contenir au moins un caractère spécial',
      );
    }
  });

  it('setPassword : hash and salt password', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    PasswordManager.setUserPassword(utilisateur, 'toto');

    // THEN
    expect(utilisateur.passwordHash.length).toBeGreaterThan(10);
    expect(utilisateur.passwordSalt.length).toBeGreaterThan(10);
  });
  it('checkPassword : OK', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    PasswordManager.setUserPassword(utilisateur, 'toto');

    // WHEN
    const result = utilisateur.checkPasswordOKAndChangeState('toto');

    // THEN
    expect(result).toEqual(true);
  });
  it('checkPassword : KO', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    PasswordManager.setUserPassword(utilisateur, 'toto');

    // WHEN
    const result = utilisateur.checkPasswordOKAndChangeState('titi');

    // THEN
    expect(result).toEqual(false);
  });

  it('isLoginLocked : false', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_login_before = new Date(new Date().getTime() - 10000);

    // WHEN
    const result = PasswordManager.isLoginLocked(utilisateur);

    // THEN
    expect(result).toEqual(false);
  });
  it('isLoginLocked : true because date in futur', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_login_before = new Date(new Date().getTime() + 10000);

    // WHEN
    const result = PasswordManager.isLoginLocked(utilisateur);

    // THEN
    expect(result).toEqual(true);
  });
  it('failLogin : increase counter', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 0;

    // WHEN
    PasswordManager.checkUserPasswordOKAndChangeState(utilisateur, 'bad');

    // THEN
    expect(utilisateur.failed_login_count).toEqual(1);
  });
  it('failedLogin : sets block date + 5 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 3;

    // WHEN
    PasswordManager.checkUserPasswordOKAndChangeState(utilisateur, 'bad');

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
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.setPassword('#1234567890HAHA');
    utilisateur.failed_login_count = 3;

    // WHEN
    PasswordManager.checkUserPasswordOKAndChangeState(utilisateur, 'bad');
    PasswordManager.checkUserPasswordOKAndChangeState(utilisateur, 'bad');

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
