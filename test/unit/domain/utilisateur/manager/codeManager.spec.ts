import { Utilisateur } from '../../../../../src/domain/utilisateur/utilisateur';
import { CodeManager } from '../../../../../src/domain/utilisateur/manager/codeManager';
import { UtilisateurSecurityRepository } from '../../../../../src/infrastructure/repository/utilisateur/utilisateurSecurity.repository';
import { TestUtil } from '../../../../../test/TestUtil';

const fakeSecurityRepository = new UtilisateurSecurityRepository({
  utilisateur: { update: jest.fn() },
} as any);

const codeManager = new CodeManager(fakeSecurityRepository);

describe('Objet CodeManager', () => {
  it('processInputCodeAndDoActionIfOK : no exception when not locked', async () => {
    // GIVEN
    const utilisateur = new Utilisateur({ ...TestUtil.utilisateurData() });
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
    const utilisateur = new Utilisateur({ ...TestUtil.utilisateurData() });
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
    const utilisateur = new Utilisateur({ ...TestUtil.utilisateurData() });
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
    const utilisateur = new Utilisateur({ ...TestUtil.utilisateurData() });
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
    const utilisateur = new Utilisateur({ ...TestUtil.utilisateurData() });
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
