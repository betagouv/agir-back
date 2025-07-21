import {
  Chauffage,
  DPE,
  Logement,
  Superficie,
  TypeLogement,
} from '../../../../src/domain/logement/logement';
import { NiveauRisqueLogement } from '../../../../src/domain/logement/NiveauRisque';
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
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '91477',
      score_risques_adresse: {
        argile: NiveauRisqueLogement.faible,
        inondation: NiveauRisqueLogement.fort,
        radon: NiveauRisqueLogement.nul,
        secheresse: NiveauRisqueLogement.tres_fort,
        seisme: NiveauRisqueLogement.inconnu,
        submersion: NiveauRisqueLogement.faible,
        tempete: NiveauRisqueLogement.moyen,
      },
      prm: '123',
      est_prm_obsolete: true,
      est_prm_par_adresse: false,
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
      latitude: 48,
      longitude: 2,
      numero_rue: '12',
      rue: 'avenue de la Paix',
      code_commune: '91477',
      score_risques_adresse: {
        argile: NiveauRisqueLogement.faible,
        inondation: NiveauRisqueLogement.fort,
        radon: NiveauRisqueLogement.nul,
        secheresse: NiveauRisqueLogement.tres_fort,
        seisme: NiveauRisqueLogement.inconnu,
        submersion: NiveauRisqueLogement.faible,
        tempete: NiveauRisqueLogement.moyen,
      },
      prm: '123',
      est_prm_obsolete: false,
      est_prm_par_adresse: true,
    });

    // WHEN
    const raw = Logement_v0.serialise(domain_start);
    const upgrade = Upgrader.upgradeRaw(raw, SerialisableDomain.Logement);
    const domain_end = new Logement(upgrade);

    // THEN
    expect(domain_end).toStrictEqual(domain_start);
  });
});
