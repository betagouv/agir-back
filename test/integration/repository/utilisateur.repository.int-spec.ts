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
  it('updateUtilisateur : update OK without loss', async () => {
    // GIVEN
    await TestUtil.create('utilisateur');

    // WHEN
    const user = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    const rawUser = await TestUtil.prisma.utilisateur.findUnique({
      where: { id: 'utilisateur-id' },
    });
    // THEN
    expect(Object.keys(TestUtil.utilisateurData()).length).toEqual(
      Object.keys(user).length,
    );
    expect(Object.keys(user).length).toEqual(Object.keys(rawUser).length);

    expect(user.email).toEqual(rawUser.email);
    expect(user.nom).toEqual(rawUser.nom);
    expect(user.prenom).toEqual(rawUser.prenom);
    expect(user.code_postal).toEqual(rawUser.code_postal);
    expect(user.commune).toEqual(rawUser.commune);
    expect(user.revenu_fiscal).toEqual(rawUser.revenu_fiscal);
    expect(user.parts).toEqual(rawUser.parts.toNumber());
    expect(user.abonnement_ter_loire).toEqual(rawUser.abonnement_ter_loire);
    expect(user.prm).toEqual(rawUser.prm);
    expect(user.code_departement).toEqual(rawUser.code_departement);
    expect(user.created_at).toEqual(rawUser.created_at);
    expect(user.updated_at).toEqual(rawUser.updated_at);
    expect(user.passwordHash).toEqual(rawUser.passwordHash);
    expect(user.passwordSalt).toEqual(rawUser.passwordSalt);
    expect(user.failed_login_count).toEqual(rawUser.failed_login_count);
    expect(user.prevent_login_before).toEqual(rawUser.prevent_login_before);
    expect(user.code).toEqual(rawUser.code);
    expect(user.code_generation_time).toEqual(rawUser.code_generation_time);
    expect(user.active_account).toEqual(rawUser.active_account);
    expect(user.failed_checkcode_count).toEqual(rawUser.failed_checkcode_count);
    expect(user.prevent_checkcode_before).toEqual(
      rawUser.prevent_checkcode_before,
    );
    expect(user.sent_email_count).toEqual(rawUser.sent_email_count);
    expect(user.prevent_sendemail_before).toEqual(
      rawUser.prevent_sendemail_before,
    );
    expect(user.passwordHash).toEqual(rawUser.passwordHash);
    expect(user.passwordHash).toEqual(rawUser.passwordHash);

    expect(user.onboardingData).toEqual(rawUser.onboardingData);
    expect(user.onboardingResult).toEqual(rawUser.onboardingResult);
    expect(user.parcours_todo).toEqual(rawUser.todo);
    expect(user.gamification).toEqual(rawUser.gamification);
    expect(user.history.article_interactions[0].content_id).toEqual(
      rawUser.history['article_interactions'][0].content_id,
    );
    expect(user.history.article_interactions[0].like_level).toEqual(
      rawUser.history['article_interactions'][0].like_level,
    );
    expect(user.history.article_interactions[0].points_en_poche).toEqual(
      rawUser.history['article_interactions'][0].points_en_poche,
    );
    expect(
      user.history.article_interactions[0].read_date.toISOString(),
    ).toEqual(rawUser.history['article_interactions'][0].read_date);
    expect(user.unlocked_features).toEqual(rawUser.unlocked_features);
    expect(user.quizzProfile.getData()).toEqual(rawUser.quizzLevels);
    expect(user.version).toEqual(rawUser.version);

    // WHEN
    await utilisateurRepository.updateUtilisateur(user);
    const userReadBack = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    // THEN
    expect(userReadBack.email).toEqual(rawUser.email);
    expect(userReadBack.nom).toEqual(rawUser.nom);
    expect(userReadBack.prenom).toEqual(rawUser.prenom);
    expect(userReadBack.code_postal).toEqual(rawUser.code_postal);
    expect(userReadBack.commune).toEqual(rawUser.commune);
    expect(userReadBack.revenu_fiscal).toEqual(rawUser.revenu_fiscal);
    expect(userReadBack.parts).toEqual(rawUser.parts.toNumber());
    expect(userReadBack.abonnement_ter_loire).toEqual(
      rawUser.abonnement_ter_loire,
    );
    expect(userReadBack.prm).toEqual(rawUser.prm);
    expect(userReadBack.code_departement).toEqual(rawUser.code_departement);
    expect(userReadBack.created_at).toEqual(rawUser.created_at);
    expect(userReadBack.updated_at).toEqual(rawUser.updated_at);
    expect(userReadBack.passwordHash).toEqual(rawUser.passwordHash);
    expect(userReadBack.passwordSalt).toEqual(rawUser.passwordSalt);
    expect(userReadBack.failed_login_count).toEqual(rawUser.failed_login_count);
    expect(userReadBack.prevent_login_before).toEqual(
      rawUser.prevent_login_before,
    );
    expect(userReadBack.code).toEqual(rawUser.code);
    expect(userReadBack.code_generation_time).toEqual(
      rawUser.code_generation_time,
    );
    expect(userReadBack.active_account).toEqual(rawUser.active_account);
    expect(userReadBack.failed_checkcode_count).toEqual(
      rawUser.failed_checkcode_count,
    );
    expect(userReadBack.prevent_checkcode_before).toEqual(
      rawUser.prevent_checkcode_before,
    );
    expect(userReadBack.sent_email_count).toEqual(rawUser.sent_email_count);
    expect(userReadBack.prevent_sendemail_before).toEqual(
      rawUser.prevent_sendemail_before,
    );
    expect(userReadBack.passwordHash).toEqual(rawUser.passwordHash);
    expect(userReadBack.passwordHash).toEqual(rawUser.passwordHash);

    expect(userReadBack.onboardingData).toEqual(rawUser.onboardingData);
    expect(userReadBack.onboardingResult).toEqual(rawUser.onboardingResult);
    expect(userReadBack.parcours_todo).toEqual(rawUser.todo);
    expect(userReadBack.gamification).toEqual(rawUser.gamification);
    expect(userReadBack.gamification).toEqual(rawUser.gamification);
    expect(userReadBack.history.article_interactions[0].content_id).toEqual(
      rawUser.history['article_interactions'][0].content_id,
    );
    expect(userReadBack.history.article_interactions[0].like_level).toEqual(
      rawUser.history['article_interactions'][0].like_level,
    );
    expect(
      userReadBack.history.article_interactions[0].points_en_poche,
    ).toEqual(rawUser.history['article_interactions'][0].points_en_poche);
    expect(
      userReadBack.history.article_interactions[0].read_date.toISOString(),
    ).toEqual(rawUser.history['article_interactions'][0].read_date);
    expect(userReadBack.version).toEqual(rawUser.version);
    expect(userReadBack.unlocked_features).toEqual(rawUser.unlocked_features);
    expect(userReadBack.quizzProfile.getData()).toEqual(rawUser.quizzLevels);

    expect(user).toStrictEqual(userReadBack);
  });
  it('creation et lecture d un utilisateur avec une part à null ', async () => {
    // GIVEN
    await TestUtil.create('utilisateur', { parts: null });

    // WHEN
    const userDB = await utilisateurRepository.findUtilisateurById(
      'utilisateur-id',
    );
    // THEN
    expect(userDB.parts).toEqual(null);
  });
});
