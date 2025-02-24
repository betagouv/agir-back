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
      liste_personnalisations_done: [],
      codes_actions_exclues: [],
      codes_actions_proposees: [],
      no_more_suggestions: false,
    });

    // WHEN
    thematique_history.declarePersonnalisationDone(Thematique.alimentation);

    // THEN
    expect(thematique_history.getListePersonnalisationsDone()).toContain(
      Thematique.alimentation,
    );
  });
  it(`declarePersonnalisationDone : pas de doublon`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_personnalisations_done: [],
      codes_actions_exclues: [],
      codes_actions_proposees: [],
      no_more_suggestions: false,
    });

    // WHEN
    thematique_history.declarePersonnalisationDone(Thematique.alimentation);
    thematique_history.declarePersonnalisationDone(Thematique.alimentation);

    // THEN
    expect(thematique_history.getListePersonnalisationsDone()).toHaveLength(1);
  });
  it(`resetPersonnalisation : supprime thematique OK`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_personnalisations_done: [
        Thematique.alimentation,
        Thematique.consommation,
      ],
      codes_actions_exclues: [],
      codes_actions_proposees: [],
      no_more_suggestions: false,
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(thematique_history.getListePersonnalisationsDone()).toHaveLength(1);
    expect(thematique_history.getListePersonnalisationsDone()).toContain(
      Thematique.consommation,
    );
  });
  it(`resetPersonnalisation : supprime OK même si absent`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_personnalisations_done: [Thematique.consommation],
      codes_actions_exclues: [],
      codes_actions_proposees: [],
      no_more_suggestions: false,
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(thematique_history.getListePersonnalisationsDone()).toHaveLength(1);
    expect(thematique_history.getListePersonnalisationsDone()).toContain(
      Thematique.consommation,
    );
  });
  it(`resetPersonnalisation : supprime OK même si vide`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_personnalisations_done: [],
      codes_actions_exclues: [],
      codes_actions_proposees: [],
      no_more_suggestions: false,
    });

    // WHEN
    thematique_history.resetPersonnalisation(Thematique.alimentation);

    // THEN
    expect(thematique_history.getListePersonnalisationsDone()).toHaveLength(0);
  });
});
