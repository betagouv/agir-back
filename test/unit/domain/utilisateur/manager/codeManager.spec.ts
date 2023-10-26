import { OnboardingResult } from '../../../../../src/domain/utilisateur/onboardingResult';
import { OnboardingData } from '../../../../../src/domain/utilisateur/onboardingData';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { CodeManager } from '../../../../../src/domain/utilisateur/manager/codeManager';
import { UtilisateurSecurityRepository } from '../../../../../src/infrastructure/repository/utilisateur/utilisateurSecurity.repository';

const fakeSecurityRepository = new UtilisateurSecurityRepository({
  utilisateur: { update: jest.fn() },
} as any);

const codeManager = new CodeManager(fakeSecurityRepository);

const UTILISATEUR = {
  id: 'id',
  email: 'email',
  nom: 'nom',
  prenom: 'prenom',
  onboardingData: new OnboardingData({}),
  onboardingResult: new OnboardingResult(new OnboardingData({})),
  code_postal: '12345',
  revenu_fiscal: 12333,
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
  sent_email_count: 0,
  prevent_sendemail_before: new Date(),
};
describe('Objet CodeManager', () => {
  it('processInputCodeAndDoActionIfOK : no exception when not locked', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() - 10000,
    );

    // WHEN
    await codeManager.processInputCodeAndDoActionIfOK(
      '123456',
      utilisateur,
      () => Number,
    );

    // THEN
    // no error
  });
  it('processInputCodeAndDoActionIfOK : appel l action si code OK', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() - 10000,
    );
    const fonction = jest.fn();

    // WHEN
    await codeManager.processInputCodeAndDoActionIfOK(
      '123456',
      utilisateur,
      fonction,
    );

    // THEN
    expect(fonction).toBeCalled();
  });
  it('processInputCodeAndDoActionIfOK : erreur car date de rejeu dans le futur', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_checkcode_before = new Date(
      new Date().getTime() + 10000,
    );

    // WHEN
    try {
      await codeManager.processInputCodeAndDoActionIfOK(
        'xxx',
        utilisateur,
        jest.fn(),
      );
      fail();
    } catch (error) {
      // THEN
      expect(error.message).toContain(
        `Trop d'essais successifs, attendez jusqu'à`,
      );
    }
  });

  it('processInputCodeAndDoActionIfOK : code KO increase counter, does not call function', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 0;
    const fonction = jest.fn();

    // WHEN
    try {
      await codeManager.processInputCodeAndDoActionIfOK(
        'bad',
        utilisateur,
        fonction,
      );
    } catch {}

    // THEN
    expect(utilisateur.failed_checkcode_count).toEqual(1);
    expect(fonction).toHaveBeenCalledTimes(0);
  });
  it('processInputCodeAndDoActionIfOK : sets block date + 5 mins', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.code = '#1234567890HAHA';
    utilisateur.failed_checkcode_count = 3;

    // WHEN
    try {
      await codeManager.processInputCodeAndDoActionIfOK(
        'bad',
        utilisateur,
        jest.fn(),
      );
    } catch {}

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
});
