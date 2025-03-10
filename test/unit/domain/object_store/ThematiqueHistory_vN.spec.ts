import { TypeAction } from '../../../../src/domain/actions/typeAction';
import {} from '../../../../src/domain/logement/logement';
import { ThematiqueHistory_v0 } from '../../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { TagExcluant } from '../../../../src/domain/scoring/tagExcluant';
import { ThematiqueHistory } from '../../../../src/domain/thematique/history/thematiqueHistory';
import { Thematique } from '../../../../src/domain/thematique/thematique';

describe('ThematiqueHistory vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.ThematiqueHistory);

    // WHEN
    new ThematiqueHistory(raw);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new ThematiqueHistory({
      version: 0,
      liste_actions_vues: [{ type: TypeAction.classique, code: '1' }],
      liste_actions_faites: [{ type: TypeAction.classique, code: '5' }],
      liste_tags_excluants: [TagExcluant.a_fait_travaux_recents],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [{ type: TypeAction.classique, code: '2' }],
          codes_actions_proposees: [{ type: TypeAction.quizz, code: '3' }],
          personnalisation_done: true,
        },
      ],
    });

    // WHEN
    const raw = ThematiqueHistory_v0.serialise(domain_start);
    const domain_end = new ThematiqueHistory(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new ThematiqueHistory({
      version: 0,
      liste_actions_vues: [{ type: TypeAction.classique, code: '1' }],
      liste_actions_faites: [{ type: TypeAction.classique, code: '5' }],
      liste_tags_excluants: [TagExcluant.a_fait_travaux_recents],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [{ type: TypeAction.classique, code: '2' }],
          codes_actions_proposees: [{ type: TypeAction.quizz, code: '3' }],
          personnalisation_done: true,
        },
      ],
    });

    // WHEN
    const raw = ThematiqueHistory_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.ThematiqueHistory,
    );
    const domain_end = new ThematiqueHistory(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
