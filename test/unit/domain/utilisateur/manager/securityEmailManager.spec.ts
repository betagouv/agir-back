import { OnboardingResult } from '../../../../../src/domain/utilisateur/onboardingResult';
import { OnboardingData } from '../../../../../src/domain/utilisateur/onboardingData';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { UtilisateurSecurityRepository } from '../../../../../src/infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { SecurityEmailManager } from '../../../../../src/domain/utilisateur/manager/securityEmailManager';

const fakeSecurityRepository = new UtilisateurSecurityRepository({
  utilisateur: { update: jest.fn() },
} as any);

const securityEmailManager = new SecurityEmailManager(fakeSecurityRepository);

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
describe('Objet SecurityEmailManager', () => {
  it('attemptSecurityEmailEmission : no exception when not locked', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_sendemail_before = new Date(
      new Date().getTime() - 10000,
    );

    // WHEN
    await securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      jest.fn(),
    );

    // THEN
    // no error
  });
  it('attemptSecurityEmailEmission : si tout ok realise l action et incremente le compteur', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.prevent_sendemail_before = new Date(
      new Date().getTime() - 10000,
    );
    const fonction = jest.fn();
    // WHEN
    await securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      fonction,
    );

    // THEN
    expect(fonction).toBeCalled();
    expect(utilisateur.sent_email_count).toEqual(1);
  });
  it('attemptSecurityEmailEmission : si compteur deja à 3 , erreur et pas d action realisée', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.sent_email_count = 3;
    utilisateur.prevent_sendemail_before = new Date();
    const fonction = jest.fn();
    // WHEN
    try {
      await securityEmailManager.attemptSecurityEmailEmission(
        utilisateur,
        fonction,
      );
      fail();
    } catch (error) {}

    // THEN
    expect(fonction).toBeCalledTimes(0);
    expect(utilisateur.sent_email_count).toEqual(4);
    expect(
      Math.round(
        (utilisateur.prevent_sendemail_before.getTime() -
          new Date().getTime()) /
          1000,
      ),
    ).toEqual(300);
  });
  it('attemptSecurityEmailEmission : si compteur deja à 4 , mais compte pas bloqué alors re init', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...UTILISATEUR });
    utilisateur.sent_email_count = 4;
    utilisateur.prevent_sendemail_before = new Date(
      new Date().getTime() - 10000,
    );
    const fonction = jest.fn();
    // WHEN
    await securityEmailManager.attemptSecurityEmailEmission(
      utilisateur,
      fonction,
    );

    // THEN
    expect(fonction).toBeCalled();
    expect(utilisateur.sent_email_count).toEqual(1);
    expect(utilisateur.prevent_sendemail_before.getTime()).toBeLessThan(
      Date.now(),
    );
  });
});
