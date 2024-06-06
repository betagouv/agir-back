import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { MissionsUtilisateur_v0 } from '../../../../src/domain/object_store/mission/MissionsUtilisateur_v0';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { ThematiqueUnivers } from '../../../../src/domain/univers/thematiqueUnivers';
import { ContentType } from '../../../../src/domain/contenu/contentType';

describe('MissionsUilisateur vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.MissionsUtilisateur);

    // WHEN

    const domain = new MissionsUtilisateur(raw);
    // THEN

    expect(domain.missions).toEqual([]);
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new MissionsUtilisateur({
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(1),
          thematique_univers: ThematiqueUnivers.cereales,

          objectifs: [
            {
              id: '2',
              content_id: '123',
              titre: 'go',
              done_at: new Date(2),
              type: ContentType.article,
              is_locked: false,
              points: 10,
              sont_points_en_poche: false,
              est_visible: true,
            },
          ],
          prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
          est_visible: true,
        },
      ],
    });

    // WHEN
    const raw = MissionsUtilisateur_v0.serialise(domain_start);
    const domain_end = new MissionsUtilisateur(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new MissionsUtilisateur({
      version: 0,
      missions: [
        {
          id: '1',
          done_at: new Date(1),
          thematique_univers: ThematiqueUnivers.cereales,

          objectifs: [
            {
              id: '2',
              content_id: '123',
              titre: 'go',
              done_at: new Date(2),
              type: ContentType.article,
              is_locked: false,
              points: 10,
              sont_points_en_poche: false,
              est_visible: true,
            },
          ],
          prochaines_thematiques: [ThematiqueUnivers.dechets_compost],
          est_visible: true,
        },
      ],
    });

    // WHEN
    const raw = MissionsUtilisateur_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.MissionsUtilisateur,
    );
    const domain_end = new MissionsUtilisateur(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
