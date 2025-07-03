import { ThematiqueHistory } from '../../../../src/domain/thematique/history/thematiqueHistory';
import { Thematique } from '../../../../src/domain/thematique/thematique';

describe('ThematiqueHistory', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it(`declarePersonnalisationDoneOnce : la thematique done`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_actions_utilisateur: [],
      liste_thematiques: [],
      codes_actions_exclues: [],
      recommandations_winter: [],
    });

    // WHEN
    thematique_history.declarePersonnalisationDoneOnce(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDoneOnce(Thematique.alimentation),
    ).toEqual(true);
  });

  it(`resetPersonnalisation : supprime thematique OK`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      recommandations_winter: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(123),
        },
      ],
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDoneOnce(Thematique.alimentation),
    ).toEqual(true);
  });
  it(`resetPersonnalisation : supprime OK même si absent`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_actions_utilisateur: [],
      codes_actions_exclues: [],
      liste_thematiques: [],
      recommandations_winter: [],
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDoneOnce(Thematique.alimentation),
    ).toEqual(false);
  });
});
