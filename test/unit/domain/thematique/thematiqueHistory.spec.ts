import { TypeAction } from '../../../../src/domain/actions/typeAction';
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

  it(`doesActionsProposeesInclude : true si type code inclu`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_tags_excluants: [],
      liste_actions_vues: [],
      liste_actions_faites: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [
            { code: '123', type: TypeAction.classique },
          ],
          personnalisation_done: true,
          personnalisation_done_once: true,
        },
      ],
    });

    // WHEN
    const result = thematique_history.doesActionsProposeesInclude(
      Thematique.alimentation,
      {
        code: '123',
        type: TypeAction.classique,
      },
    );

    // THEN
    expect(result).toEqual(true);
  });

  it(`declarePersonnalisationDone : la thematique done`, () => {
    // GIVEN
    const thematique_history = new ThematiqueHistory({
      version: 0,
      liste_tags_excluants: [],
      liste_actions_vues: [],
      liste_actions_faites: [],
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
      liste_tags_excluants: [],
      liste_actions_vues: [],
      liste_actions_faites: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: false,
          personnalisation_done_once: false,
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
      liste_tags_excluants: [],
      liste_actions_vues: [],
      liste_actions_faites: [],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [],
          codes_actions_proposees: [],
          personnalisation_done: true,
          personnalisation_done_once: true,
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
      liste_tags_excluants: [],
      liste_actions_vues: [],
      liste_actions_faites: [],
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
