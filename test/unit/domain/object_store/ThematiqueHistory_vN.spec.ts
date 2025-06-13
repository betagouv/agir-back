import { TypeAction } from '../../../../src/domain/actions/typeAction';
import {} from '../../../../src/domain/logement/logement';
import { ThematiqueHistory_v0 } from '../../../../src/domain/object_store/thematique/thematiqueHistory_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
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
      codes_actions_exclues: [
        {
          action: { type: TypeAction.classique, code: '2' },
          date: new Date(),
        },
      ],
      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          vue_le: new Date(456),
          faite_le: new Date(123),
          feedback: 'pas mal',
          like_level: 2,
          liste_questions: [
            { date: new Date(), est_action_faite: true, question: 'haha' },
          ],
          liste_partages: [new Date(123)],
        },
      ],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { type: TypeAction.classique, code: '2' },
              date: new Date(),
            },
          ],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(),
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
      codes_actions_exclues: [
        {
          action: { type: TypeAction.classique, code: '2' },
          date: new Date(),
        },
      ],

      liste_actions_utilisateur: [
        {
          action: { code: '1', type: TypeAction.classique },
          vue_le: new Date(456),
          faite_le: new Date(123),
          feedback: 'pas mal',
          like_level: 2,
          liste_questions: [
            { date: new Date(), est_action_faite: true, question: 'haha' },
          ],
          liste_partages: [new Date(132)],
        },
      ],
      liste_thematiques: [
        {
          thematique: Thematique.alimentation,
          codes_actions_exclues: [
            {
              action: { type: TypeAction.classique, code: '2' },
              date: new Date(),
            },
          ],
          personnalisation_done_once: true,
          first_personnalisation_date: new Date(),
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
