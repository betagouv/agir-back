import { SecurityEmailManager } from '../../../../../src/domain/utilisateur/manager/securityEmailManager';
import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { UtilisateurSecurityRepository } from '../../../../../src/infrastructure/repository/utilisateur/utilisateurSecurity.repository';

const fakeSecurityRepository = new UtilisateurSecurityRepository({
  utilisateur: { update: jest.fn() },
} as any);

const securityEmailManager = new SecurityEmailManager(fakeSecurityRepository);

describe('Objet SecurityEmailManager', () => {
  it('attemptSecurityEmailEmission : no exception when not locked', async () => {
    // GIVEN
    const utilisateur = new Utilisateur();
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
    const utilisateur = new Utilisateur();
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
    const utilisateur = new Utilisateur();
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
  it('attemptSecurityEmailEmission : si compteur deja à 5 , mais compte pas bloqué alors re init', async () => {
    // GIVEN
    const utilisateur = new Utilisateur();
    utilisateur.sent_email_count = 5;
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
