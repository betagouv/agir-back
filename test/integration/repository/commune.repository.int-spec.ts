import { CommuneRepository } from '../../../src/infrastructure/repository/commune/commune.repository';
import { TestUtil } from '../../TestUtil';

describe('CommuneRepository', () => {
  let communeRepository = new CommuneRepository(TestUtil.prisma);

  beforeAll(async () => {
    await TestUtil.appinit();
  });

  beforeEach(async () => {
    await TestUtil.deleteAll();
  });

  afterAll(async () => {
    await TestUtil.appclose();
  });

  it('checkCodePostal : revoie true si le code postal existe', async () => {
    // WHEN
    const result = communeRepository.checkCodePostal('91120');

    // THEN
    expect(result).toStrictEqual(true);
  });
  it('checkCodePostal : revoie false si le code postal non existant', async () => {
    // WHEN
    const result = communeRepository.checkCodePostal('99999');

    // THEN
    expect(result).toStrictEqual(false);
  });
  it('getListCommunesParCodePostal : revoie liste vide si le code postal non existant', async () => {
    // WHEN
    const result = communeRepository.getListNomsCommunesParCodePostal('99999');

    // THEN
    expect(result).toHaveLength(0);
  });
  it('getListCommunesParCodePostal : revoie bonne liste si le code postal ok', async () => {
    // WHEN
    const result = communeRepository.getListNomsCommunesParCodePostal('26290');

    // THEN
    expect(result).toHaveLength(2);
    expect(result).toStrictEqual(['DONZERE', 'LES GRANGES GONTARDES']);
  });
  it('getListCommunesParCodePostal : supprime les doublons', async () => {
    // GIVEN
    const toClean = {
      '10330': [
        {
          INSEE: '10333',
          commune: 'The_commune',
          acheminement: 'ST ANDRE LES VERGERS',
          Ligne_5: 'lieu dit 1',
        },
        {
          INSEE: '10334',
          commune: 'The_commune',
          acheminement: 'ST ANDRE LES VERGERS',
          Ligne_5: 'lieu dit 2',
        },
      ],
    };
    // WHEN
    communeRepository.supprimernDoublonsCommunesEtLigne5(toClean);

    // THEN
    expect(toClean['10330']).toHaveLength(1);
    expect(toClean['10330'][0].commune).toEqual('The_commune');
    expect(toClean['10330'][0].Ligne_5).toBeUndefined();
  });
  it('getListCommunesParCodePostal : supprime les doublons du fichier chargé', async () => {
    // WHEN
    const result = communeRepository.getListNomsCommunesParCodePostal('10120');

    // THEN
    expect(result).toHaveLength(4); // au lieu de 6 à cause de lieux dits
  });

  it('findDepartementRegionByCodePostal : renvoie 91 pour 91120', async () => {
    // WHEN
    const result = communeRepository.findDepartementRegionByCodePostal('91120');

    // THEN
    expect(result).toEqual({ code_departement: '91', code_region: '11' });
  });
  it('findDepartementRegionByCodePostal : renvoie 1 pour 01500', async () => {
    // WHEN
    const result = communeRepository.findDepartementRegionByCodePostal('01500');

    // THEN
    expect(result).toEqual({ code_departement: '01', code_region: '84' });
  });
  it('findDepartementRegionByCodePostal : renvoie 2A pour 20000 (Ajaccio)', async () => {
    // WHEN
    const result = communeRepository.findDepartementRegionByCodePostal('20000');

    // THEN
    expect(result).toEqual({ code_departement: '2A', code_region: '94' });
  });
  it('findDepartementRegionByCodePostal : renvoie ok pour le premier arrondissement de Lyon', async () => {
    // WHEN
    const result = communeRepository.findDepartementRegionByCodePostal('69001');

    // THEN
    expect(result).toEqual({ code_departement: '69', code_region: '84' });
  });
  it('findDepartementRegionByCodePostal : renvoie ok pour le premier arrondissement de Paris', async () => {
    // WHEN
    const result = communeRepository.findDepartementRegionByCodePostal('75002');

    // THEN
    expect(result).toEqual({ code_departement: '75', code_region: '11' });
  });
  it('findDepartementRegionByCodePostal : renvoie 2B pour 20287 (Meria)', async () => {
    // WHEN
    const result = communeRepository.findDepartementRegionByCodePostal('20287');

    // THEN
    expect(result).toEqual({
      code_departement: '2B',
      code_region: '94',
    });
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : renvoi la metropole quand ça match', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '29280',
        'METRO',
      );

    // THEN
    expect(result).toEqual(['Brest Métropole']);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : liste vide si pas de match metropole', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '77650',
        'METRO',
      );

    // THEN
    expect(result).toEqual([]);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : renvoi la CA quand ça match', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01100',
        'CA',
      );

    // THEN
    expect(result).toEqual(['CA Haut - Bugey Agglomération']);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : liste vide si pas de match CA', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01260',
        'CA',
      );

    // THEN
    expect(result).toEqual([]);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : renvoi la CC quand ça match', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01300',
        'CC',
      );

    // THEN
    expect(result).toEqual(['CC Bugey Sud']);
  });
  it('findRaisonSocialeDeNatureJuridiqueByCodePostal : liste vide si pas de match CC', async () => {
    // WHEN
    const result =
      communeRepository.findRaisonSocialeDeNatureJuridiqueByCodePostal(
        '01170',
        'CC',
      );

    // THEN
    expect(result).toEqual([]);
  });
  it(`getListeCodesCommuneParCodeEPCI : listes communes d'une EPCI`, async () => {
    // WHEN
    const result =
      communeRepository.getListeCodesCommuneParCodeEPCI('242100410');

    // THEN
    expect(result).toHaveLength(23);
    expect(result).toContain('21605');
  });
  it.skip(`upsertCommuneAndEpciToDatabase : intègres les EPIC et commune en BDD - trop long`, async () => {
    // WHEN
    const time = Date.now();
    await communeRepository.upsertCommuneAndEpciToDatabase();
    console.log(Date.now() - time);

    // THEN
    const communeDB = await TestUtil.prisma.communesAndEPCI.findUnique({
      where: { code_insee: '06088' },
    });

    expect(communeDB.code_postaux).toEqual([
      '06000',
      '06100',
      '06200',
      '06300',
    ]);
    expect(communeDB.nom).toEqual('Nice');
    expect(communeDB.is_epci).toEqual(false);
    expect(communeDB.is_commune).toEqual(true);
    expect(communeDB.codes_communes).toEqual([]);
    expect(communeDB.type_epci).toEqual(null);

    const epicDB = await TestUtil.prisma.communesAndEPCI.findUnique({
      where: { code_insee: '242100410' },
    });
    expect(epicDB.code_postaux).toEqual([
      '21000',
      '21300',
      '21240',
      '21800',
      '21121',
      '21600',
      '21850',
      '21160',
      '21370',
      '21560',
      '21110',
    ]);
    expect(epicDB.codes_communes).toEqual([
      '21231',
      '21166',
      '21617',
      '21171',
      '21515',
      '21278',
      '21355',
      '21540',
      '21390',
      '21452',
      '21485',
      '21481',
      '21605',
      '21263',
      '21473',
      '21003',
      '21223',
      '21315',
      '21105',
      '21106',
      '21370',
      '21192',
      '21270',
    ]);
    expect(epicDB.nom).toEqual('Dijon Métropole');
    expect(epicDB.is_epci).toEqual(true);
    expect(epicDB.is_commune).toEqual(false);
    expect(epicDB.type_epci).toEqual('METRO');
  });
});
