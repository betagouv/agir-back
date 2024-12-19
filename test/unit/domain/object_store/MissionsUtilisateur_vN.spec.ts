import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { MissionsUtilisateur } from '../../../../src/domain/mission/missionsUtilisateur';
import { CodeMission } from '../../../../src/domain/mission/codeMission';
import { ContentType } from '../../../../src/domain/contenu/contentType';
import { Thematique } from '../../../../src/domain/contenu/thematique';
import { MissionsUtilisateur_v1 } from '../../../../src/domain/object_store/mission/MissionsUtilisateur_v1';

describe('MissionsUilisateur vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.MissionsUtilisateur);

    // WHEN

    const domain = new MissionsUtilisateur(raw);
    // THEN

    expect(domain.getRAWMissions()).toEqual([]);
  });
  it('serialise <=> deserialise v1 OK', () => {
    // GIVEN
    const domain_start = new MissionsUtilisateur({
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(1),
          thematique: Thematique.alimentation,
          code: CodeMission.cereales,
          image_url: 'img',
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
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
              est_reco: true,
            },
          ],
          est_visible: true,
        },
      ],
    });

    // WHEN
    const raw = MissionsUtilisateur_v1.serialise(domain_start);
    const domain_end = new MissionsUtilisateur(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v1 OK', () => {
    // GIVEN
    const domain_start = new MissionsUtilisateur({
      version: 1,
      missions: [
        {
          id: '1',
          done_at: new Date(1),
          thematique: Thematique.alimentation,
          code: CodeMission.cereales,
          image_url: 'img',
          titre: 'titre',
          introduction: 'intro',
          is_first: false,
          est_examen: false,
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
              est_reco: true,
            },
          ],
          est_visible: true,
        },
      ],
    });

    // WHEN
    const raw = MissionsUtilisateur_v1.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.MissionsUtilisateur,
    );
    const domain_end = new MissionsUtilisateur(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
