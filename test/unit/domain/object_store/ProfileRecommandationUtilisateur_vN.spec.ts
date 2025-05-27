import { ProfileRecommandationUtilisateur_v0 } from '../../../../src/domain/object_store/recommandation/ProfileRecommandationUtilisateur_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import { ProfileRecommandationUtilisateur } from '../../../../src/domain/scoring/system_v2/profileRecommandationUtilisateur';
import { Tag_v2 } from '../../../../src/domain/scoring/system_v2/Tag_v2';

describe('ProfileRecommandationUtilisateur_vN ', () => {
  it('build ok from empty', async () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw(
      {},
      SerialisableDomain.ProfileRecommandationUtilisateur,
    );

    // WHEN

    const domain = new ProfileRecommandationUtilisateur(raw);
  });
  it('serialise <=> deSerialise v1 OK', async () => {
    // GIVEN
    const domain_start = new ProfileRecommandationUtilisateur({
      version: 0,
      liste_tags_actifs: [Tag_v2.a_une_voiture, Tag_v2.est_proprietaire],
    });

    // WHEN
    const raw = ProfileRecommandationUtilisateur_v0.serialise(domain_start);

    const domain_end = new ProfileRecommandationUtilisateur(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgrade <=> deSerialise v1 OK', async () => {
    // GIVEN
    const domain_start = new ProfileRecommandationUtilisateur({
      version: 0,
      liste_tags_actifs: [Tag_v2.a_une_voiture, Tag_v2.est_proprietaire],
    });

    // WHEN
    const raw = ProfileRecommandationUtilisateur_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(
      raw,
      SerialisableDomain.ProfileRecommandationUtilisateur,
    );

    const domain_end = new ProfileRecommandationUtilisateur(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
