import { OnboardingResult } from '../../../../../src/domain/utilisateur/onboardingResult';
import { OnboardingData } from '../../../../../src/domain/utilisateur/onboardingData';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { CodeManager } from '../../../../../src/domain/utilisateur/manager/codeManager';

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
describe('Objet CodeManager', () => {
  it('checkCode : OK', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = '123456';

    // WHEN
    const result = CodeManager.checkCodeOKAndChangeState(utilisateur, '123456');

    // THEN
    expect(result).toEqual(true);
  });
  it('checkCode : KO', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = 'toto';

    // WHEN
    const result = CodeManager.checkCodeOKAndChangeState(utilisateur, 'titi');

    // THEN
    expect(result).toEqual(false);
  });
  it('isCodeLocked : false', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() - 10000,
    );

    // WHEN
    const result = CodeManager.isCodeLocked(utilisateur);

    // THEN
    expect(result).toEqual(false);
  });
  it('isCodeLocked : true because date in futur', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() + 10000,
    );

    // WHEN
    const result = CodeManager.isCodeLocked(utilisateur);

    // THEN
    expect(result).toEqual(true);
  });

  it('failCode : increase counter', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 0;

    // WHEN
    CodeManager.checkCodeOKAndChangeState(utilisateur, 'bad');

    // THEN
    expect(utilisateur.failed_checkcode_count).toEqual(1);
  });
  it('failedCode : sets block date + 5 mins', () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 3;

    // WHEN
    CodeManager.checkCodeOKAndChangeState(utilisateur, 'bad');

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
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 3;

    // WHEN
    CodeManager.checkCodeOKAndChangeState(utilisateur, 'bad');
    CodeManager.checkCodeOKAndChangeState(utilisateur, 'bad');

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
