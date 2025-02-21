import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import {} from '../../../../src/domain/logement/logement';
import { ThematiqueHistory } from '../../../../src/domain/thematique/thematiqueHistory';
import { ThematiqueHistory_v0 } from '../../../../src/domain/object_store/thematique/thematiqueHistory_v0';
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
      liste_personnalisations_done: [
        Thematique.alimentation,
        Thematique.logement,
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
      liste_personnalisations_done: [
        Thematique.alimentation,
        Thematique.logement,
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
