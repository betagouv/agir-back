import { Gamification } from '../../../../src/domain/gamification/gamification';
import { Gamification_v0 } from '../../../../src/domain/object_store/gamification/gamification_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';
import {
  SourceInscription,
  Utilisateur,
} from '../../../../src/domain/utilisateur/utilisateur';

describe('Gamification vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.Gamification);

    // WHEN

    const domain = new Gamification(raw);
    // THEN

    expect(domain.celebrations).toHaveLength(0);
    expect(domain.getPoints()).toEqual(0);
  });
  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'c',
      false,
      SourceInscription.inconnue,
    );
    let domain_start = new Gamification();
    domain_start.ajoutePoints(150, user);

    // WHEN
    const raw = Gamification_v0.serialise(domain_start);
    const domain_end = new Gamification(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const user = Utilisateur.createNewUtilisateur(
      'c',
      false,
      SourceInscription.inconnue,
    );
    const domain_start = new Gamification();
    domain_start.ajoutePoints(150, user);

    // WHEN
    const raw = Gamification_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.Gamification);
    const domain_end = new Gamification(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
