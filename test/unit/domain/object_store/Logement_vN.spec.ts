import {
  Chauffage,
  DPE,
  Logement,
  Superficie,
  TypeLogement,
} from '../../../../src/domain/logement/logement';
import { Logement_v0 } from '../../../../src/domain/object_store/logement/logement_v0';
import {
  SerialisableDomain,
  Upgrader,
} from '../../../../src/domain/object_store/upgrader';

describe('Logement vN ', () => {
  it('build OK from empty', () => {
    // GIVEN
    const raw = Upgrader.upgradeRaw({}, SerialisableDomain.Logement);

    // WHEN
    new Logement(raw);
  });

  it('serialise <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new Logement({
      version: 0,
      type: TypeLogement.maison,
      plus_de_15_ans: true,
      nombre_enfants: 2,
      nombre_adultes: 1,
      dpe: DPE.B,
      chauffage: Chauffage.bois,
      code_postal: '91120',
      proprietaire: true,
      commune: 'PALAISEAU',
      superficie: Superficie.superficie_150_et_plus,
      risques: {
        nombre_catnat_commune: 1,
        pourcent_exposition_commune_innondations: 2,
        pourcent_exposition_commune_secheresse_geotech_zone_1: 1,
        pourcent_exposition_commune_secheresse_geotech_zone_2: 2,
        pourcent_exposition_commune_secheresse_geotech_zone_3: 3,
        pourcent_exposition_commune_secheresse_geotech_zone_4: 4,
        pourcent_exposition_commune_secheresse_geotech_zone_5: 5,
      },
    });

    // WHEN
    const raw = Logement_v0.serialise(domain_start);
    const domain_end = new Logement(raw);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
  it('serialise <=> upgade <=> deserialise v0 OK', () => {
    // GIVEN
    const domain_start = new Logement({
      version: 0,
      type: TypeLogement.maison,
      plus_de_15_ans: true,
      nombre_enfants: 2,
      nombre_adultes: 1,
      dpe: DPE.B,
      chauffage: Chauffage.bois,
      code_postal: '91120',
      proprietaire: true,
      commune: 'PALAISEAU',
      superficie: Superficie.superficie_150_et_plus,
      risques: {
        nombre_catnat_commune: 1,
        pourcent_exposition_commune_innondations: 2,
        pourcent_exposition_commune_secheresse_geotech_zone_1: 1,
        pourcent_exposition_commune_secheresse_geotech_zone_2: 2,
        pourcent_exposition_commune_secheresse_geotech_zone_3: 3,
        pourcent_exposition_commune_secheresse_geotech_zone_4: 4,
        pourcent_exposition_commune_secheresse_geotech_zone_5: 5,
      },
    });

    // WHEN
    const raw = Logement_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.Logement);
    const domain_end = new Logement(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
