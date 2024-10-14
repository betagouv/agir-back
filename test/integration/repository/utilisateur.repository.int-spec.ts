import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import {
  Scope,
  SourceInscription,
  Utilisateur,
} from '../../../src/domain/utilisateur/utilisateur';

describe('UtilisateurRepository', () => {
  let utilisateurRepository = new UtilisateurRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('listUtilisateurIds : list utilisateur Ids OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: 'email1@truc.com',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: 'email2@truc.com',
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      email: 'email3@truc.com',
    });

    // WHEN
    const result = await utilisateurRepository.listUtilisateurIds();

    result.sort((a, b) => parseInt(a) - parseInt(b));
    // THEN
    expect(result).toStrictEqual(['1', '2', '3']);
  });

  it('nombreTotalUtilisateurs :  compte le bon nombre', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { id: '1', email: 'a' });
    await TestUtil.create(DB.utilisateur, { id: '2', email: 'b' });
    await TestUtil.create(DB.utilisateur, { id: '3', email: 'c' });

    // WHEN
    const result = await utilisateurRepository.nombreTotalUtilisateurs();

    // THEN
    expect(result).toEqual(3);
  });

  it('creation et lecture d un utilisateur avec une part à null ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { parts: null });

    // WHEN
    const userDB = await utilisateurRepository.getById('utilisateur-id', []);
    // THEN
    expect(userDB.parts).toEqual(null);
  });
  it('creation et lecture , versionning des donnes json ', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'w@w.com',
      false,
      SourceInscription.inconnue,
    );
    user.id = 'utilisateur-id';

    // WHEN
    await utilisateurRepository.createUtilisateur(user);

    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(userDB.unlocked_features['version']).toEqual(1);
  });
  it('checkState throws error', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { force_connexion: true });

    // WHEN
    try {
      await utilisateurRepository.checkState('utilisateur-id');
      fail();
    } catch (error) {
      // THEN
      // OK
    }
  });
  it('checkState throws no error', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { force_connexion: false });

    // WHEN
    await utilisateurRepository.checkState('utilisateur-id');

    // THEN
    // no error
  });
  it('findLastActiveUtilisateurs : no inactive accounts', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { active_account: false });

    // WHEN
    const liste = await utilisateurRepository.findLastActiveUtilisateurs(
      10,
      0,
      new Date(0),
    );

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('findLastActiveUtilisateurs : active account OK', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { active_account: true });

    // WHEN
    const liste = await utilisateurRepository.findLastActiveUtilisateurs(
      10,
      0,
      new Date(0),
    );

    // THEN
    expect(liste).toHaveLength(1);
  });
  it('findLastActiveUtilisateurs : date après => pas de compte', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { active_account: true });

    // WHEN
    const liste = await utilisateurRepository.findLastActiveUtilisateurs(
      10,
      0,
      new Date(Date.now() + 100),
    );

    // THEN
    expect(liste).toHaveLength(0);
  });
  it('countActiveUsersWithRecentActivity : date après => 0', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { active_account: true });

    // WHEN
    const count =
      await utilisateurRepository.countActiveUsersWithRecentActivity(
        new Date(Date.now() + 100),
      );

    // THEN
    expect(count).toEqual(0);
  });
  it('countActiveUsersWithRecentActivity : 1 si date avant', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { active_account: true });

    // WHEN
    const count =
      await utilisateurRepository.countActiveUsersWithRecentActivity(
        new Date(0),
      );

    // THEN
    expect(count).toEqual(1);
  });
  it('countActiveUsersWithRecentActivity : 0 si inactif', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { active_account: false });

    // WHEN
    const count =
      await utilisateurRepository.countActiveUsersWithRecentActivity(
        new Date(0),
      );

    // THEN
    expect(count).toEqual(0);
  });
  it('update_last_activite  : set la date courante', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, { derniere_activite: null });

    // WHEN
    await utilisateurRepository.update_last_activite('utilisateur-id');

    // THEN
    const userDB = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    expect(userDB.derniere_activite.getTime()).toBeGreaterThan(
      Date.now() - 100,
    );
    expect(userDB.derniere_activite.getTime()).toBeLessThan(Date.now());
  });
  it('getById  : lecture du scope argument', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const userDB = await utilisateurRepository.getById('utilisateur-id', []);

    // THEN
    expect(userDB.kyc_history).toBeUndefined();
  });
  it('getById  : scope ALL ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.ALL,
    ]);

    // THEN
    expect(userDB.kyc_history.answered_questions).toHaveLength(1);
  });
  it('getById  : scope kyc ', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);

    // WHEN
    const userDB = await utilisateurRepository.getById('utilisateur-id', [
      Scope.kyc,
    ]);

    // THEN
    expect(userDB.kyc_history.answered_questions).toHaveLength(1);
  });
  it(`updateUtilisateur : pas d'erreur si champ json undefined`, async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur);
    const userDB = await utilisateurRepository.getById('utilisateur-id', []);
    expect(userDB.kyc_history).toBeUndefined();

    // WHEN
    await utilisateurRepository.updateUtilisateur(userDB);

    // THEN
    // no error
    const userDB_2 = await utilisateurRepository.getById('utilisateur-id', [
      Scope.kyc,
    ]);
    expect(userDB_2.kyc_history).not.toBeUndefined();
  });
});
