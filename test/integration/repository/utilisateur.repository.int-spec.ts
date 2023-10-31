import { TestUtil } from '../../TestUtil';
import { UtilisateurRepository } from '../../../src/infrastructure/repository/utilisateur/utilisateur.repository';
import { Impact } from '../../../src/domain/utilisateur/onboarding/onboarding';
import { Thematique as ThematiqueOnboarding } from '../../../src/domain/utilisateur/onboarding/onboarding';

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
    await TestUtil.create('utilisateur', { id: '1', email: 'email1@truc.com' });
    await TestUtil.create('utilisateur', { id: '2', email: 'email2@truc.com' });
    await TestUtil.create('utilisateur', { id: '3', email: 'email3@truc.com' });

    // WHEN
    const result = await utilisateurRepository.listUtilisateurIds();

    result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    // THEN
    expect(result).toStrictEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
  });

  it('countUserWithAtLeastNThematiquesOfImpactGreaterThan : select ok single user', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', {
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
    await TestUtil.create('utilisateur', { id: '1', email: 'a' });
    await TestUtil.create('utilisateur', { id: '2', email: 'b' });
    await TestUtil.create('utilisateur', { id: '3', email: 'c' });

    // WHEN
    const result = await utilisateurRepository.nombreTotalUtilisateurs();

    // THEN
    expect(result).toEqual(3);
  });
});
