import { Aide } from '../../../src/domain/aides/aide';
import { AideDefinition } from '../../../src/domain/aides/aideDefinition';
import { Besoin } from '../../../src/domain/aides/besoin';
import { Echelle } from '../../../src/domain/aides/echelle';
import { PartenaireDefinition } from '../../../src/domain/contenu/partenaireDefinition';

const aide_def: AideDefinition = {
  content_id: '1',
  titre: 'titre',
  contenu: 'haha',
  partenaires_supp_ids: [],
  url_simulateur: 'a',
  url_source: 'b',
  url_demande: 'c',
  is_simulateur: false,
  codes_postaux: [],
  thematiques: [],
  montant_max: 1000,
  echelle: Echelle.Commune,
  besoin: Besoin.acheter_velo,
  besoin_desc: 'hihi',
  include_codes_commune: [],
  exclude_codes_commune: [],
  codes_departement: [],
  codes_region: [],
  date_expiration: new Date(),
  derniere_maj: new Date(),
  est_gratuit: false,
};

const part_def = {
  id_cms: '1',
  code_commune: '12345',
  code_epci: '242100410',
  echelle: Echelle.Métropole,
  liste_codes_commune_from_EPCI: [],
  image_url: 'aaa',
  nom: 'bbb',
  url: 'ccc',
};
describe('Classe Aide', () => {
  it(`setPartenairePourUtilisateur  - cas liste null`, () => {
    // GIVEN
    const aide = new Aide(aide_def);

    // WHEN
    aide.setPartenairePourUtilisateur('21231', null);

    // THEN
    expect(aide.partenaire_logo_url).toBeUndefined();
    expect(aide.partenaire_nom).toBeUndefined();
    expect(aide.partenaire_url).toBeUndefined();
  });
  it(`setPartenairePourUtilisateur  - cas liste vide`, () => {
    // GIVEN
    const aide = new Aide(aide_def);

    // WHEN
    aide.setPartenairePourUtilisateur('21231', []);

    // THEN
    expect(aide.partenaire_logo_url).toBeUndefined();
    expect(aide.partenaire_nom).toBeUndefined();
    expect(aide.partenaire_url).toBeUndefined();
  });
  it(`setPartenairePourUtilisateur  - cas commune manquante sur user => premier élément de la liste`, () => {
    // GIVEN
    const aide = new Aide(aide_def);

    const liste_part: PartenaireDefinition[] = [
      part_def,
      { ...part_def, nom: 'HHHH' },
    ];

    // WHEN
    aide.setPartenairePourUtilisateur(null, liste_part);

    // THEN
    expect(aide.partenaire_logo_url).toEqual('aaa');
    expect(aide.partenaire_nom).toEqual('bbb');
    expect(aide.partenaire_url).toEqual('ccc');
  });

  it(`setPartenairePourUtilisateur  - cas prio de match commune exacte`, () => {
    // GIVEN
    const aide = new Aide(aide_def);

    const liste_part: PartenaireDefinition[] = [
      {
        ...part_def,
        code_commune: null,
        liste_codes_commune_from_EPCI: ['123', '456'],
        nom: 'FIRST',
      },
      { ...part_def, code_commune: '123', nom: 'SECOND' },
    ];

    // WHEN
    aide.setPartenairePourUtilisateur('123', liste_part);

    // THEN
    expect(aide.partenaire_nom).toEqual('SECOND');
  });
  it(`setPartenairePourUtilisateur  - cas match codes commune EPIC`, () => {
    // GIVEN
    const aide = new Aide(aide_def);

    const liste_part: PartenaireDefinition[] = [
      {
        ...part_def,
        code_commune: null,
        liste_codes_commune_from_EPCI: ['4', '5', '6'],
        nom: 'AAAAAA',
      },
      {
        ...part_def,
        code_commune: null,
        liste_codes_commune_from_EPCI: ['123', '2', '3'],
        nom: 'BBBBBB',
      },
      {
        ...part_def,
        code_commune: null,
        liste_codes_commune_from_EPCI: ['123', '7', '9'],
        nom: 'CCCCCC',
      },
    ];

    // WHEN
    aide.setPartenairePourUtilisateur('123', liste_part);

    // THEN
    expect(aide.partenaire_nom).toEqual('BBBBBB');
  });
  it(`setPartenairePourUtilisateur  - rien ne match, on prend le premier partenaire`, () => {
    // GIVEN
    const aide = new Aide(aide_def);

    const liste_part: PartenaireDefinition[] = [
      {
        ...part_def,
        code_commune: null,
        liste_codes_commune_from_EPCI: ['4', '5', '6'],
        nom: 'AAAAAA',
      },
      {
        ...part_def,
        code_commune: '456',
        liste_codes_commune_from_EPCI: [],
        nom: 'BBBBBB',
      },
    ];

    // WHEN
    aide.setPartenairePourUtilisateur('123', liste_part);

    // THEN
    expect(aide.partenaire_nom).toEqual('AAAAAA');
  });
});
