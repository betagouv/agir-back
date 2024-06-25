import { DB, TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Impact, Onboarding } from '../../../src/domain/onboarding/onboarding';
import { ThematiqueOnboarding as ThematiqueOnboarding } from '../../../src/domain/onboarding/onboarding';
import { Utilisateur } from '../../../src/domain/utilisateur/utilisateur';

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

  it('countUserWithAtLeastNThematiquesOfImpactGreaterThan : select ok single user', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.tres_eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.transports],
          '3': [ThematiqueOnboarding.logement],
          '4': [ThematiqueOnboarding.consommation],
        },
      },
    });

    // WHEN
    const result =
      await utilisateurRepository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
        Impact.eleve,
        0,
      );

    // THEN
    expect(result).toEqual(1);
  });
  it('countUserWithAtLeastNThematiquesOfImpactGreaterThan : select 1 when zéro thmetique expected', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [
            ThematiqueOnboarding.transports,
            ThematiqueOnboarding.consommation,
          ],
          '3': [ThematiqueOnboarding.logement],
          '4': [],
        },
      },
    });

    // WHEN
    const result =
      await utilisateurRepository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
        Impact.tres_eleve,
        0,
      );

    // THEN
    expect(result).toEqual(1);
  });
  it('countUserWithAtLeastNThematiquesOfImpactGreaterThan : select 0 when not enough impact', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [
            ThematiqueOnboarding.transports,
            ThematiqueOnboarding.consommation,
          ],
          '3': [ThematiqueOnboarding.logement],
          '4': [],
        },
      },
    });

    // WHEN
    const result =
      await utilisateurRepository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
        Impact.tres_eleve,
        1,
      );

    // THEN
    expect(result).toEqual(0);
  });
  it('countUserWithAtLeastNThematiquesOfImpactGreaterThan : select 0 when not enough thematiques', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.tres_eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.transports],
          '3': [ThematiqueOnboarding.logement],
          '4': [ThematiqueOnboarding.consommation],
        },
      },
    });

    // WHEN
    const result =
      await utilisateurRepository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
        Impact.eleve,
        3,
      );

    // THEN
    expect(result).toEqual(0);
  });
  it('countUserWithAtLeastNThematiquesOfImpactGreaterThan : select 1 when enough thematiques', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.tres_eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.transports],
          '3': [ThematiqueOnboarding.logement],
          '4': [ThematiqueOnboarding.consommation],
        },
      },
    });

    // WHEN
    const result =
      await utilisateurRepository.countUsersWithAtLeastNThematiquesOfImpactGreaterThan(
        Impact.eleve,
        2,
      );

    // THEN
    expect(result).toEqual(1);
  });
  it('countUsersWithLessImpactOnThematique : compte le bon nombre de user avec moins de X sur thematiquee Y', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: 'a',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.eleve,
          transports: Impact.tres_faible,
          logement: Impact.tres_faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.logement, ThematiqueOnboarding.transports],
          '2': [],
          '3': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.consommation,
          ],
          '4': [],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: 'b',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_eleve,
          transports: Impact.tres_eleve,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [],
          '2': [
            ThematiqueOnboarding.logement,
            ThematiqueOnboarding.consommation,
          ],
          '3': [],
          '4': [
            ThematiqueOnboarding.transports,
            ThematiqueOnboarding.alimentation,
          ],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      email: 'c',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.tres_eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.transports],
          '3': [ThematiqueOnboarding.logement],
          '4': [ThematiqueOnboarding.consommation],
        },
      },
    });

    // WHEN
    const result_1 =
      await utilisateurRepository.countUsersWithLessImpactOnThematique(
        Impact.eleve,
        ThematiqueOnboarding.transports,
      );
    const result_2 =
      await utilisateurRepository.countUsersWithLessImpactOnThematique(
        Impact.faible,
        ThematiqueOnboarding.alimentation,
      );
    const result_3 =
      await utilisateurRepository.countUsersWithLessImpactOnThematique(
        Impact.faible,
        ThematiqueOnboarding.consommation,
      );

    // THEN
    expect(result_1).toEqual(2);
    expect(result_2).toEqual(1);
    expect(result_3).toEqual(0);
  });
  it('countUsersWithMoreImpactOnThematiques : compte le bon nombre de user avec moins de X sur thematiquee Y', async () => {
    // GIVEN
    await TestUtil.create(DB.utilisateur, {
      id: '1',
      email: 'a',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.eleve,
          transports: Impact.tres_faible,
          logement: Impact.tres_faible,
          consommation: Impact.eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.logement, ThematiqueOnboarding.transports],
          '2': [],
          '3': [
            ThematiqueOnboarding.alimentation,
            ThematiqueOnboarding.consommation,
          ],
          '4': [],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '2',
      email: 'b',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_eleve,
          transports: Impact.tres_eleve,
          logement: Impact.faible,
          consommation: Impact.faible,
        },
        ventilation_par_impacts: {
          '1': [],
          '2': [
            ThematiqueOnboarding.logement,
            ThematiqueOnboarding.consommation,
          ],
          '3': [],
          '4': [
            ThematiqueOnboarding.transports,
            ThematiqueOnboarding.alimentation,
          ],
        },
      },
    });
    await TestUtil.create(DB.utilisateur, {
      id: '3',
      email: 'c',
      onboardingResult: {
        ventilation_par_thematiques: {
          alimentation: Impact.tres_faible,
          transports: Impact.faible,
          logement: Impact.eleve,
          consommation: Impact.tres_eleve,
        },
        ventilation_par_impacts: {
          '1': [ThematiqueOnboarding.alimentation],
          '2': [ThematiqueOnboarding.transports],
          '3': [ThematiqueOnboarding.logement],
          '4': [ThematiqueOnboarding.consommation],
        },
      },
    });

    // WHEN
    const result_1 =
      await utilisateurRepository.countUsersWithMoreImpactOnThematiques(
        [Impact.eleve],
        [ThematiqueOnboarding.transports],
      );
    const result_2 =
      await utilisateurRepository.countUsersWithMoreImpactOnThematiques(
        [Impact.faible, Impact.tres_faible],
        [ThematiqueOnboarding.alimentation, ThematiqueOnboarding.consommation],
      );
    const result_3 =
      await utilisateurRepository.countUsersWithMoreImpactOnThematiques(
        [Impact.tres_faible, Impact.tres_faible, Impact.tres_faible],
        [
          ThematiqueOnboarding.transports,
          ThematiqueOnboarding.logement,
          ThematiqueOnboarding.consommation,
        ],
      );

    // THEN
    expect(result_1).toEqual(1);
    expect(result_2).toEqual(2);
    expect(result_3).toEqual(2);
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
    const userDB = await utilisateurRepository.getById('utilisateur-id');
    // THEN
    expect(userDB.parts).toEqual(null);
  });
  it('creation et lecture , versionning des donnes json ', async () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'pierre',
      'paul',
      'w@w.com',
      1234,
      '91120',
      'PALAISEAU',
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
});
