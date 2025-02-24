import { Thematique } from '../../../../src/domain/thematique/thematique';
import { ThematiqueHistory } from '../../../../src/domain/thematique/thematiqueHistory';

describe('ThematiqueHistory', () => {
  const OLD_ENV = process.env;

  beforeEach(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(async () => {
    process.env = OLD_ENV;
  });

  it(`declarePersonnalisationDone : la thematique done`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_thematiques: [],
    });

    // WHEN
    thematique_history.declarePersonnalisationDone(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDone(Thematique.alimentation),
    ).toEqual(true);
  });
  it(`declarePersonnalisationDone : la thematique done`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: false,
        },
      ],
    });

    // WHEN
    thematique_history.declarePersonnalisationDone(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDone(Thematique.alimentation),
    ).toEqual(true);
  });
  it(`resetPersonnalisation : supprime thematique OK`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          no_more_suggestions: false,
          personnalisation_done: true,
        },
      ],
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDone(Thematique.alimentation),
    ).toEqual(false);
  });
  it(`resetPersonnalisation : supprime OK même si absent`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_thematiques: [],
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(
      thematique_history.isPersonnalisationDone(Thematique.alimentation),
    ).toEqual(false);
  });
});
